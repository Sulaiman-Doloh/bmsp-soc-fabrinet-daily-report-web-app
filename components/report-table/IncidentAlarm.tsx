import React from 'react';

// ✅ แก้ไข: เปลี่ยน methodName เป็น threatType ให้ตรงกับ API
interface AlarmItem {
  threatType: string; 
  count: number;
}

interface Props {
  data: AlarmItem[];
}

export default function AlarmTable({ data }: Props) {
  return (
    <div className="w-full mb-8 font-arapey break-inside-avoid text-black text-[12px]">
      {/* ส่วน Header: ใช้รูปภาพแทน Code เดิม */}
      <div className="w-full">
        <img 
          src="/images/alarm.png" 
          alt="Incident Alarm Summary" 
          className="w-full h-auto block" /* block ช่วยลบช่องว่างใต้รูป */
        />
      </div>

      {/* ตัวตาราง */}
      {/* ลบ border-t ออก (border-t-0) เพื่อให้เส้นขอบบนของตารางไม่ซ้อนกับรูปภาพ */}
      <table className="report-table w-full border-collapse border border-black border-t-0 table-fixed">
        <thead>
          <tr className="bg-white font-bold">
            <th className="border border-black border-t-0 p-2 text-left w-3/4 pl-4 align-middle">Threat Model Type</th>
            <th className="border border-black border-t-0 p-2 text-center w-1/4 align-middle">Count of Incident</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={index} className="h-10">
                {/* ✅ แก้ไข: เรียกใช้ threatType และกันเหนียวกรณีค่าว่าง */}
                <td className="border border-black p-2 pl-4 font-bold align-middle text-left">
                    {item.threatType || <span className="dash-center">-</span>}
                </td>
                <td className="border border-black p-2 text-center font-bold align-middle">
                  {typeof item.count === "number" ? item.count : <span className="dash-center">-</span>}
                </td>
              </tr>
            ))
          ) : (
            // กรณีไม่มีข้อมูล
            <tr>
                <td className="border border-black p-4 text-center align-middle font-bold">-</td>
                <td className="border border-black p-4 text-center align-middle font-bold">-</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}