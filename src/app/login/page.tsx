"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({
        email,
        firstName,
        lastName,
        authProvider: "EMAIL_LOGIN",
      });
      router.push("/");
    } catch (err) {
      setError("Giriş başarısız. Lütfen bilgileri kontrol edin.");
      console.error(err);
    }
  };

  return (
    <Container>
      <div className="flex min-h-[60vh] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Giriş yap</h1>
          <p className="mt-2 text-sm text-neutral-600">
            E-posta ve ad bilgilerinle oturum aç. Hesabın yoksa, kayıt sayfasından hemen oluşturabilirsin.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-neutral-700">E-posta</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                placeholder="you@example.com"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-neutral-700">Ad</label>
                <input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                  placeholder="Berat"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700">Soyad</label>
                <input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                  placeholder="Yılmaz"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "Giriş yapılıyor..." : "Giriş yap"}
            </Button>
          </form>

          <p className="mt-4 text-xs text-neutral-500">
            Henüz hesabın yok mu?{" "}
            <a href="/register" className="font-medium text-neutral-900 hover:underline">
              Kayıt ol
            </a>
          </p>
        </div>
      </div>
    </Container>
  );
}

