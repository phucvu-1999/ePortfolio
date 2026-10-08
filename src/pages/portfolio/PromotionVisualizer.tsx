// ─── Promotion Engine Visualizer — Rule Builder & Live Cart ─────────────────
// Interactive promotion rule builder showcasing the V5 POS promotion engine:
// 14 reward types, qualification strategies, and advanced vouchers.
// Visitors build a promotion rule and watch it evaluate against a sample cart.
import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NumberFlow from '@number-flow/react'
import {
  Tag, DollarSign, ShoppingCart,
  Check, X, ChevronRight, Sparkles, Calendar, Hash, Search,
} from 'lucide-react'

/* ── Types ──────────────────────────────────────────────────────────────────── */
type QualType = 'MinimumSpend' | 'SpecificProduct' | 'Quantity' | 'DayOfWeek'

interface Qualification {
  type: QualType
  minSpend: number
  product: string
  qty: number
  days: string[]
}

type RewardId =
  | 'FlatDiscount' | 'PercentageDiscount' | 'BulkFixedPrice' | 'BulkFlatDiscount'
  | 'BulkPercentageDiscount' | 'CheaperItemFlatDiscount' | 'CheaperItemPercentageDiscount'
  | 'FreeCheapest' | 'PackageFixedPrice' | 'ProductsFixedPrice' | 'ProductsFlatDiscount'
  | 'ProductsPercentageDiscount' | 'CashVoucher' | 'AdvancedVoucher'

interface RewardDef {
  id: RewardId
  name: string
  desc: string
  emoji: string
  paramType: 'input' | 'slider' | 'none' | 'json'
  paramLabel?: string
  min?: number
  max?: number
  defaultVal?: number
  unit?: string
}

interface CartItem { name: string; qty: number; price: number }

/* ── Data ───────────────────────────────────────────────────────────────────── */
const CART: CartItem[] = [
  { name: 'Chicken Rice', qty: 1, price: 8.5 },
  { name: 'Iced Tea', qty: 2, price: 3.2 },
  { name: 'Cookie', qty: 1, price: 2.8 },
  { name: 'Nasi Lemak', qty: 1, price: 12.0 },
]
const SUBTOTAL = CART.reduce((s, i) => s + i.qty * i.price, 0)
const PRODUCTS = CART.map(i => i.name)
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const TODAY_IDX = 0 // Monday for demo

