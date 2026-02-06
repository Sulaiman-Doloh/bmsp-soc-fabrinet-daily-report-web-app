import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Regex สำหรับเช็คว่า string เป็น UUID หรือไม่
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ==========================================
// AlienVault helpers
// ==========================================

function getAlienVaultConfig() {
  const subdomain = process.env.ALIENVAULT_SUBDOMAIN;
  const clientId = process.env.ALIENVAULT_CLIENT_ID;
  const clientSecret = process.env.ALIENVAULT_CLIENT_SECRET;

  if (!subdomain || !clientId || !clientSecret) {
    throw new Error('AlienVault ENV missing');
  }

  return {
    clientId,
    clientSecret,
    baseUrl: `https://${subdomain}.alienvault.cloud/api/2.0`,
  };
}

// 1. ฟังก์ชันขอ Token
async function getAlienVaultToken() {
  const { clientId, clientSecret, baseUrl } = getAlienVaultConfig();
  const authString = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString('base64');

  try {
    const res = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store',
    });

    const data = await res.json();
    return data.access_token ?? null;
  } catch (error) {
    console.error('❌ AlienVault Token Error:', error);
    return null;
  }
}

// 2. ฟังก์ชันแปลง Asset ID เป็นชื่อ
async function resolveAssetId(assetId: string, token: string): Promise<string> {
  try {
    const { baseUrl } = getAlienVaultConfig();

    const res = await fetch(`${baseUrl}/assets/${assetId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'force-cache',
    });

    if (!res.ok) return assetId;

    const data = await res.json();
    return (
      data.name ||
      data.canonical ||
      data.hostnames?.[0] ||
      data.ip_addresses?.[0] ||
      assetId
    );
  } catch {
    return assetId;
  }
}

// 3. ฟังก์ชันหลักดึงข้อมูลและประมวลผล
async function fetchAlienVaultData(startDate: string, endDate: string) {
  const token = await getAlienVaultToken();
  if (!token) return { alarms: [], actions: [] };

  const startTs = new Date(startDate).getTime();
  const endTs =
    new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;

  try {
    const { baseUrl } = getAlienVaultConfig();

    const params = new URLSearchParams({
      timestamp_occured_gte: startTs.toString(),
      timestamp_occured_lte: endTs.toString(),
      status: 'open',
      size: '100',
      sort: 'timestamp_occured,asc',
    });

    const res = await fetch(`${baseUrl}/alarms?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) return { alarms: [], actions: [] };

    const data = await res.json();
    const alarmsList = data._embedded?.alarms || [];

    const statsMap = new Map<
      string,
      { count: number; users: Set<string>; sources: Set<string> }
    >();

    alarmsList.forEach((alarm: any) => {
      const method =
        alarm.rule_method ||
        alarm.rule_id ||
        alarm.rule_intent ||
        'Unknown Threat';

      if (!statsMap.has(method)) {
        statsMap.set(method, {
          count: 0,
          users: new Set(),
          sources: new Set(),
        });
      }

      const entry = statsMap.get(method)!;
      entry.count++;

      if (alarm.destination_username) {
        entry.users.add(alarm.destination_username);
      }

      const event = Array.isArray(alarm.events)
        ? alarm.events[0]
        : alarm.events;

      const src =
        event?.source_address ||
        alarm.source_name ||
        'Unknown';

      entry.sources.add(src);
    });

    return {
      alarms: Array.from(statsMap.entries()).map(([k, v]) => ({
        threatType: k,
        count: v.count,
      })),
      actions: Array.from(statsMap.entries()).map(([k, v]) => ({
        methodName: `${k} (${v.count})`,
        usernames: [...v.users].map((u) => `${u} (1)`),
        sources: [...v.sources].map((s) => `${s} (1)`),
      })),
    };
  } catch (error) {
    console.error('❌ AlienVault Fetch Error:', error);
    return { alarms: [], actions: [] };
  }
}

// ==========================================
// API Handler
// ==========================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing date parameters' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const [avData, sbData] = await Promise.all([
      fetchAlienVaultData(startDate, endDate),
      supabase
        .from('incidents')
        .select('inc_no, incident_name, status')
        .eq('customer', 'Fabrinet')
        .gte('incident_date', startDate)
        .lte('incident_date', endDate)
        .order('incident_date', { ascending: false }),
    ]);

    return NextResponse.json({
      alarms: avData.alarms,
      pendings: sbData.data ?? [],
      actions: avData.actions,
    });
  } catch (error: any) {
    console.error('❌ API Error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
