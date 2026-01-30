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
    <div className="w-full mb-8 font-arapey break-inside-avoid">
      {/* ส่วน Header รูปภาพ */}
      <div className="w-full">
        <img 
            src="/images/pending.png" 
            alt="Incident Pending Summary" 
            className="w-full h-auto block" 
        />
      </div>

      <table className="w-full border-collapse border border-black border-t-0 text-base">
        <thead>
          <tr className="bg-white text-black font-bold text-center">
            <th className="border border-black border-t-0 p-2 w-14">No.</th>
            <th className="border border-black border-t-0 p-2 w-48">Incident ID</th>
            <th className="border border-black border-t-0 p-2">Incident Name</th>
            <th className="border border-black border-t-0 p-2 w-24">Stage</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="h-12">
              <td className="border border-black p-2 text-center font-bold align-middle">{index + 1}</td>
              <td className="border border-black p-2 pl-4 font-bold align-middle">{item.id}</td>
              <td className="border border-black p-2 pl-4 align-middle font-medium leading-tight">{item.name}</td>
              <td className="border border-black p-2 text-center font-bold align-middle">
                {item.stage}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}