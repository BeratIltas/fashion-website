"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, CheckCircle2, XCircle, LoaderCircle } from "lucide-react";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { playfair } from "@/app/fonts";

export default function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const oobCode = searchParams.get("oobCode") ?? "";

  const [phase, setPhase] = useState<"verifying" | "form" | "success" | "invalid">("verifying");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!oobCode) {
      setPhase("invalid");
      return;
    }
    verifyPasswordResetCode(auth, oobCode)
      .then((email) => {
        setEmail(email);
        setPhase("form");
      })
      .catch(() => setPhase("invalid"));
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setPhase("success");
    } catch {
      setError("Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col items-center justify-center px-4">
      <Link href="/" className={`text-3xl font-bold tracking-tight text-black mb-10 ${playfair.className}`}>
        Miragé
      </Link>

      <div className="w-full max-w-md bg-white border border-neutral-100 p-10">
        {phase === "verifying" && (
          <div className="flex flex-col items-center gap-4 py-8 text-neutral-400">
            <LoaderCircle size={28} className="animate-spin" />
            <p className="text-sm">Verifying your reset link…</p>
          </div>
        )}

        {phase === "invalid" && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <XCircle size={40} className="text-red-400" />
            <h1 className="text-xl font-semibold text-black">Invalid or Expired Link</h1>
            <p className="text-sm text-neutral-500">
              This password reset link is invalid or has already been used.
              Please request a new one.
            </p>
            <Link
              href="/login"
              className="mt-2 text-[11px] font-bold uppercase tracking-widest text-black border-b border-black pb-0.5 hover:opacity-60 transition-opacity"
            >
              Back to Login
            </Link>
          </div>
        )}

        {phase === "success" && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <CheckCircle2 size={40} className="text-emerald-500" />
            <h1 className="text-xl font-semibold text-black">Password Reset</h1>
            <p className="text-sm text-neutral-500">
              Your password has been updated successfully.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="mt-4 w-full bg-black text-white text-[11px] font-bold uppercase tracking-widest py-3.5 hover:bg-neutral-800 transition-colors"
            >
              Sign In
            </button>
          </div>
        )}

        {phase === "form" && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-semibold tracking-tight text-black">Set New Password</h1>
              {email && (
                <p className="text-sm text-neutral-500 mt-1">for {email}</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                  New Password
                </label>
                <div className="relative flex items-center border border-neutral-200 focus-within:border-black transition-colors">
                  <LockKeyhole size={15} className="absolute left-3.5 text-neutral-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    className="w-full pl-10 pr-10 py-3 text-sm outline-none bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 text-neutral-400 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                  Confirm Password
                </label>
                <div className="relative flex items-center border border-neutral-200 focus-within:border-black transition-colors">
                  <LockKeyhole size={15} className="absolute left-3.5 text-neutral-400 pointer-events-none" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    className="w-full pl-10 pr-10 py-3 text-sm outline-none bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 text-neutral-400 hover:text-black transition-colors"
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 -mt-1">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full bg-black text-white text-[11px] font-bold uppercase tracking-widest py-3.5 hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <LoaderCircle size={14} className="animate-spin" />}
                Reset Password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
