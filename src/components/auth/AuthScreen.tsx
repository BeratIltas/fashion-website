"use client";

import type React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Facebook, LoaderCircle, LockKeyhole, Mail, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { useAuth } from "@/contexts/AuthContext";

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

type SocialButtonProps = {
  label: string;
  onClick: () => Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  icon: React.ReactNode;
};

function GoogleMark() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4a9.6 9.6 0 1 0 0 19.2c5.5 0 9.2-3.8 9.2-9.2 0-.6-.1-1.1-.2-1.6Z"
      />
      <path
        fill="#34A853"
        d="M6 14.4 5.1 17l-2.6.1A9.5 9.5 0 0 1 2.4 12c0-1.7.4-3.3 1.1-4.6h.1l2.3.4 1 2.2A5.8 5.8 0 0 0 6 12c0 .8.1 1.6.4 2.4Z"
      />
      <path
        fill="#FBBC05"
        d="M21.2 12.4c0-.6-.1-1.1-.2-1.6H12v3.9h5.5a5.9 5.9 0 0 1-2.6 3.9l.1 2.5 2.5.1c2.3-2.1 3.7-5.2 3.7-8.8Z"
      />
      <path
        fill="#4285F4"
        d="M2.5 6.9A9.6 9.6 0 0 1 12 2.4c2.7 0 5 .9 6.6 2.5l-2.7 2.6A5.7 5.7 0 0 0 12 6c-2.5 0-4.7 1.7-5.5 4l-3.1-2.4Z"
      />
    </svg>
  );
}

function PasswordField({
  id,
  label,
  placeholder,
  value,
  disabled,
  show,
  onToggle,
  onChange,
}: PasswordFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
        {label}
      </label>
      <div className="mt-2 flex items-center rounded-2xl border border-neutral-200 bg-white px-3 shadow-sm transition focus-within:border-neutral-900">
        <LockKeyhole size={16} className="text-neutral-400" />
        <input
          id={id}
          type={show ? "text" : "password"}
          required
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-neutral-400"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
          aria-label={show ? "Şifreyi gizle" : "Şifreyi göster"}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

function SocialButton({ label, onClick, disabled, loading, icon }: SocialButtonProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => {
        void onClick();
      }}
      disabled={disabled}
      className="w-full gap-3 rounded-2xl border-neutral-200 bg-white py-3"
    >
      {loading ? <LoaderCircle size={16} className="animate-spin" /> : icon}
      <span>{label}</span>
    </Button>
  );
}

