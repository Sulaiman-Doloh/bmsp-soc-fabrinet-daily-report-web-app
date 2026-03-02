"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/hero/HeroSection";
import CursorGlow from "@/components/effects/CursorGlow";
import ScanLine from "@/components/effects/ScanLine";
import AuthModal from "@/components/auth/AuthModal";
import "@/app/globals.css";

export default function Home() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="min-h-screen bg-[#03060f] text-white font-sans overflow-x-hidden">
      <CursorGlow />
      <ScanLine />

      <Navbar onLogin={() => setShowAuth(true)} />

      <main className="relative flex-1 grid-bg">
        <HeroSection onAccess={() => setShowAuth(true)} />
        <Footer />
      </main>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}