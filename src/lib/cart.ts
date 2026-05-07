import { cookies } from "next/headers";
import { getProduct, type Product } from "./products";

const COOKIE = "cart";

export type CartItem = { id: string; qty: number };
export type Cart = { items: CartItem[] };

export type CartLine = {
  product: Product;
  qty: number;
  lineTotalMinor: number;
};

export type ResolvedCart = {
  lines: CartLine[];
  subtotalMinor: number;
  currency: string;
  itemCount: number;
};

function parse(raw: string | undefined): Cart {
  if (!raw) return { items: [] };
  try {
    const parsed = JSON.parse(raw) as Cart;
    if (!parsed || !Array.isArray(parsed.items)) return { items: [] };
    return {
      items: parsed.items
        .filter((i) => i && typeof i.id === "string" && typeof i.qty === "number")
        .map((i) => ({ id: i.id, qty: Math.max(1, Math.floor(i.qty)) })),
    };
  } catch {
    return { items: [] };
  }
}

export async function readCart(): Promise<Cart> {
  const store = await cookies();
  return parse(store.get(COOKIE)?.value);
}

export async function writeCart(cart: Cart): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, JSON.stringify(cart), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function resolveCart(): Promise<ResolvedCart> {
  const cart = await readCart();
  const lines: CartLine[] = [];
  let subtotalMinor = 0;
  let currency = "USD";

  for (const item of cart.items) {
    const product = getProduct(item.id);
    if (!product) continue;
    const lineTotalMinor = product.priceMinor * item.qty;
    subtotalMinor += lineTotalMinor;
    currency = product.currency;
    lines.push({ product, qty: item.qty, lineTotalMinor });
  }

  return {
    lines,
    subtotalMinor,
    currency,
    itemCount: lines.reduce((n, l) => n + l.qty, 0),
  };
}

export function mutate(cart: Cart, action: CartAction): Cart {
  const items = [...cart.items];
  const idx = items.findIndex((i) => i.id === action.id);

  if (action.type === "add") {
    if (idx >= 0) items[idx] = { ...items[idx], qty: items[idx].qty + 1 };
    else items.push({ id: action.id, qty: 1 });
  } else if (action.type === "set") {
    if (action.qty <= 0) {
      if (idx >= 0) items.splice(idx, 1);
    } else if (idx >= 0) {
      items[idx] = { ...items[idx], qty: action.qty };
    } else {
      items.push({ id: action.id, qty: action.qty });
    }
  } else if (action.type === "remove") {
    if (idx >= 0) items.splice(idx, 1);
  } else if (action.type === "clear") {
    return { items: [] };
  }

  return { items };
}

export type CartAction =
  | { type: "add"; id: string }
  | { type: "set"; id: string; qty: number }
  | { type: "remove"; id: string }
  | { type: "clear"; id?: never };
