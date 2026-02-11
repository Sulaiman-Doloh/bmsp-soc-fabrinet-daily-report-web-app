import React from 'react';

interface Incident {
  id: string;
  name: string;
  stage: string;
}

interface Props {
  data: Incident[];
}

export default function PendingTable({ data }: Props) {
  return (
    <div className="w-full mb-8 font-arapey break-inside-avoid text-black text-[12px]">
      {/* ส่วน Header รูปภาพ */}
      <div className="w-full">
        <img 
            src="/images/pending.png" 
            alt="Incident Pending Summary" 
            className="w-full h-auto block" 
        />
      </div>

      <table className="report-table w-full border-collapse border border-black border-t-0 table-fixed">
        <thead>
          <tr className="bg-white font-bold text-left">
            <th className="border border-black border-t-0 p-2 w-14 align-middle">No.</th>
            <th className="border border-black border-t-0 p-2 w-48 align-middle">Incident ID</th>
            <th className="border border-black border-t-0 p-2 align-middle">Incident Name</th>
            <th className="border border-black border-t-0 p-2 w-24 align-middle">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={index} className="h-12">
                <td className="border border-black p-2 text-left font-bold align-middle">{index + 1}</td>
                <td className="border border-black p-2 pl-4 font-bold align-middle text-left">
                  {item.id || <span className="dash-center">-</span>}
                </td>
                <td className="border border-black p-2 pl-4 align-middle font-medium leading-tight text-left">
                  {item.name || <span className="dash-center">-</span>}
                </td>
                <td className="border border-black p-2 text-left font-bold align-middle">
                  {item.stage || <span className="dash-center">-</span>}
                </td>
              </tr>
            ))
          ) : (
            <tr className="h-12">
              <td className="border border-black p-2 text-center font-bold align-middle">-</td>
              <td className="border border-black p-2 text-center font-bold align-middle">-</td>
              <td className="border border-black p-2 text-center font-bold align-middle">-</td>
              <td className="border border-black p-2 text-center font-bold align-middle">-</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}