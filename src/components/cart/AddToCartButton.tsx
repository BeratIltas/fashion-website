"use client";

import { useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import { useCart } from "@/contexts/CartContext";

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
  const { addItem, loading } = useCart();
  const [localLoading, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  const isLoading = loading || localLoading;

  const handleClick = () => {
    if (!asin) return;
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

