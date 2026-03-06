import { NextResponse } from 'next/server';
import crypto from 'crypto';


// ==========================================
// ส่วน AlienVault Config
// ==========================================

const AV_SUBDOMAIN = process.env.ALIENVAULT_SUBDOMAIN;
const AV_CLIENT_ID = process.env.ALIENVAULT_CLIENT_ID;
const AV_CLIENT_SECRET = process.env.ALIENVAULT_CLIENT_SECRET;
const AV_BASE_URL = `https://${AV_SUBDOMAIN}.alienvault.cloud/api/2.0`;

// ==========================================
// Cyware Config & Helper Functions
// ==========================================
const BUFFER_DAYS = 2;
const MAX_CONCURRENT_REQUESTS = 20;
const CYWARE_ACCESS_ID = process.env.CYWARE_ACCESS_ID || process.env.ACCESS_ID;
const CYWARE_SECRET_KEY = process.env.CYWARE_SECRET_KEY || process.env.SECRET_KEY;
const CYWARE_BASE_URL = process.env.CYWARE_BASE_URL || process.env.BASE_URL || 'https://bangkokmsp.cyware.com/cftrapi';
const CYWARE_PAGE_SIZE = 100;
const MAX_DEST_USERNAMES_PER_METHOD = 50;

type CywareIncident = {
  unique_id?: string;
  readable_id?: string;
  incident_id?: string;
  title?: string;
  status?: string;
  created?: string;
};

type PendingIncidentRow = {
  inc_no: string;
  incident_name: string;
  status: string;
};

