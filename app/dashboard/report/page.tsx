// app/report/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Arapey } from 'next/font/google';

// Import Components
import IncidentAlarm from '@/components/report-table/IncidentAlarm';
import IncidentPending from '@/components/report-table/IncidentPending';
import RecommendAction from '@/components/report-table/RecommendAction';

// Import Context
import { useReport } from '@/context/ReportContext';

const arapey = Arapey({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-arapey',
});

// --- Helper Function: ตัดแบ่งข้อมูล ---
function paginateData<T>(array: T[], firstPageSize: number, otherPageSize: number) {
  const pages = [];
  if (array.length > 0) {
    pages.push(array.slice(0, firstPageSize));
  }
  let i = firstPageSize;
  while (i < array.length) {
    pages.push(array.slice(i, i + otherPageSize));
    i += otherPageSize;
  }
  return pages;
}

function formatReportDate(dateStr: string) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return dateStr;
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  return `${String(day).padStart(2, "0")} ${monthNames[month - 1]} ${year}`;
}

function buildActionPages(data: any[], maxPerPage: number) {
  const rowOverheadUnits = 0.5;
  const pageBottomBufferUnits = 3;
  const effectivePageLimit = Math.max(1, maxPerPage - pageBottomBufferUnits);
  const methodCharsPerLine = 34;
  const usernameCharsPerLine = 30;
  const sourceCharsPerLine = 34;
  const maxRowUnits = Math.max(1, effectivePageLimit - rowOverheadUnits);
  const normalizedRows: any[] = [];

  const estimateListUnits = (values: string[], charsPerLine: number) => {
    if (!values || values.length === 0) return 1;
    return values.reduce((sum, value) => {
      const text = String(value || "-");
      const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
      return sum + lines;
    }, 0);
  };

  const estimateRowUnits = (item: any) => {
    const usernames = Array.isArray(item.usernames) ? item.usernames : [];
    const sources = Array.isArray(item.sources) ? item.sources : [];
    const methodText = String(item.methodName || "-");

    const methodUnits = Math.max(1, Math.ceil(methodText.length / methodCharsPerLine));
    const usernameUnits = estimateListUnits(usernames, usernameCharsPerLine);
    const sourceUnits = estimateListUnits(sources, sourceCharsPerLine);

    return Math.max(methodUnits, usernameUnits, sourceUnits) + rowOverheadUnits;
  };

  // Keep method in one row by default, but split very large rows that cannot fit in one A4 page.
  data.forEach((item) => {
    const usernames = Array.isArray(item.usernames) ? item.usernames : [];
    const sources = Array.isArray(item.sources) ? item.sources : [];
    const maxLen = Math.max(usernames.length, sources.length, 1);

    if (estimateRowUnits(item) <= maxRowUnits) {
      normalizedRows.push(item);
      return;
    }

    let start = 0;
    while (start < maxLen) {
      let end = start + 1;
      let bestEnd = end;

      while (end <= maxLen) {
        const candidate = {
          ...item,
          usernames: usernames.slice(start, end),
          sources: sources.slice(start, end)
        };
        if (estimateRowUnits(candidate) <= maxRowUnits) {
          bestEnd = end;
          end += 1;
          continue;
        }
        break;
      }

      if (bestEnd <= start) bestEnd = start + 1;

      normalizedRows.push({
        ...item,
        usernames: usernames.slice(start, bestEnd),
        sources: sources.slice(start, bestEnd),
      });
      start = bestEnd;
    }
  });

  const pages: any[][] = [];
  let currentPage: any[] = [];
  let currentUnits = 0;

  const splitItemByCapacity = (item: any, capacityUnits: number) => {
    const usernames = Array.isArray(item.usernames) ? item.usernames : [];
    const sources = Array.isArray(item.sources) ? item.sources : [];
    const maxLen = Math.max(usernames.length, sources.length, 1);
    if (maxLen <= 1 || capacityUnits <= 0) {
      return { fitPart: null as any, restPart: item };
    }

    let bestEnd = 0;
    for (let end = 1; end <= maxLen; end += 1) {
      const candidate = {
        ...item,
        usernames: usernames.slice(0, end),
        sources: sources.slice(0, end),
      };
      if (estimateRowUnits(candidate) <= capacityUnits) {
        bestEnd = end;
      } else {
        break;
      }
    }

    if (bestEnd <= 0) {
      return { fitPart: null as any, restPart: item };
    }

    const fitPart = {
      ...item,
      usernames: usernames.slice(0, bestEnd),
      sources: sources.slice(0, bestEnd),
    };

    if (bestEnd >= maxLen) {
      return { fitPart, restPart: null as any };
    }

    const restPart = {
      ...item,
      usernames: usernames.slice(bestEnd),
      sources: sources.slice(bestEnd),
    };

    return { fitPart, restPart };
  };

  const flushPage = () => {
    if (currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [];
      currentUnits = 0;
    }
  };

  const getPageUnits = (pageItems: any[]) =>
    pageItems.reduce((sum, entry) => sum + estimateRowUnits(entry), 0);

  normalizedRows.forEach((item) => {
    let workingItem = item;

    while (workingItem) {
      const itemUnits = estimateRowUnits(workingItem);
      const remainingUnits = effectivePageLimit - currentUnits;

      if (currentPage.length === 0 || itemUnits <= remainingUnits) {
        currentPage.push(workingItem);
        currentUnits += itemUnits;
        workingItem = null;
        continue;
      }

      const { fitPart, restPart } = splitItemByCapacity(workingItem, remainingUnits);
      if (fitPart) {
        currentPage.push(fitPart);
        currentUnits += estimateRowUnits(fitPart);
        flushPage();
        workingItem = restPart;
        continue;
      }

      flushPage();
    }
  });

  flushPage();

  // Rebalance pages: move first rows of next page upward when there is room.
  for (let i = 0; i < pages.length - 1; i += 1) {
    while (pages[i + 1].length > 0) {
      const candidate = pages[i + 1][0];
      const candidateUnits = estimateRowUnits(candidate);
      const currentUnitsInPage = getPageUnits(pages[i]);
      if (currentUnitsInPage + candidateUnits > effectivePageLimit) {
        break;
      }
      pages[i].push(candidate);
      pages[i + 1].shift();
    }
  }

  return pages.filter((page) => page.length > 0);
}
// --- Component: A4 Page ---
const A4Page = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  return (
    <div
      className={`a4-page w-[210mm] min-h-[297mm] bg-white shadow-lg mb-8 mx-auto relative flex flex-col overflow-hidden
      print:shadow-none print:mb-0 print:break-after-page ${className}`}
    >
      <div className="a4-safe-area">
        {children}
      </div>
    </div>
  );
};

