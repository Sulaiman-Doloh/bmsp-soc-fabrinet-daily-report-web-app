import React from "react";
import Sidebar from "@/components/sidebar/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#020817]">
      <Sidebar />
      <main
        className="flex-1 h-screen overflow-y-auto p-8 print:p-0 print:h-auto print:overflow-visible
        bg-[radial-gradient(85%_55%_at_0%_0%,rgba(14,116,144,0.20),transparent_58%),radial-gradient(65%_45%_at_100%_0%,rgba(30,58,138,0.24),transparent_62%),linear-gradient(180deg,#071022_0%,#09142a_40%,#0a1223_100%)]"
      >
        {children}
      </main>
    </div>
  );
}