const REWARDS: RewardDef[] = [
  { id: 'FlatDiscount', name: 'Flat Discount', desc: '$X off order', emoji: '💲', paramType: 'input', paramLabel: 'Amount', min: 1, max: 20, defaultVal: 5, unit: '$' },
  { id: 'PercentageDiscount', name: '% Discount', desc: 'X% off order', emoji: '📉', paramType: 'slider', paramLabel: 'Percent', min: 5, max: 50, defaultVal: 10, unit: '%' },
  { id: 'BulkFixedPrice', name: 'Bulk Fixed Price', desc: 'All for $X', emoji: '📦', paramType: 'input', paramLabel: 'Price', min: 5, max: 50, defaultVal: 25, unit: '$' },
  { id: 'BulkFlatDiscount', name: 'Bulk Flat Discount', desc: '$X off the group', emoji: '🏷️', paramType: 'input', paramLabel: 'Amount', min: 1, max: 10, defaultVal: 3, unit: '$' },
  { id: 'BulkPercentageDiscount', name: 'Bulk % Discount', desc: 'X% off the group', emoji: '📊', paramType: 'slider', paramLabel: 'Percent', min: 5, max: 30, defaultVal: 15, unit: '%' },
  { id: 'CheaperItemFlatDiscount', name: 'Cheapest Flat Off', desc: '$X off cheapest', emoji: '🔻', paramType: 'input', paramLabel: 'Amount', min: 1, max: 5, defaultVal: 2, unit: '$' },
  { id: 'CheaperItemPercentageDiscount', name: 'Cheapest % Off', desc: 'X% off cheapest', emoji: '⬇️', paramType: 'slider', paramLabel: 'Percent', min: 10, max: 100, defaultVal: 50, unit: '%' },
  { id: 'FreeCheapest', name: 'Free Cheapest', desc: 'Cheapest item free', emoji: '🎁', paramType: 'none' },
  { id: 'PackageFixedPrice', name: 'Package Price', desc: 'Package for $X', emoji: '🎀', paramType: 'input', paramLabel: 'Price', min: 10, max: 40, defaultVal: 22, unit: '$' },
  { id: 'ProductsFixedPrice', name: 'Products Fixed', desc: 'Selected for $X', emoji: '🏪', paramType: 'input', paramLabel: 'Price', min: 5, max: 40, defaultVal: 20, unit: '$' },
  { id: 'ProductsFlatDiscount', name: 'Products Flat Off', desc: '$X off selected', emoji: '✂️', paramType: 'input', paramLabel: 'Amount', min: 1, max: 10, defaultVal: 4, unit: '$' },
  { id: 'ProductsPercentageDiscount', name: 'Products % Off', desc: 'X% off selected', emoji: '🔖', paramType: 'slider', paramLabel: 'Percent', min: 5, max: 50, defaultVal: 20, unit: '%' },
  { id: 'CashVoucher', name: 'Cash Voucher', desc: 'Voucher worth $X', emoji: '🎫', paramType: 'input', paramLabel: 'Value', min: 5, max: 50, defaultVal: 10, unit: '$' },
  { id: 'AdvancedVoucher', name: 'Advanced Voucher', desc: 'JSON-parameterized', emoji: '⚡', paramType: 'json' },
]

const QUAL_OPTIONS: { type: QualType; label: string; icon: typeof Tag; desc: string }[] = [
  { type: 'MinimumSpend', label: 'Min Spend', icon: DollarSign, desc: 'Cart total ≥ $X' },
  { type: 'SpecificProduct', label: 'Specific Product', icon: Search, desc: 'Cart contains product X' },
  { type: 'Quantity', label: 'Quantity', icon: Hash, desc: 'Buy N+ of any item' },
  { type: 'DayOfWeek', label: 'Day of Week', icon: Calendar, desc: 'Valid on selected days' },
]

const CHEAPEST_PRICE = Math.min(...CART.map(i => i.price))

/* ── Helpers ────────────────────────────────────────────────────────────────── */
function evaluateQualification(q: Qualification): { pass: boolean; reason: string } {
  switch (q.type) {
    case 'MinimumSpend': {
      const pass = SUBTOTAL >= q.minSpend
      const diff = Math.abs(SUBTOTAL - q.minSpend).toFixed(2)
      return { pass, reason: `MinimumSpend $${q.minSpend} → Cart $${SUBTOTAL.toFixed(2)} → ${pass ? '✓ PASS' : `✗ FAIL (short by $${diff})`}` }
    }
    case 'SpecificProduct': {
      const found = PRODUCTS.includes(q.product)
      return { pass: found, reason: `SpecificProduct '${q.product}' → ${found ? '✓ FOUND in cart' : '✗ NOT in cart'}` }
    }
    case 'Quantity': {
      const maxQty = Math.max(...CART.map(i => i.qty))
      const pass = maxQty >= q.qty
      return { pass, reason: `Quantity ≥ ${q.qty} → Max item qty ${maxQty} → ${pass ? '✓ PASS' : '✗ FAIL'}` }
    }
    case 'DayOfWeek': {
      const today = DAYS[TODAY_IDX]
      const pass = q.days.includes(today)
      return { pass, reason: `DayOfWeek [${q.days.join(', ')}] → Today is ${today} → ${pass ? '✓ PASS' : '✗ FAIL'}` }
    }
  }
}

