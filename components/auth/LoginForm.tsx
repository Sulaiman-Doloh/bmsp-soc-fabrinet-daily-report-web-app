"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginForm({ onSubmit }: { onSubmit: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      onSubmit();
      router.refresh();
      router.push("/dashboard/report");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        type="email"
        placeholder="Email"
        className="input-field"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="input-field"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin} className="btn-primary py-3 rounded">
        AUTHENTICATE →
      </button>
    </div>
  );
}