function getReadableError(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

export default function AuthScreen({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const isLogin = mode === "login";
  const {
    user,
    initialized,
    loading,
    busyAction,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    loginWithFacebook,
    sendPasswordReset,
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
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (initialized && user) {
      router.replace(redirect);
    }
  }, [initialized, redirect, router, user]);

  const switchHref = isLogin
    ? redirect === "/"
      ? "/register"
      : `/register?redirect=${encodeURIComponent(redirect)}`
    : redirect === "/"
      ? "/login"
      : `/login?redirect=${encodeURIComponent(redirect)}`;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isLogin) {
      if (password.length < 6) {
        setError("Şifren en az 6 karakter olmalı.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Şifreler eşleşmiyor.");
        return;
      }
    }

    try {
      if (isLogin) {
        await loginWithEmail({ email, password });
      } else {
        await registerWithEmail({ email, password, firstName, lastName });
      }

      router.push(redirect);
    } catch (authError) {
      setError(
        getReadableError(
          authError,
          isLogin ? "Giriş sırasında bir sorun oluştu." : "Kayıt sırasında bir sorun oluştu."
        )
      );
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSuccess(null);

    try {
      await loginWithGoogle();
      router.push(redirect);
    } catch (authError) {
      setError(getReadableError(authError, "Google ile giriş başlatılamadı."));
    }
  };

  const handleFacebookLogin = async () => {
    setError(null);
    setSuccess(null);

    try {
      await loginWithFacebook();
      router.push(redirect);
    } catch (authError) {
      setError(getReadableError(authError, "Facebook ile giriş başlatılamadı."));
    }
  };

  const handlePasswordReset = async () => {
    setError(null);
    setSuccess(null);

    const targetEmail = (resetEmail || email).trim();
    if (!targetEmail) {
      setError("Şifre sıfırlama için önce e-posta adresini gir.");
      return;
    }

    try {
      const message = await sendPasswordReset(targetEmail);
      setSuccess(message);
      setResetEmail(targetEmail);
      setShowResetPanel(true);
    } catch (authError) {
      setError(getReadableError(authError, "Şifre sıfırlama bağlantısı gönderilemedi."));
    }
  };

  return (
    <Container>
      <div className="flex min-h-[calc(100vh-8rem)] items-center py-24">
        <div className="grid w-full gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="relative overflow-hidden rounded-[2rem] border border-[#eadcc9] bg-[radial-gradient(circle_at_top_left,_rgba(255,246,232,0.96),_rgba(255,255,255,1)_58%)] p-8 shadow-[0_30px_80px_-60px_rgba(116,77,18,0.45)] sm:p-10">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(201,160,99,0.12),transparent_35%,rgba(0,0,0,0.04)_100%)]" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-neutral-700 backdrop-blur">
                <Sparkles size={14} />
                Mirage Membership
              </div>

              <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
                Tek hesapla daha hızlı alışveriş, daha güçlü güvenlik.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-700 sm:text-base">
                Firebase Authentication ile e-posta, Google ve Facebook girişlerini tek yerde topladık.
                Oturum açıldıktan sonra mevcut backend API&apos;n de çağrılıyor; yani sipariş, favori ve sepet akışların
                aynı şekilde çalışmaya devam ediyor.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-black/10 bg-white/75 p-5 backdrop-blur">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-white">
                    <ShieldCheck size={18} />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-neutral-950">Güvenli hesap yönetimi</h2>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Şifre gizle-göster, sıfırlama bağlantısı ve kalıcı oturum desteği tek akışta.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-black/10 bg-white/75 p-5 backdrop-blur">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-white">
                    <UserRound size={18} />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-neutral-950">Backend ile senkron</h2>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Firebase kullanıcı bilgisiyle backend login isteği atılıyor ve mevcut token akışın korunuyor.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-black/10 bg-white/75 p-5 backdrop-blur">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-white">
                    <GoogleMark />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-neutral-950">Tek tık sosyal giriş</h2>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Google ve Facebook ile hesap açma ya da giriş yapma tek popup akışıyla tamamlanır.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-black/10 bg-white/75 p-5 backdrop-blur">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-white">
                    <LockKeyhole size={18} />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-neutral-950">Profesyonel UX</h2>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Net hata mesajları, durum geri bildirimi ve mobil uyumlu giriş kartı deneyimi.
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-[1.75rem] border border-black/10 bg-black px-5 py-4 text-sm text-white shadow-lg shadow-black/10">
                Google ve Facebook oturumlarının canlıda çalışması için Firebase Console &gt; Authentication &gt;
                Sign-in method bölümünde ilgili sağlayıcıların aktif edilmesi gerekir.
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-[0_35px_80px_-55px_rgba(0,0,0,0.35)] sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-600">
              <ShieldCheck size={14} />
              Secure Access
            </div>

            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-neutral-950">
              {isLogin ? "Hesabına giriş yap" : "Yeni hesabını oluştur"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              {isLogin
                ? "Siparişlerin, favorilerin ve ödeme adımların için oturumunu güvenli şekilde aç."
                : "Birkaç saniyede hesabını oluştur, ardından aynı kullanıcıyı backend tarafında da oturumlu hale getirelim."}
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500"
                    >
                      Ad
                    </label>
                    <div className="mt-2 flex items-center rounded-2xl border border-neutral-200 bg-white px-3 shadow-sm transition focus-within:border-neutral-900">
                      <UserRound size={16} className="text-neutral-400" />
                      <input
                        id="firstName"
                        required
                        value={firstName}
                        disabled={loading}
                        onChange={(event) => setFirstName(event.target.value)}
                        className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-neutral-400"
                        placeholder="Berat"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500"
                    >
                      Soyad
                    </label>
                    <div className="mt-2 flex items-center rounded-2xl border border-neutral-200 bg-white px-3 shadow-sm transition focus-within:border-neutral-900">
                      <UserRound size={16} className="text-neutral-400" />
                      <input
                        id="lastName"
                        required
                        value={lastName}
                        disabled={loading}
                        onChange={(event) => setLastName(event.target.value)}
                        className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-neutral-400"
                        placeholder="Yilmaz"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                  E-posta
                </label>
                <div className="mt-2 flex items-center rounded-2xl border border-neutral-200 bg-white px-3 shadow-sm transition focus-within:border-neutral-900">
                  <Mail size={16} className="text-neutral-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    disabled={loading}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-neutral-400"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <PasswordField
                id="password"
                label="Şifre"
                placeholder={isLogin ? "Şifreni gir" : "En az 6 karakter"}
                value={password}
                disabled={loading}
                show={showPassword}
                onToggle={() => setShowPassword((value) => !value)}
                onChange={setPassword}
              />

              {!isLogin && (
                <PasswordField
                  id="confirmPassword"
                  label="Şifre tekrarı"
                  placeholder="Şifreni tekrar yaz"
                  value={confirmPassword}
                  disabled={loading}
                  show={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((value) => !value)}
                  onChange={setConfirmPassword}
                />
              )}

              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-neutral-500">
                  {isLogin ? "Şifreni unuttuysan birkaç saniyede sıfırlayabilirsin." : "Hesabın oluşturulunca hemen giriş yapmış olursun."}
                </span>
                {isLogin ? (
                  <button
                    type="button"
                    className="font-medium text-neutral-900 underline-offset-4 transition hover:underline"
                    onClick={() => {
                      setShowResetPanel((current) => !current);
                      setResetEmail(email);
                      setError(null);
                      setSuccess(null);
                    }}
                  >
                    Şifremi unuttum
                  </button>
                ) : (
                  <span className="font-medium text-neutral-900">Google ve Facebook ile de kayıt olabilirsin.</span>
                )}
              </div>

              {showResetPanel && isLogin && (
                <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-4">
                  <div className="text-sm font-semibold text-neutral-900">Şifre sıfırlama bağlantısı</div>
                  <p className="mt-1 text-sm text-neutral-600">
                    E-posta adresini gir, Firebase üzerinden sana sıfırlama bağlantısı gönderelim.
                  </p>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="email"
                      value={resetEmail}
                      disabled={loading}
                      onChange={(event) => setResetEmail(event.target.value)}
                      className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                      placeholder="you@example.com"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        void handlePasswordReset();
                      }}
                      disabled={busyAction === "reset"}
                      className="whitespace-nowrap"
                    >
                      {busyAction === "reset" ? "Gönderiliyor..." : "Bağlantı gönder"}
                    </Button>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              )}

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {busyAction === "email-login" || busyAction === "email-register" ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : null}
                <span>
                  {isLogin
                    ? busyAction === "email-login"
                      ? "Giriş yapılıyor..."
                      : "E-posta ile giriş yap"
                    : busyAction === "email-register"
                      ? "Hesap oluşturuluyor..."
                      : "Hesap oluştur"}
                </span>
              </Button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">veya</span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            <div className="grid gap-3">
              <SocialButton
                label="Google ile devam et"
                onClick={handleGoogleLogin}
                disabled={loading}
                loading={busyAction === "google"}
                icon={<GoogleMark />}
              />
              <SocialButton
                label="Facebook ile devam et"
                onClick={handleFacebookLogin}
                disabled={loading}
                loading={busyAction === "facebook"}
                icon={<Facebook size={18} />}
              />
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-neutral-200 bg-neutral-50 px-5 py-4 text-sm text-neutral-600">
              {isLogin ? "Henüz hesabın yok mu?" : "Zaten bir hesabın var mı?"}{" "}
              <Link href={switchHref} className="font-semibold text-neutral-900 underline-offset-4 hover:underline">
                {isLogin ? "Kayıt ol" : "Giriş yap"}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </Container>
  );
}
