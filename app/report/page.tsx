// app/report/page.tsx
import React from 'react';
import { Arapey } from 'next/font/google';

// Import Components
import IncidentAlarm from '@/components/IncidentAlarm';
import IncidentPending from '@/components/IncidentPending';
import RecommendAction from '@/components/RecommendAction';

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
  // --- Mock Data ---
  const alarmData = [
    { threatType: "User Account was Unlocked", count: 202 },
    { threatType: "Windows Account Lockout", count: 137 },
    { threatType: "SSL Handshake High Activity to 10.100.90.9", count: 78 },
    { threatType: "FBNAIML - Outbound connection [TEST]", count: 41 },
    { threatType: "Failed Logon to Nonexistent Account", count: 33 },
    { threatType: "Powershell Execution of Encoded Command", count: 31 },
    { threatType: "VPN authentication Rejected", count: 17 },
    { threatType: "Failed Logon to Default Account", count: 13 },
    { threatType: "Windows Event Log Cleared", count: 13 },
    { threatType: "Failed Logon to Expired Account", count: 8 },
    { threatType: "HTTP SQL Injection Attempt", count: 8 },
    // ข้อมูลจำลองสำหรับทดสอบหน้าถัดไป
    { threatType: "User Account was Unlocked (Page 2)", count: 202 },
    { threatType: "Windows Account Lockout (Page 2)", count: 137 },
    { threatType: "SSL Handshake High Activity (Page 2)", count: 78 },
    { threatType: "FBNAIML - Outbound connection (Page 2)", count: 41 },
    { threatType: "Failed Logon to Nonexistent (Page 2)", count: 33 },
    { threatType: "Powershell Execution (Page 2)", count: 31 },
    { threatType: "VPN authentication (Page 2)", count: 17 },
    { threatType: "Failed Logon to Default (Page 2)", count: 13 },
    { threatType: "Windows Event Log Cleared (Page 2)", count: 13 },
  ];

  const pendingData = [
    { id: "Fabrinet-INC-001276", name: "Possible HTTP Malicious Payload Detection", stage: "Pending" },
    { id: "Fabrinet-INC-001277", name: "Compromised or manufacturer default password found in HTTP Basic Authentication", stage: "Pending" },
    { id: "Fabrinet-INC-001278", name: "React Server Components Vulnerability Scanner Traffic Detection", stage: "Pending" },
    { id: "Fabrinet-INC-001279", name: "Suspicious Telerik Web UI Request", stage: "Pending" },
    { id: "Fabrinet-INC-001280", name: "Outbound SSH Connections Over Web Ports", stage: "Pending" },
  ];

  const actionData = [
    {
      methodName: "User Account was Unlocked(202)",
      usernames: [
        "AdtranUser(1)", "Guest(1)", "Janes(1)", "JiradaS(1)", 
        "ManeewanN(1)", "NattapongL(1)", "NudjareeC(1)", 
        "PDCISCO Non-OTBU(1)", "PatsakornK(1)", "RanchidaJ(1)",
      ],
      sources: [
        "FBN-DC01(165)", "FBN-DC03(19)", "FNC-DC01(13)", 
        "FNC-DC02(3)", "FBN-DC02(1)", "FBNAPEX01(1)"
      ]
    }
  ];

  // Config: จำนวนแถวต่อหน้า
  const alarmPages = paginateData(alarmData, 12, 20); 
  const pendingPages = paginateData(pendingData, 20, 25);
  const actionPages = paginateData(actionData, 4, 6);

  return (
    <div className={`${arapey.variable} font-arapey flex flex-col items-center bg-gray-100 min-h-screen p-8 print:p-0 print:bg-white`}>
      
      {/* ================= SECTION 1: Incident Alarm ================= */}
      <div id="page-1">
        {alarmPages.map((pageData, index) => (
            <A4Page key={`alarm-page-${index}`}>
                
                {/* แก้ไข: แสดง HeaderImage เฉพาะหน้าแรก (index 0) เท่านั้น */}
                {index === 0 && <HeaderImage />}
                
                {/* Info Section เฉพาะหน้าแรก */}
                {index === 0 && (
                    <div className="mt-2 mb-8 text-lg text-black font-bold space-y-1.5 leading-snug">
                        <div className="flex"><span className="w-30 font-bold">Report Date :</span> <span className="font-normal">20 January 2026</span></div>
                        <div className="flex"><span className="w-25 font-bold">Report by :</span> <span className="font-normal">BMSP SOC Support</span></div>
                        <div className="flex"><span className="w-40 font-bold">Customer Name :</span> <span className="font-normal">Fabrinet</span></div>
                        <div className="flex"><span className="w-35 font-bold">Project Name :</span> <span className="font-normal">Fabrinet SOC</span></div>
                    </div>
                )}

                {/* แสดงตาราง */}
                <div className="flex-grow">
                    {/* ถ้าเป็นหน้าถัดไป (index > 0) ให้เพิ่ม padding บนหน่อย (pt-8) เพื่อความสวยงาม */}
                    <div className={index > 0 ? "pt-8" : ""}>
                       <IncidentAlarm data={pageData} />
                    </div>
                </div>
            </A4Page>
        ))}
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