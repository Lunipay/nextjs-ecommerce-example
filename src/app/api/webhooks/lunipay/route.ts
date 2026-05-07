import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/lunipay";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("lunipay-signature");

  const ok = await verifyWebhookSignature(rawBody, signature);
  if (!ok) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  let event: LunipayEvent;
  try {
    event = JSON.parse(rawBody) as LunipayEvent;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  // event.data.object is the resource snapshot — for checkout.session.completed
  // it's the checkout_session, for payment.* it's the payment, etc.
  const resource = event.data?.object;

  switch (event.type) {
    case "checkout.session.completed":
      // This is the one to act on for hosted-checkout flows: mark the order paid,
      // send the receipt email, kick off fulfillment.
      console.log("[lunipay] checkout completed", resource);
      break;
    case "payment.succeeded":
      console.log("[lunipay] payment succeeded", resource);
      break;
    case "payment.failed":
      console.log("[lunipay] payment failed", resource);
      break;
    default:
      console.log("[lunipay] unhandled event", event.type);
  }

  return NextResponse.json({ received: true });
}

type LunipayEvent = {
  id: string;
  object: "event";
  type: string;
  livemode: boolean;
  api_version: string;
  data: { object: Record<string, unknown> };
  created: number;
};
