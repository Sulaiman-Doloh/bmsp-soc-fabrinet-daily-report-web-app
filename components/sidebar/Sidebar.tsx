"use client";

import React, { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useReport } from "@/context/ReportContext";

function clsx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function Icon({
  path,
  className,
}: {
  path: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={clsx("h-4 w-4", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

function NavButton({
  active,
  label,
  iconPath,
  onClick,
}: {
  active?: boolean;
  label: string;
  iconPath: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "group w-full rounded-xl border px-3 py-3 text-left transition",
        "flex items-center gap-3",
        active
          ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.16)_inset]"
          : "border-white/10 bg-white/[0.03] text-slate-200 hover:border-white/20 hover:bg-white/[0.06]"
      )}
    >
      <span
        className={clsx(
          "inline-flex h-8 w-8 items-center justify-center rounded-lg border",
          active
            ? "border-cyan-300/40 bg-cyan-400/15 text-cyan-200"
            : "border-white/15 bg-white/5 text-slate-300 group-hover:text-white"
        )}
      >
        <Icon path={iconPath} />
      </span>
      <span className="font-medium tracking-[0.01em]">{label}</span>
    </button>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isReportSocOpen, setIsReportSocOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { selectedDate, reportDate, setSelectedDate, setReportDate, isRunning } =
    useReport();

  const canRun = !!selectedDate && !isRunning;
  const canStop = !!reportDate || isRunning;
  const canDownload = !!reportDate && !isRunning;

  const reportStatus = useMemo(() => {
    if (isRunning) return "Running";
    if (reportDate) return "Ready";
    return "Idle";
  }, [isRunning, reportDate]);

  const handleRunReport = () => {
    if (!canRun) return;
    setReportDate(selectedDate);
    router.push("/dashboard/report");
  };

  const handleStopReport = () => {
    if (!canStop) return;
    setReportDate("");
  };

  const handleDownload = async () => {
    if (!canDownload) return;

    const reportRoot = document.getElementById("report-root");
    if (!reportRoot) return;

    try {
      if (document.fonts?.ready) await document.fonts.ready;

      const html2canvasModule = await import("html2canvas");
      const html2canvas = html2canvasModule.default || html2canvasModule;

      const jspdfModule = await import("jspdf");
      const { jsPDF } = jspdfModule;

      const pages = Array.from(
        reportRoot.querySelectorAll(".a4-page")
      ) as HTMLElement[];
      if (pages.length === 0) return;

      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const filename = `SOC Daily Report [Fabrinet]${reportDate}.pdf`;

      for (let i = 0; i < pages.length; i += 1) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        const canvas = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });
        const imgData = canvas.toDataURL("image/jpeg", 0.98);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight);
      }

      pdf.save(filename);
    } catch (error) {
      console.error("Download PDF failed:", error);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(error.message);
      setIsLoggingOut(false);
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <aside
      className={clsx(
        "relative h-screen shrink-0 overflow-hidden border-r border-cyan-500/15 text-slate-100",
        "bg-[radial-gradient(120%_60%_at_10%_0%,rgba(14,116,144,0.18),transparent_55%),linear-gradient(180deg,#020617_0%,#020b22_55%,#010817_100%)]",
        "transition-all duration-300",
        isCollapsed ? "w-24" : "w-80"
      )}
    >
      <div className="flex h-full flex-col">
        <header className="border-b border-white/10 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-700 text-base font-black text-white shadow-lg shadow-red-900/30">
                B
              </div>
              {!isCollapsed && (
                <div>
                  <p className="text-2xl font-extrabold tracking-tight text-white">
                    SOC System
                  </p>
                  <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">
                    Security Console
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="rounded-lg border border-white/15 bg-white/5 p-2 text-slate-300 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Icon path={isCollapsed ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6"} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <section className="mb-5">
            <button
              onClick={() => setIsReportSocOpen((prev) => !prev)}
              className="mb-3 flex w-full items-center justify-between px-1"
            >
              {!isCollapsed && (
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Report SOC
                </span>
              )}
              {!isCollapsed && (
                <Icon
                  path={isReportSocOpen ? "m6 9 6 6 6-6" : "m9 6 6 6-6 6"}
                  className="text-slate-400"
                />
              )}
            </button>

            {isReportSocOpen && !isCollapsed && (
              <div className="rounded-2xl border border-cyan-300/20 bg-gradient-to-b from-[#0b1f4a]/85 to-[#081537]/85 p-4 shadow-xl shadow-cyan-950/30">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-200/85">
                    Select Report Date
                  </span>
                  <span
                    className={clsx(
                      "rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                      reportStatus === "Running" && "bg-amber-400/20 text-amber-200",
                      reportStatus === "Ready" && "bg-emerald-400/20 text-emerald-200",
                      reportStatus === "Idle" && "bg-slate-400/20 text-slate-300"
                    )}
                  >
                    {reportStatus}
                  </span>
                </div>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  disabled={isRunning}
                  className="h-12 w-full rounded-xl border border-cyan-100/20 bg-black/25 px-3 text-[15px] text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/25 disabled:cursor-not-allowed disabled:opacity-70"
                />

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={handleRunReport}
                    disabled={!canRun}
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Run
                  </button>
                  <button
                    onClick={handleStopReport}
                    disabled={!canStop}
                    className="rounded-xl bg-gradient-to-r from-fuchsia-700 to-rose-700 px-3 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Stop
                  </button>
                </div>
              </div>
            )}

            <div className="mt-3 space-y-2">
              <NavButton
                active={pathname.startsWith("/dashboard/report")}
                label={isCollapsed ? "Report" : "Fabrinet Report"}
                iconPath="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6"
                onClick={() => router.push("/dashboard/report")}
              />
            </div>
          </section>

          <section className="pt-4">
            {!isCollapsed && (
              <p className="mb-3 px-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                System
              </p>
            )}

            <div className="space-y-2">
              <NavButton
                active={pathname.startsWith("/dashboard/settings")}
                label="Settings"
                iconPath="M12 3a2 2 0 0 0-2 2v.4a1.7 1.7 0 0 1-1.3 1.6l-.5.1a1.7 1.7 0 0 1-1.8-.7l-.2-.3a2 2 0 0 0-2.7-.7l-.4.2a2 2 0 0 0-.7 2.7l.2.4a1.7 1.7 0 0 1 0 1.8l-.2.4a2 2 0 0 0 .7 2.7l.4.2a2 2 0 0 0 2.7-.7l.2-.3a1.7 1.7 0 0 1 1.8-.7l.5.1A1.7 1.7 0 0 1 10 18.6V19a2 2 0 0 0 2 2h.5a2 2 0 0 0 2-2v-.4a1.7 1.7 0 0 1 1.3-1.6l.5-.1a1.7 1.7 0 0 1 1.8.7l.2.3a2 2 0 0 0 2.7.7l.4-.2a2 2 0 0 0 .7-2.7l-.2-.4a1.7 1.7 0 0 1 0-1.8l.2-.4a2 2 0 0 0-.7-2.7l-.4-.2a2 2 0 0 0-2.7.7l-.2.3a1.7 1.7 0 0 1-1.8.7l-.5-.1A1.7 1.7 0 0 1 14.5 5V5a2 2 0 0 0-2-2z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
                onClick={() => router.push("/dashboard/settings")}
              />
              <NavButton
                active={pathname.startsWith("/dashboard/profile")}
                label="User Profile"
                iconPath="M20 21a8 8 0 0 0-16 0 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
                onClick={() => router.push("/dashboard/profile")}
              />

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="group mt-1 flex w-full items-center gap-3 rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-3 text-left text-rose-200 transition hover:border-rose-300/45 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-300/35 bg-rose-500/20 text-rose-100">
                  <Icon path="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" />
                </span>
                <span className="font-medium">
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </span>
              </button>
            </div>
          </section>
        </div>

        <footer className="border-t border-white/10 p-4">
          <button
            onClick={handleDownload}
            disabled={!canDownload}
            className={clsx(
              "flex h-12 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold tracking-[0.02em] transition",
              canDownload
                ? "border-emerald-300/25 bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-950/40 hover:brightness-110"
                : "cursor-not-allowed border-white/10 bg-white/5 text-slate-500"
            )}
          >
            <Icon path="M12 3v12 M7 10l5 5 5-5 M5 21h14" />
            {!isCollapsed && "Download PDF"}
          </button>

          {!isCollapsed && (
            <p className="mt-3 text-center text-[11px] tracking-[0.08em] text-slate-500">
              System v2.1.0
            </p>
          )}
        </footer>
      </div>
    </aside>
  );
}