// 1. ฟังก์ชันขอ Token
async function getAlienVaultToken() {
  const authString = Buffer.from(`${AV_CLIENT_ID}:${AV_CLIENT_SECRET}`).toString('base64');
  try {
    const res = await fetch(`${AV_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store'
    });
    const data = await res.json();
    return data.access_token;
  } catch (error) {
    console.error("❌ AlienVault Token Error:", error);
    return null;
  }
}

// 2. ฟังก์ชันแปลง Asset ID เป็นชื่อ
async function resolveAssetId(
  assetId: string,
  tokenRef: { value: string },
  cache: Map<string, string>
): Promise<string> {

  if (!assetId) return "Unknown Asset";
  if (cache.has(assetId)) return cache.get(assetId)!;

  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {

      const res = await fetch(`${AV_BASE_URL}/assets/${assetId}`, {
        headers: { Authorization: `Bearer ${tokenRef.value}` },
        cache: "no-store"
      });

      if (res.status === 401 && attempt === 0) {
        const newToken = await getAlienVaultToken();
        if (newToken) tokenRef.value = newToken;
        continue;
      }

      if (res.status === 404) {
        cache.set(assetId, assetId);
        return assetId;
      }

      if (!res.ok) {
        cache.set(assetId, assetId);
        return assetId;
      }

      const data = await res.json();

      let name = data.name;
      if (!name) name = data.canonical;
      if (!name && data.hostnames?.length > 0) name = data.hostnames[0];
      if (!name && data.ip_addresses?.length > 0) name = data.ip_addresses[0];

      const finalName = name || assetId;
      cache.set(assetId, finalName);

      return finalName;
    }

  } catch (error) {
    cache.set(assetId, assetId);
    return assetId;
  }

  return assetId; // 🔥 สำคัญ
}

function getThaiDayStart(dateStr: string) {
  return new Date(`${dateStr}T00:00:00+07:00`).getTime();
}

function getThaiDayEnd(dateStr: string) {
  return new Date(`${dateStr}T23:59:59.000+07:00`).getTime();
}

function generateCywareSignature(accessId: string, secretKey: string, expires: number) {
  const payload = `${accessId}\n${expires}`;
  return crypto.createHmac('sha1', secretKey).update(payload).digest('base64');
}

function normalizePendingStatus(status: unknown): string {
  const normalized = String(status ?? '').trim().toLowerCase();
  if (normalized === 'open') return 'Pending';
  if (normalized === 'closed') return 'Completed';
  return String(status ?? 'Pending').trim() || 'Pending';
}

function buildCywareAuthParams() {
  if (!CYWARE_ACCESS_ID || !CYWARE_SECRET_KEY) {
    return null;
  }
  const expires = Math.floor(Date.now() / 1000) + 60;
  return {
    AccessID: CYWARE_ACCESS_ID,
    Expires: expires,
    Signature: generateCywareSignature(CYWARE_ACCESS_ID, CYWARE_SECRET_KEY, expires)
  };
}

async function fetchCywareIncidentDetail(uniqueId: string): Promise<string> {
  const authParams = buildCywareAuthParams();
  if (!authParams || !uniqueId) return '';

  try {
    const params = new URLSearchParams({
      ...Object.fromEntries(Object.entries(authParams).map(([k, v]) => [k, String(v)]))
    });
    const res = await fetch(`${CYWARE_BASE_URL}/openapi/v1/incident/${encodeURIComponent(uniqueId)}/?${params.toString()}`, {
      cache: 'no-store'
    });
    if (!res.ok) return '';
    const data = await res.json();
    return data?.incident_id ? String(data.incident_id) : '';
  } catch {
    return '';
  }
}

async function fetchCywarePendingIncidents(startDate: string, endDate: string): Promise<PendingIncidentRow[]> {
  if (!buildCywareAuthParams()) {
    console.warn('CYWARE_ACCESS_ID / CYWARE_SECRET_KEY is not configured.');
    return [];
  }

  try {
    const endEpoch = Math.floor(getThaiDayEnd(endDate) / 1000);
    const primaryStartEpoch = Math.floor(getThaiDayStart(startDate) / 1000);

    const fetchIncidentsByRange = async (startEpoch: number, endEpochRange: number) => {
      const rows: CywareIncident[] = [];
      let page = 1;

      while (true) {
        const authParams = buildCywareAuthParams();
        if (!authParams) break;

        const params = new URLSearchParams({
          ...Object.fromEntries(Object.entries(authParams).map(([k, v]) => [k, String(v)])),
          page_size: String(CYWARE_PAGE_SIZE),
          page: String(page),
          created_date__gte: String(startEpoch),
          created_date__lte: String(endEpochRange)
        });

        const res = await fetch(`${CYWARE_BASE_URL}/openapi/v1/incident/?${params.toString()}`, {
          cache: 'no-store'
        });

        if (!res.ok) break;

        const data = await res.json();
        const pageResults: CywareIncident[] = Array.isArray(data?.results) ? data.results : [];
        if (pageResults.length === 0) break;

        rows.push(...pageResults);
        if (!data?.next || pageResults.length < CYWARE_PAGE_SIZE) break;
        page += 1;
      }

      return rows;
    };

    const incidents = await fetchIncidentsByRange(primaryStartEpoch, endEpoch);
    const reportIncidents = incidents
      .sort((a, b) => new Date(b?.created || 0).getTime() - new Date(a?.created || 0).getTime());

    const statusList = [...new Set(incidents.map((item) => String(item?.status ?? '').trim()).filter(Boolean))];
    if (reportIncidents.length === 0) {
      console.log(
        `[Cyware Pending] no rows in selected range ${startDate}..${endDate}. ` +
        `Returning empty pending rows for this date range.`
      );
    }

    console.log(`[Cyware Pending] fetched=${incidents.length}, returned=${reportIncidents.length}, statuses=${statusList.join(', ')}`);

    const mapped = await mapWithConcurrency(
      reportIncidents,
      10,
      async (item) => {
        const fabrinetId = item?.unique_id ? await fetchCywareIncidentDetail(String(item.unique_id)) : '';
        return {
          inc_no: fabrinetId || item?.readable_id || '-',
          incident_name: item?.title || '-',
          status: normalizePendingStatus(item?.status)
        };
      }
    );

    return mapped;
  } catch (error) {
    console.error('Cyware Pending Fetch Error:', error);
    return [];
  }
}

async function fetchAlarmDetails(alarmId: string, tokenRef: { value: string }) {
  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const res = await fetch(`${AV_BASE_URL}/alarms/${alarmId}`, {
        headers: { 'Authorization': `Bearer ${tokenRef.value}` },
        cache: 'no-store'
      });
      if (res.status === 401 && attempt === 0) {
        const newToken = await getAlienVaultToken();
        if (newToken) tokenRef.value = newToken;
        continue;
      }
      if (!res.ok) return null;
      return await res.json();
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function processAlarmResolution(
  alarm: any,
  tokenRef: { value: string },
  assetCache: Map<string, string>
) {
  const alarmId = alarm.id || alarm.uuid;
  const originalSourceVal = alarm.source_name || alarm.source_address || "Unknown";

  if (!alarmId) {
    return { ...alarm, resolved_source_names: [originalSourceVal] };
  }

  const fullData = (await fetchAlarmDetails(alarmId, tokenRef)) || alarm;
  const normalizedAlarm = {
    ...alarm,
    rule_method: fullData.rule_method || alarm.rule_method,
    destination_username: fullData.destination_username || alarm.destination_username
  };

  const events = fullData.events;
  let firstEvent: any = {};
  if (Array.isArray(events) && events.length > 0) {
    firstEvent = events[0];
  } else if (events && typeof events === "object") {
    firstEvent = events;
  }

  let resolvedList: string[] = [];

  // Priority 1: Asset ID จาก Event
  const assetId = firstEvent?.source_asset_id;
  if (assetId) {
    const singleName = await resolveAssetId(String(assetId), tokenRef, assetCache);
    if (singleName) resolvedList = [singleName];
  }

  // Priority 2: alarm_source_names
  if (resolvedList.length === 0) {
    const sourceNames = fullData?.alarm_source_names;
    if (Array.isArray(sourceNames) && sourceNames.length > 0) {
      const cleanedNames = sourceNames.filter(Boolean).map((name) => String(name));
      resolvedList = [...new Set(cleanedNames)];
    }
  }

  // Priority 3: IP Address
  if (resolvedList.length === 0) {
    const ipAddress = firstEvent?.source_address;
    if (ipAddress) resolvedList = [String(ipAddress)];
  }

  // Priority 4: Fallback decode from source_name / source_address
  if (resolvedList.length === 0) {
    if (originalSourceVal && originalSourceVal !== "Unknown") {
      const decodedName = await resolveAssetId(String(originalSourceVal), tokenRef, assetCache);
      resolvedList = [decodedName || String(originalSourceVal)];
    } else {
      resolvedList = [String(originalSourceVal)];
    }
  }

  return { ...normalizedAlarm, resolved_source_names: resolvedList };
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) return [];
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, () =>
    (async () => {
      while (true) {
        const index = currentIndex;
        currentIndex += 1;
        if (index >= items.length) break;
        results[index] = await mapper(items[index], index);
      }
    })()
  );

  await Promise.all(workers);
  return results;
}

// 3. ฟังก์ชันหลักดึงข้อมูลและประมวลผล
async function fetchAlienVaultData(startDate: string, endDate: string) {
  const token = await getAlienVaultToken();
  if (!token) return { alarms: [], actions: [] };
  const tokenRef = { value: token };

  const receivedStartTs = getThaiDayStart(startDate);
  const receivedEndTs = getThaiDayEnd(endDate);

  const occuredStartTs = getThaiDayStart(startDate);
  const occuredEndTs = getThaiDayEnd(endDate) + (24 * 60 * 60 * 1000);
  const apiFetchOccuredStart = occuredStartTs - (BUFFER_DAYS * 24 * 60 * 60 * 1000);

  try {
    const allAlarms: any[] = [];
    let page = 0;
    const size = 1000;
    let currentToken = token;

    while (true) {
      const params = new URLSearchParams({
        timestamp_occured_gte: apiFetchOccuredStart.toString(),
        timestamp_occured_lte: occuredEndTs.toString(),
        status: 'open',
        page: page.toString(),
        size: size.toString(),
        sort: 'timestamp_occured,asc'
      });

      const res = await fetch(`${AV_BASE_URL}/alarms?${params}`, {
        headers: { 'Authorization': `Bearer ${currentToken}` },
        cache: 'no-store'
      });

      if (res.status === 401) {
        const newToken = await getAlienVaultToken();
        if (!newToken) break;
        currentToken = newToken;
        tokenRef.value = newToken;
        continue;
      }
      if (!res.ok) break;

      const data = await res.json();
      const alarmsInPage = data._embedded?.alarms || [];
      if (!alarmsInPage.length) break;

      allAlarms.push(...alarmsInPage);
      if (!data._links?.next) break;
      page += 1;
    }

    const assetCache = new Map<string, string>();
    const statsMap = new Map<string, {
      total: number,
      destUsers: Map<string, number>,
      sources: Map<string, number>
    }>();

    const filteredAlarms = allAlarms.filter((alarm: any) => {
      const recTime = alarm.timestamp_received || alarm.timestamp_occured || 0;
      return recTime >= receivedStartTs && recTime <= receivedEndTs;
    });

    const processedAlarms = await mapWithConcurrency(
      filteredAlarms,
      MAX_CONCURRENT_REQUESTS,
      async (alarm) => processAlarmResolution(alarm, tokenRef, assetCache)
    );

    for (const alarm of processedAlarms) {
      const method = alarm.rule_method || "Unknown Threat";
      if (!statsMap.has(method)) {
        statsMap.set(method, { total: 0, destUsers: new Map(), sources: new Map() });
      }
      const entry = statsMap.get(method)!;
      entry.total += 1;

      const dstUser = alarm.destination_username;
      if (dstUser) {
        entry.destUsers.set(dstUser, (entry.destUsers.get(dstUser) || 0) + 1);
      }

      const resolvedSrcs = alarm.resolved_source_names || [];
      for (const src of resolvedSrcs) {
        if (!src) continue;
        entry.sources.set(src, (entry.sources.get(src) || 0) + 1);
      }
    }

    const table1Data = Array.from(statsMap.entries())
      .map(([method, data]) => ({ threatType: method, count: data.total }))
      .sort((a, b) => b.count - a.count);

    const customSort = (a: [string, number], b: [string, number]) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      const aStr = String(a[0]);
      const bStr = String(b[0]);
      const aStartsWithBackslash = aStr.startsWith("\\");
      const bStartsWithBackslash = bStr.startsWith("\\");
      if (!aStartsWithBackslash && bStartsWithBackslash) return -1;
      if (aStartsWithBackslash && !bStartsWithBackslash) return 1;
      return aStr.localeCompare(bStr, 'en', { sensitivity: 'base', numeric: true });
    };

    const usernameSort = (a: [string, number], b: [string, number]) => {
      if (b[1] !== a[1]) return b[1] - a[1];

      const aStr = String(a[0]);
      const bStr = String(b[0]);

      const aStartsWithBackslash = aStr.startsWith("\\");
      const bStartsWithBackslash = bStr.startsWith("\\");
      if (!aStartsWithBackslash && bStartsWithBackslash) return -1;
      if (aStartsWithBackslash && !bStartsWithBackslash) return 1;

      const startsWithLower = (value: string) => {
        const first = value.trim().charAt(0);
        if (!first) return false;
        return first >= 'a' && first <= 'z';
      };

      const aLower = startsWithLower(aStr);
      const bLower = startsWithLower(bStr);
      if (aLower !== bLower) return aLower ? 1 : -1;
      const nameOrder = aStr.localeCompare(bStr, 'en', { sensitivity: 'base', numeric: true });
      if (nameOrder !== 0) return nameOrder;
      return 0;
    };

    const table3Data = Array.from(statsMap.entries()).map(([method, data]) => {
      const usernames = Array.from(data.destUsers.entries())
        .sort(usernameSort)
        .slice(0, MAX_DEST_USERNAMES_PER_METHOD)
        .map(([name, count]) => `${name} (${count})`);
      const sources = Array.from(data.sources.entries())
        .sort(customSort)
        .slice(0, MAX_DEST_USERNAMES_PER_METHOD)
        .map(([name, count]) => `${name} (${count})`);

      return {
        methodName: `${method} (${data.total})`,
        usernames,
        sources
      };
    });

    return { alarms: table1Data, actions: table3Data };

  } catch (error) {
    console.error("❌ AlienVault Fetch Error:", error);
    return { alarms: [], actions: [] };
  }
}

// ==========================================
// ส่วน API Handler หลัก
// ==========================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Missing date parameters' }, { status: 400 });
    }

    console.log(`🔄 Processing Report: ${startDate} to ${endDate}`);
    const [avData, pendingData] = await Promise.all([
      fetchAlienVaultData(startDate, endDate),
      fetchCywarePendingIncidents(startDate, endDate)
    ]);

    return NextResponse.json({
      alarms: avData.alarms,
      pendings: pendingData || [],
      actions: avData.actions
    });

  } catch (error: any) {
    console.error('❌ API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
