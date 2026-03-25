"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  asin: string;
  quantity?: number;
  fullWidth?: boolean;
  label?: string;
};

export default function AddToCartButton({
  asin,
  quantity = 1,
  fullWidth,
  label = "Add to cart",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { addItem, loading } = useCart();
  const [localLoading, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  const isLoading = loading || localLoading;

  const handleClick = () => {
    if (!asin) return;

    if (!user) {
      const redirect = encodeURIComponent(pathname || "/");
      router.push(`/login?redirect=${redirect}`);
      return;
    }

    setAdded(false);
    startTransition(async () => {
      await addItem(asin, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className={fullWidth ? "w-full" : ""}
    >
      {isLoading ? "Adding..." : added ? "Added ✓" : label}
    </Button>
  );
}

