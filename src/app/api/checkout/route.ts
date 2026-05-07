import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { resolveCart } from "@/lib/cart";
import { createCheckoutSession } from "@/lib/lunipay";

export async function POST() {
  const cart = await resolveCart();
  if (cart.lines.length === 0) {
    return NextResponse.json({ error: "cart is empty" }, { status: 400 });
  }

  const baseUrl = await getBaseUrl();

  try {
    const session = await createCheckoutSession({
      currency: cart.currency,
      lineItems: cart.lines.map((line) => ({
        name: line.product.name,
        quantity: line.qty,
        amountMinor: line.product.priceMinor,
      })),
      successUrl: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/cancel`,
    });
    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function getBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
