export default function Features() {
  const features = [
    {
      icon: "📡",
      title: "AlienVault Integration",
      desc: "Fetch alarms and threat intel.",
    },
    {
      icon: "🗄",
      title: "Incident Tracking",
      desc: "Manage pending incidents.",
    },
    {
      icon: "📄",
      title: "Daily Reporting",
      desc: "Generate A4-ready PDF reports.",
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4 w-full max-w-5xl">
      {features.map((f, i) => (
        <div key={i} className="feature-card p-6">
          <div className="text-2xl mb-3">{f.icon}</div>
          <h3 className="feature-title">{f.title}</h3>
          <p className="feature-desc">{f.desc}</p>
        </div>
      ))}
    </div>
  );
}