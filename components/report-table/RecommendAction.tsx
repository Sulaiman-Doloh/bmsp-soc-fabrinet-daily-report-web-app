import React from 'react';

interface ActionItem {
  methodName: string;
  usernames: string[];
  sources: string[];
}

interface Props {
  data: ActionItem[];
  density?: "normal" | "compact" | "dense" | "ultra";
}

export default function ActionTable({ data, density = "normal" }: Props) {
  const isCompact = density === "compact" || density === "dense" || density === "ultra";
  const isDense = density === "dense" || density === "ultra";
  const isUltra = density === "ultra";
  const cellPaddingClass = isUltra ? "p-1" : isDense ? "p-1.5" : isCompact ? "p-1.5" : "p-2";
  const fontStyle = isUltra
    ? { fontSize: "8.2px", lineHeight: "1.14" }
    : isDense
      ? { fontSize: "9px", lineHeight: "1.2" }
        : isCompact
        ? { fontSize: "9.5px", lineHeight: "1.22" }
        : { fontSize: "10.2px", lineHeight: "1.26" };
  const listCellStyle = isUltra
    ? { fontSize: "7.6px", lineHeight: "1.14" }
    : isDense
      ? { fontSize: "8.2px", lineHeight: "1.17" }
      : isCompact
        ? { fontSize: "10px", lineHeight: "1.18" }
        : { fontSize: "13px", lineHeight: "1.22" };
  const getColumnCount = (count: number, isSource = false) => {
    if (!isSource && count >= 200) return 4;
    if (!isSource && count >= 120) return 3;
    if (!isSource && count >= 70) return 2;
    if (isSource && count >= 80) return 2;
    return 1;
  };
  const splitIntoColumns = (values: string[], columns: number) => {
    if (columns <= 1) return [values];
    const perColumn = Math.ceil(values.length / columns);
    const chunks: string[][] = [];
    for (let i = 0; i < columns; i += 1) {
      chunks.push(values.slice(i * perColumn, (i + 1) * perColumn));
    }
    return chunks.filter((chunk) => chunk.length > 0);
  };

  return (
    <div className="w-full mb-6 font-arapey break-inside-avoid text-black" style={fontStyle}>
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
            <th className="border border-black border-t-0 p-1.5 w-[20%] align-middle">Method Name</th>
            <th className="border border-black border-t-0 p-1.5 w-[20%] align-middle">Destination Username</th>
            <th className="border border-black border-t-0 p-1.5 w-[20%] align-middle">Sources</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => {
              const usernameColumns = getColumnCount(item.usernames.length);
              const sourceColumns = getColumnCount(item.sources.length, true);
              const usernameChunks = splitIntoColumns(item.usernames, usernameColumns);
              const sourceChunks = splitIntoColumns(item.sources, sourceColumns);
              return (
              <tr key={index}>
                <td className={`border border-black ${cellPaddingClass} text-center align-middle font-bold leading-snug break-words`} 
                    style={{ fontSize: "15px" }}>
                  {item.methodName || <span className="dash-center">-</span>}
                </td>
                <td
                  className={`border border-black ${cellPaddingClass} align-top font-medium leading-snug text-left style="font-size: 18px; "break-words`}
                  style={{ ...listCellStyle, fontSize: "13px" }}
                >
                  {item.usernames.length > 0 ? (
                    <div
                      className="grid gap-x-2"
                      style={{ gridTemplateColumns: `repeat(${usernameColumns}, minmax(0, 1fr))` }}
                    >
                      {usernameChunks.map((chunk, colIdx) => (
                        <div key={colIdx}>
                          {chunk.map((user, i) => (
                            <div key={`${colIdx}-${i}`} className="pb-[1px]">
                              {user}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="dash-center">-</div>
                  )}
                </td>
                <td
                  className={`border border-black ${cellPaddingClass} align-top font-medium leading-snug text-left style="font-size: 13px; "break-words`}
                  style={{ ...listCellStyle, fontSize: "13px" }}
                >
                  {item.sources.length > 0 ? (
                    <div
                      className="grid gap-x-2"
                      style={{ gridTemplateColumns: `repeat(${sourceColumns}, minmax(0, 1fr))` }}
                    >
                      {sourceChunks.map((chunk, colIdx) => (
                        <div key={colIdx}>
                          {chunk.map((source, i) => (
                            <div key={`${colIdx}-${i}`} className="pb-[1px]">
                              {source}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="dash-center">-</div>
                  )}
                </td>
              </tr>
            )})
          ) : (
            <tr>
              <td className={`border border-black ${cellPaddingClass} text-center align-middle font-bold`}>-</td>
              <td className={`border border-black ${cellPaddingClass} text-center align-middle font-bold`}>-</td>
              <td className={`border border-black ${cellPaddingClass} text-center align-middle font-bold`}>-</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
