import Link from "next/link";
import { resolveCart } from "@/lib/cart";

export async function Nav() {
  const cart = await resolveCart();
  return (
    <header className="border-b border-black/[.08] dark:border-white/[.1]">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Island Goods
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:underline">
            Shop
          </Link>
          <Link href="/cart" className="hover:underline">
            Cart{cart.itemCount > 0 ? ` (${cart.itemCount})` : ""}
          </Link>
        </nav>
      </div>
    </header>
  );
}
