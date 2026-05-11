"use client";

import { useState, useTransition } from "react";

export function CheckoutButton() {
  const [pending, start] = useTransition();
  const [pendingPath, setPendingPath] = useState<"fetch" | "sdk" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkout = (path: "fetch" | "sdk") => {
    setError(null);
    setPendingPath(path);
    const endpoint = path === "sdk" ? "/api/checkout-sdk" : "/api/checkout";
    start(async () => {
      const res = await fetch(endpoint, { method: "POST" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? `Checkout failed (${res.status})`);
        setPendingPath(null);
        return;
      }
      const data = (await res.json()) as { url: string };
      window.location.href = data.url;
    });
  };

  return (
    <div className="flex flex-col items-end gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => checkout("fetch")}
          disabled={pending}
          className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending && pendingPath === "fetch"
            ? "Redirecting…"
            : "Checkout (fetch)"}
        </button>
        <button
          type="button"
          onClick={() => checkout("sdk")}
          disabled={pending}
          className="rounded-full border border-foreground px-6 py-3 text-sm font-medium transition-colors hover:bg-foreground/[.05] disabled:opacity-50"
        >
          {pending && pendingPath === "sdk" ? "Redirecting…" : "Checkout (SDK)"}
        </button>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Same Lunipay flow — left uses raw <code>fetch</code>, right uses the{" "}
        <code>lunipay</code> npm package.
      </p>
      {error ? (
        <p className="max-w-md text-right text-xs text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
