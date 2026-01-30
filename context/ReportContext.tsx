// context/ReportContext.tsx
"use client";

import React, { createContext, useContext, useState } from 'react';

// กำหนดหน้าตาของข้อมูลที่จะส่งหากัน
interface ReportContextType {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: React.ReactNode }) {
  // ตั้งค่าเริ่มต้นเป็นวันที่ปัจจุบัน
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  return (
    <ReportContext.Provider value={{ startDate, endDate, setStartDate, setEndDate }}>
      {children}
    </ReportContext.Provider>
  );
}

// ฟังก์ชันสำหรับเรียกใช้ข้อมูล (Custom Hook)
export function useReport() {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
}