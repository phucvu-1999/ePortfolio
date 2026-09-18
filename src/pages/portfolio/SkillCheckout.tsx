import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Atom, Boxes, CreditCard, MonitorSmartphone, Gift, CloudOff,
  Plus, Minus, Trash2, ScanLine, RotateCcw, Star, ChevronRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { playSound } from '../../lib/sound'

const ACCENT = '#ec4899'

interface SkillProduct {
  id: string
  name: string
  tagline: string
  price: number
  rating: number
  icon: LucideIcon
}

const PRODUCTS: SkillProduct[] = [
  { id: 'react', name: 'React + TypeScript', tagline: 'Pixel-perfect, type-safe UIs', price: 120, rating: 5.0, icon: Atom },
  { id: 'dotnet', name: '.NET 8 + C#', tagline: 'gRPC microservices at scale', price: 110, rating: 5.0, icon: Boxes },
  { id: 'payments', name: 'Payment Integrations', tagline: '20+ methods · 0 incidents', price: 140, rating: 5.0, icon: CreditCard },
  { id: 'xplat', name: 'WPF / Xamarin', tagline: '5 device types, one core', price: 90, rating: 4.5, icon: MonitorSmartphone },
  { id: 'loyalty', name: 'Loyalty & Promos', tagline: 'Points, tiers, 14 reward types', price: 100, rating: 4.5, icon: Gift },
  { id: 'offline', name: 'Offline-First Sync', tagline: 'SQLite → gRPC reconciliation', price: 95, rating: 4.5, icon: CloudOff },
]

const PAID_WITH = ['COFFEE ☕', 'PURE CURIOSITY', 'GOOD VIBES', 'A FIRM HANDSHAKE', 'ONE (1) TRUST FALL']

type Cart = Record<string, number>
type Status = 'browsing' | 'authorizing' | 'paid'

const money = (n: number) => `S$${n.toFixed(2)}`

/**
 * The Self-Checkout — the portfolio's signature interactive moment.
 * Visitors scan Leo's skills like products at a POS, pay with curiosity,
 * and receive a printed receipt. Domain-relevant play: this is literally
 * what he builds all day.
 */
