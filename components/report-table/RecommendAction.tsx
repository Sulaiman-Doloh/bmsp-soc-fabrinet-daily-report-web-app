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
    <div className="w-full mb-8 font-arapey break-inside-avoid text-black text-[9px]">
      {/* ส่วน Header รูปภาพ */}
      <div className="w-full">
        <img 
            src="/images/action.png" 
            alt="Recommend Action" 
            className="w-full h-auto block" 
        />
      </div>

      <table className="report-table w-full border-collapse border border-black border-t-0 table-fixed">
        <thead>
          <tr className="bg-white font-bold text-center">
            <th className="border border-black border-t-0 p-2 w-1/3 align-middle">Method Name</th>
            <th className="border border-black border-t-0 p-2 w-1/3 align-middle">Destination Username</th>
            <th className="border border-black border-t-0 p-2 w-1/3 align-middle">Sources</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={index}>
                <td className="border border-black p-4 text-center align-middle font-bold">
                  {item.methodName || <span className="dash-center">-</span>}
                </td>
                <td className="border border-black p-4 align-middle font-medium leading-tight text-left">
                  {item.usernames.length > 0 ? (
                    item.usernames.map((user, i) => <div key={i}>{user}</div>)
                  ) : (
                    <div className="dash-center">-</div>
                  )}
                </td>
                <td className="border border-black p-4 align-middle font-medium leading-tight text-left">
                  {item.sources.length > 0 ? (
                    item.sources.map((source, i) => <div key={i}>{source}</div>)
                  ) : (
                    <div className="dash-center">-</div>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="border border-black p-4 text-center align-middle font-bold">-</td>
              <td className="border border-black p-4 text-center align-middle font-bold">-</td>
              <td className="border border-black p-4 text-center align-middle font-bold">-</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}