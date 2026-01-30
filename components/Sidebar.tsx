// components/Sidebar.tsx
"use client";

import React, { useState } from 'react';

export default function Sidebar() {
  const [isReportSocOpen, setIsReportSocOpen] = useState(true);
  const [activeReport, setActiveReport] = useState('fabrinet');
  
  // เพิ่ม State สำหรับเก็บวันที่ (ค่าเริ่มต้นคือวันนี้)
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);

  const handlePrint = () => {
    window.print();
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <aside className="w-64 bg-[#050a20] text-white h-screen sticky top-0 left-0 flex flex-col shadow-xl print:hidden z-50 font-sans">
      
      {/* 1. Logo Area */}
      <div className="p-6 border-b border-gray-700 flex items-center gap-3 bg-[#020510]">
        <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center font-bold shadow-red-900/50 shadow-lg">B</div>
        <span className="text-lg font-bold tracking-wide">SOC System</span>
      </div>

      {/* 2. Menu Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        
        {/* --- Group 1: Report SOC --- */}
        <div className="px-3 mb-6">
          <button 
            onClick={() => setIsReportSocOpen(!isReportSocOpen)}
            className="w-full flex items-center justify-between text-gray-400 hover:text-white mb-2 px-2 transition-colors uppercase text-xs font-bold tracking-wider"
          >
            <span>📁 Report SOC</span>
            <span>{isReportSocOpen ? '▼' : '▶'}</span>
          </button>

          {isReportSocOpen && (
            <div className="space-y-3 mt-2">
              
              {/* === เพิ่ม: ส่วนกรองวันที่ (Date Filter) === */}
              <div className="px-2 mb-4">
                <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Select Date</label>
                <input 
                    type="date" 
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full bg-[#0b1640] border border-gray-600 text-gray-200 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
                />
              </div>

              {/* 1.1 Fabrinet Report */}
              <div>
                <button 
                  onClick={() => setActiveReport('fabrinet')}
                  className={`w-full text-left px-4 py-2 rounded-md transition flex items-center gap-2 text-sm font-medium
                    ${activeReport === 'fabrinet' ? 'bg-blue-900/50 text-blue-300 border-l-4 border-blue-500' : 'text-gray-300 hover:bg-gray-800'}`}
                >
                  📄 Fabrinet Report
                </button>

                {/* Submenu for Fabrinet */}
                {activeReport === 'fabrinet' && (
                  <div className="ml-4 pl-3 border-l border-gray-700 mt-1 space-y-1">
                    <button onClick={() => scrollToSection('page-1')} className="w-full text-left px-3 py-1.5 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition flex items-center gap-2">
                      <span>•</span> Alarm Summary
                    </button>
                    <button onClick={() => scrollToSection('page-2')} className="w-full text-left px-3 py-1.5 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition flex items-center gap-2">
                      <span>•</span> Pending Summary
                    </button>
                    <button onClick={() => scrollToSection('page-3')} className="w-full text-left px-3 py-1.5 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition flex items-center gap-2">
                      <span>•</span> Action Plan
                    </button>
                  </div>
                )}
              </div>

              {/* 1.2 Daily Report */}
              <button 
                onClick={() => setActiveReport('daily')}
                className={`w-full text-left px-4 py-2 rounded-md transition flex items-center gap-2 text-sm font-medium
                  ${activeReport === 'daily' ? 'bg-blue-900/50 text-blue-300 border-l-4 border-blue-500' : 'text-gray-300 hover:bg-gray-800'}`}
              >
                📊 Daily Report
              </button>

              {/* 1.3 Other Report */}
              <button className="w-full text-left px-4 py-2 rounded-md transition flex items-center gap-2 text-sm font-medium text-gray-300 hover:bg-gray-800">
                📈 Monthly Report
              </button>

            </div>
          )}
        </div>

        {/* --- Group 2: Settings --- */}
        <div className="px-3 border-t border-gray-800 pt-4 mt-2">
          <div className="text-gray-500 uppercase text-xs font-bold tracking-wider mb-2 px-2">System</div>
          <button className="w-full text-left px-4 py-2 rounded-md transition flex items-center gap-3 text-gray-300 hover:bg-gray-800 hover:text-white">
            <span>⚙️</span> Settings
          </button>
          <button className="w-full text-left px-4 py-2 rounded-md transition flex items-center gap-3 text-gray-300 hover:bg-gray-800 hover:text-white">
            <span>👤</span> User Profile
          </button>
        </div>

      </nav>

      {/* 3. Footer Actions */}
      <div className="p-4 border-t border-gray-700 bg-[#020510]">
        <button 
          onClick={handlePrint}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2"
        >
          🖨️ Print Report
        </button>
        <p className="text-[10px] text-center text-gray-600 mt-3 font-mono">System v2.1.0</p>
      </div>

    </aside>
  );
}