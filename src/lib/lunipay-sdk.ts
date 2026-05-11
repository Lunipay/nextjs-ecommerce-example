/**
 * Lunipay official SDK client.
 *
 * This is the SDK-based equivalent of `lunipay.ts`. The two files do the
 * same job — create checkout sessions and verify webhooks — so you can
 * compare the raw-fetch approach (`lunipay.ts`) against the SDK approach
 * side by side.
 *
 * Docs: https://www.npmjs.com/package/lunipay
 */

import LuniPay, { Webhook, WebhookSignatureError } from "lunipay";
import type { LineItem } from "./lunipay";

function client(): LuniPay {
  const apiKey = process.env.LUNIPAY_SECRET_KEY;
  if (!apiKey) {
    throw new Error(
      "LUNIPAY_SECRET_KEY is not set. Copy .env.local.example to .env.local and fill it in."
    );
  }
  return new LuniPay({
    apiKey,
    // Hit the www host directly — see the note in lunipay.ts about the
    // apex → www redirect stripping the Authorization header.
    apiBase: process.env.LUNIPAY_API_URL ?? "https://www.lunipay.io",
    maxNetworkRetries: 2,
  });
}

export async function createCheckoutSessionWithSdk(args: {
  lineItems: LineItem[];
  currency: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
  idempotencyKey?: string;
}) {
  const totalAmount = args.lineItems.reduce(
    (sum, li) => sum + li.amountMinor * li.quantity,
    0
  );

  return client().checkout.sessions.create(
    {
      amount: totalAmount,
      currency: args.currency.toLowerCase(),
      success_url: args.successUrl,
      cancel_url: args.cancelUrl,
      customer_email: args.customerEmail,
      // The SDK's TypeScript types say `amount_cents` here, but the live
      // API actually wants `amount` on line items (same quirk noted in
      // src/lib/lunipay.ts). Cast through `as never` so we can send the
      // shape the API expects until the SDK types catch up.
      line_items: args.lineItems.map(
        (li) =>
          ({
            name: li.name,
            quantity: li.quantity,
            amount: li.amountMinor,
          }) as never
      ),
      metadata: args.metadata,
    },
    args.idempotencyKey ? { idempotencyKey: args.idempotencyKey } : undefined
  );
}

/**
 * Verify a Lunipay webhook using the SDK. Throws `WebhookSignatureError`
 * on failure — callers can branch on `instanceof WebhookSignatureError`
 * to return a 400.
 */
export function constructWebhookEvent(rawBody: string, signature: string | null) {
  const secret = process.env.LUNIPAY_WEBHOOK_SECRET;
  if (!secret) {
    // Mirror the fetch-based helper: allow in dev so the flow can be wired
    // end to end, reject in prod so a misconfiguration can't silently accept.
    if (process.env.NODE_ENV === "production") {
      throw new WebhookSignatureError("LUNIPAY_WEBHOOK_SECRET is not set");
    }
    return JSON.parse(rawBody);
  }
  return Webhook.constructEvent(rawBody, signature ?? "", secret);
}

export { WebhookSignatureError };
