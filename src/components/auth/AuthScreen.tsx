"use client";

import type React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { AuthUser, UserRole } from "@/lib/api";

type AuthMode = "login" | "register";

type PasswordFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  disabled?: boolean;
  show: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
};

type TextFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  disabled?: boolean;
  type?: string;
  icon: React.ReactNode;
  onChange: (value: string) => void;
};

type SocialButtonProps = {
  label: string;
  onClick: () => Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  icon: React.ReactNode;
};

type AuthSuccessState = {
  title: string;
  message: string;
};

function GoogleMark() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4a9.6 9.6 0 1 0 0 19.2c5.5 0 9.2-3.8 9.2-9.2 0-.6-.1-1.1-.2-1.6Z" />
      <path fill="#34A853" d="M6 14.4 5.1 17l-2.6.1A9.5 9.5 0 0 1 2.4 12c0-1.7.4-3.3 1.1-4.6h.1l2.3.4 1 2.2A5.8 5.8 0 0 0 6 12c0 .8.1 1.6.4 2.4Z" />
      <path fill="#FBBC05" d="M21.2 12.4c0-.6-.1-1.1-.2-1.6H12v3.9h5.5a5.9 5.9 0 0 1-2.6 3.9l.1 2.5 2.5.1c2.3-2.1 3.7-5.2 3.7-8.8Z" />
      <path fill="#4285F4" d="M2.5 6.9A9.6 9.6 0 0 1 12 2.4c2.7 0 5 .9 6.6 2.5l-2.7 2.6A5.7 5.7 0 0 0 12 6c-2.5 0-4.7 1.7-5.5 4l-3.1-2.4Z" />
    </svg>
  );
}

