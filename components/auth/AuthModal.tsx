"use client";
import { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function AuthModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"login" | "signup">("login");

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box w-full max-w-md">
        <div className="modal-tabs">
          <button onClick={() => setTab("login")}>SIGN IN</button>
          <button onClick={() => setTab("signup")}>REGISTER</button>
        </div>

        <div className="p-6">
          {tab === "login" ? (
            <LoginForm onSubmit={onClose} />
          ) : (
            <SignupForm onSubmit={() => setTab("login")} />
          )}
        </div>
      </div>
    </div>
  );
}