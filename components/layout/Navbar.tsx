"use client";

export default function Navbar({ onLogin }: { onLogin: () => void }) {
  return (
    <header className="w-full sticky top-0 z-40 navbar-bg">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="logo-hex">B</div>
          <span className="logo-text">
            SOC<span className="cyan">SYS</span>
          </span>
        </div>

        <button
          onClick={onLogin}
          className="btn-outline px-5 py-2 rounded"
        >
          LOG IN
        </button>
      </div>
    </header>
  );
}