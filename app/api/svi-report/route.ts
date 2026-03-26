import { NextResponse } from "next/server";

const CS_BASE_URL = process.env.CROWDSTRIKE_BASE_URL || "https://api.crowdstrike.com";
const CS_CLIENT_ID = process.env.CROWDSTRIKE_CLIENT_ID;
const CS_CLIENT_SECRET = process.env.CROWDSTRIKE_CLIENT_SECRET;

const LOGSCALE_BASE_URL = process.env.LOGSCALE_BASE_URL;
const LOGSCALE_REPO = process.env.LOGSCALE_REPO;
const LOGSCALE_TOKEN =
  process.env.LOGSCALE_TOKEN ||
  process.env.LOGSCALE_API_TOKEN ||
  process.env.CROWDSTRIKE_LOGSCALE_TOKEN;
const LOGSCALE_CID = process.env.LOGSCALE_CID;

const ALERT_QUERY_LIMIT = 500;
const ALERT_DETAIL_BATCH = 100;

type CrowdStrikeAlert = {
  id?: string;
  composite_id?: string;
  type?: string;
  product?: string;
  status?: string;
  comment?: string;
  created_timestamp?: string;
  updated_timestamp?: string;
  timestamp?: string;
  signal_start_timestamp?: string;
  signal_end_timestamp?: string;
  signal_updated_timestamp?: string;
  severity?: number;
  severity_name?: string;
  user_name?: string;
  user_principal?: string;
  display_name?: string;
  name?: string;
  description?: string;
  filename?: string;
  cmdline?: string;
  device?: {
    device_id?: string;
    hostname?: string;
  };
};

type SeverityCount = { severity: string; count: number };
type TopRow = { name: string; count: number };
type IncidentRow = {
  inc_no: string;
  host_name: string;
  process_name: string;
  severity: string;
  status: string;
};

function requireEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

function toThaiDayRange(dateStr: string) {
  const start = new Date(`${dateStr}T00:00:00+07:00`).getTime();
  const end = new Date(`${dateStr}T23:59:59.999+07:00`).getTime();
  return { start, end };
}

function pickTimestampMs(alert: CrowdStrikeAlert) {
  const raw =
    alert.timestamp ||
    alert.signal_start_timestamp ||
    alert.created_timestamp ||
    alert.signal_updated_timestamp ||
    alert.updated_timestamp;
  if (!raw) return null;
  const ms = new Date(raw).getTime();
  return Number.isNaN(ms) ? null : ms;
}

function normalizeSeverity(alert: CrowdStrikeAlert) {
  if (alert.severity_name) return alert.severity_name;
  const sev = typeof alert.severity === "number" ? alert.severity : null;
  if (sev === null) return null;
  if (sev >= 80) return "Critical";
  if (sev >= 60) return "High";
  if (sev >= 40) return "Medium";
  if (sev >= 20) return "Low";
  return "Info";
}

function toTitleCase(value: string) {
  if (!value) return "-";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

async function getCrowdStrikeToken() {
  const clientId = requireEnv(CS_CLIENT_ID, "CROWDSTRIKE_CLIENT_ID");
  const clientSecret = requireEnv(CS_CLIENT_SECRET, "CROWDSTRIKE_CLIENT_SECRET");

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret
  });

  const res = await fetch(`${CS_BASE_URL}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store"
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CrowdStrike token error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data?.access_token as string;
}

async function fetchAlertIds(token: string) {
  const allIds: string[] = [];
  let offset = 0;

  while (true) {
    const params = new URLSearchParams({
      limit: String(ALERT_QUERY_LIMIT),
      offset: String(offset)
    });

    const res = await fetch(`${CS_BASE_URL}/alerts/queries/alerts/v1?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      },
      cache: "no-store"
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`CrowdStrike query error: ${res.status} ${text}`);
    }

    const data = await res.json();
    const resources: string[] = Array.isArray(data?.resources) ? data.resources : [];
    if (resources.length === 0) break;

    allIds.push(...resources);
    if (resources.length < ALERT_QUERY_LIMIT) break;
    offset += ALERT_QUERY_LIMIT;
  }

  return allIds;
}

async function fetchAlertDetails(token: string, ids: string[]) {
  if (ids.length === 0) return [];

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json"
  };
  const results: CrowdStrikeAlert[] = [];

  for (let i = 0; i < ids.length; i += ALERT_DETAIL_BATCH) {
    const chunk = ids.slice(i, i + ALERT_DETAIL_BATCH);
    const payloadIds = { ids: chunk };
    const payloadComposite = { composite_ids: chunk };

    const post = async (payload: Record<string, string[]>) => {
      const res = await fetch(`${CS_BASE_URL}/alerts/entities/alerts/v2`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        cache: "no-store"
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`CrowdStrike details error: ${res.status} ${text}`);
      }
      return res.json();
    };

    try {
      const data = await post(payloadIds);
      results.push(...(Array.isArray(data?.resources) ? data.resources : []));
    } catch (error) {
      const data = await post(payloadComposite);
      results.push(...(Array.isArray(data?.resources) ? data.resources : []));
    }
  }

  return results;
}

