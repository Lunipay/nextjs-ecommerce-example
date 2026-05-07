import Link from "next/link";
import { products } from "@/lib/products";
import { formatMoney } from "@/lib/format";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Island Goods</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          A small Caribbean-inspired demo store. Add a few things, check out, and
          watch the order flow through the Lunipay sandbox.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <li
            key={p.id}
            className="group rounded-lg border border-black/[.08] bg-white transition-colors hover:border-black/[.2] dark:border-white/[.1] dark:bg-zinc-950 dark:hover:border-white/[.25]"
          >
            <Link href={`/products/${p.id}`} className="flex flex-col">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image}
                alt={p.name}
                className="aspect-square w-full rounded-t-lg object-cover"
                loading="lazy"
              />
              <div className="flex flex-col gap-1 p-4">
                <span className="text-base font-medium">{p.name}</span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {formatMoney(p.priceMinor, p.currency)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
