export default function StatsBar() {
  const stats = [
    { label: "ACTIVE ALARMS", val: "—", unit: "live" },
    { label: "PENDING INCIDENTS", val: "—", unit: "queued" },
    { label: "REPORTS TODAY", val: "—", unit: "generated" },
  ];

  return (
    <div className="stats-bar">
      {stats.map((s, i) => (
        <div key={i} className="text-center py-4">
          <div className="stats-value">{s.val}</div>
          <div className="stats-label">{s.label}</div>
          <div className="stats-unit">{s.unit}</div>
        </div>
      ))}
    </div>
  );
}