// --- Component: Header Image ---
const HeaderImage = () => (
  <div className="w-full h-auto mb-0">
     <img src="/images/header.png" alt="Report Header" className="w-full h-auto object-cover" />
  </div>
);

export default function ReportPage() {
  const { reportDate, setIsRunning } = useReport();

  const [alarmData, setAlarmData] = useState<any[]>([]);
  const [pendingData, setPendingData] = useState<any[]>([]);
  const [actionData, setActionData] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!reportDate) {
      abortRef.current?.abort();
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setLoading(false);
      setIsRunning(false);
      setProgress(0);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setIsRunning(true);
      setProgress(0);
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      progressTimerRef.current = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 5 : prev));
      }, 700);

      try {
        const res = await fetch(`/api/soc-report?start=${reportDate}&end=${reportDate}`, {
          signal: controller.signal
        });
        
        if (!res.ok) throw new Error("Failed to fetch data");
        
        const result = await res.json();
        
        // --- 3.1 Table 1 (Alarm Summary) ---
        // ✅ แก้ไข: ใช้ข้อมูลจาก Backend ได้เลย ไม่ต้องวน Loop คำนวณซ้ำ
        // Backend ส่งมาเป็น [{ threatType: "...", count: N }] แล้ว
        setAlarmData(result.alarms || []);

        // --- 3.2 Table 2 (Pending) ---
        // Mapping field ให้ตรงกับ Component
        const mappedPending = (result.pendings || []).map((item: any) => ({
            inc_no: item.inc_no,
            incident_name: item.incident_name,
            status: item.status || "Pending"
        })).sort((a: any, b: any) => {
            const extractNumericId = (value: string) => {
              const text = String(value || "");
              const match = text.match(/(\d+)(?!.*\d)/);
              return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
            };
            const aNum = extractNumericId(a.inc_no);
            const bNum = extractNumericId(b.inc_no);
            if (aNum !== bNum) return aNum - bNum;
            return String(a.inc_no || "").localeCompare(String(b.inc_no || ""), "en", { numeric: true, sensitivity: "base" });
        });
        setPendingData(mappedPending);

        // --- 3.3 Table 3 (Action) ---
        // ใช้ข้อมูลจาก Backend ได้เลย
        setActionData(result.actions || []);

      } catch (err: any) {
        if (err?.name === "AbortError") {
          return;
        }
        console.error("Fetch error:", err);
        setError(err.message);
        setAlarmData([]);
        setPendingData([]);
      } finally {
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        setProgress(100);
        setLoading(false);
        setIsRunning(false);
      }
    };

    fetchData();
  }, [reportDate, setIsRunning]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);


  // 4. แบ่งหน้าข้อมูล (Pagination)
  const alarmPages = paginateData(alarmData, 12, 20); 
  const pendingPages = paginateData(pendingData, 20, 25);
  const threatOrder = alarmData.map((item) => item.threatType);
  const getMethodKey = (methodName: string) => {
    const trimmed = methodName?.trim() || "";
    const cutIndex = trimmed.lastIndexOf(" (");
    return cutIndex > 0 ? trimmed.slice(0, cutIndex) : trimmed;
  };
  const sortedActionData = [...actionData].sort((a, b) => {
    const aKey = getMethodKey(a.methodName);
    const bKey = getMethodKey(b.methodName);
    const aIndex = threatOrder.indexOf(aKey);
    const bIndex = threatOrder.indexOf(bKey);
    const aRank = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
    const bRank = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
    if (aRank !== bRank) return aRank - bRank;
    return aKey.localeCompare(bKey);
  });
  const actionPages = buildActionPages(sortedActionData, 55);

  if (!reportDate) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-bold text-gray-600">
        Please select a report date and click Run Report.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-blue-800 font-bold">
        <div className="text-xl animate-pulse">Loading Data...</div>
        <div className="mt-3 text-lg">{progress}%</div>
        <div className="mt-3 h-2 w-64 bg-blue-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }
  
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold">Error: {error}</div>;
  }

  return (
    <div
      id="report-root"
      className={`${arapey.variable} report-root font-arapey flex flex-col items-center min-h-screen p-8 print:p-0 print:bg-white`}
    >
      
      {/* ================= SECTION 1: Incident Alarm ================= */}
      <div id="page-1">
        {alarmPages.length > 0 ? (
            alarmPages.map((pageData, index) => (
                <A4Page key={`alarm-page-${index}`}>
                    {index === 0 && <HeaderImage />}
                    
                    {index === 0 && (
                        <div className="mt-0 mb-5 text-lg text-black font-bold space-y-1 leading-snug">
                            {/* ใช้ w-44 เพื่อจัดระเบียบข้อความ */}
                            <div className="flex"><span className="w-27 font-bold">Report Date :</span> <span className="font-normal">{formatReportDate(reportDate)}</span></div>
                            <div className="flex"><span className="w-23 font-bold">Report by :</span> <span className="font-normal">BMSP SOC Support</span></div>
                            <div className="flex"><span className="w-35 font-bold">Customer Name :</span> <span className="font-normal">Fabrinet</span></div>
                            <div className="flex"><span className="w-30 font-bold">Project Name :</span> <span className="font-normal">Fabrinet SOC</span></div>
                        </div>
                    )}

                    <div className="flex-grow">
                        <div className={index > 0 ? "pt-8" : ""}>
                           <IncidentAlarm data={pageData} />
                        </div>
                    </div>
                </A4Page>
            ))
        ) : (
            <A4Page>
                 <HeaderImage />
                 <div className="h-96 flex flex-col items-center justify-center text-gray-400">
                    <p className="text-2xl font-bold">No Data Found</p>
                    <p className="text-sm">Date {formatReportDate(reportDate)}</p>
                 </div>
            </A4Page>
        )}
      </div>

      {/* ================= SECTION 2: Incident Pending ================= */}
      <div id="page-2">
         {pendingPages.length > 0 ? (
            pendingPages.map((pageData, index) => (
              <A4Page key={`pending-page-${index}`}>
                <div className="pt-8">
                  <IncidentPending data={pageData} />
                </div>
              </A4Page>
            ))
         ) : (
            <A4Page>
              <div className="pt-8">
                <IncidentPending data={[]} />
              </div>
            </A4Page>
         )}
      </div>

      {/* ================= SECTION 3: Recommend Action ================= */}
      <div id="page-3">
         {actionPages.length > 0 ? (
            actionPages.map((pageData, index) => (
              <A4Page key={`action-page-${index}`}>
                <div className="pt-4">
                  <RecommendAction data={pageData} />
                </div>
              </A4Page>
            ))
         ) : (
            <A4Page>
              <div className="pt-4">
                <RecommendAction data={[]} />
              </div>
            </A4Page>
         )}
      </div>

    </div>
  );
}

