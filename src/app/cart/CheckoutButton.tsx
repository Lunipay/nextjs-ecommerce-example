"use client";

import { useState, useTransition } from "react";

export function CheckoutButton() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onClick = () => {
    setError(null);
    start(async () => {
      const res = await fetch("/api/checkout", { method: "POST" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? `Checkout failed (${res.status})`);
        return;
      }
      const data = (await res.json()) as { url: string };
      window.location.href = data.url;
    });
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Redirecting to Lunipay…" : "Checkout with Lunipay"}
      </button>
      {error ? (
        <p className="max-w-md text-right text-xs text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