export default function SkillCheckout({ onContact }: { onContact: () => void }) {
  const [cart, setCart] = useState<Cart>({})
  const [status, setStatus] = useState<Status>('browsing')
  const [receipt, setReceipt] = useState<{ no: string; paidWith: string; items: { name: string; qty: number; price: number }[]; total: number } | null>(null)
  const timer = useRef<number | null>(null)

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current) }, [])

  const items = useMemo(
    () => Object.entries(cart)
      .map(([id, qty]) => ({ product: PRODUCTS.find((p) => p.id === id)!, qty }))
      .filter((i) => i.qty > 0 && i.product),
    [cart],
  )
  const count = items.reduce((n, i) => n + i.qty, 0)
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0)
  const gst = subtotal * 0.09
  const total = subtotal + gst

  const scan = (id: string) => {
    playSound('key')
    if (status === 'paid') { setCart({}); setReceipt(null) }
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }))
    setStatus('browsing')
  }

  const step = (id: string, d: number) => {
    setCart((c) => {
      const next = { ...c, [id]: Math.max(0, (c[id] ?? 0) + d) }
      if (next[id] === 0) delete next[id]
      return next
    })
  }

  const reset = () => {
    if (timer.current) window.clearTimeout(timer.current)
    setCart({})
    setStatus('browsing')
    setReceipt(null)
  }

  const pay = () => {
    if (!items.length || status !== 'browsing') return
    setStatus('authorizing')
    timer.current = window.setTimeout(() => {
      setReceipt({
        no: String(Math.floor(1000 + Math.random() * 9000)),
        paidWith: PAID_WITH[Math.floor(Math.random() * PAID_WITH.length)],
        items: items.map((i) => ({ name: i.product.name, qty: i.qty, price: i.product.price })),
        total,
      })
      setStatus('paid')
      playSound('success')
    }, 1100)
  }

  return (
    <div>
      {/* Hint bar */}
      <p className="text-center font-mono text-xs text-slate-500 mb-8">
        🛒 scan a skill → checkout → print receipt. <span className="text-slate-400">Yes, this is what I build all day.</span>
      </p>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
        {/* ── Product shelf ── */}
        <div className="grid sm:grid-cols-2 gap-4">
          {PRODUCTS.map((p) => {
            const inCart = cart[p.id] ?? 0
            return (
              <motion.button
                key={p.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => scan(p.id)}
                className={`relative text-left rounded-xl border p-5 transition-colors cursor-pointer ${
                  inCart > 0 ? 'border-pink-500/50 bg-pink-500/[0.07]' : 'border-slate-800 bg-slate-900/40 hover:border-slate-600'
                }`}
              >
                {inCart > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-pink-500 text-white text-xs font-bold flex items-center justify-center shadow-[0_0_12px_rgba(236,72,153,0.6)]">
                    {inCart}
                  </span>
                )}
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border"
                    style={{ color: ACCENT, borderColor: `${ACCENT}44`, background: `${ACCENT}12` }}
                  >
                    <p.icon size={22} />
                  </span>
                  <span className="flex items-center gap-1 font-mono text-xs text-amber-400">
                    <Star size={11} fill="currentColor" /> {p.rating.toFixed(1)}
                  </span>
                </div>
                <div className="mt-4 font-semibold text-slate-100">{p.name}</div>
                <div className="text-sm text-slate-500 mt-0.5">{p.tagline}</div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-mono text-lg font-bold" style={{ color: ACCENT }}>{money(p.price)}</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 border border-slate-800 rounded px-2 py-1 group-hover:border-pink-500/40">
                    <ScanLine size={11} className="inline mr-1 -mt-0.5" /> scan
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* ── Cart / receipt panel ── */}
        <div className="lg:sticky lg:top-24 rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          {/* terminal chrome header */}
          <div className="flex items-center justify-between gap-2 px-4 py-3 bg-slate-900/80 border-b border-slate-800">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
              self-checkout · reg 01 · cashier: leo
            </span>
          </div>

          <AnimatePresence mode="wait">
            {status !== 'paid' ? (
              <motion.div key="cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs uppercase tracking-widest text-slate-400">
                    cart <span className="text-slate-600">({count})</span>
                  </span>
                  {count > 0 && (
                    <button onClick={reset} className="flex items-center gap-1 font-mono text-[11px] text-slate-500 hover:text-rose-400 transition-colors cursor-pointer">
                      <Trash2 size={11} /> clear
                    </button>
                  )}
                </div>

                {items.length === 0 ? (
                  <div className="border border-dashed border-slate-800 rounded-xl py-10 text-center">
                    <ScanLine size={22} className="mx-auto text-slate-600" />
                    <p className="font-mono text-xs text-slate-500 mt-3">cart empty — scan a skill to begin</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {items.map(({ product: p, qty }) => (
                      <div key={p.id} className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-md border border-slate-800 bg-slate-900/60 flex items-center justify-center shrink-0" style={{ color: ACCENT }}>
                          <p.icon size={15} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-slate-200 truncate">{p.name}</div>
                          <div className="font-mono text-[11px] text-slate-500">{money(p.price)} each</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => step(p.id, -1)} className="w-6 h-6 rounded border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 cursor-pointer" aria-label={`Remove one ${p.name}`}>
                            <Minus size={11} />
                          </button>
                          <span className="w-6 text-center font-mono text-sm text-slate-200 tabular-nums">{qty}</span>
                          <button onClick={() => step(p.id, 1)} className="w-6 h-6 rounded border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 cursor-pointer" aria-label={`Add one ${p.name}`}>
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* totals */}
                <div className="mt-5 pt-4 border-t border-dashed border-slate-800 font-mono text-sm space-y-1.5">
                  <div className="flex justify-between text-slate-500"><span>subtotal</span><span className="tabular-nums">{money(subtotal)}</span></div>
                  <div className="flex justify-between text-slate-500"><span>gst 9% <span className="text-slate-600">(singapore 🇸🇬)</span></span><span className="tabular-nums">{money(gst)}</span></div>
                  <div className="flex justify-between text-slate-100 font-bold text-base pt-1"><span>total</span><span className="tabular-nums" style={{ color: ACCENT }}>{money(total)}</span></div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={pay}
                  disabled={!items.length || status === 'authorizing'}
                  className={`mt-5 w-full py-3.5 rounded-xl font-mono text-sm font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    status === 'authorizing'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : items.length
                        ? 'bg-pink-500/15 text-pink-300 border border-pink-500/40 hover:bg-pink-500/25'
                        : 'bg-slate-900/40 text-slate-600 border border-slate-800 cursor-not-allowed'
                  }`}
                >
                  {status === 'authorizing' ? (
                    <>
                      <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                      authorizing…
                    </>
                  ) : (
                    <><CreditCard size={15} /> pay {money(total)}</>
                  )}
                </motion.button>
              </motion.div>
            ) : (
              /* ── Printed receipt ── */
              <motion.div
                key="receipt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5"
              >
                <motion.div
                  initial={{ clipPath: 'inset(0 0 100% 0)' }}
                  animate={{ clipPath: 'inset(0 0 0% 0)' }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="relative rounded-lg border border-slate-800 bg-[#0d1117] font-mono text-xs px-5 py-5"
                >
                  {/* receipt header */}
                  <div className="text-center">
                    <div className="text-slate-200 font-bold tracking-[0.25em]">LEO&rsquo;S SKILL STORE</div>
                    <div className="text-slate-600 mt-1">self-checkout · reg 01</div>
                    <div className="text-slate-600">receipt #{receipt!.no} · {new Date().toLocaleDateString('en-SG')}</div>
                  </div>

                  <div className="my-4 border-t border-dashed border-slate-700" />

                  <div className="space-y-1.5">
                    {receipt!.items.map((it, i) => (
                      <div key={i} className="flex justify-between gap-3">
                        <span className="text-slate-300 truncate">{it.qty}× {it.name}</span>
                        <span className="text-slate-500 tabular-nums shrink-0">{money(it.price * it.qty)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="my-4 border-t border-dashed border-slate-700" />

                  <div className="flex justify-between text-slate-400"><span>incl. gst 9%</span><span className="tabular-nums">{money(receipt!.total * 0.09)}</span></div>
                  <div className="flex justify-between text-slate-100 font-bold text-sm mt-1"><span>total</span><span className="tabular-nums">{money(receipt!.total)}</span></div>
                  <div className="flex justify-between text-slate-500 mt-1"><span>paid with</span><span className="text-slate-300">{receipt!.paidWith}</span></div>

                  {/* approved stamp */}
                  <div className="my-5 flex justify-center">
                    <span
                      className="px-6 py-1.5 border-2 rounded font-bold tracking-[0.3em] text-sm"
                      style={{ color: '#10b981', borderColor: '#10b981', transform: 'rotate(-6deg)', boxShadow: '0 0 18px rgba(16,185,129,0.25)' }}
                    >
                      APPROVED
                    </span>
                  </div>

                  {/* pseudo barcode */}
                  <div
                    className="h-10 mx-6 rounded-sm opacity-70"
                    style={{ background: 'repeating-linear-gradient(90deg, #94a3b8 0 2px, transparent 2px 5px, #94a3b8 5px 6px, transparent 6px 11px, #94a3b8 11px 14px, transparent 14px 17px)' }}
                  />
                  <div className="text-center text-slate-600 mt-2 tracking-[0.35em]">SK1LL-C0DE-2025</div>

                  <div className="text-center text-slate-500 mt-4 text-[11px] leading-relaxed">
                    currency: suggested engagement fee<br />no refunds on good vibes
                  </div>
                </motion.div>

                {/* actions */}
                <div className="mt-4 grid grid-cols-[1fr_auto] gap-3">
                  <button
                    onClick={onContact}
                    className="py-3 rounded-xl font-mono text-sm font-bold uppercase tracking-wider bg-pink-500/15 text-pink-300 border border-pink-500/40 hover:bg-pink-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    hire for real <ChevronRight size={15} />
                  </button>
                  <button
                    onClick={reset}
                    className="px-4 py-3 rounded-xl font-mono text-xs text-slate-400 border border-slate-800 hover:border-slate-600 hover:text-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw size={13} /> new sale
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
