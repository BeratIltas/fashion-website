import { Suspense } from "react";
import AuthScreen from "@/components/auth/AuthScreen";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" aria-hidden="true" />}>
      <AuthScreen mode="login" />
    </Suspense>
  );
}
