import Link from "next/link";

const WelcomePage: React.FC = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Outfit:wght@200;300;400;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body { background: #03050a; overflow: hidden; height: 100%; }

        @keyframes pulse-ring {
          0% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(1.15); opacity: 0; }
        }

        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        @keyframes flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.4; }
          94% { opacity: 1; }
          96% { opacity: 0.6; }
          97% { opacity: 1; }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes float-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes data-stream {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-400px); opacity: 0; }
        }

        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes spin-reverse {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(-360deg); }
        }

        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 200, 255, 0.15), 0 0 40px rgba(0, 200, 255, 0.05); }
          50% { box-shadow: 0 0 30px rgba(0, 200, 255, 0.3), 0 0 60px rgba(0, 200, 255, 0.1); }
        }

        .soc-page {
          height: 100vh;
          max-height: 100vh;
          background: #03050a;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          animation: flicker 8s infinite;
        }

        /* Grid background */
        .soc-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(0, 200, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 200, 255, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }

        /* Scan line overlay */
        .scan-line {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(0, 200, 255, 0.15), transparent);
          animation: scan-line 6s linear infinite;
          pointer-events: none;
          z-index: 50;
        }

        /* Noise overlay */
        .soc-page::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.35;
          pointer-events: none;
          z-index: 1;
        }

        /* Navbar */
        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 48px;
          border-bottom: 1px solid rgba(0, 200, 255, 0.08);
          position: relative;
          z-index: 10;
          animation: float-in 0.6s ease both;
        }

        .nav-logo {
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          font-size: 0.9rem;
          color: #00c8ff;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .nav-logo-dot {
          width: 8px;
          height: 8px;
          background: #00c8ff;
          border-radius: 50%;
          box-shadow: 0 0 8px #00c8ff;
          animation: blink 1.5s ease infinite;
        }

        .nav-status {
          font-family: 'Space Mono', monospace;
          font-size: 0.7rem;
          color: rgba(0, 200, 255, 0.4);
          letter-spacing: 0.15em;
        }

        .nav-status span {
          color: #00ff88;
          text-shadow: 0 0 8px #00ff88;
        }

        /* Main content */
        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 12px 24px;
          position: relative;
          z-index: 5;
          overflow: hidden;
        }

        /* Radar circle */
        .radar-wrap {
          position: relative;
          width: 180px;
          height: 180px;
          margin-bottom: 20px;
          animation: float-in 0.8s ease 0.2s both;
        }

        .radar-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          border-radius: 50%;
          border: 1px solid rgba(0, 200, 255, 0.15);
        }

        .radar-ring:nth-child(1) {
          width: 180px; height: 180px;
          transform: translate(-50%, -50%);
        }
        .radar-ring:nth-child(2) {
          width: 135px; height: 135px;
          transform: translate(-50%, -50%);
          border-color: rgba(0, 200, 255, 0.2);
        }
        .radar-ring:nth-child(3) {
          width: 90px; height: 90px;
          transform: translate(-50%, -50%);
          border-color: rgba(0, 200, 255, 0.25);
        }
        .radar-ring:nth-child(4) {
          width: 45px; height: 45px;
          transform: translate(-50%, -50%);
          border-color: rgba(0, 200, 255, 0.3);
        }

        .radar-pulse {
          position: absolute;
          top: 50%; left: 50%;
          width: 180px; height: 180px;
          border-radius: 50%;
          border: 1.5px solid rgba(0, 200, 255, 0.5);
          animation: pulse-ring 2.5s ease-out infinite;
        }

        .radar-pulse:nth-child(6) {
          animation-delay: 1.25s;
        }

        .radar-spin-outer {
          position: absolute;
          top: 50%; left: 50%;
          width: 180px; height: 180px;
          border-radius: 50%;
          border: 1px dashed rgba(0, 200, 255, 0.1);
          animation: spin-slow 20s linear infinite;
        }

        .radar-spin-inner {
          position: absolute;
          top: 50%; left: 50%;
          width: 115px; height: 115px;
          border-radius: 50%;
          border: 1px dashed rgba(0, 200, 255, 0.08);
          animation: spin-reverse 15s linear infinite;
        }

        /* Crosshair lines */
        .radar-cross {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 180px; height: 180px;
        }

        .radar-cross::before {
          content: '';
          position: absolute;
          top: 50%; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 200, 255, 0.2), transparent);
        }

        .radar-cross::after {
          content: '';
          position: absolute;
          left: 50%; top: 0; bottom: 0;
          width: 1px;
          background: linear-gradient(180deg, transparent, rgba(0, 200, 255, 0.2), transparent);
        }

        /* Center dot */
        .radar-center {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 12px; height: 12px;
          background: #00c8ff;
          border-radius: 50%;
          box-shadow: 0 0 12px #00c8ff, 0 0 30px rgba(0, 200, 255, 0.4);
        }

        /* Dot indicators */
        .radar-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          background: #00ff88;
          border-radius: 50%;
          box-shadow: 0 0 8px #00ff88;
        }

        .radar-dot:nth-of-type(1) { top: 30%; left: 20%; animation: blink 2.1s ease infinite; }
        .radar-dot:nth-of-type(2) { top: 60%; right: 18%; animation: blink 3s ease infinite 0.8s; }
        .radar-dot:nth-of-type(3) { bottom: 25%; left: 40%; animation: blink 2.5s ease infinite 1.4s; background: #ffaa00; box-shadow: 0 0 8px #ffaa00; }

        /* Shield icon in center */
        .radar-shield {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-size: 2.2rem;
          filter: drop-shadow(0 0 12px rgba(0, 200, 255, 0.5));
          color: rgba(0, 200, 255, 0.7);
          line-height: 1;
        }

        /* Heading */
        .heading-label {
          font-family: 'Space Mono', monospace;
          font-size: 0.68rem;
          color: rgba(0, 200, 255, 0.5);
          letter-spacing: 0.4em;
          text-transform: uppercase;
          margin-bottom: 10px;
          animation: float-in 0.8s ease 0.35s both;
        }

        .heading-label::before {
          content: '> ';
          color: #00c8ff;
        }

        h1 {
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: clamp(2rem, 5vw, 3.8rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
          color: #e8f4ff;
          text-shadow: 0 0 40px rgba(0, 200, 255, 0.2);
          animation: float-in 0.8s ease 0.45s both;
        }

        h1 span {
          color: #00c8ff;
          text-shadow: 0 0 30px rgba(0, 200, 255, 0.4);
        }

        .sub-heading {
          font-family: 'Space Mono', monospace;
          font-size: 0.72rem;
          color: rgba(0, 200, 255, 0.35);
          letter-spacing: 0.35em;
          text-transform: uppercase;
          margin-bottom: 16px;
          animation: float-in 0.8s ease 0.55s both;
        }

        .description {
          color: rgba(180, 210, 230, 0.45);
          font-family: 'Outfit', sans-serif;
          font-weight: 300;
          font-size: 0.88rem;
          line-height: 1.7;
          max-width: 440px;
          margin-bottom: 24px;
          animation: float-in 0.8s ease 0.65s both;
        }

        /* Stats row */
        .stats-row {
          display: flex;
          gap: 0;
          margin-bottom: 28px;
          border: 1px solid rgba(0, 200, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          animation: float-in 0.8s ease 0.75s both;
        }

        .stat {
          padding: 10px 24px;
          border-right: 1px solid rgba(0, 200, 255, 0.1);
          text-align: center;
        }

        .stat:last-child { border-right: none; }

        .stat-value {
          font-family: 'Space Mono', monospace;
          font-size: 1.1rem;
          font-weight: 700;
          color: #00c8ff;
          text-shadow: 0 0 12px rgba(0, 200, 255, 0.4);
          display: block;
        }

        .stat-label {
          font-family: 'Space Mono', monospace;
          font-size: 0.58rem;
          color: rgba(0, 200, 255, 0.35);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-top: 2px;
          display: block;
        }

        /* CTA Button */
        .cta-btn {
          font-family: 'Space Mono', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #00c8ff;
          text-decoration: none;
          padding: 16px 44px;
          border: 1px solid rgba(0, 200, 255, 0.35);
          border-radius: 2px;
          position: relative;
          transition: all 0.3s ease;
          background: rgba(0, 200, 255, 0.04);
          animation: float-in 0.8s ease 0.85s both, glow-pulse 3s ease infinite 1s;
          display: inline-block;
        }

        .cta-btn::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 2px;
          background: linear-gradient(135deg, rgba(0, 200, 255, 0.15), transparent 60%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .cta-btn::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 6px; height: 6px;
          border-top: 1.5px solid #00c8ff;
          border-left: 1.5px solid #00c8ff;
        }

        .cta-btn:hover {
          background: rgba(0, 200, 255, 0.1) !important;
          border-color: rgba(0, 200, 255, 0.7) !important;
          color: #fff !important;
          box-shadow: 0 0 30px rgba(0, 200, 255, 0.2), inset 0 0 20px rgba(0, 200, 255, 0.05);
        }

        .cta-btn:hover::before { opacity: 1; }

        .cta-arrow {
          margin-left: 10px;
          opacity: 0.6;
        }

        /* Data stream columns */
        .data-streams {
          position: fixed;
          top: 0; right: 60px;
          height: 100vh;
          display: flex;
          gap: 20px;
          pointer-events: none;
          z-index: 2;
          opacity: 0.5;
        }

        .data-col {
          font-family: 'Space Mono', monospace;
          font-size: 0.6rem;
          color: rgba(0, 200, 255, 0.2);
          display: flex;
          flex-direction: column;
          gap: 8px;
          animation: data-stream 8s linear infinite;
        }

        .data-col:nth-child(2) { animation-delay: -3s; }
        .data-col:nth-child(3) { animation-delay: -6s; }

        /* Footer */
        .footer {
          padding: 14px 48px;
          border-top: 1px solid rgba(0, 200, 255, 0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 10;
        }

        .footer-text {
          font-family: 'Space Mono', monospace;
          font-size: 0.62rem;
          color: rgba(0, 200, 255, 0.2);
          letter-spacing: 0.15em;
        }

        .footer-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Space Mono', monospace;
          font-size: 0.62rem;
          color: rgba(0, 200, 255, 0.25);
        }

        .status-dot {
          width: 5px;
          height: 5px;
          background: #00ff88;
          border-radius: 50%;
          box-shadow: 0 0 6px #00ff88;
          animation: blink 2s ease infinite;
        }
      `}</style>

      <div className="soc-page">
        <div className="scan-line" />

        {/* Data stream decorations */}
        <div className="data-streams" aria-hidden="true">
          {['01001101', '10110010', '11001011', '00101100', '10010111', '01110100'].map((d, i) => (
            <div key={i} className="data-col">
              {Array.from({ length: 20 }, (_, j) => (
                <span key={j}>{Math.random() > 0.5 ? '1' : '0'}{Math.random() > 0.5 ? '1' : '0'}{Math.random() > 0.5 ? '1' : '0'}</span>
              ))}
            </div>
          ))}
        </div>

        {/* Navbar */}
        <nav className="nav">
          <div className="nav-logo">
            <div className="nav-logo-dot" />
            SOC — SYSTEM
          </div>
          <div className="nav-status">
            STATUS: <span>OPERATIONAL</span>
          </div>
        </nav>

        {/* Hero */}
        <main className="main">
          {/* Radar graphic */}
          <div className="radar-wrap" aria-hidden="true">
            <div className="radar-ring" />
            <div className="radar-ring" />
            <div className="radar-ring" />
            <div className="radar-ring" />
            <div className="radar-pulse" />
            <div className="radar-pulse" style={{ animationDelay: '1.25s' }} />
            <div className="radar-spin-outer" />
            <div className="radar-spin-inner" />
            <div className="radar-cross" />
            <div className="radar-dot" />
            <div className="radar-dot" />
            <div className="radar-dot" />
            <div className="radar-center" />
          </div>

          <p className="heading-label">Threat Intelligence Platform</p>

          <h1>
            Security<br />
            <span>Operations</span> Center
          </h1>

          <p className="sub-heading">Continuous Monitoring · Detection · Response</p>

          <p className="description">
            A centralized function responsible for continuously monitoring,
            detecting, analyzing, and responding to cybersecurity threats
            within your organization — 24 hours a day, 7 days a week.
          </p>

          {/* Stats */}
          <div className="stats-row">
            <div className="stat">
              <span className="stat-value">24/7</span>
              <span className="stat-label">Uptime</span>
            </div>
            <div className="stat">
              <span className="stat-value">0.3s</span>
              <span className="stat-label">Detect</span>
            </div>
            <div className="stat">
              <span className="stat-value">100%</span>
              <span className="stat-label">Coverage</span>
            </div>
          </div>

          <Link href="/dashboard/report" className="cta-btn">
            Click to Run Security Report <span className="cta-arrow">→</span>
          </Link>
        </main>

        {/* Footer */}
        <footer className="footer">
          <span className="footer-text">© 2025 SOC SYSTEM — CLASSIFIED</span>
          <div className="footer-status">
            <div className="status-dot" />
            ALL SYSTEMS NOMINAL
          </div>
        </footer>
      </div>
    </>
  );
};

export default WelcomePage;