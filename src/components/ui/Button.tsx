import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export default function Button({ variant = "primary", className = "", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-medium transition active:scale-[0.98]";
  const styles =
    variant === "primary"
      ? "bg-black text-white hover:bg-neutral-800"
      : "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50";

  return <button className={`${base} ${styles} ${className}`} {...props} />;
}