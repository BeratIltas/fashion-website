import { Suspense } from "react";
import AuthScreen from "@/components/auth/AuthScreen";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" aria-hidden="true" />}>
      <AuthScreen mode="register" />
    </Suspense>
  );
}