function evaluateReward(rewardId: RewardId, param: number): { discount: number; label: string } {
  switch (rewardId) {
    case 'FlatDiscount': return { discount: Math.min(param, SUBTOTAL), label: `$${param} off order` }
    case 'PercentageDiscount': return { discount: +(SUBTOTAL * param / 100).toFixed(2), label: `${param}% off order` }
    case 'BulkFixedPrice': return { discount: Math.max(0, +(SUBTOTAL - param).toFixed(2)), label: `All for $${param}` }
    case 'BulkFlatDiscount': return { discount: Math.min(param, SUBTOTAL), label: `$${param} off group` }
    case 'BulkPercentageDiscount': return { discount: +(SUBTOTAL * param / 100).toFixed(2), label: `${param}% off group` }
    case 'CheaperItemFlatDiscount': return { discount: Math.min(param, CHEAPEST_PRICE), label: `$${param} off cheapest ($${CHEAPEST_PRICE})` }
    case 'CheaperItemPercentageDiscount': return { discount: +(CHEAPEST_PRICE * param / 100).toFixed(2), label: `${param}% off cheapest ($${CHEAPEST_PRICE})` }
    case 'FreeCheapest': return { discount: CHEAPEST_PRICE, label: `Cheapest item free ($${CHEAPEST_PRICE})` }
    case 'PackageFixedPrice': return { discount: Math.max(0, +(SUBTOTAL - param).toFixed(2)), label: `Package for $${param}` }
    case 'ProductsFixedPrice': return { discount: Math.max(0, +(SUBTOTAL - param).toFixed(2)), label: `Selected items for $${param}` }
    case 'ProductsFlatDiscount': return { discount: Math.min(param, SUBTOTAL), label: `$${param} off selected` }
    case 'ProductsPercentageDiscount': return { discount: +(SUBTOTAL * param / 100).toFixed(2), label: `${param}% off selected` }
    case 'CashVoucher': return { discount: Math.min(param, SUBTOTAL), label: `Voucher $${param}` }
    case 'AdvancedVoucher': return { discount: 8, label: 'JSON rule → $8 discount' }
  }
}

