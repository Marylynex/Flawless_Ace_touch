'use client';

import { useEffect, useMemo, useState } from 'react';
import PaymentCard from './PaymentCard';
import { PRODUCTS, formatNgn, type Product } from '../data/products';
import { addToCart, cartCount, cartProducts, cartTotal, clearCart, getCart, setQty, type CartLine } from '../services/cart';
import { readLastPay, readPendingPay } from '../services/paySession';

export default function Shop({
  email,
  highlightIds,
  heading = 'Shop prescribed care',
  sub = 'Buy the products your expert would typically pair with your concern — all on this platform.',
}: {
  email: string;
  highlightIds?: string[];
  heading?: string;
  sub?: string;
}) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [flash, setFlash] = useState<string | null>(null);
  const [orderId] = useState(() => {
    const pending = readPendingPay();
    if (pending?.tab === 'shop') return pending.referenceId;
    const last = readLastPay();
    if (last?.tab === 'shop') return last.referenceId;
    return 'SHOP-' + Date.now().toString(36).toUpperCase();
  });
  const [orderPaid, setOrderPaid] = useState(() => readLastPay()?.tab === 'shop');
  const [paidAmount, setPaidAmount] = useState(0);

  useEffect(() => {
    setLines(getCart());
  }, []);

  const concerns = useMemo(() => {
    const set = new Set<string>();
    PRODUCTS.forEach((p) => p.concerns.forEach((c) => set.add(c)));
    return ['all', ...Array.from(set)];
  }, []);

  const visible = PRODUCTS.filter((p) => filter === 'all' || p.concerns.includes(filter));
  const items = cartProducts(lines);
  const total = cartTotal(lines);
  const count = lines.reduce((n, l) => n + l.qty, 0);

  function add(p: Product) {
    const next = addToCart(p.id);
    setLines(next);
    setFlash(`${p.name} added to bag`);
    setTimeout(() => setFlash(null), 1800);
  }

  function changeQty(id: string, qty: number) {
    setLines(setQty(id, qty));
  }

  return (
    <section className="card shop-card">
      <div className="section-head">
        <div>
          <h2>{heading}</h2>
          <p className="muted">{sub}</p>
        </div>
        <span className="bag-chip">Bag · {count}</span>
      </div>

      <div className="pills">
        {concerns.map((c) => (
          <button
            key={c}
            type="button"
            className={filter === c ? 'pill active' : 'pill'}
            onClick={() => setFilter(c)}
          >
            {c === 'all' ? 'All products' : c === 'rosacea' ? 'Butterfly rash / rosacea' : c.replace('-', ' ')}
          </button>
        ))}
      </div>

      {flash && <div className="toast">{flash}</div>}

      <div className="product-grid">
        {visible.map((p) => {
          const prescribed = highlightIds?.includes(p.id);
          return (
            <article className={prescribed ? 'product-card prescribed' : 'product-card'} key={p.id}>
              {prescribed && <span className="tag">Prescribed</span>}
              <div className="product-mark">{p.name.charAt(0)}</div>
              <strong>{p.name}</strong>
              <span className="muted">{p.size}</span>
              <p>{p.blurb}</p>
              <span className="ingredient">{p.ingredient}</span>
              <div className="product-foot">
                <span className="price">{formatNgn(p.priceNgn)}</span>
                <button className="btn btn-secondary" type="button" onClick={() => add(p)}>
                  Add to bag
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="cart-panel">
        <h3>Your bag</h3>
        {items.length === 0 && !orderPaid && readPendingPay()?.tab !== 'shop' ? (
          <p className="muted">Your bag is empty. Add a prescribed product to check out here.</p>
        ) : (
          <>
            {items.length > 0 && (
              <>
                <ul className="cart-lines">
                  {items.map(({ product, qty }) => (
                    <li key={product.id}>
                      <div>
                        <strong>{product.name}</strong>
                        <span className="muted">{formatNgn(product.priceNgn)} each</span>
                      </div>
                      <div className="qty">
                        <button type="button" onClick={() => changeQty(product.id, qty - 1)} aria-label="Decrease">−</button>
                        <span>{qty}</span>
                        <button type="button" onClick={() => changeQty(product.id, qty + 1)} aria-label="Increase">+</button>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="cart-total"><span>Total</span><strong>{formatNgn(total)}</strong></p>
              </>
            )}
            {(items.length > 0 || orderPaid) && (
              <PaymentCard
                key={orderId}
                email={email}
                referenceId={orderId}
                returnTab="shop"
                amountNgn={total || paidAmount}
                title="Product order"
                description="Pay for prescribed and shop items on Flawless AceTouch. Paystack will send you back here automatically."
                successNote="Order placed. We will pack your products (mock). A confirmation stays on this page."
                onPaid={() => {
                  setPaidAmount(total);
                  clearCart();
                  setLines([]);
                  setOrderPaid(true);
                }}
              />
            )}
          </>
        )}
      </div>
      <p className="muted tiny">Bag count helper: {cartCount() ? 'items saved on this device.' : 'empty bag.'}</p>
    </section>
  );
}