function buildLogScaleTopHostsQuery(params: {
  objective?: string | null;
  tactic?: string | null;
  severity?: string | null;
}) {
  const lines: string[] = [
    '#repo=detections ExternalApiType=Event_EppDetectionSummaryEvent cid=?cid Hostname!="" Hostname!="N/A" SeverityName!=Informational'
  ];

  if (params.objective) {
    lines.push(`| in(Objective, values=[${JSON.stringify(params.objective)}], ignoreCase=true)`);
  }
  if (params.tactic) {
    lines.push(`| in(Tactic, values=[${JSON.stringify(params.tactic)}], ignoreCase=true)`);
  }
  if (params.severity) {
    lines.push(`| in(SeverityName, values=[${JSON.stringify(params.severity)}], ignoreCase=true)`);
  }

  lines.push('| ComputerName := rename(Hostname)');
  lines.push('| groupBy([CompositeId, ComputerName, Description], function=[], limit=max)');
  lines.push('| groupBy(ComputerName, function=count(as=count), limit=max)');
  lines.push('| sort(count, order=desc, limit=10)');

  return lines.join("\n");
}

async function runLogScaleQuery(queryString: string, start: number, end: number, args: Record<string, string>) {
  if (!LOGSCALE_BASE_URL || !LOGSCALE_REPO || !LOGSCALE_TOKEN) return null;

  const createRes = await fetch(`${LOGSCALE_BASE_URL}/api/v1/repositories/${LOGSCALE_REPO}/queryjobs`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${LOGSCALE_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      queryString,
      start,
      end,
      isLive: false,
      allowEventSkipping: true,
      noResultUntilDone: true,
      timeZoneOffsetMinutes: 420,
      arguments: args
    }),
    cache: "no-store"
  });

  if (!createRes.ok) {
    const text = await createRes.text();
    throw new Error(`LogScale queryjob error: ${createRes.status} ${text}`);
  }

  const createData = await createRes.json();
  const jobId = createData?.id;
  if (!jobId) return null;

  const headers = { Authorization: `Bearer ${LOGSCALE_TOKEN}` };

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const pollRes = await fetch(
      `${LOGSCALE_BASE_URL}/api/v1/repositories/${LOGSCALE_REPO}/queryjobs/${jobId}`,
      { headers, cache: "no-store" }
    );

    if (!pollRes.ok) {
      const text = await pollRes.text();
      throw new Error(`LogScale poll error: ${pollRes.status} ${text}`);
    }

    const pollData = await pollRes.json();
    const rows =
      (Array.isArray(pollData?.events) && pollData.events) ||
      (Array.isArray(pollData?.results?.events) && pollData.results.events) ||
      (Array.isArray(pollData?.results?.rows) && pollData.results.rows) ||
      (Array.isArray(pollData?.rows) && pollData.rows) ||
      [];

    if (pollData?.done) return rows;

    const waitMs = typeof pollData?.metaData?.pollAfter === "number" ? pollData.metaData.pollAfter : 500;
    await new Promise((resolve) => setTimeout(resolve, Math.min(Math.max(waitMs, 200), 2000)));
  }

  return [];
}

async function fetchLogScaleTopHosts(params: {
  cid?: string | null;
  objective?: string | null;
  tactic?: string | null;
  severity?: string | null;
  start: number;
  end: number;
}) {
  if (!params.cid) return null;

  const queryString = buildLogScaleTopHostsQuery({
    objective: params.objective,
    tactic: params.tactic,
    severity: params.severity
  });

  const rows = await runLogScaleQuery(queryString, params.start, params.end, { cid: params.cid });
  if (!rows) return null;

  const mapped: TopRow[] = rows
    .map((row: any) => {
      const name = row?.ComputerName || row?.hostname || row?.HostName || row?.host || "";
      const countVal = row?.count ?? row?._count ?? row?.Count;
      const count = typeof countVal === "number" ? countVal : Number(countVal || 0);
      return { name: String(name || ""), count };
    })
    .filter((row) => row.name)
    .sort((a, b) => b.count - a.count);

  return mapped.slice(0, 10);
}

function buildLogScaleTopUsersQuery(params: {
  objective?: string | null;
  tactic?: string | null;
  severity?: string | null;
}) {
  const lines: string[] = [
    '#repo=detections ExternalApiType=Event_EppDetectionSummaryEvent cid=?cid UserName!="" UserName!="N/A" SeverityName!=Informational'
  ];

  if (params.objective) {
    lines.push(`| in(Objective, values=[${JSON.stringify(params.objective)}], ignoreCase=true)`);
  }
  if (params.tactic) {
    lines.push(`| in(Tactic, values=[${JSON.stringify(params.tactic)}], ignoreCase=true)`);
  }
  if (params.severity) {
    lines.push(`| in(SeverityName, values=[${JSON.stringify(params.severity)}], ignoreCase=true)`);
  }

  lines.push('| groupBy([CompositeId, UserName, Description], function=[], limit=max)');
  lines.push('| groupBy(UserName, function=count(as=count), limit=max)');
  lines.push('| sort(count, order=desc, limit=10)');

  return lines.join("\n");
}