/* ── Component ──────────────────────────────────────────────────────────────── */
export default function PromotionVisualizer() {
  const [qual, setQual] = useState<Qualification>({ type: 'MinimumSpend', minSpend: 30, product: 'Chicken Rice', qty: 3, days: ['Mon', 'Fri'] })
  const [selectedReward, setSelectedReward] = useState<RewardId>('FlatDiscount')
  const [rewardParam, setRewardParam] = useState(5)

  const rewardDef = REWARDS.find(r => r.id === selectedReward)!

  const handleRewardSelect = useCallback((r: RewardDef) => {
    setSelectedReward(r.id)
    setRewardParam(r.defaultVal ?? 0)
  }, [])

  const qualResult = useMemo(() => evaluateQualification(qual), [qual])
  const rewardResult = useMemo(() => evaluateReward(selectedReward, rewardParam), [selectedReward, rewardParam])
  const finalTotal = qualResult.pass ? Math.max(0, +(SUBTOTAL - rewardResult.discount).toFixed(2)) : SUBTOTAL

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <section className="w-full" style={{ background: '#0d1117' }}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide" style={{ borderColor: '#f59e0b40', color: '#f59e0b', background: '#f59e0b10' }}>
            <Tag size={13} /> PROMOTION ENGINE
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }} className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Build a Promo Rule, Watch It Fire
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="mx-auto mt-3 max-w-2xl text-sm" style={{ color: '#94a3b8' }}>
            The V5 POS engine supports 14 reward types, multiple qualification strategies, and advanced JSON-parameterized vouchers — all evaluated client-side against the live cart.
          </motion.p>
        </div>

        {/* Two-panel layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── LEFT PANEL: Rule Builder ─────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            {/* Step 1: Qualification */}
            <Panel title="Step 1 — Qualification Strategy" accent="#f59e0b">
              <div className="grid grid-cols-2 gap-2">
                {QUAL_OPTIONS.map(o => {
                  const active = qual.type === o.type
                  return (
                    <motion.button key={o.type} whileTap={{ scale: 0.97 }} onClick={() => setQual(q => ({ ...q, type: o.type }))}
                      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors"
                      style={{ borderColor: active ? '#f59e0b' : '#1e293b', background: active ? '#f59e0b18' : '#0f172a', color: active ? '#fbbf24' : '#94a3b8' }}>
                      <o.icon size={14} />
                      <div><div className="font-semibold" style={{ color: active ? '#fbbf24' : '#e2e8f0' }}>{o.label}</div><div className="opacity-70">{o.desc}</div></div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Qualification params */}
              <div className="mt-3">
                <AnimatePresence mode="wait">
                  {qual.type === 'MinimumSpend' && (
                    <FadeIn key="ms"><label className="text-xs" style={{ color: '#94a3b8' }}>Minimum: <span className="font-mono font-bold" style={{ color: '#fbbf24' }}>${qual.minSpend}</span></label>
                      <input type="range" min={10} max={100} value={qual.minSpend} onChange={e => setQual(q => ({ ...q, minSpend: +e.target.value }))} className="mt-1 w-full accent-amber-500" /></FadeIn>
                  )}
                  {qual.type === 'SpecificProduct' && (
                    <FadeIn key="sp"><label className="text-xs" style={{ color: '#94a3b8' }}>Product:</label>
                      <div className="mt-1 flex flex-wrap gap-1.5">{PRODUCTS.map(p => (
                        <button key={p} onClick={() => setQual(q => ({ ...q, product: p }))}
                          className="rounded-md border px-2.5 py-1 text-xs transition-colors"
                          style={{ borderColor: qual.product === p ? '#f59e0b' : '#1e293b', background: qual.product === p ? '#f59e0b20' : 'transparent', color: qual.product === p ? '#fbbf24' : '#94a3b8' }}>
                          {p}
                        </button>
                      ))}</div></FadeIn>
                  )}
                  {qual.type === 'Quantity' && (
                    <FadeIn key="qty"><label className="text-xs" style={{ color: '#94a3b8' }}>Min quantity: <span className="font-mono font-bold" style={{ color: '#fbbf24' }}>{qual.qty}</span></label>
                      <div className="mt-1 flex items-center gap-2">
                        <Stepper value={qual.qty} min={2} max={5} onChange={v => setQual(q => ({ ...q, qty: v }))} />
                      </div></FadeIn>
                  )}
                  {qual.type === 'DayOfWeek' && (
                    <FadeIn key="day"><label className="text-xs" style={{ color: '#94a3b8' }}>Valid days <span className="opacity-60">(Today = {DAYS[TODAY_IDX]})</span>:</label>
                      <div className="mt-1 flex flex-wrap gap-1.5">{DAYS.map(d => {
                        const on = qual.days.includes(d)
                        return (
                          <button key={d} onClick={() => setQual(q => ({ ...q, days: on ? q.days.filter(x => x !== d) : [...q.days, d] }))}
                            className="rounded-md border px-2.5 py-1 text-xs font-medium transition-colors"
                            style={{ borderColor: on ? '#f59e0b' : '#1e293b', background: on ? '#f59e0b20' : 'transparent', color: on ? '#fbbf24' : '#64748b' }}>
                            {d}
                          </button>)
                      })}</div></FadeIn>
                  )}
                </AnimatePresence>
              </div>
            </Panel>

            {/* Step 2: Reward */}
            <Panel title="Step 2 — Reward Type" accent="#f59e0b">
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3" style={{ maxHeight: 220, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                {REWARDS.map(r => {
                  const active = selectedReward === r.id
                  const isAdv = r.id === 'AdvancedVoucher'
                  const border = active ? (isAdv ? '#8b5cf6' : '#f59e0b') : '#1e293b'
                  const bg = active ? (isAdv ? '#8b5cf615' : '#f59e0b12') : '#0f172a'
                  return (
                    <motion.button key={r.id} whileTap={{ scale: 0.96 }} onClick={() => handleRewardSelect(r)}
                      className="rounded-lg border p-2 text-left transition-colors" style={{ borderColor: border, background: bg }}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{r.emoji}</span>
                        <span className="truncate text-[11px] font-semibold" style={{ color: active ? (isAdv ? '#a78bfa' : '#fbbf24') : '#cbd5e1' }}>{r.name}</span>
                      </div>
                      <div className="mt-0.5 truncate text-[10px]" style={{ color: '#64748b' }}>{r.desc}</div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Reward param */}
              <div className="mt-3">
                <AnimatePresence mode="wait">
                  {rewardDef.paramType === 'input' && (
                    <FadeIn key={`inp-${selectedReward}`}>
                      <label className="text-xs" style={{ color: '#94a3b8' }}>{rewardDef.paramLabel}: <span className="font-mono font-bold" style={{ color: '#fbbf24' }}>{rewardDef.unit}{rewardParam}</span></label>
                      <input type="range" min={rewardDef.min} max={rewardDef.max} value={rewardParam} onChange={e => setRewardParam(+e.target.value)} className="mt-1 w-full accent-amber-500" />
                    </FadeIn>
                  )}
                  {rewardDef.paramType === 'slider' && (
                    <FadeIn key={`sld-${selectedReward}`}>
                      <label className="text-xs" style={{ color: '#94a3b8' }}>{rewardDef.paramLabel}: <span className="font-mono font-bold" style={{ color: '#fbbf24' }}>{rewardParam}{rewardDef.unit}</span></label>
                      <input type="range" min={rewardDef.min} max={rewardDef.max} value={rewardParam} onChange={e => setRewardParam(+e.target.value)} className="mt-1 w-full accent-amber-500" />
                    </FadeIn>
                  )}
                  {rewardDef.paramType === 'json' && (
                    <FadeIn key="json">
                      <div className="mt-1 rounded-lg border p-3 font-mono text-[11px] leading-relaxed" style={{ borderColor: '#8b5cf640', background: '#8b5cf608', color: '#c4b5fd' }}>
                        <span style={{ color: '#64748b' }}>{'{'}</span><br />
                        &nbsp;&nbsp;<span style={{ color: '#a78bfa' }}>"conditionType"</span>: <span style={{ color: '#fbbf24' }}>"minimum_spending"</span>,<br />
                        &nbsp;&nbsp;<span style={{ color: '#a78bfa' }}>"conditionParams"</span>: {'{'} <span style={{ color: '#fbbf24' }}>"amount"</span>: <span style={{ color: '#34d399' }}>30</span> {'}'},<br />
                        &nbsp;&nbsp;<span style={{ color: '#a78bfa' }}>"rewardType"</span>: <span style={{ color: '#fbbf24' }}>"discount_amount"</span>,<br />
                        &nbsp;&nbsp;<span style={{ color: '#a78bfa' }}>"rewardParams"</span>: {'{'} <span style={{ color: '#fbbf24' }}>"amount"</span>: <span style={{ color: '#34d399' }}>8</span>, <span style={{ color: '#fbbf24' }}>"product_variant_ids"</span>: [<span style={{ color: '#34d399' }}>101, 203</span>] {'}'}<br />
                        <span style={{ color: '#64748b' }}>{'}'}</span>
                      </div>
                      <p className="mt-2 text-[10px] italic leading-snug" style={{ color: '#7c3aed' }}>
                        Advanced vouchers arrive JSON-parameterized from the backend — the client re-validates every condition against the actual cart before discounting.
                      </p>
                    </FadeIn>
                  )}
                  {rewardDef.paramType === 'none' && (
                    <FadeIn key="none"><p className="text-xs italic" style={{ color: '#64748b' }}>No parameters — cheapest item is automatically free.</p></FadeIn>
                  )}
                </AnimatePresence>
              </div>
            </Panel>

            {/* Step 3: Rule Summary */}
            <Panel title="Step 3 — Rule Summary" accent="#f59e0b">
              <motion.div layout className="flex items-center gap-2 rounded-lg border p-3" style={{ borderColor: '#f59e0b30', background: '#f59e0b08' }}>
                <div className="flex flex-1 flex-col gap-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold" style={{ color: '#fbbf24' }}>IF</span>
                    <span style={{ color: '#e2e8f0' }}>{qualSummary(qual)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold" style={{ background: selectedReward === 'AdvancedVoucher' ? '#8b5cf620' : '#10b98120', color: selectedReward === 'AdvancedVoucher' ? '#a78bfa' : '#34d399' }}>THEN</span>
                    <span style={{ color: '#e2e8f0' }}>{rewardDef.emoji} {rewardResult.label}</span>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: '#475569' }} />
              </motion.div>
            </Panel>
          </div>

          {/* ── RIGHT PANEL: Live Cart Evaluation ────────────────────────── */}
          <div className="flex flex-col gap-5">
            {/* Cart */}
            <Panel title="Sample Cart" accent="#3b82f6">
              <div className="flex flex-col gap-1">
                {CART.map(item => (
                  <div key={item.name} className="flex items-center justify-between rounded px-2 py-1.5 text-xs" style={{ background: '#1e293b40' }}>
                    <span style={{ color: '#e2e8f0' }}>{item.qty}× {item.name}</span>
                    <span className="font-mono font-semibold" style={{ color: '#94a3b8' }}>${(item.qty * item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between border-t pt-2 text-sm font-bold" style={{ borderColor: '#1e293b', color: '#e2e8f0' }}>
                <span>Subtotal</span>
                <span className="font-mono">${SUBTOTAL.toFixed(2)}</span>
              </div>
            </Panel>

            {/* Qualification Check */}
            <Panel title="Qualification Check" accent={qualResult.pass ? '#10b981' : '#ef4444'}>
              <AnimatePresence mode="wait">
                <motion.div key={qualResult.reason} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }}
                  className="flex items-start gap-2 rounded-lg border p-3" style={{ borderColor: qualResult.pass ? '#10b98130' : '#ef444430', background: qualResult.pass ? '#10b98108' : '#ef444408' }}>
                  {qualResult.pass
                    ? <Check size={16} className="mt-0.5 shrink-0" style={{ color: '#10b981' }} />
                    : <X size={16} className="mt-0.5 shrink-0" style={{ color: '#ef4444' }} />}
                  <span className="font-mono text-xs leading-relaxed" style={{ color: qualResult.pass ? '#6ee7b7' : '#fca5a5' }}>{qualResult.reason}</span>
                </motion.div>
              </AnimatePresence>
            </Panel>

            {/* Reward Calculation */}
            <Panel title="Reward Calculation" accent={qualResult.pass ? '#f59e0b' : '#475569'}>
              <AnimatePresence mode="wait">
                {qualResult.pass ? (
                  <motion.div key="reward-pass" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#94a3b8' }}>
                      <Sparkles size={13} style={{ color: '#f59e0b' }} />
                      <span>{rewardDef.emoji} <span className="font-medium" style={{ color: '#e2e8f0' }}>{rewardResult.label}</span></span>
                    </div>

                    {/* Discount amount */}
                    <div className="flex items-center justify-between rounded-lg border px-4 py-3" style={{ borderColor: '#f59e0b30', background: '#f59e0b08' }}>
                      <span className="text-xs font-medium" style={{ color: '#fbbf24' }}>Discount</span>
                      <span className="font-mono text-xl font-bold" style={{ color: '#f59e0b' }}>
                        −$<NumberFlow value={rewardResult.discount} />
                      </span>
                    </div>

                    {/* New total */}
                    <div className="flex items-center justify-between rounded-lg border px-4 py-4" style={{ borderColor: '#10b98130', background: '#10b98108' }}>
                      <span className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>New Total</span>
                      <span className="font-mono text-2xl font-extrabold" style={{ color: '#34d399' }}>
                        $<NumberFlow value={finalTotal} />
                      </span>
                    </div>

                    {/* Savings badge */}
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 }}
                      className="self-center rounded-full border px-4 py-1 text-xs font-bold" style={{ borderColor: '#f59e0b40', color: '#fbbf24', background: '#f59e0b10' }}>
                      🎉 You save ${rewardResult.discount.toFixed(2)} ({(rewardResult.discount / SUBTOTAL * 100).toFixed(1)}%)
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div key="reward-blocked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 rounded-lg border p-3" style={{ borderColor: '#1e293b', background: '#0f172a' }}>
                    <ShoppingCart size={14} style={{ color: '#475569' }} />
                    <span className="text-xs italic" style={{ color: '#475569' }}>Qualification not met — reward not applied.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Panel>

            {/* Advanced voucher note */}
            <AnimatePresence>
              {selectedReward === 'AdvancedVoucher' && qualResult.pass && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <Panel title="Advanced Voucher Engine" accent="#8b5cf6">
                    <div className="rounded-lg border p-3 font-mono text-[11px] leading-relaxed" style={{ borderColor: '#8b5cf630', background: '#8b5cf608', color: '#c4b5fd' }}>
                      <span style={{ color: '#64748b' }}>{'{'}</span><br />
                      &nbsp;&nbsp;<span style={{ color: '#a78bfa' }}>"conditionType"</span>: <span style={{ color: '#fbbf24' }}>"minimum_spending"</span>,<br />
                      &nbsp;&nbsp;<span style={{ color: '#a78bfa' }}>"conditionParams"</span>: {'{'} <span style={{ color: '#fbbf24' }}>"amount"</span>: <span style={{ color: '#34d399' }}>30</span> {'}'},<br />
                      &nbsp;&nbsp;<span style={{ color: '#a78bfa' }}>"rewardType"</span>: <span style={{ color: '#fbbf24' }}>"discount_amount"</span>,<br />
                      &nbsp;&nbsp;<span style={{ color: '#a78bfa' }}>"rewardParams"</span>: {'{'} <span style={{ color: '#fbbf24' }}>"amount"</span>: <span style={{ color: '#34d399' }}>8</span>, <span style={{ color: '#fbbf24' }}>"product_variant_ids"</span>: [<span style={{ color: '#34d399' }}>101, 203</span>] {'}'}<br />
                      <span style={{ color: '#64748b' }}>{'}'}</span>
                    </div>
                    <p className="mt-2 text-[10px] leading-snug" style={{ color: '#7c3aed' }}>
                      ⚡ Advanced vouchers arrive JSON-parameterized from the backend — the client re-validates every condition against the actual cart before discounting.
                    </p>
                  </Panel>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Sub-components ─────────────────────────────────────────────────────────── */
function Panel({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="rounded-xl border p-4" style={{ borderColor: `${accent}25`, background: '#0f172a' }}>
      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} /> {title}
      </h3>
      {children}
    </motion.div>
  )
}

function FadeIn({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
      {children}
    </motion.div>
  )
}

function Stepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => onChange(Math.max(min, value - 1))} className="flex h-7 w-7 items-center justify-center rounded-md border text-xs font-bold" style={{ borderColor: '#1e293b', color: '#94a3b8', background: '#0f172a' }}>−</button>
      <span className="w-6 text-center font-mono text-sm font-bold" style={{ color: '#fbbf24' }}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} className="flex h-7 w-7 items-center justify-center rounded-md border text-xs font-bold" style={{ borderColor: '#1e293b', color: '#94a3b8', background: '#0f172a' }}>+</button>
    </div>
  )
}

function qualSummary(q: Qualification): string {
  switch (q.type) {
    case 'MinimumSpend': return `Cart total ≥ $${q.minSpend}`
    case 'SpecificProduct': return `Cart contains "${q.product}"`
    case 'Quantity': return `Buy ${q.qty}+ of any item`
    case 'DayOfWeek': return `Valid on ${q.days.join(', ') || '(no days)'}`
  }
}
