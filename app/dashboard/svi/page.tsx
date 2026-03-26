"use client";

import React, { useEffect, useState } from "react";
import { useReport } from "@/context/ReportContext";

type SeveritySummaryRow = { severity: string; count: number };
type TopRow = { name: string; count: number };
type IncidentRow = {
  inc_no: string;
  host_name: string;
  process_name: string;
  severity: string;
  status: string;
};

type SviReportResponse = {
  severitySummary: SeveritySummaryRow[];
  topUsers: TopRow[];
  topHosts: TopRow[];
  incidentSummary: IncidentRow[];
  endpointDetections: IncidentRow[];
};

const A4Page = ({ children }: { children: React.ReactNode }) => {
  return <div className="a4-page mx-auto shadow-lg mb-8 bg-white">{children}</div>;
};

const SectionHeader = ({ src, alt }: { src: string; alt: string }) => (
  <div className="w-full">
    <img src={src} alt={alt} className="w-full h-auto block" />
  </div>
);

const ChartPlaceholder = ({ title }: { title: string }) => (
  <div className="mt-4">
    <div className="text-center text-[12px] font-bold text-slate-700 mb-2">{title}</div>
    <div className="h-40 border border-slate-300 bg-white flex items-end justify-center gap-6 px-6 py-4">
      <div className="w-16 h-24 bg-blue-600" />
      <div className="w-16 h-24 bg-blue-600" />
      <div className="w-16 h-24 bg-blue-600" />
    </div>
  </div>
);

const SmallBarChart = ({ labels }: { labels: string[] }) => (
  <div className="mt-4">
    <div className="text-center text-[12px] font-bold text-slate-700 mb-2">Detections by severity</div>
    <div className="h-32 border border-slate-300 bg-white flex items-end justify-center gap-10 px-6 py-4">
      {labels.map((label) => (
        <div key={label} className="flex flex-col items-center gap-2">
          <div className="w-3 h-20 bg-blue-600" />
          <div className="text-[10px] text-slate-600">{label}</div>
        </div>
      ))}
    </div>
  </div>
);

function formatReportDate(dateStr: string) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return dateStr;
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  return `${String(day).padStart(2, "0")} ${monthNames[month - 1]} ${year}`;
}

