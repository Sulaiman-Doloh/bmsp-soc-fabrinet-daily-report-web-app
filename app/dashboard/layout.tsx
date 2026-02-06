// app/(dashboard)/layout.tsx
import React from 'react';
import Sidebar from '@/components/sidebar/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar จะโผล่เฉพาะหน้าที่อยู่ในโฟลเดอร์ (dashboard) เท่านั้น */}
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto p-8 print:p-0 print:h-auto print:overflow-visible">
        {children}
      </main>
    </div>
  );
}