"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordField({
  name = "password",
  label = "Password",
  autoComplete,
  required = true,
  hint,
}: {
  name?: string;
  label?: string;
  autoComplete?: string;
  required?: boolean;
  hint?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-brand-dark">{label}</label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          name={name}
          required={required}
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-black/10 px-4 py-2.5 pr-11 outline-none focus:border-brand-blue"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-brand-gray hover:text-brand-dark"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {hint && <p className="mt-1 text-xs text-brand-gray">{hint}</p>}
    </div>
  );
}
