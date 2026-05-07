import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Checkout cancelled</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Your cart is still saved — head back when you're ready.
      </p>
      <div className="mt-10 flex justify-center gap-3">
        <Link
          href="/cart"
          className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Back to cart
        </Link>
        <Link
          href="/"
          className="rounded-full border border-black/[.1] px-5 py-2 text-sm hover:bg-black/[.04] dark:border-white/[.15] dark:hover:bg-white/[.06]"
        >
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
