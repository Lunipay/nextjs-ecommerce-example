import Link from "next/link";
import { ClearCartOnLoad } from "./ClearCartOnLoad";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <ClearCartOnLoad />
      <h1 className="text-3xl font-semibold tracking-tight">Thanks for your order</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Your payment was completed in the Lunipay sandbox. A confirmation will follow
        once the webhook event lands.
      </p>
      {session_id ? (
        <p className="mt-6 inline-block rounded-md bg-zinc-100 px-3 py-1.5 font-mono text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          session: {session_id}
        </p>
      ) : null}
      <div className="mt-10">
        <Link
          href="/"
          className="rounded-full border border-black/[.1] px-5 py-2 text-sm hover:bg-black/[.04] dark:border-white/[.15] dark:hover:bg-white/[.06]"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
