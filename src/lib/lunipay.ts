/**
 * Lunipay API client.
 *
 * Docs:
 *   - https://www.lunipay.io/docs/authentication
 *   - https://www.lunipay.io/docs/api/checkout-sessions
 *   - https://www.lunipay.io/docs/webhooks/signature-verification
 *
 * The whole app talks to Lunipay through this file. If a field name or
 * endpoint changes upstream, edit it here.
 */

// Note: lunipay.io (apex) returns a 307 redirect to www.lunipay.io, and Node's
// fetch strips the Authorization header on cross-hostname redirects for safety.
// Always hit the www. host directly so the Bearer token survives the request.
const apiUrl = (process.env.LUNIPAY_API_URL ?? "https://www.lunipay.io/api/v1").replace(
  /\/$/,
  ""
);

function secretKey(): string {
  const key = process.env.LUNIPAY_SECRET_KEY;
  if (!key) {
    throw new Error(
      "LUNIPAY_SECRET_KEY is not set. Copy .env.local.example to .env.local and fill it in."
    );
  }
  return key;
}

export type LineItem = {
  name: string;
  quantity: number;
  amountMinor: number; // unit price in cents
};

export type CheckoutSession = {
  id: string;
  url: string;
  status: string;
  payment_status: string;
};

export async function createCheckoutSession(args: {
  lineItems: LineItem[];
  currency: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}): Promise<CheckoutSession> {
  // Lunipay's API takes `amount` on the request body but echoes back `amount_cents`
  // in the response. The docs at /docs/api/checkout-sessions say `amount_cents` for
  // both — the docs are wrong on the request side.
  const totalAmount = args.lineItems.reduce(
    (sum, li) => sum + li.amountMinor * li.quantity,
    0
  );

  const body = {
    amount: totalAmount,
    currency: args.currency.toLowerCase(),
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
    customer_email: args.customerEmail,
    line_items: args.lineItems.map((li) => ({
      name: li.name,
      quantity: li.quantity,
      amount: li.amountMinor,
    })),
    metadata: args.metadata,
  };

  const res = await fetch(`${apiUrl}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Lunipay checkout failed (${res.status}): ${errorBody}`);
  }

  return (await res.json()) as CheckoutSession;
}

/**
 * Verify a Lunipay webhook signature.
 *
 * Header format: `LuniPay-Signature: t=1713100900,v1=hex_hmac_sha256`
 * Algorithm:     HMAC-SHA256(webhook_secret, `${t}.${rawBody}`)
 * Tolerance:     5 minutes (rejects replays older than that)
 *
 * The raw request body must be the exact bytes Lunipay sent — never
 * re-stringify a parsed JSON body before verifying.
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): Promise<boolean> {
  const secret = process.env.LUNIPAY_WEBHOOK_SECRET;
  if (!secret) {
    // No secret configured — allow in dev so the flow can be wired end to end,
    // reject in prod so a misconfiguration can't quietly accept events.
    return process.env.NODE_ENV !== "production";
  }
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((kv) => {
      const [k, ...rest] = kv.trim().split("=");
      return [k, rest.join("=")];
    })
  );
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;

  const tNum = Number(t);
  if (!Number.isFinite(tNum)) return false;
  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - tNum);
  if (ageSeconds > 300) return false; // 5 minute tolerance

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(`${t}.${rawBody}`));
  const expected = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return timingSafeEqual(expected, v1);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
