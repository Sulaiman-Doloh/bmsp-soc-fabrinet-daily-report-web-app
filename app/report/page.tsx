import React from "react";

type AlarmSummary = {
  threatType: string;
  count: number;
};

type PendingIncident = {
  id: string;
  name: string;
  stage: string;
};

type RecommendActionItem = {
  threatType: string;
  methodName: string;
  destinationUsers: string[];
  sources: string[];
};

const alarmSummaryData: AlarmSummary[] = [
  { threatType: "Windows Account Lockout", count: 210 },
  { threatType: "User Account was Unlocked", count: 198 },
  { threatType: "FBNAIML - Outbound connection [TEST]", count: 47 },
  { threatType: "Powershell Execution of Encoded Command", count: 45 },
  { threatType: "Failed Logon to Nonexistent Account", count: 39 },
  { threatType: "Failed Logon to Default Account", count: 16 }
];

const pendingIncidentData: PendingIncident[] = [
  {
    id: "Fabrinet-INC-001321",
    name: "Possible HTTP Malicious Payload Detection.",
    stage: "Completed"
  },
  {
    id: "Fabrinet-INC-001322",
    name: "Possible HTTP Malicious Payload Detection.",
    stage: "Pending"
  },
  {
    id: "Fabrinet-INC-001323",
    name: "Credential Breaches",
    stage: "Pending"
  }
];

const recommendActionData: RecommendActionItem[] = [
  {
    threatType: "Windows Account Lockout",
    methodName: "Windows Account Lockout",
    destinationUsers: ["WAYMO (7)", "administrator (6)", "itfuser (4)"],
    sources: ["FBN-DC01 (1)", "FBN-DC02 (1)", "FBN-DC03 (1)"]
  },
  {
    threatType: "User Account was Unlocked",
    methodName: "User Account was Unlocked",
    destinationUsers: ["AXUSER1 (1)", "NattapongL (1)", "Guest (1)"],
    sources: ["FBN-DC01 (154)", "FBN-DC03 (15)", "FNC-DC01 (14)"]
  },
  {
    threatType: "FBNAIML - Outbound connection [TEST]",
    methodName: "FBNAIML - Outbound connection [TEST]",
    destinationUsers: ["-"],
    sources: ["fbn-fs09 (47)"]
  },
  {
    threatType: "Powershell Execution of Encoded Command",
    methodName: "Powershell Execution of Encoded Command",
    destinationUsers: ["-"],
    sources: ["FITS-018-P (2)", "FITS-041-W (2)", "FBN-MFT01 (2)"]
  },
  {
    threatType: "Failed Logon to Nonexistent Account",
    methodName: "Failed Logon to Nonexistent Account",
    destinationUsers: ["CUS-0312-020$ (3)", "IT-P2381$ (3)"],
    sources: ["CUS0312020 (3)", "FBNADFS (3)", "FBNMX04 (3)"]
  },
  {
    threatType: "Failed Logon to Default Account",
    methodName: "Failed Logon to Default Account",
    destinationUsers: ["Guest (5)"],
    sources: ["FITS077 (6)", "CUS0471047 (5)", "FBNATOMN (5)"]
  }
];

const reportDate = "05 February 2026";
const customerName = "Fabrinet";

export default function ReportPage() {
  const orderedThreatTypes = alarmSummaryData.map((item) => item.threatType);
  const orderedRecommend = [...recommendActionData].sort((a, b) => {
    const aIndex = orderedThreatTypes.indexOf(a.threatType);
    const bIndex = orderedThreatTypes.indexOf(b.threatType);
    const aRank = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
    const bRank = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
    if (aRank !== bRank) return aRank - bRank;
    return a.threatType.localeCompare(b.threatType);
  });

  return (
    <div className="report-root min-h-screen bg-gray-100 py-10 print:bg-white">
      <div className="report-page mx-auto bg-white shadow-lg">
        <header className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-md bg-red-600 text-white flex items-center justify-center font-bold">
              B
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">BMSP SOC Support</p>
              <p className="text-sm text-slate-600">SOC Daily Report</p>
            </div>
          </div>
          <div className="text-right text-sm text-slate-700">
            <p className="font-semibold">Report Date : {reportDate}</p>
            <p>Customer Name : {customerName}</p>
            <p>Project Name : Fabrinet SOC</p>
          </div>
        </header>

        <section className="mt-8">
          <h2 className="section-title">Incident Alarm Summary</h2>
          <table className="report-table no-repeat-header mt-4">
            <thead>
              <tr>
                <th className="w-3/4 text-left">Threat Model Type</th>
                <th className="w-1/4 text-center">Count of Incident</th>
              </tr>
            </thead>
            <tbody>
              {alarmSummaryData.map((row) => (
                <tr key={row.threatType}>
                  <td>{row.threatType}</td>
                  <td className="text-center">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="section-break mt-10">
          <h2 className="section-title">Incident Pending Summary</h2>
          <table className="report-table no-repeat-header mt-4">
            <thead>
              <tr>
                <th className="w-14 text-left">No</th>
                <th className="w-48 text-left">Incident ID</th>
                <th className="text-left">Incident Name</th>
                <th className="w-24 text-left">Stage</th>
              </tr>
            </thead>
            <tbody>
              {pendingIncidentData.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  <td>{row.id}</td>
                  <td>{row.name}</td>
                  <td>{row.stage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="section-break mt-10">
          <h2 className="section-title">Recommend Action: (After Investigate Alarms)</h2>
          {orderedRecommend.map((item) => (
            <div key={item.threatType} className="mt-6">
              <div className="rounded-md border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800">
                {item.threatType}
              </div>
              <table className="report-table no-repeat-header mt-3">
                <thead>
                  <tr>
                    <th className="w-1/3 text-left">Method Name</th>
                    <th className="w-1/3 text-left">Destination Username</th>
                    <th className="w-1/3 text-left">Sources</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{item.methodName}</td>
                    <td>
                      {item.destinationUsers.length > 0
                        ? item.destinationUsers.map((user) => <div key={user}>{user}</div>)
                        : <span className="dash-center">-</span>}
                    </td>
                    <td>
                      {item.sources.length > 0
                        ? item.sources.map((source) => <div key={source}>{source}</div>)
                        : <span className="dash-center">-</span>}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
