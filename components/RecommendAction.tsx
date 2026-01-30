import React from 'react';

interface ActionItem {
  methodName: string;
  usernames: string[];
  sources: string[];
}

interface Props {
  data: ActionItem[];
}

export default function ActionTable({ data }: Props) {
  return (
    <div className="w-full mb-8 font-arapey break-inside-avoid">
      {/* ส่วน Header รูปภาพ */}
      <div className="w-full">
        <img 
            src="/images/action.png" 
            alt="Recommend Action" 
            className="w-full h-auto block" 
        />
      </div>

      <table className="w-full border-collapse border border-black border-t-0 text-base">
        <thead>
          <tr className="bg-white text-black font-bold text-center">
            <th className="border border-black border-t-0 p-2 w-1/3">Method Name</th>
            <th className="border border-black border-t-0 p-2 w-1/3">Destination Username</th>
            <th className="border border-black border-t-0 p-2 w-1/3">Sources</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td className="border border-black p-4 text-center align-middle font-bold">
                {item.methodName}
              </td>
              <td className="border border-black p-4 align-top font-medium leading-relaxed">
                {item.usernames.map((user, i) => (
                  <div key={i}>{user}</div>
                ))}
              </td>
              <td className="border border-black p-4 align-top font-medium leading-relaxed">
                {item.sources.map((source, i) => (
                  <div key={i}>{source}</div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}