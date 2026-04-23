"use client";

import { useState } from "react";
import { generateCoupon, verifyCoupon } from "@/lib/adminApi";
import AdminBell from "@/components/dashboard/AdminBell";
import {
  CheckCircle2,
  ClipboardCopy,
  LoaderCircle,
  Percent,
  Search,
  Tag,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminDiscountsPage() {
  const { user } = useAuth();

  const [generating, setGenerating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [genError, setGenError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [verifyInput, setVerifyInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ code: string; discount: number } | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenError(null);
    try {
      const code = await generateCoupon();
      setGeneratedCodes((prev) => [code, ...prev]);
    } catch (e: unknown) {
      setGenError(e instanceof Error ? e.message : "Failed to generate coupon");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const handleVerify = async () => {
    const code = verifyInput.trim();
    if (!code) return;
    setVerifying(true);
    setVerifyResult(null);
    setVerifyError(null);
    try {
      const discount = await verifyCoupon(code);
      setVerifyResult({ code, discount });
    } catch (e: unknown) {
      setVerifyError(e instanceof Error ? e.message : "Invalid or expired coupon");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-4 border-b border-neutral-200 bg-white px-6 py-3 shrink-0">
        <h1 className="text-sm font-semibold text-neutral-800">Discounts</h1>
        <div className="ml-auto flex items-center gap-3">
          <AdminBell />
          <div className="flex items-center gap-2.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-[11px] font-bold text-white">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-neutral-900 leading-none">{user?.firstName}</p>
              <p className="text-[10px] text-neutral-400 leading-none mt-0.5">Administrator</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-neutral-50">
        <div className="bg-white border-b border-neutral-200 px-6 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-orange-500 mb-1">Admin Console</p>
          <h1 className="text-[28px] font-semibold tracking-tight text-neutral-900">Discounts & Coupons</h1>
          <p className="mt-0.5 text-sm text-neutral-500">Generate and verify discount codes</p>
        </div>

        <div className="px-6 py-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Generate */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <Tag size={18} className="text-orange-500" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">Generate Coupon</h2>
                <p className="text-xs text-neutral-400">Create a new unique discount code</p>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-sm shadow-orange-200"
            >
              {generating ? <><LoaderCircle size={14} className="animate-spin" /> Generating...</> : <><Tag size={14} /> Generate Code</>}
            </button>

            {genError && <p className="mt-3 rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-xs text-red-600">{genError}</p>}

            {generatedCodes.length > 0 && (
              <div className="mt-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">Generated this session</p>
                <div className="space-y-2">
                  {generatedCodes.map((code, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Percent size={13} className="text-orange-400 shrink-0" />
                        <span className="font-mono text-sm font-bold tracking-widest text-neutral-900">{code}</span>
                        {idx === 0 && (
                          <span className="rounded-full bg-orange-50 border border-orange-100 px-2 py-0.5 text-[9px] font-bold text-orange-600 uppercase">New</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleCopy(code)}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
                      >
                        {copiedCode === code ? <><CheckCircle2 size={12} className="text-emerald-500" /> Copied</> : <><ClipboardCopy size={12} /> Copy</>}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Verify */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <Search size={18} className="text-amber-500" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">Verify Coupon</h2>
                <p className="text-xs text-neutral-400">Check the discount value of a code</p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 focus-within:border-orange-400 focus-within:bg-white transition-colors">
                <Percent size={13} className="text-neutral-400 shrink-0" />
                <input
                  value={verifyInput}
                  onChange={(e) => setVerifyInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  placeholder="Enter coupon code..."
                  className="bg-transparent outline-none text-sm font-mono text-neutral-900 placeholder:text-neutral-400 placeholder:font-sans w-full"
                />
              </div>
              <button
                onClick={handleVerify}
                disabled={verifying || !verifyInput.trim()}
                className="rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
              >
                {verifying ? <LoaderCircle size={13} className="animate-spin" /> : "Check"}
              </button>
            </div>

            {verifyResult && (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 mb-0.5">Valid Coupon</p>
                    <p className="font-mono text-base font-bold text-neutral-900 tracking-widest">{verifyResult.code}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-[38px] font-semibold leading-none text-emerald-600">
                      {verifyResult.discount}<span className="text-xl">%</span>
                    </p>
                    <p className="text-[10px] text-neutral-400">discount</p>
                  </div>
                </div>
              </div>
            )}

            {verifyError && (
              <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <XCircle size={16} className="text-red-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-700">Invalid Coupon</p>
                  <p className="text-xs text-red-500 mt-0.5">{verifyError}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
