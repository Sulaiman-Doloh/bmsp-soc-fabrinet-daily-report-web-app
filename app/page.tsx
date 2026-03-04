import Link from "next/link";

const NavLink: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <a
    href="#"
    style={{
      color: "#94a3b8",
      textDecoration: "none",
      fontSize: "0.85rem",
      letterSpacing: "0.1em",
      textTransform: "uppercase" as const,
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 500,
    }}
  >
    {children}
  </a>
);

const WelcomePage: React.FC = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #070b14; }
        a:hover { color: #7dd3fc !important; }
        .btn:hover {
          background: linear-gradient(135deg, #0ea5e9, #38bdf8) !important;
          color: #fff !important;
          border-color: #38bdf8 !important;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #0a0f1e 0%, #060a14 60%, #080d1a 100%)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Navbar */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "28px 60px",
            borderBottom: "1px solid rgba(148,163,184,0.08)",
          }}
        >
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "1.2rem",
              color: "#e2e8f0",
              letterSpacing: "0.05em",
            }}
          >
            SOC SYSTEM
          </div>
        </nav>

        {/* Hero */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "80px 24px",
          }}
        >
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(3rem, 7vw, 5.5rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              marginBottom: 14,
              background: "linear-gradient(135deg, #f1f5f9 0%, #7dd3fc 60%, #38bdf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Security Operations Center
          </h1>

          <p
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 600,
              fontSize: "1.1rem",
              color: "#475569",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              marginBottom: 28,
            }}
          >
            To Our Company
          </p>

          <p
            style={{
              color: "#475569",
              fontSize: "0.9rem",
              lineHeight: 1.9,
              maxWidth: 480,
              marginBottom: 44,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 300,
            }}
          >
            Security Operations Center 
            (SOC) is a centralized function responsible for continuously 
            monitoring, detecting, analyzing, and responding to cybersecurity threats within an organization 24/7.
          </p>

          <Link href="/dashboard/report"
            className="btn"
            style={{
              background: "transparent",
              border: "1.5px solid rgba(148,163,184,0.35)",
              color: "#94a3b8",
              padding: "13px 38px",
              borderRadius: 100,
              fontSize: "0.78rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
          >
            Click to run report
          </Link>
        </main>
      </div>
    </>
  );
};

export default WelcomePage;