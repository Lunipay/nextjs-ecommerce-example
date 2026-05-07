export type Product = {
  id: string;
  name: string;
  description: string;
  priceMinor: number; // amount in minor units (cents)
  currency: string;
  image: string;
};

export const products: Product[] = [
  {
    id: "rum-cake",
    name: "Caribbean Rum Cake",
    description:
      "Hand-baked Jamaican rum cake. Aged dark rum, raisins, brown sugar. Ships in a tin.",
    priceMinor: 2999,
    currency: "USD",
    image:
      "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "blue-mountain-coffee",
    name: "Blue Mountain Coffee — 12 oz",
    description:
      "Single-origin Jamaica Blue Mountain. Whole bean, medium roast. Roasted to order.",
    priceMinor: 4500,
    currency: "USD",
    image:
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "scotch-bonnet-hot-sauce",
    name: "Scotch Bonnet Hot Sauce",
    description:
      "Small-batch hot sauce. Scotch bonnet, mango, allspice, lime. 5 fl oz bottle.",
    priceMinor: 1200,
    currency: "USD",
    image:
      "https://images.unsplash.com/photo-1582169296194-e4d644c48063?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "linen-shirt",
    name: "Island Linen Shirt",
    description:
      "Loose-fit linen shirt, off-white. Coconut buttons. Hand-finished in Trinidad.",
    priceMinor: 7800,
    currency: "USD",
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "raffia-tote",
    name: "Raffia Beach Tote",
    description:
      "Hand-woven raffia tote with leather handles. Big enough for a wet swimsuit and a book.",
    priceMinor: 6500,
    currency: "USD",
    image:
      "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "soursop-soap",
    name: "Soursop & Coconut Soap",
    description:
      "Cold-process bar soap. Soursop leaf extract, virgin coconut oil, shea. 4 oz bar.",
    priceMinor: 900,
    currency: "USD",
    image:
      "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=800&q=70",
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
