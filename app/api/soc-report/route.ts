import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ==========================================
// ส่วน AlienVault Config
// ==========================================

const AV_SUBDOMAIN = process.env.ALIENVAULT_SUBDOMAIN;
const AV_CLIENT_ID = process.env.ALIENVAULT_CLIENT_ID;
const AV_CLIENT_SECRET = process.env.ALIENVAULT_CLIENT_SECRET;
const AV_BASE_URL = `https://${AV_SUBDOMAIN}.alienvault.cloud/api/2.0`;

// Regex สำหรับเช็คว่า string เป็น UUID หรือไม่
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
async function resolveAssetId(assetId: string, token: string): Promise<string> {
  try {
    const res = await fetch(`${AV_BASE_URL}/assets/${assetId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'force-cache'
    });

    if (res.status === 404) return assetId;
    if (!res.ok) return assetId;

    const data = await res.json();
    let name = data.name;
    if (!name) name = data.canonical;
    if (!name && data.hostnames && data.hostnames.length > 0) name = data.hostnames[0];
    if (!name && data.ip_addresses && data.ip_addresses.length > 0) name = data.ip_addresses[0];

    return name || assetId;
  } catch (error) {
    return assetId;
  }
}

// 3. ฟังก์ชันหลักดึงข้อมูลและประมวลผล
async function fetchAlienVaultData(startDate: string, endDate: string) {
  const token = await getAlienVaultToken();
  if (!token) return { alarms: [], actions: [] };

  const startTs = new Date(startDate).getTime();
  const endTs = new Date(endDate).getTime() + (24 * 60 * 60 * 1000) - 1;

  try {
    const params = new URLSearchParams({
      timestamp_occured_gte: startTs.toString(),
      timestamp_occured_lte: endTs.toString(),
      status: 'open',
      size: '100', // จำกัดจำนวนต่อหน้า
      sort: 'timestamp_occured,asc'
    });

    const res = await fetch(`${AV_BASE_URL}/alarms?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    });
    
    if (!res.ok) return { alarms: [], actions: [] };

    const data = await res.json();
    const alarmsList = data._embedded?.alarms || [];

    // --- ส่วนแปลง Asset ID (รวม ID แล้วยิงทีเดียว) ---
    const assetIdsToResolve = new Set<string>();
    alarmsList.forEach((alarm: any) => {
      const event = alarm.events ? (Array.isArray(alarm.events) ? alarm.events[0] : alarm.events) : null;
      if (event && event.source_asset_id) assetIdsToResolve.add(event.source_asset_id);
      const srcName = alarm.source_name || alarm.source_address;
      if (srcName && UUID_REGEX.test(srcName)) assetIdsToResolve.add(srcName);
    });

    const assetMap = new Map<string, string>();
    const resolvePromises = Array.from(assetIdsToResolve).map(async (id) => {
      const name = await resolveAssetId(id, token);
      assetMap.set(id, name);
    });
    await Promise.all(resolvePromises);

    // --- ส่วนนับสถิติ (Aggregation) ---
    const statsMap = new Map<string, { count: number, users: Set<string>, sources: Set<string> }>();

    alarmsList.forEach((alarm: any) => {
      // ✅ แก้ไข: ใช้ rule_method เป็นตัวหลัก ตาม JSON ที่ได้มา
      const method = alarm.rule_method || alarm.rule_id || alarm.rule_intent || "Unknown Threat";
      
      if (!statsMap.has(method)) {
        statsMap.set(method, { count: 0, users: new Set(), sources: new Set() });
      }
      const entry = statsMap.get(method)!;
      entry.count += 1;

      // เก็บ Usernames
      if (alarm.destination_username) {
        entry.users.add(`${alarm.destination_username}`);
      }

      // เก็บ Sources (เลือกชื่อที่แปลงแล้ว)
      let finalSourceName = "Unknown";
      const event = alarm.events ? (Array.isArray(alarm.events) ? alarm.events[0] : alarm.events) : null;
      const assetId = event?.source_asset_id;
      const alarmSourceNames = alarm.alarm_source_names || [];
      const ipAddress = event?.source_address;
      const fallbackSrc = alarm.source_name || alarm.source_address;

      if (assetId && assetMap.has(assetId)) {
        finalSourceName = assetMap.get(assetId)!;
      } else if (alarmSourceNames.length > 0) {
        finalSourceName = alarmSourceNames[0];
      } else if (ipAddress) {
        finalSourceName = ipAddress;
      } else if (fallbackSrc) {
         if (UUID_REGEX.test(fallbackSrc) && assetMap.has(fallbackSrc)) {
             finalSourceName = assetMap.get(fallbackSrc)!;
         } else {
             finalSourceName = fallbackSrc;
         }
      }
      entry.sources.add(finalSourceName);
    });

    // Format Output
    const table1Data = Array.from(statsMap.entries()).map(([method, data]) => ({
      threatType: method,
      count: data.count
    })).sort((a, b) => b.count - a.count);

    const table3Data = Array.from(statsMap.entries()).map(([method, data]) => ({
      methodName: `${method} (${data.count})`,
      usernames: Array.from(data.users).map(u => `${u} (1)`), 
      sources: Array.from(data.sources).map(s => `${s} (1)`)
    }));

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

    const [avData, sbData] = await Promise.all([
      fetchAlienVaultData(startDate, endDate),
      
      supabase
        .from('incidents')
        .select('inc_no, incident_name, status')
        .eq('customer', 'Fabrinet')
        .gte('incident_date', startDate)
        .lte('incident_date', endDate)
        .order('incident_date', { ascending: false })
    ]);

    return NextResponse.json({
      alarms: avData.alarms,
      pendings: sbData.data || [],
      actions: avData.actions
    });

  } catch (error: any) {
    console.error('❌ API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}