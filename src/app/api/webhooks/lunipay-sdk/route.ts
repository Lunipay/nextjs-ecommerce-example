/**
 * Webhook handler via the official Lunipay SDK.
 *
 * Same job as `/api/webhooks/lunipay` — verify the signature and switch
 * on `event.type` — but uses `Webhook.constructEvent` from the SDK so
 * the verification + parsing is one call.
 */

import { NextResponse } from "next/server";
import { constructWebhookEvent, WebhookSignatureError } from "@/lib/lunipay-sdk";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("lunipay-signature");

  let event: { type: string; data?: { object?: Record<string, unknown> } };
  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch (err) {
    if (err instanceof WebhookSignatureError) {
      return NextResponse.json({ error: "invalid signature" }, { status: 400 });
    }
    throw err;
  }

  const resource = event.data?.object;

  switch (event.type) {
    case "checkout.session.completed":
      console.log("[lunipay-sdk] checkout completed", resource);
      break;
    case "payment.succeeded":
      console.log("[lunipay-sdk] payment succeeded", resource);
      break;
    case "payment.failed":
      console.log("[lunipay-sdk] payment failed", resource);
      break;
    default:
      console.log("[lunipay-sdk] unhandled event", event.type);
  }

  return NextResponse.json({ received: true });
}
