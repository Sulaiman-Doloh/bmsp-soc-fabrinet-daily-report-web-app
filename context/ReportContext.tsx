// context/ReportContext.tsx
"use client";

import React, { createContext, useContext, useState } from 'react';

// กำหนดหน้าตาของข้อมูลที่จะส่งหากัน
interface ReportContextType {
  selectedDate: string;
  reportDate: string;
  setSelectedDate: (date: string) => void;
  setReportDate: (date: string) => void;
  isRunning: boolean;
  setIsRunning: (value: boolean) => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: React.ReactNode }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  return (
    <ReportContext.Provider
      value={{
        selectedDate,
        reportDate,
        setSelectedDate,
        setReportDate,
        isRunning,
        setIsRunning
      }}
    >
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