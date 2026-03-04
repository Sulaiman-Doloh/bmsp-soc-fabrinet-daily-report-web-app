"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupForm({ onSubmit }: { onSubmit: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
          department,
        },
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: `${firstName} ${lastName}`.trim(),
        role: "analyst",
      });
    }

    onSubmit();
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="First Name"
        className="input-field"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Last Name"
        className="input-field"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
      <input
        type="tel"
        placeholder="Phone Number"
        className="input-field"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        type="text"
        placeholder="Department"
        className="input-field"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        className="input-field"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="input-field"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleSignup} className="btn-primary py-3 rounded">
        REQUEST ACCESS →
      </button>
    </div>
  );
}