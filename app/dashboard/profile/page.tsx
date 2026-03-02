"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ProfileForm = {
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
  email: string;
};

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileForm>({
    firstName: "",
    lastName: "",
    phone: "",
    department: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        setLoading(false);
        return;
      }

      const metadata = user.user_metadata ?? {};
      setForm({
        firstName: String(metadata.first_name ?? ""),
        lastName: String(metadata.last_name ?? ""),
        phone: String(metadata.phone ?? ""),
        department: String(metadata.department ?? ""),
        email: user.email ?? "",
      });
      setLoading(false);
    };

    loadProfile();
  }, []);

  const setField = (key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: form.firstName,
        last_name: form.lastName,
        phone: form.phone,
        department: form.department,
      },
    });

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        full_name: `${form.firstName} ${form.lastName}`.trim(),
        role: "analyst",
      });
    }

    setSaving(false);
    alert("Profile updated");
  };

  if (loading) {
    return <div className="text-slate-600 font-semibold">Loading profile...</div>;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-800">User Profile</h1>
      <p className="text-slate-500 mt-1">Update your account information.</p>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-600">First Name</label>
          <input
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2"
            value={form.firstName}
            onChange={(e) => setField("firstName", e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-slate-600">Last Name</label>
          <input
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2"
            value={form.lastName}
            onChange={(e) => setField("lastName", e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-slate-600">Phone Number</label>
          <input
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-slate-600">Department</label>
          <input
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2"
            value={form.department}
            onChange={(e) => setField("department", e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-slate-600">Email</label>
          <input
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 bg-slate-50 text-slate-500"
            value={form.email}
            disabled
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white font-semibold px-5 py-2.5 rounded-md"
      >
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}