async function fetchLogScaleTopUsers(params: {
  cid?: string | null;
  objective?: string | null;
  tactic?: string | null;
  severity?: string | null;
  start: number;
  end: number;
}) {
  if (!params.cid) return null;

  const queryString = buildLogScaleTopUsersQuery({
    objective: params.objective,
    tactic: params.tactic,
    severity: params.severity
  });

  const rows = await runLogScaleQuery(queryString, params.start, params.end, { cid: params.cid });
  if (!rows) return null;

  const mapped: TopRow[] = rows
    .map((row: any) => {
      const name = row?.UserName || row?.username || row?.user || row?.User || "";
      const countVal = row?.count ?? row?._count ?? row?.Count;
      const count = typeof countVal === "number" ? countVal : Number(countVal || 0);
      return { name: String(name || ""), count };
    })
    .filter((row) => row.name)
    .sort((a, b) => b.count - a.count);

  return mapped.slice(0, 10);
}

function buildTopRows(values: string[], limit = 10): TopRow[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (!value) continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");
    const cidParam = searchParams.get("cid") || LOGSCALE_CID;
    const objectiveParam = searchParams.get("objective");
    const tacticParam = searchParams.get("tactic");
    const severityParam = searchParams.get("severity");

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Missing date parameters" }, { status: 400 });
    }

    const token = await getCrowdStrikeToken();
    const ids = await fetchAlertIds(token);
    const alerts = await fetchAlertDetails(token, ids);

    const startRange = toThaiDayRange(startDate);
    const endRange = toThaiDayRange(endDate);

    const filtered = alerts.filter((alert) => {
      const ts = pickTimestampMs(alert);
      if (!ts) return false;
      return ts >= startRange.start && ts <= endRange.end;
    });

    const severityCounts = new Map<string, number>();
    const users: string[] = [];
    const hosts: string[] = [];

    const incidentSummary: IncidentRow[] = [];
    const endpointDetections: IncidentRow[] = [];

    for (const alert of filtered) {
      const severity = normalizeSeverity(alert);
      if (severity) {
        severityCounts.set(severity, (severityCounts.get(severity) || 0) + 1);
      }

      if (alert.user_name) users.push(alert.user_name);
      else if (alert.user_principal) users.push(alert.user_principal);

      if (alert.device?.hostname) hosts.push(alert.device.hostname);

      const hostName = alert.device?.hostname || alert.device?.device_id || "-";
      const processName =
        alert.description ||
        alert.display_name ||
        alert.name ||
        alert.filename ||
        alert.cmdline ||
        "-";
      const status = toTitleCase(alert.status || "unknown");

      if (alert.comment) {
        incidentSummary.push({
          inc_no: alert.comment,
          host_name: hostName,
          process_name: processName,
          severity,
          status
        });
      }

      if (alert.type === "signal") {
        endpointDetections.push({
          inc_no: alert.comment || "-",
          host_name: hostName,
          process_name: alert.filename || processName,
          severity,
          status
        });
      }
    }

    const severitySummary: SeverityCount[] = Array.from(severityCounts.entries())
      .map(([severity, count]) => ({ severity, count }))
      .filter((row) => row.severity && row.severity !== "Unknown")
      .sort((a, b) => b.count - a.count);

    let topUsersFinal = buildTopRows(users);
    try {
      const logscaleTopUsers = await fetchLogScaleTopUsers({
        cid: cidParam,
        objective: objectiveParam,
        tactic: tacticParam,
        severity: severityParam,
        start: startRange.start,
        end: endRange.end
      });
      if (logscaleTopUsers && logscaleTopUsers.length > 0) {
        topUsersFinal = logscaleTopUsers;
      }
    } catch (logscaleError: any) {
      console.error("LogScale top users error:", logscaleError?.message || logscaleError);
    }
    let topHostsFinal = buildTopRows(hosts);
    try {
      const logscaleTopHosts = await fetchLogScaleTopHosts({
        cid: cidParam,
        objective: objectiveParam,
        tactic: tacticParam,
        severity: severityParam,
        start: startRange.start,
        end: endRange.end
      });
      if (logscaleTopHosts && logscaleTopHosts.length > 0) {
        topHostsFinal = logscaleTopHosts;
      }
    } catch (logscaleError: any) {
      console.error("LogScale top hosts error:", logscaleError?.message || logscaleError);
    }

    return NextResponse.json({
      severitySummary,
      topUsers: topUsersFinal,
      topHosts: topHostsFinal,
      incidentSummary,
      endpointDetections
    });
  } catch (error: any) {
    console.error("SVI API Error:", error?.message || error);
    return NextResponse.json({ error: error?.message || "Unknown error" }, { status: 500 });
  }
}




