# Island Goods — Lunipay API example

A small e-commerce demo wired up to the [Lunipay](https://www.lunipay.io) sandbox.
A customer browses products, drops a few into a cart, and checks out via Lunipay's
hosted checkout. The order is confirmed by a webhook event.

Stack: **Next.js 16 (App Router) · TypeScript · Tailwind 4**.

---

## Run it locally

```bash
pnpm install
cp .env.local.example .env.local
# fill in LUNIPAY_SECRET_KEY and NEXT_PUBLIC_LUNIPAY_PUBLISHABLE_KEY
pnpm dev
```

Then open <http://localhost:3000>.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `LUNIPAY_SECRET_KEY` | yes | Sandbox secret (`sk_test_…`). Server-side only. |
| `NEXT_PUBLIC_LUNIPAY_PUBLISHABLE_KEY` | yes | Sandbox publishable (`pk_test_…`). Safe to expose. |
| `LUNIPAY_WEBHOOK_SECRET` | optional | Webhook signing secret. In dev it's optional; in prod it's required for the webhook to validate. |
| `LUNIPAY_API_URL` | optional | Override Lunipay API base. Defaults to `https://www.lunipay.io/api/v1`. |
| `NEXT_PUBLIC_APP_URL` | optional | Public URL of this app. Used to build the success/cancel redirect URLs. Defaults to the request host. |

`.env.local` is gitignored — never commit your secret key.

## Project layout

```
src/
  app/
    page.tsx                       # product grid (homepage)
    products/[id]/page.tsx         # product detail
    cart/page.tsx                  # cart
    success/page.tsx               # post-payment landing
    cancel/page.tsx                # cancelled checkout
    api/
      cart/route.ts                # mutate the cart cookie
      checkout/route.ts            # create a Lunipay session, return its URL
      webhooks/lunipay/route.ts    # receive Lunipay events
  lib/
    products.ts                    # mock catalog
    cart.ts                        # cookie-backed cart helpers
    lunipay.ts                     # Lunipay HTTP client (one place to swap)
    format.ts                      # money formatting
```

## How payment flows

```
Customer ─▶ /cart ──[POST /api/checkout]──▶ Lunipay (creates session)
                                            ◀── { id, url }
       ◀──── 303 redirect to session.url
       ─▶ Lunipay hosted checkout
       ─▶ /success?session_id=…   (redirect after payment)

Lunipay ──[POST /api/webhooks/lunipay]──▶ this app (mark order paid)
```

## Lunipay integration

[`src/lib/lunipay.ts`](src/lib/lunipay.ts) is the single file that talks to
Lunipay. The shape matches Lunipay's docs as of writing:

- **Create session** — `POST https://lunipay.io/api/v1/checkout/sessions` with
  body `{ amount_cents, currency, success_url, cancel_url, line_items, … }`.
  See [docs](https://www.lunipay.io/docs/api/checkout-sessions).
- **Auth** — `Authorization: Bearer sk_test_…`. See
  [docs](https://www.lunipay.io/docs/authentication).
- **Webhooks** — header `LuniPay-Signature: t=…,v1=…`, signed payload is
  `${t}.${rawBody}`, HMAC-SHA256, 5-minute tolerance. See
  [docs](https://www.lunipay.io/docs/webhooks/signature-verification).

## Test cards

Lunipay's sandbox accepts the standard Stripe test cards:

- `4242 4242 4242 4242` — succeeds
- `4000 0000 0000 9995` — declines (insufficient funds)
- `4000 0025 0000 3155` — requires 3DS

Use any future expiry, any CVC, any postcode.

## Notes

- Cart state lives in a cookie. A real store would back this with a database
  and tie it to a user.
- The webhook handler logs events to stdout. A real store would record the
  order, fire fulfillment, and send a receipt email here.
- Product images are loaded from Unsplash via plain `<img>` tags. Switch to
  `next/image` and add the host to `images.remotePatterns` if you want
  optimized delivery.
