import mockProducts from './mockProducts.json';

export interface Product {
  id: string;
  name: string;
  concerns: string[];
  priceNgn: number;
  size: string;
  blurb: string;
  ingredient: string;
}

export const PRODUCTS = mockProducts as Product[];

export function productsForConcern(concern: string): Product[] {
  const matched = PRODUCTS.filter((p) => p.concerns.includes(concern));
  if (matched.length >= 2) return matched.slice(0, 3);
  const spf = PRODUCTS.find((p) => p.id === 'prd-spf');
  const extra = PRODUCTS.filter((p) => p.id !== matched[0]?.id).slice(0, 2);
  return [...matched, ...(spf && !matched.includes(spf) ? [spf] : extra)].slice(0, 3);
}

export function formatNgn(n: number): string {
  return `NGN ${n.toLocaleString()}`;
}
