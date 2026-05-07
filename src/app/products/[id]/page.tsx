import { notFound } from "next/navigation";
import Link from "next/link";
import { getProduct, products } from "@/lib/products";
import { formatMoney } from "@/lib/format";
import { AddToCartButton } from "./AddToCartButton";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link
        href="/"
        className="mb-6 inline-block text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Back to shop
      </Link>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="aspect-square w-full rounded-lg border border-black/[.08] object-cover dark:border-white/[.1]"
        />
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
          <p className="text-lg">
            {formatMoney(product.priceMinor, product.currency)}
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">{product.description}</p>
          <div className="mt-2">
            <AddToCartButton id={product.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
