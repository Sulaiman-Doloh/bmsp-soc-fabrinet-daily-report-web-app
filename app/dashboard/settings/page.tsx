"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (!password || password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Password confirmation does not match.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setPassword("");
    setConfirmPassword("");
    alert("Password updated successfully.");
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-800 text-white">Settings</h1>
      <p className="text-slate-500 mt-1">Manage your account security.</p>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6">
        <h2 className="text-lg font-semibold text-slate-800">Change Password</h2>
        <p className="text-sm text-slate-500 mt-1">
          Set a new password for your account.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm text-slate-600">New Password</label>
            <input
              type="password"
              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 bg-slate-800 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Confirm New Password</label>
            <input
              type="password"
              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 bg-slate-800 text-white"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleChangePassword}
          disabled={saving}
          className="mt-5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white font-semibold px-5 py-2.5 rounded-md"
        >
          {saving ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}
