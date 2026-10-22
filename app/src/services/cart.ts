import { PRODUCTS, type Product } from '../data/products';

export interface CartLine {
  productId: string;
  qty: number;
}

const KEY = 'fat_cart';

function read(): CartLine[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function write(lines: CartLine[]): void {
  localStorage.setItem(KEY, JSON.stringify(lines));
}

export function getCart(): CartLine[] {
  return read();
}

export function cartCount(): number {
  return read().reduce((n, l) => n + l.qty, 0);
}

export function addToCart(productId: string, qty = 1): CartLine[] {
  const lines = read();
  const existing = lines.find((l) => l.productId === productId);
  if (existing) existing.qty += qty;
  else lines.push({ productId, qty });
  write(lines);
  return lines;
}

export function setQty(productId: string, qty: number): CartLine[] {
  const next = qty <= 0
    ? read().filter((l) => l.productId !== productId)
    : read().map((l) => (l.productId === productId ? { ...l, qty } : l));
  write(next);
  return next;
}

export function clearCart(): void {
  write([]);
}

export function cartProducts(lines: CartLine[]): { product: Product; qty: number }[] {
  return lines
    .map((l) => {
      const product = PRODUCTS.find((p) => p.id === l.productId);
      return product ? { product, qty: l.qty } : null;
    })
    .filter((x): x is { product: Product; qty: number } => x !== null);
}

export function cartTotal(lines: CartLine[]): number {
  return cartProducts(lines).reduce((sum, l) => sum + l.product.priceNgn * l.qty, 0);
}
