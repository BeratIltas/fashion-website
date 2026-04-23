"use client";

import { updateProfile } from "firebase/auth";
import {
  Camera,
  CheckCircle2,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, type ReactNode, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, updateUserProfile, uploadProfileImage, type UserProfile, type UserRole } from "@/lib/api";
import { auth } from "@/lib/firebase";

type ProfileField = keyof UserProfile;
type Notice = { type: "success" | "error"; message: string } | null;

const emptyProfile: UserProfile = {
  firstName: "",
  lastName: "",
  email: "",
  role: "USER",
  phone: "",
  address: "",
  city: "",
  country: "",
  photoURL: "",
};

function getInitials(firstName: string, lastName: string, email: string) {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);
  const fallback = email.trim().charAt(0);
  return `${first}${last}`.trim().toUpperCase() || fallback.toUpperCase() || "M";
}

function cleanPhotoUrl(value: string) {
  return value.trim().replace(/^"|"$/g, "");
}

function normalizeRole(role: string): UserRole | undefined {
  if (role === "USER" || role === "ADMIN" || role === "SELLER") return role;
  return undefined;
}

function getReadableProfileError(error: unknown) {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "";

  if (error instanceof Error && error.message.trim()) return error.message;
  return "Profile could not be updated. Please try again.";
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, initialized, updateSessionUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      router.replace("/login?redirect=/profile");
      return;
    }

    let active = true;

    async function loadProfile() {
      setLoadingProfile(true);
      setNotice(null);

      const fallbackProfile: UserProfile = {
        ...emptyProfile,
        firstName: user?.firstName ?? "",
        lastName: user?.lastName ?? "",
        email: user?.email ?? auth.currentUser?.email ?? "",
        role: user?.role ?? "USER",
        photoURL: auth.currentUser?.photoURL ?? user?.avatarUrl ?? "",
      };

      try {
        const remoteProfile = await getUserProfile();
        if (!active) return;

        setProfile({
          ...fallbackProfile,
          ...remoteProfile,
          firstName: remoteProfile.firstName || fallbackProfile.firstName,
          lastName: remoteProfile.lastName || fallbackProfile.lastName,
          email: remoteProfile.email || fallbackProfile.email,
          role: remoteProfile.role || fallbackProfile.role,
          photoURL: remoteProfile.photoURL || fallbackProfile.photoURL,
        });
      } catch (error) {
        console.error(error);
        if (!active) return;
        setProfile(fallbackProfile);
        setNotice({
          type: "error",
          message: "We could not load every saved detail. You can still review and update your profile.",
        });
      } finally {
        if (active) setLoadingProfile(false);
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [initialized, router, user?.id, user?.token]);

  const setField = (field: ProfileField, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setNotice({ type: "error", message: "Please choose an image file." });
      return;
    }

    setUploading(true);
    setNotice(null);

    try {
      const uploadedUrl = cleanPhotoUrl(await uploadProfileImage(file));
      setField("photoURL", uploadedUrl);
      setNotice({ type: "success", message: "Photo added. Save changes to keep it on your profile." });
    } catch (error) {
      setNotice({ type: "error", message: getReadableProfileError(error) });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);

    const nextProfile: UserProfile = {
      ...profile,
      firstName: profile.firstName.trim(),
      lastName: profile.lastName.trim(),
      email: profile.email.trim(),
      role: profile.role || user?.role || "USER",
      phone: profile.phone.trim(),
      address: profile.address.trim(),
      city: profile.city.trim(),
      country: profile.country.trim(),
      photoURL: cleanPhotoUrl(profile.photoURL),
    };

    try {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        const displayName = `${nextProfile.firstName} ${nextProfile.lastName}`.trim();

        await updateProfile(firebaseUser, {
          displayName: displayName || null,
          photoURL: nextProfile.photoURL || null,
        });

      }

      const savedProfile = await updateUserProfile(nextProfile);
      setProfile({ ...nextProfile, ...savedProfile });
      updateSessionUser({
        firstName: savedProfile.firstName || nextProfile.firstName,
        lastName: savedProfile.lastName || nextProfile.lastName,
        email: savedProfile.email || nextProfile.email,
        role: normalizeRole(savedProfile.role || nextProfile.role) || user?.role,
        avatarUrl: savedProfile.photoURL || nextProfile.photoURL,
      });
      setNotice({ type: "success", message: "Your profile has been updated." });
    } catch (error) {
      setNotice({ type: "error", message: getReadableProfileError(error) });
    } finally {
      setSaving(false);
    }
  };

  if (!initialized || loadingProfile) {
    return (
      <Container>
        <div className="flex min-h-[70vh] items-center justify-center pt-28">
          <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm text-neutral-600 shadow-sm">
            <LoaderCircle size={16} className="animate-spin" />
            Loading profile...
          </div>
        </div>
      </Container>
    );
  }

  const initials = getInitials(profile.firstName, profile.lastName, profile.email);
  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || "Complete your profile";
  const location = [profile.city, profile.country].filter(Boolean).join(", ") || "Add your location";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f4f2]">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            "linear-gradient(rgba(24,24,27,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(24,24,27,0.06) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white via-white/70 to-transparent" />
      <div className="pointer-events-none absolute left-[8%] top-36 h-64 w-64 rounded-full bg-neutral-300/45 blur-3xl" />
      <div className="pointer-events-none absolute right-[6%] top-52 h-80 w-80 rounded-full bg-zinc-200/70 blur-3xl" />

      <Container>
        <div className="relative z-10 pt-24 pb-16">
          <div className="mb-7 flex flex-col gap-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500 shadow-sm backdrop-blur">
              <Sparkles size={13} />
              My Account
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
                  Profile settings
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                  Update your personal details so checkout and account pages feel ready when you need them.
                </p>
              </div>
              <div className="rounded-full border border-neutral-200 bg-white/85 px-4 py-2 text-xs font-medium text-neutral-600 shadow-sm backdrop-blur">
                Signed in
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-[0_28px_90px_-58px_rgba(0,0,0,0.42)]"
          >
            <div className="relative border-b border-neutral-200 bg-neutral-950 px-5 py-6 text-white md:px-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.18),transparent_28%),linear-gradient(120deg,rgba(255,255,255,0.12),transparent_42%)]" />
              <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/15 bg-white/10 text-3xl font-semibold shadow-2xl">
                    {profile.photoURL ? (
                      <img src={profile.photoURL} alt="Profile preview" className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">Profile</div>
                    <h2 className="mt-2 truncate text-3xl font-semibold tracking-tight">{fullName}</h2>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/70">
                      <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1">{profile.email || "Add email"}</span>
                      <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1">{location}</span>
                    </div>
                  </div>
                </div>

                <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100">
                  {uploading ? <LoaderCircle size={15} className="animate-spin" /> : <Camera size={15} />}
                  {uploading ? "Uploading..." : "Change photo"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading || saving} />
                </label>
              </div>
            </div>

            <div>
              <section className="p-5 md:p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight text-neutral-950">Personal details</h3>
                    <p className="mt-2 text-sm text-neutral-500">
                      Fill in the details you want to use across your account.
                    </p>
                  </div>
                  <div className="hidden rounded-2xl bg-neutral-100 p-3 text-neutral-500 sm:block">
                    <ShieldCheck size={21} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <ProfileInput label="First name" value={profile.firstName} onChange={(value) => setField("firstName", value)} icon={<UserRound size={15} />} />
                  <ProfileInput label="Last name" value={profile.lastName} onChange={(value) => setField("lastName", value)} icon={<UserRound size={15} />} />
                  <ProfileInput label="Email" value={profile.email} type="email" onChange={(value) => setField("email", value)} icon={<Mail size={15} />} disabled />
                  <ProfileInput label="Phone" value={profile.phone} onChange={(value) => setField("phone", value)} icon={<Phone size={15} />} placeholder="+90 555 000 00 00" />
                  <ProfileInput label="City" value={profile.city} onChange={(value) => setField("city", value)} icon={<MapPin size={15} />} placeholder="Beykoz" />
                  <ProfileInput label="Country" value={profile.country} onChange={(value) => setField("country", value)} icon={<MapPin size={15} />} placeholder="Turkey" />
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Address
                  </label>
                  <textarea
                    value={profile.address}
                    onChange={(event) => setField("address", event.target.value)}
                    rows={4}
                    className="mt-2 w-full resize-none rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:bg-white"
                    placeholder="Street, building, apartment"
                  />
                </div>

                <div className="mt-4">
                  <ProfileInput
                    label="Photo URL"
                    value={profile.photoURL}
                    onChange={(value) => setField("photoURL", value)}
                    icon={<Camera size={15} />}
                    placeholder="https://..."
                  />
                </div>

                {notice && (
                  <div
                    className={`mt-5 flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${
                      notice.type === "success"
                        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                        : "border-red-100 bg-red-50 text-red-600"
                    }`}
                  >
                    {notice.type === "success" ? <CheckCircle2 size={16} /> : <ShieldCheck size={16} />}
                    <span>{notice.message}</span>
                  </div>
                )}

                <div className="mt-7 flex flex-col gap-3 border-t border-neutral-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-5 text-neutral-500">
                    Keep your details up to date for smoother checkout and order updates.
                  </p>
                  <Button type="submit" disabled={saving || uploading} className="min-w-40">
                    {saving && <LoaderCircle size={16} className="mr-2 animate-spin" />}
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </section>
            </div>
          </form>
        </div>
      </Container>
    </main>
  );
}

function ProfileInput({
  label,
  value,
  onChange,
  icon,
  placeholder,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: ReactNode;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
        {label}
      </label>
      <div className="mt-2 flex h-12 items-center rounded-2xl border border-neutral-200 bg-neutral-50 px-3 transition focus-within:border-neutral-900 focus-within:bg-white">
        <span className="text-neutral-400">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:text-neutral-500"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
