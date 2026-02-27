// components/Sidebar.tsx
"use client";

import React, { useState } from "react";
import { useReport } from "@/context/ReportContext";

export default function Sidebar() {
  const [isReportSocOpen, setIsReportSocOpen] = useState(true);
  const [activeReport, setActiveReport] = useState("fabrinet");
  const [isCollapsed, setIsCollapsed] = useState(false); // ✅ เพิ่ม state ย่อ/ขยาย

  const {
    selectedDate,
    reportDate,
    setSelectedDate,
    setReportDate,
    isRunning,
  } = useReport();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleRunReport = () => {
    if (!selectedDate || isRunning) return;
    setReportDate(selectedDate);
  };

  const handleStopReport = () => {
    if (!reportDate && !isRunning) return;
    setReportDate("");
  };

  const handleDownload = async () => {
    if (!reportDate || isRunning) return;

    const reportRoot = document.getElementById("report-root");
    if (!reportRoot) return;

    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const html2canvasModule = await import("html2canvas");
      const html2canvas = html2canvasModule.default || html2canvasModule;

      const jspdfModule = await import("jspdf");
      const { jsPDF } = jspdfModule;

      const filename = `SOC Daily Report [Fabrinet]${reportDate}.pdf`;

      const pages = Array.from(
        reportRoot.querySelectorAll(".a4-page")
      ) as HTMLElement[];

      if (pages.length === 0) return;

      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < pages.length; i++) {
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve())
        );

        const canvas = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.98);

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight);
      }

      pdf.save(filename);
    } catch (error) {
      console.error("Download PDF failed:", error);
    }
  };

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } bg-[#050a20] text-white h-screen sticky top-0 left-0 flex flex-col shadow-xl print:hidden z-50 font-sans transition-all duration-300`}
    >
      {/* Logo + Toggle */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-[#020510]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center font-bold shadow-lg">
            B
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-wide">
              SOC System
            </span>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-400 hover:text-white transition"
        >
          ☰
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 mb-6">
          <button
            onClick={() => setIsReportSocOpen(!isReportSocOpen)}
            className="w-full flex items-center justify-between text-gray-400 hover:text-white mb-2 px-2 transition uppercase text-xs font-bold tracking-wider"
          >
            {!isCollapsed && <span>📁 Report SOC</span>}
            {!isCollapsed && <span>{isReportSocOpen ? "▼" : "▶"}</span>}
          </button>

          {isReportSocOpen && (
            <div className="space-y-3 mt-2">
              {/* Date Selector */}
              {!isCollapsed && (
                <div className="px-2 mb-4">
                  <div className="bg-[#0b1640] p-3 rounded-lg border border-gray-700/50">
                    <label className="text-[10px] text-blue-300 font-bold uppercase mb-2 block">
                      📅 Select Report Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      disabled={isRunning}
                      className="w-full bg-[#1a234d] border border-gray-600 text-white text-sm rounded-md px-3 py-2"
                    />

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={handleRunReport}
                        disabled={!selectedDate || isRunning}
                        className="flex-1 bg-blue-600 disabled:bg-blue-900/40 hover:bg-blue-500 text-white font-bold py-2 rounded-md text-xs"
                      >
                        ▶ Run
                      </button>
                      <button
                        onClick={handleStopReport}
                        disabled={!reportDate && !isRunning}
                        className="flex-1 bg-rose-600 disabled:bg-rose-900/40 hover:bg-rose-500 text-white font-bold py-2 rounded-md text-xs"
                      >
                        ■ Stop
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Fabrinet */}
              <button
                onClick={() => setActiveReport("fabrinet")}
                className={`w-full text-left px-4 py-2 rounded-md transition flex items-center gap-2 text-sm font-medium ${
                  activeReport === "fabrinet"
                    ? "bg-blue-900/50 text-blue-300 border-l-4 border-blue-500"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <span>📄</span>
                {!isCollapsed && "Fabrinet Report"}
              </button>

              {/* Daily */}
              <button
                onClick={() => setActiveReport("daily")}
                className={`w-full text-left px-4 py-2 rounded-md transition flex items-center gap-2 text-sm font-medium ${
                  activeReport === "daily"
                    ? "bg-blue-900/50 text-blue-300 border-l-4 border-blue-500"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <span>📊</span>
                {!isCollapsed && "Daily Report"}
              </button>

              {/* Monthly */}
              <button className="w-full text-left px-4 py-2 rounded-md transition flex items-center gap-2 text-sm font-medium text-gray-300 hover:bg-gray-800">
                <span>📈</span>
                {!isCollapsed && "Monthly Report"}
              </button>
            </div>
          )}
        </div>

        {/* System */}
        <div className="px-3 border-t border-gray-800 pt-4 mt-2">
          {!isCollapsed && (
            <div className="text-gray-500 uppercase text-xs font-bold tracking-wider mb-2 px-2">
              System
            </div>
          )}

          <button className="w-full text-left px-4 py-2 rounded-md transition flex items-center gap-3 text-gray-300 hover:bg-gray-800 hover:text-white">
            <span>⚙️</span>
            {!isCollapsed && "Settings"}
          </button>

          <button className="w-full text-left px-4 py-2 rounded-md transition flex items-center gap-3 text-gray-300 hover:bg-gray-800 hover:text-white">
            <span>👤</span>
            {!isCollapsed && "User Profile"}
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 bg-[#020510]">
        <button
          onClick={handleDownload}
          disabled={!reportDate || isRunning}
          className="w-full bg-emerald-600 disabled:bg-emerald-900/40 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
        >
          ⬇ {!isCollapsed && "Download PDF"}
        </button>

        {!isCollapsed && (
          <p className="text-[10px] text-center text-gray-600 mt-3 font-mono">
            System v2.1.0
          </p>
        )}
      </div>
    </aside>
  );
}