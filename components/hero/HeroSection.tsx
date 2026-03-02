import StatsBar from "./StatsBar";
import Features from "./Features";

export default function HeroSection({
  onAccess,
}: {
  onAccess: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 flex flex-col items-center relative z-10">

      <h1 className="hero-title text-center mb-4">
        SECURITY OPERATIONS
        <br />
        <span className="cyan-gradient">
          COMMAND CENTER
        </span>
      </h1>

      <div className="hero-btn flex gap-3 mb-20">
        <button
          onClick={onAccess}
          className="btn-primary px-8 py-3 rounded"
        >
          ACCESS SYSTEM →
        </button>
      </div>

      <StatsBar />
      <Features />
    </div>
  );
}