function TextField({ id, label, placeholder, value, disabled, type = "text", icon, onChange }: TextFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
        {label}
      </label>
      <div className="flex h-12 items-center rounded-xl border-[1.5px] border-neutral-200 bg-white px-3 transition focus-within:border-[#2d79f3]">
        <span className="shrink-0 text-neutral-500">{icon}</span>
        <input
          id={id}
          type={type}
          required
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-full w-full bg-transparent px-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

function PasswordField({ id, label, placeholder, value, disabled, show, onToggle, onChange }: PasswordFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
        {label}
      </label>
      <div className="flex h-12 items-center rounded-xl border-[1.5px] border-neutral-200 bg-white px-3 transition focus-within:border-[#2d79f3]">
        <LockKeyhole size={14} className="shrink-0 text-neutral-500" />
        <input
          id={id}
          type={show ? "text" : "password"}
          required
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-full w-full bg-transparent px-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 p-1 text-neutral-500 transition hover:text-neutral-800"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

function SocialButton({ label, onClick, disabled, loading, icon }: SocialButtonProps) {
  return (
    <button
      type="button"
      onClick={() => void onClick()}
      disabled={disabled}
      className="mt-2 flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:border-[#2d79f3] disabled:opacity-50"
    >
      {loading ? <LoaderCircle size={14} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}

function getReadableError(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallbackMessage;
}

function AuthSuccessPanel({ title, message }: AuthSuccessState) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-neutral-900/10" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg">
          <Check size={24} strokeWidth={2.5} />
        </div>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1.5 text-sm text-neutral-500">{message}</p>
      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-neutral-400">
        <LoaderCircle size={12} className="animate-spin" />
        Redirecting...
      </div>
    </div>
  );
}

export default function AuthScreen({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const isLogin = mode === "login";

  const {
    user, initialized, loading, busyAction,
    loginWithEmail, registerWithEmail, loginWithGoogle, sendPasswordReset,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetPanel, setShowResetPanel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [authSuccessState, setAuthSuccessState] = useState<AuthSuccessState | null>(null);

  useEffect(() => {
    if (initialized && user && !authSuccessState) router.replace(redirect);
  }, [authSuccessState, initialized, redirect, router, user]);

  const switchHref = isLogin
    ? redirect === "/" ? "/register" : `/register?redirect=${encodeURIComponent(redirect)}`
    : redirect === "/" ? "/login" : `/login?redirect=${encodeURIComponent(redirect)}`;

  function getRedirectByRole(role?: UserRole) {
    if (role === "SELLER") return "/dashboard/seller";
    if (role === "ADMIN") return "/dashboard/admin";
    return redirect;
  }

  const completeAuth = async (successState: AuthSuccessState, authUser?: AuthUser) => {
    setAuthSuccessState(successState);
    await new Promise((resolve) => window.setTimeout(resolve, 1400));
    router.push(getRedirectByRole(authUser?.role));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setFeedbackSuccess(null);

    if (!isLogin) {
      if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
      if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    }

    try {
      if (isLogin) {
        const authUser = await loginWithEmail({ email, password });
        await completeAuth({ title: "Welcome back", message: "Signed in successfully. Taking you back now." }, authUser);
      } else {
        const authUser = await registerWithEmail({ email, password, firstName, lastName });
        await completeAuth({ title: "Account created", message: "Everything looks great. Taking you to the store." }, authUser);
      }
    } catch (authError) {
      setError(getReadableError(authError, isLogin ? "Sign in failed." : "Registration failed."));
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setFeedbackSuccess(null);
    try {
      const authUser = await loginWithGoogle();
      await completeAuth({ title: "Signed in", message: "Google sign-in complete. Taking you back now." }, authUser);
    } catch (authError) {
      setError(getReadableError(authError, "Google sign-in could not be started."));
    }
  };

  const handlePasswordReset = async () => {
    setError(null);
    setFeedbackSuccess(null);
    const targetEmail = (resetEmail || email).trim();
    if (!targetEmail) { setError("Enter your email address first."); return; }
    try {
      const message = await sendPasswordReset(targetEmail);
      setFeedbackSuccess(message);
      setResetEmail(targetEmail);
      setShowResetPanel(true);
    } catch (authError) {
      setError(getReadableError(authError, "Couldn't send the reset link."));
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] overflow-hidden bg-white px-4 pb-6 pt-20 sm:px-6 lg:px-8 lg:pt-22">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-9.5rem)] max-w-6xl items-center">
        <div className="grid w-full items-stretch gap-4 lg:grid-cols-[0.94fr_1.06fr] lg:gap-5">
          <section className="h-full rounded-[1.75rem] border border-neutral-200 bg-white/92 p-5 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.10)] backdrop-blur sm:p-6 lg:p-7">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
              <Sparkles size={12} />
              Mirage Access
            </div>

            <div className="mb-5">
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-[2rem]">
                Everything in one secure place.
              </h1>
              <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
                Fast access, cleaner account flows, and a smoother storefront experience.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.35rem] border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white">
                  <ShieldCheck size={16} />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-neutral-900">Secure account controls</h3>
                <p className="mt-1.5 text-sm leading-5 text-neutral-500">
                  Password visibility, reset links, and protected access in one clean flow.
                </p>
              </div>

              <div className="rounded-[1.35rem] border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white">
                  <UserRound size={16} />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-neutral-900">Backend-ready session</h3>
                <p className="mt-1.5 text-sm leading-5 text-neutral-500">
                  Orders, favorites, and checkout stay aligned with your active account.
                </p>
              </div>

              <div className="rounded-[1.35rem] border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white">
                  <GoogleMark />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-neutral-900">One-tap Google sign-in</h3>
                <p className="mt-1.5 text-sm leading-5 text-neutral-500">
                  Start with Google in seconds using the same polished auth experience.
                </p>
              </div>

              <div className="rounded-[1.35rem] border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white">
                  <LockKeyhole size={16} />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-neutral-900">Refined storefront UX</h3>
                <p className="mt-1.5 text-sm leading-5 text-neutral-500">
                  Cleaner forms, quicker actions, and less friction across the auth flow.
                </p>
              </div>
            </div>
          </section>

          <section className="h-full rounded-[1.75rem] border border-neutral-200 bg-white shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)]">
            <div className="flex h-full flex-col justify-center px-6 py-5 sm:px-7">
              <div className="mx-auto w-full max-w-[400px]">
              {!authSuccessState && (
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
                    {isLogin ? "Sign in to your account" : "Create your account"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    {isLogin
                      ? "Continue with your email or Google account."
                      : "Set up your account and start shopping in minutes."}
                  </p>
                </div>
              )}

              {authSuccessState ? (
                <AuthSuccessPanel title={authSuccessState.title} message={authSuccessState.message} />
              ) : (
                <>
                  <form className="space-y-3" onSubmit={handleSubmit}>
                    {!isLogin && (
                      <div className="grid grid-cols-2 gap-3">
                        <TextField id="firstName" label="First name" placeholder="Enter your first name" value={firstName} disabled={loading} icon={<UserRound size={14} />} onChange={setFirstName} />
                        <TextField id="lastName" label="Last name" placeholder="Enter your last name" value={lastName} disabled={loading} icon={<UserRound size={14} />} onChange={setLastName} />
                      </div>
                    )}

                    <TextField id="email" type="email" label="Email" placeholder="Enter your email" value={email} disabled={loading} icon={<Mail size={14} />} onChange={setEmail} />

                    <PasswordField id="password" label="Password" placeholder="Enter your password" value={password} disabled={loading} show={showPassword} onToggle={() => setShowPassword((v) => !v)} onChange={setPassword} />

                    {!isLogin && (
                      <PasswordField id="confirmPassword" label="Confirm password" placeholder="Confirm your password" value={confirmPassword} disabled={loading} show={showConfirmPassword} onToggle={() => setShowConfirmPassword((v) => !v)} onChange={setConfirmPassword} />
                    )}

                    {isLogin && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="text-xs font-medium text-neutral-500 underline-offset-2 transition hover:text-neutral-900 hover:underline"
                          onClick={() => {
                            setShowResetPanel((c) => !c);
                            setResetEmail(email);
                            setError(null);
                            setFeedbackSuccess(null);
                          }}
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    {showResetPanel && isLogin && (
                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5">
                        <p className="text-xs font-medium text-neutral-600">We'll send a reset link via Firebase.</p>
                        <div className="mt-2.5 flex gap-2">
                          <input
                            type="email"
                            value={resetEmail}
                            disabled={loading}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#2d79f3]"
                            placeholder="you@example.com"
                          />
                          <button
                            type="button"
                            onClick={() => void handlePasswordReset()}
                            disabled={busyAction === "reset"}
                            className="rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-50"
                          >
                            {busyAction === "reset" ? "Sending..." : "Send"}
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-2 w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
                    >
                      {(busyAction === "email-login" || busyAction === "email-register") ? (
                        <span className="flex items-center justify-center gap-2">
                          <LoaderCircle size={14} className="animate-spin" />
                          {isLogin ? "Signing in..." : "Creating account..."}
                        </span>
                      ) : isLogin ? (
                        "Sign in"
                      ) : (
                        "Sign up"
                      )}
                    </button>

                    {error && (
                      <div className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs text-red-600">{error}</div>
                    )}
                    {feedbackSuccess && (
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-700">{feedbackSuccess}</div>
                    )}

                    <p className="text-center text-sm text-neutral-500">
                      {isLogin ? "No account yet? " : "Already have one? "}
                      <Link href={switchHref} className="font-semibold text-[#2d79f3] hover:underline">
                        {isLogin ? "Register" : "Sign in"}
                      </Link>
                    </p>
                  </form>

                  <div className="mt-2">
                    <SocialButton label="Google" onClick={handleGoogleLogin} disabled={loading} loading={busyAction === "google"} icon={<GoogleMark />} />
                  </div>
                </>
              )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}






