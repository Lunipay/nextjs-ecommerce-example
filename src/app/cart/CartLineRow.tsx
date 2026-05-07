"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { formatMoney } from "@/lib/format";
import type { CartLine } from "@/lib/cart";

export function CartLineRow({ line }: { line: CartLine }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const mutate = (body: unknown) => {
    start(async () => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) router.refresh();
    });
  };

  return (
    <li className="flex items-center gap-4 p-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={line.product.image}
        alt={line.product.name}
        className="h-16 w-16 rounded object-cover"
      />
      <div className="flex flex-1 flex-col">
        <span className="text-sm font-medium">{line.product.name}</span>
        <span className="text-xs text-zinc-600 dark:text-zinc-400">
          {formatMoney(line.product.priceMinor, line.product.currency)} each
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={pending}
          onClick={() =>
            mutate({ type: "set", id: line.product.id, qty: line.qty - 1 })
          }
          className="h-8 w-8 rounded-full border border-black/[.1] text-sm hover:bg-black/[.04] disabled:opacity-50 dark:border-white/[.15] dark:hover:bg-white/[.06]"
        >
          −
        </button>
        <span className="w-6 text-center text-sm tabular-nums">{line.qty}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={pending}
          onClick={() =>
            mutate({ type: "set", id: line.product.id, qty: line.qty + 1 })
          }
          className="h-8 w-8 rounded-full border border-black/[.1] text-sm hover:bg-black/[.04] disabled:opacity-50 dark:border-white/[.15] dark:hover:bg-white/[.06]"
        >
          +
        </button>
      </div>

      <span className="w-20 text-right text-sm font-medium tabular-nums">
        {formatMoney(line.lineTotalMinor, line.product.currency)}
      </span>

      <button
        type="button"
        aria-label="Remove item"
        disabled={pending}
        onClick={() => mutate({ type: "remove", id: line.product.id })}
        className="text-xs text-zinc-500 hover:text-red-600 disabled:opacity-50"
      >
        Remove
      </button>
    </li>
  );
}
