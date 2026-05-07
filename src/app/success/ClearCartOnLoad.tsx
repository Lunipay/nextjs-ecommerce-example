"use client";

import { useEffect } from "react";

export function ClearCartOnLoad() {
  useEffect(() => {
    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "clear" }),
    }).catch(() => {});
  }, []);
  return null;
}
