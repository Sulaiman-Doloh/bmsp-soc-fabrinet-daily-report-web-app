// app/report/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
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

// --- Component: A4 Page ---
const A4Page = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={`w-[210mm] min-h-[297mm] bg-white shadow-lg mb-8 mx-auto relative flex flex-col p-[15mm]
      print:shadow-none print:mb-0 print:break-after-page ${className}`}>
      {children}
    </div>
  );
};

// --- Component: Header Image ---
const HeaderImage = () => (
  <div className="w-full h-auto mb-6">
     <img src="/images/header.png" alt="Report Header" className="w-full h-auto object-cover" />
  </div>
);

export default function ReportPage() {
  const { startDate, endDate } = useReport();

  const [alarmData, setAlarmData] = useState<any[]>([]);
  const [pendingData, setPendingData] = useState<any[]>([]);
  const [actionData, setActionData] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/soc-report?start=${startDate}&end=${endDate}`);
        
        if (!res.ok) throw new Error("Failed to fetch data");
        
        const result = await res.json();
        
        // --- 3.1 Table 1 (Alarm Summary) ---
        // ✅ แก้ไข: ใช้ข้อมูลจาก Backend ได้เลย ไม่ต้องวน Loop คำนวณซ้ำ
        // Backend ส่งมาเป็น [{ threatType: "...", count: N }] แล้ว
        setAlarmData(result.alarms || []);

        // --- 3.2 Table 2 (Pending) ---
        // Mapping field ให้ตรงกับ Component
        const mappedPending = (result.pendings || []).map((item: any) => ({
            id: item.inc_no,
            name: item.incident_name,
            stage: item.status || "Pending"
        }));
        setPendingData(mappedPending);

        // --- 3.3 Table 3 (Action) ---
        // ใช้ข้อมูลจาก Backend ได้เลย
        setActionData(result.actions || []);

      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message);
        setAlarmData([]);
        setPendingData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);


  // 4. แบ่งหน้าข้อมูล (Pagination)
  const alarmPages = paginateData(alarmData, 12, 20); 
  const pendingPages = paginateData(pendingData, 20, 25);
  const actionPages = paginateData(actionData, 4, 6);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl font-bold text-blue-800 animate-pulse">Loading Data...</div>;
  }
  
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold">Error: {error}</div>;
  }

  return (
    <div className={`${arapey.variable} font-arapey flex flex-col items-center bg-gray-100 min-h-screen p-8 print:p-0 print:bg-white`}>
      
      {/* ================= SECTION 1: Incident Alarm ================= */}
      <div id="page-1">
        {alarmPages.length > 0 ? (
            alarmPages.map((pageData, index) => (
                <A4Page key={`alarm-page-${index}`}>
                    {index === 0 && <HeaderImage />}
                    
                    {index === 0 && (
                        <div className="mt-2 mb-8 text-lg text-black font-bold space-y-1.5 leading-snug">
                            <div className="flex"><span className="w-44 font-bold">Report Range :</span> <span className="font-normal">{startDate} to {endDate}</span></div>
                            <div className="flex"><span className="w-44 font-bold">Report by :</span> <span className="font-normal">BMSP SOC Support</span></div>
                            <div className="flex"><span className="w-44 font-bold">Customer Name :</span> <span className="font-normal">Fabrinet</span></div>
                            <div className="flex"><span className="w-44 font-bold">Project Name :</span> <span className="font-normal">Fabrinet SOC</span></div>
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
                    <p className="text-sm">Between {startDate} and {endDate}</p>
                 </div>
            </A4Page>
        )}
      </div>

      {/* ================= SECTION 2: Incident Pending ================= */}
      <div id="page-2">
         {pendingPages.map((pageData, index) => (
            <A4Page key={`pending-page-${index}`}>
                 <div className="pt-8"> 
                    <IncidentPending data={pageData} />
                 </div>
            </A4Page>
         ))}
      </div>

      {/* ================= SECTION 3: Recommend Action ================= */}
      <div id="page-3">
         {actionPages.map((pageData, index) => (
            <A4Page key={`action-page-${index}`}>
                 <div className="pt-8">
                    <RecommendAction data={pageData} />
                 </div>
            </A4Page>
         ))}
      </div>

    </div>
  );
}