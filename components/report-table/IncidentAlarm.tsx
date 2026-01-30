// components/report-table/IncidentAlarm.tsx
import React from 'react';

// กำหนด Type ให้ตรงกับที่ API ส่งมา (สำคัญมาก)
interface AlarmData {
  threatType: string; // ต้องใช้ชื่อนี้ให้ตรงกับ Backend
  count: number;
}

interface IncidentAlarmProps {
  data: AlarmData[];
}

const IncidentAlarm: React.FC<IncidentAlarmProps> = ({ data }) => {
  return (
    <div className="w-full">
        {/* หัวตาราง */}
        <div className="bg-[#0b102b] text-white font-bold py-2 px-4 text-xl border border-black">
            Incident Alarm Summary
        </div>
        
        {/* ตารางข้อมูล */}
        <table className="w-full border-collapse border-x border-b border-black">
            <thead>
                <tr className="bg-white">
                    <th className="border-y border-r border-black py-2 px-4 text-left font-bold text-black w-[80%]">
                        Threat Model Type
                    </th>
                    <th className="border-y border-black py-2 px-4 text-center font-bold text-black w-[20%]">
                        Count of Incident
                    </th>
                </tr>
            </thead>
            <tbody>
                {data.length > 0 ? (
                    data.map((item, index) => (
                        <tr key={index} className="border-b border-gray-300">
                            {/* ✅ จุดที่แก้ไข: เรียกใช้ item.threatType */}
                            <td className="border-r border-black py-2 px-4 text-black text-sm align-middle">
                                {item.threatType || "Unknown Threat"} 
                            </td>
                            <td className="py-2 px-4 text-center text-black font-bold align-middle">
                                {item.count}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={2} className="py-4 text-center text-gray-500 italic">
                            No incidents found
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
  );
};

export default IncidentAlarm;