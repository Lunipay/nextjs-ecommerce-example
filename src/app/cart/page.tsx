import Link from "next/link";
import { resolveCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { CartLineRow } from "./CartLineRow";
import { CheckoutButton } from "./CheckoutButton";

export default async function CartPage() {
  const cart = await resolveCart();

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Your cart is empty</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Browse the shop and add a few things.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full border border-black/[.1] px-5 py-2 text-sm hover:bg-black/[.04] dark:border-white/[.15] dark:hover:bg-white/[.06]"
        >
          Go to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Cart</h1>

      <ul className="divide-y divide-black/[.08] rounded-lg border border-black/[.08] dark:divide-white/[.1] dark:border-white/[.1]">
        {cart.lines.map((line) => (
          <CartLineRow key={line.product.id} line={line} />
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">Subtotal</span>
        <span className="text-lg font-medium">
          {formatMoney(cart.subtotalMinor, cart.currency)}
        </span>
      </div>

      <div className="mt-6 flex justify-end">
        <CheckoutButton />
      </div>
    </div>
  );
}
