"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  customer: { name: string; email: string; phone: string; notes?: string };
  items: { name: string; quantity: number; price: number }[];
  paidAt?: string;
  createdAt: string;
};

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const lastPaidAtRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
  }, []);

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/admin/orders");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (!res.ok) return;
    const data = await res.json();
    setOrders(data.orders);
    setAuthed(true);

    const paidOrders = (data.orders as OrderRow[]).filter(
      (o) => o.status === "paid" && o.paidAt
    );
    if (paidOrders.length === 0) return;

    const newestPaid = paidOrders.reduce((a, b) =>
      new Date(a.paidAt!) > new Date(b.paidAt!) ? a : b
    );

    if (lastPaidAtRef.current) {
      const prev = new Date(lastPaidAtRef.current).getTime();
      const next = new Date(newestPaid.paidAt!).getTime();
      if (next > prev) {
        audioRef.current?.play().catch(() => {
          /* autoplay may be blocked until user interacts */
        });
      }
    }
    lastPaidAtRef.current = newestPaid.paidAt!;
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetchOrders();
    const id = setInterval(fetchOrders, 4000);
    return () => clearInterval(id);
  }, [authed, fetchOrders]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Invalid email or password");
      return;
    }
    setAuthed(true);
    await fetchOrders();
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
    setOrders([]);
    lastPaidAtRef.current = null;
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen w-full min-w-0 items-center justify-center overflow-x-hidden bg-stone-100 px-3 sm:px-4">
        <form
          onSubmit={login}
          className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md"
        >
          <h1 className="text-xl font-semibold text-[#2d422b]">Admin orders</h1>
          <p className="mt-1 text-sm text-stone-600">
            Sign in to view paid orders. New paid orders play{" "}
            <code className="text-xs">/public/notification.mp3</code>.
          </p>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="mt-4 w-full rounded-lg border border-stone-200 px-3 py-2"
          />
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="mt-2 w-full rounded-lg border border-stone-200 px-3 py-2"
          />
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-full bg-[#2d422b] py-2.5 text-sm font-semibold text-white"
          >
            {loading ? "…" : "Sign in"}
          </button>
          <Link href="/" className="mt-4 block text-center text-sm text-stone-500">
            ← Back to store
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-3 py-3 sm:px-4 sm:py-4">
          <h1 className="text-lg font-semibold text-[#2d422b]">Orders</h1>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => audioRef.current?.play()}
              className="text-sm text-stone-600 hover:text-stone-900"
            >
              Test sound
            </button>
            <button
              type="button"
              onClick={logout}
              className="text-sm font-medium text-red-600"
            >
              Log out
            </button>
            <Link href="/" className="text-sm text-stone-600">Store</Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full min-w-0 max-w-5xl px-3 py-6 sm:px-4 sm:py-8">
        <p className="mb-4 text-sm text-stone-600">
          Polling every 4s. Place <strong>notification.mp3</strong> in{" "}
          <code>public/</code> (replace the placeholder).
        </p>
        {orders.length === 0 ? (
          <p className="text-stone-500">No orders yet.</p>
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => (
              <li
                key={o.id}
                className={`rounded-xl border bg-white p-4 shadow-sm ${
                  o.status === "paid"
                    ? "border-emerald-200"
                    : "border-stone-200"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{o.orderNumber}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      o.status === "paid"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {o.status}
                  </span>
                  <span className="font-medium">${o.total.toFixed(2)}</span>
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  Subtotal ${o.subtotal?.toFixed(2) ?? "—"} · Tax ${o.tax?.toFixed(2) ?? "—"}
                </p>
                <p className="mt-2 text-sm text-stone-700">
                  {o.customer.name} · {o.customer.phone} · {o.customer.email}
                </p>
                <ul className="mt-2 text-sm text-stone-600">
                  {o.items.map((it, i) => (
                    <li key={i}>
                      {it.quantity}× {it.name}
                    </li>
                  ))}
                </ul>
                {o.paidAt ? (
                  <p className="mt-2 text-xs text-stone-400">
                    Paid {new Date(o.paidAt).toLocaleString()}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
