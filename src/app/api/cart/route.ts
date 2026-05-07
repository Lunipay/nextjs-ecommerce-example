import { NextResponse } from "next/server";
import { mutate, readCart, writeCart, type CartAction } from "@/lib/cart";
import { getProduct } from "@/lib/products";

export async function POST(req: Request) {
  let body: CartAction;
  try {
    body = (await req.json()) as CartAction;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    !["add", "set", "remove", "clear"].includes(body.type)
  ) {
    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  }

  if (body.type !== "clear") {
    if (typeof body.id !== "string" || !getProduct(body.id)) {
      return NextResponse.json({ error: "unknown product" }, { status: 400 });
    }
    if (body.type === "set" && (typeof body.qty !== "number" || body.qty < 0)) {
      return NextResponse.json({ error: "invalid qty" }, { status: 400 });
    }
  }

  const next = mutate(await readCart(), body);
  await writeCart(next);
  return NextResponse.json({ ok: true, items: next.items });
}