export default function SviReportPage() {
  const { reportDate, setIsRunning } = useReport();

  const [data, setData] = useState<SviReportResponse>({
    severitySummary: [],
    topUsers: [],
    topHosts: [],
    incidentSummary: [],
    endpointDetections: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportDate) {
      setData({
        severitySummary: [],
        topUsers: [],
        topHosts: [],
        incidentSummary: [],
        endpointDetections: []
      });
      setLoading(false);
      setIsRunning(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsRunning(true);

        const res = await fetch(`/api/svi-report?start=${reportDate}&end=${reportDate}`, {
          cache: "no-store"
        });

        if (!res.ok) {
          throw new Error("Failed to fetch SVI report");
        }

        const json = (await res.json()) as SviReportResponse;
        setData({
          severitySummary: json.severitySummary || [],
          topUsers: json.topUsers || [],
          topHosts: json.topHosts || [],
          incidentSummary: json.incidentSummary || [],
          endpointDetections: json.endpointDetections || []
        });
      } catch (err: any) {
        setError(err?.message || "Unknown error");
      } finally {
        setLoading(false);
        setIsRunning(false);
      }
    };

    fetchData();
  }, [reportDate, setIsRunning]);

  if (!reportDate) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-bold text-gray-600">
        Please select a report date and click Run Report SVI.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-blue-800 font-bold">
        <div className="text-xl animate-pulse">Loading Data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-bold">
        Error: {error}
      </div>
    );
  }

  return (
    <div id="report-root" className="report-root min-h-screen bg-gray-100 py-10 print:bg-white">
      <A4Page>
        <SectionHeader src="/images/heading_svi.png" alt="SOC Daily Report" />
        <div className="mt-4 border-t border-slate-300 pt-3 text-[14px] font-bold text-slate-800 space-y-1">
          <div>Report Date : {formatReportDate(reportDate)}</div>
          <div>Report by : Pham Van Giang</div>
          <div>Customer Name : SVI public company limited</div>
          <div>Project Name : SVI-CrowdStrike</div>
        </div>

        <div className="mt-5">
          <SectionHeader src="/images/executive_summary_svi.png" alt="Executive Summary" />
          <div className="border border-slate-500 border-t-0">
            <div className="bg-slate-300 px-4 py-2 text-[12px] font-bold">
              Detections by severity
            </div>
            <table className="report-table w-full border-collapse text-[12px]">
              <thead>
                <tr className="bg-slate-300">
                  <th className="border border-slate-500 p-2 w-20">No.</th>
                  <th className="border border-slate-500 p-2">Severity Name</th>
                  <th className="border border-slate-500 p-2 w-28">Count</th>
                </tr>
              </thead>
              <tbody>
                {data.severitySummary.length > 0 ? (
                  data.severitySummary.map((row, index) => (
                    <tr key={`${row.severity}-${index}`}>
                      <td className="border border-slate-500 p-2 text-center">{index + 1}</td>
                      <td className="border border-slate-500 p-2 text-center">{row.severity}</td>
                      <td className="border border-slate-500 p-2 text-center">{row.count}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="border border-slate-500 p-2 text-center">-</td>
                    <td className="border border-slate-500 p-2 text-center">-</td>
                    <td className="border border-slate-500 p-2 text-center">-</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <SmallBarChart labels={data.severitySummary.map((row) => row.severity)} />
        </div>
      </A4Page>

      <A4Page>
        <SectionHeader src="/images/executive_summary_svi.png" alt="Executive Summary" />
        <div className="border border-slate-500 border-t-0">
          <div className="bg-slate-300 px-4 py-2 text-[12px] font-bold">
            Top 10 users with most detections
          </div>
          <table className="report-table w-full border-collapse text-[12px]">
            <thead>
              <tr className="bg-slate-300">
                <th className="border border-slate-500 p-2 w-20">No.</th>
                <th className="border border-slate-500 p-2">User Name</th>
                <th className="border border-slate-500 p-2 w-28">Count</th>
              </tr>
            </thead>
            <tbody>
              {data.topUsers.length > 0 ? (
                data.topUsers.map((row, index) => (
                  <tr key={`${row.name}-${index}`}>
                    <td className="border border-slate-500 p-2 text-center">{index + 1}</td>
                    <td className="border border-slate-500 p-2 text-center">{row.name}</td>
                    <td className="border border-slate-500 p-2 text-center">{row.count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="border border-slate-500 p-2 text-center">-</td>
                  <td className="border border-slate-500 p-2 text-center">-</td>
                  <td className="border border-slate-500 p-2 text-center">-</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <ChartPlaceholder title="Top 10 users with most detections" />
      </A4Page>

      <A4Page>
        <SectionHeader src="/images/executive_summary_svi.png" alt="Executive Summary" />
        <div className="border border-slate-500 border-t-0">
          <div className="bg-slate-300 px-4 py-2 text-[12px] font-bold">
            Top 10 hosts with most detections
          </div>
          <table className="report-table w-full border-collapse text-[12px]">
            <thead>
              <tr className="bg-slate-300">
                <th className="border border-slate-500 p-2 w-20">No.</th>
                <th className="border border-slate-500 p-2">Computer Name</th>
                <th className="border border-slate-500 p-2 w-28">Count</th>
              </tr>
            </thead>
            <tbody>
              {data.topHosts.length > 0 ? (
                data.topHosts.map((row, index) => (
                  <tr key={`${row.name}-${index}`}>
                    <td className="border border-slate-500 p-2 text-center">{index + 1}</td>
                    <td className="border border-slate-500 p-2 text-center">{row.name}</td>
                    <td className="border border-slate-500 p-2 text-center">{row.count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="border border-slate-500 p-2 text-center">-</td>
                  <td className="border border-slate-500 p-2 text-center">-</td>
                  <td className="border border-slate-500 p-2 text-center">-</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <ChartPlaceholder title="Top 10 hosts with most detections" />
      </A4Page>

      <A4Page>
        <SectionHeader src="/images/incident_summary_svi.png" alt="Incident Summary" />
        <table className="report-table w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-slate-300">
              <th className="border border-slate-500 p-2 w-16">No.</th>
              <th className="border border-slate-500 p-2 w-44">Host Name</th>
              <th className="border border-slate-500 p-2">Process Name</th>
              <th className="border border-slate-500 p-2 w-28">Severity</th>
              <th className="border border-slate-500 p-2 w-28">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.incidentSummary.length > 0 ? (
              data.incidentSummary.map((row, index) => (
                <tr key={`${row.inc_no}-${index}`}>
                  <td className="border border-slate-500 p-2 text-center">{index + 1}</td>
                  <td className="border border-slate-500 p-2 text-center">{row.host_name}</td>
                  <td className="border border-slate-500 p-2 text-center">{row.process_name}</td>
                  <td className="border border-slate-500 p-2 text-center">{row.severity}</td>
                  <td className="border border-slate-500 p-2 text-center">{row.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border border-slate-500 p-2 text-center">-</td>
                <td className="border border-slate-500 p-2 text-center">-</td>
                <td className="border border-slate-500 p-2 text-center">-</td>
                <td className="border border-slate-500 p-2 text-center">-</td>
                <td className="border border-slate-500 p-2 text-center">-</td>
              </tr>
            )}
          </tbody>
        </table>
      </A4Page>

      <A4Page>
        <SectionHeader
          src="/images/endpoint_detections_summary_svi.png"
          alt="Endpoint Detections Summary"
        />
        <table className="report-table w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-slate-300">
              <th className="border border-slate-500 p-2 w-16">No.</th>
              <th className="border border-slate-500 p-2 w-44">Host Name</th>
              <th className="border border-slate-500 p-2">Process Name</th>
              <th className="border border-slate-500 p-2 w-28">Severity</th>
              <th className="border border-slate-500 p-2 w-28">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.endpointDetections.length > 0 ? (
              data.endpointDetections.map((row, index) => (
                <tr key={`${row.inc_no}-${index}`}>
                  <td className="border border-slate-500 p-2 text-center">{index + 1}</td>
                  <td className="border border-slate-500 p-2 text-center">{row.host_name}</td>
                  <td className="border border-slate-500 p-2 text-center">{row.process_name}</td>
                  <td className="border border-slate-500 p-2 text-center">{row.severity}</td>
                  <td className="border border-slate-500 p-2 text-center">{row.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border border-slate-500 p-2 text-center">-</td>
                <td className="border border-slate-500 p-2 text-center">-</td>
                <td className="border border-slate-500 p-2 text-center">-</td>
                <td className="border border-slate-500 p-2 text-center">-</td>
                <td className="border border-slate-500 p-2 text-center">-</td>
              </tr>
            )}
          </tbody>
        </table>
      </A4Page>

      <A4Page>
        <SectionHeader
          src="/images/top_10_active_sensors_by_country_svi.png"
          alt="Top 10 Active sensors by country"
        />
        <div className="border border-slate-400 bg-slate-200 h-60 mt-4 flex items-center justify-center text-slate-600 text-sm">
          Map placeholder
        </div>
        <table className="report-table w-full border-collapse text-[12px] mt-4">
          <thead>
            <tr className="bg-slate-300">
              <th className="border border-slate-500 p-2 w-16">No.</th>
              <th className="border border-slate-500 p-2">Country</th>
              <th className="border border-slate-500 p-2 w-28">Count</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-500 p-2 text-center">-</td>
              <td className="border border-slate-500 p-2 text-center">-</td>
              <td className="border border-slate-500 p-2 text-center">-</td>
            </tr>
          </tbody>
        </table>
      </A4Page>
    </div>
  );
}
