/**
 * Checkout via the official Lunipay SDK.
 *
 * Functionally identical to `/api/checkout`, but uses the `lunipay` npm
 * package instead of hand-rolled `fetch`. Kept side by side so you can
 * see both styles.
 */

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { randomUUID } from "node:crypto";
import { resolveCart } from "@/lib/cart";
import { createCheckoutSessionWithSdk } from "@/lib/lunipay-sdk";
import {
  InvalidRequestError,
  AuthenticationError,
  RateLimitError,
  LuniPayError,
} from "lunipay";

export async function POST() {
  const cart = await resolveCart();
  if (cart.lines.length === 0) {
    return NextResponse.json({ error: "cart is empty" }, { status: 400 });
  }

  const baseUrl = await getBaseUrl();

  try {
    const session = await createCheckoutSessionWithSdk({
      currency: cart.currency,
      lineItems: cart.lines.map((line) => ({
        name: line.product.name,
        quantity: line.qty,
        amountMinor: line.product.priceMinor,
      })),
      successUrl: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/cancel`,
      // Safe to retry — same key returns the same session instead of duplicating.
      idempotencyKey: randomUUID(),
    });
    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err) {
    // The SDK throws typed errors — branch on the class to give the
    // caller a clean status code and message.
    if (err instanceof InvalidRequestError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: 400 }
      );
    }
    if (err instanceof AuthenticationError) {
      return NextResponse.json({ error: "auth failed" }, { status: 401 });
    }
    if (err instanceof RateLimitError) {
      return NextResponse.json({ error: "rate limited" }, { status: 429 });
    }
    if (err instanceof LuniPayError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
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
