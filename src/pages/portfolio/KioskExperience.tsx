// ─── Kiosk Experience — Interactive Self-Service Simulator ───────────────────
// Walk-through of the V5 POS self-service ordering kiosk: welcome → browse →
// customize → cart → payment → receipt. A mini-app inside the portfolio.
import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Hand,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  ShoppingCart,
  CreditCard,
  Check,
  Loader2,
  Trash2,
  Wifi,
  Database,
  Zap,
  RefreshCw,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────
type Step = 'welcome' | 'browse' | 'customize' | 'cart' | 'payment' | 'complete'

interface MenuItem {
  id: string
  name: string
  emoji: string
  price: number
  category: string
}

interface AddOn {
  id: string
  name: string
  price: number
}

type Size = 'regular' | 'large'

interface CartItem {
  item: MenuItem
  size: Size
  addOns: string[]
  qty: number
}

// ── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = ['Mains', 'Sides', 'Drinks', 'Desserts'] as const

const MENU_ITEMS: MenuItem[] = [
  { id: 'm1', name: 'Grilled Chicken', emoji: '🍗', price: 12.9, category: 'Mains' },
  { id: 'm2', name: 'Fish & Chips', emoji: '🐟', price: 14.5, category: 'Mains' },
  { id: 'm3', name: 'Beef Burger', emoji: '🍔', price: 13.9, category: 'Mains' },
  { id: 's1', name: 'Truffle Fries', emoji: '🍟', price: 6.5, category: 'Sides' },
  { id: 's2', name: 'Coleslaw', emoji: '🥗', price: 4.5, category: 'Sides' },
  { id: 'd1', name: 'Iced Latte', emoji: '☕', price: 5.9, category: 'Drinks' },
  { id: 'd2', name: 'Fresh OJ', emoji: '🍊', price: 4.9, category: 'Drinks' },
  { id: 'x1', name: 'Lava Cake', emoji: '🍫', price: 8.9, category: 'Desserts' },
]

const ADD_ONS: AddOn[] = [
  { id: 'a1', name: 'Extra Cheese', price: 1.5 },
  { id: 'a2', name: 'Extra Sauce', price: 0.8 },
  { id: 'a3', name: 'Upsize Drink', price: 1.0 },
]

const STEP_ORDER: Step[] = ['welcome', 'browse', 'customize', 'cart', 'payment', 'complete']
const STEP_LABELS: Record<Step, string> = {
  welcome: 'Welcome',
  browse: 'Menu',
  customize: 'Customize',
  cart: 'Cart',
  payment: 'Payment',
  complete: 'Done',
}

const GST_RATE = 0.09

const TECH_CALLOUTS = [
  { icon: Zap, text: 'Shared business logic with POS terminal via epos_client_lib', color: '#10b981' },
  { icon: Wifi, text: 'gRPC order sync — orders route to kitchen display instantly', color: '#3b82f6' },
  { icon: Database, text: 'Offline-capable — SQLite queue syncs on reconnect', color: '#8b5cf6' },
  { icon: RefreshCw, text: 'Same promotion engine — 14 reward types apply at kiosk', color: '#f59e0b' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => `$${n.toFixed(2)}`
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 120 : -120, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -120 : 120, opacity: 0 }),
}

// ── Sub-components ───────────────────────────────────────────────────────────

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <button
      onClick={onStart}
      className="flex flex-col items-center justify-center h-full w-full gap-6 px-6 py-12"
      aria-label="Start ordering"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
      >
        <Hand size={48} className="text-emerald-400" />
      </motion.div>
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Welcome!</h3>
        <p className="text-slate-400 font-mono text-sm">Touch to start ordering</p>
      </div>
      <span className="px-6 py-2.5 rounded-full bg-emerald-500 text-white font-mono text-sm font-semibold">
        Start Order
      </span>
    </button>
  )
}

function BrowseMenu({
  onSelect,
}: {
  onSelect: (item: MenuItem) => void
}) {
  const [activeCat, setActiveCat] = useState<string>('Mains')
  const filtered = useMemo(() => MENU_ITEMS.filter((m) => m.category === activeCat), [activeCat])

  return (
    <div className="flex flex-col h-full">
      {/* Category tabs */}
      <div className="flex border-b border-slate-700/60 shrink-0">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCat(c)}
            className={`flex-1 py-2.5 font-mono text-xs font-semibold transition-colors ${
              activeCat === c
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            aria-pressed={activeCat === c}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Item grid */}
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2.5 content-start">
        <AnimatePresence mode="popLayout">
          {filtered.map((item) => (
            <motion.button
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => onSelect(item)}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-700/50 bg-slate-800/40 p-3 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
              aria-label={`Add ${item.name}`}
            >
              <span className="text-3xl">{item.emoji}</span>
              <span className="font-mono text-[11px] text-slate-300 font-medium leading-tight text-center">
                {item.name}
              </span>
              <span className="font-mono text-xs font-bold text-amber-400">{fmt(item.price)}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function CustomizeItem({
  item,
  onAdd,
  onBack,
}: {
  item: MenuItem
  onAdd: (size: Size, addOns: string[]) => void
  onBack: () => void
}) {
  const [size, setSize] = useState<Size>('regular')
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
  }

  const extraCost = (size === 'large' ? 2.0 : 0) + selectedAddOns.reduce((s, id) => {
    const ao = ADD_ONS.find((a) => a.id === id)
    return s + (ao?.price ?? 0)
  }, 0)

  return (
    <div className="flex flex-col h-full p-4">
      <button onClick={onBack} className="flex items-center gap-1 text-slate-500 hover:text-slate-300 font-mono text-xs mb-3 self-start" aria-label="Back to menu">
        <ChevronLeft size={14} /> Back
      </button>

      <div className="text-center mb-4">
        <span className="text-4xl">{item.emoji}</span>
        <h4 className="font-mono text-lg font-bold text-white mt-2">{item.name}</h4>
        <p className="font-mono text-sm text-amber-400">{fmt(item.price)}</p>
      </div>

      {/* Size */}
      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2">Size</p>
      <div className="flex gap-2 mb-4">
        {(['regular', 'large'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSize(s)}
            className={`flex-1 py-2 rounded-lg font-mono text-xs font-semibold border transition-all ${
              size === s
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : 'border-slate-700/50 text-slate-400 hover:border-slate-500'
            }`}
            aria-pressed={size === s}
          >
            {s === 'regular' ? 'Regular' : 'Large (+$2.00)'}
          </button>
        ))}
      </div>

      {/* Add-ons */}
      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2">Add-ons</p>
      <div className="space-y-2 mb-4">
        {ADD_ONS.map((ao) => {
          const active = selectedAddOns.includes(ao.id)
          return (
            <button
              key={ao.id}
              onClick={() => toggleAddOn(ao.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border font-mono text-xs transition-all ${
                active
                  ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400'
                  : 'border-slate-700/50 text-slate-400 hover:border-slate-500'
              }`}
              aria-pressed={active}
            >
              <span>{ao.name}</span>
              <span className="text-amber-400">+{fmt(ao.price)}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-auto">
        <button
          onClick={() => onAdd(size, selectedAddOns)}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-sm font-bold transition-colors"
        >
          Add to Cart — {fmt(item.price + extraCost)}
        </button>
      </div>
    </div>
  )
}

function CartView({
  cart,
  onUpdateQty,
  onRemove,
  onCheckout,
  onBack,
}: {
  cart: CartItem[]
  onUpdateQty: (idx: number, delta: number) => void
  onRemove: (idx: number) => void
  onCheckout: () => void
  onBack: () => void
}) {
  const subtotal = cart.reduce((s, ci) => {
    const aoExtra = ci.addOns.reduce((a, id) => a + (ADD_ONS.find((x) => x.id === id)?.price ?? 0), 0)
    return s + (ci.item.price + (ci.size === 'large' ? 2 : 0) + aoExtra) * ci.qty
  }, 0)
  const gst = subtotal * GST_RATE
  const total = subtotal + gst

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
        <ShoppingCart size={40} className="text-slate-600" />
        <p className="font-mono text-sm text-slate-500">Your cart is empty</p>
        <button onClick={onBack} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white font-mono text-xs transition-colors">
          Browse Menu
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cart.map((ci, idx) => {
          const aoExtra = ci.addOns.reduce((a, id) => a + (ADD_ONS.find((x) => x.id === id)?.price ?? 0), 0)
          const lineTotal = (ci.item.price + (ci.size === 'large' ? 2 : 0) + aoExtra) * ci.qty
          return (
            <motion.div
              key={`${ci.item.id}-${ci.size}-${ci.addOns.join(',')}-${idx}`}
              layout
              className="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-800/30 p-2.5"
            >
              <span className="text-2xl shrink-0">{ci.item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs font-semibold text-white truncate">{ci.item.name}</p>
                <p className="font-mono text-[10px] text-slate-500">
                  {ci.size === 'large' ? 'Large' : 'Regular'}
                  {ci.addOns.length > 0 && ` + ${ci.addOns.length} add-on${ci.addOns.length > 1 ? 's' : ''}`}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => onUpdateQty(idx, -1)} className="w-6 h-6 rounded border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors" aria-label="Decrease quantity">
                  <Minus size={12} />
                </button>
                <span className="font-mono text-xs text-white w-5 text-center">{ci.qty}</span>
                <button onClick={() => onUpdateQty(idx, 1)} className="w-6 h-6 rounded border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors" aria-label="Increase quantity">
                  <Plus size={12} />
                </button>
              </div>
              <span className="font-mono text-xs font-bold text-amber-400 shrink-0 w-16 text-right">{fmt(lineTotal)}</span>
              <button onClick={() => onRemove(idx)} className="text-slate-600 hover:text-red-400 transition-colors shrink-0" aria-label={`Remove ${ci.item.name}`}>
                <Trash2 size={14} />
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Totals */}
      <div className="border-t border-slate-700/60 p-3 space-y-1.5 shrink-0">
        <div className="flex justify-between font-mono text-xs text-slate-400">
          <span>Subtotal</span><span>{fmt(subtotal)}</span>
        </div>
        <div className="flex justify-between font-mono text-xs text-slate-400">
          <span>GST (9%)</span><span>{fmt(gst)}</span>
        </div>
        <div className="flex justify-between font-mono text-sm font-bold text-white pt-1.5 border-t border-dashed border-slate-700/50">
          <span>Total</span><span className="text-emerald-400">{fmt(total)}</span>
        </div>
        <button
          onClick={onCheckout}
          className="w-full mt-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-sm font-bold transition-colors flex items-center justify-center gap-2"
        >
          <CreditCard size={16} /> Proceed to Payment
        </button>
      </div>
    </div>
  )
}

function PaymentScreen({ onComplete }: { onComplete: () => void }) {
  const [processing, setProcessing] = useState(false)

  const handlePay = () => {
    setProcessing(true)
    setTimeout(onComplete, 1800)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-6">
      {processing ? (
        <>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <Loader2 size={48} className="text-emerald-400" />
          </motion.div>
          <p className="font-mono text-sm text-slate-400">Processing payment…</p>
        </>
      ) : (
        <>
          <CreditCard size={48} className="text-emerald-400" />
          <h3 className="text-lg font-bold text-white font-mono">Select Payment</h3>
          <div className="w-full max-w-xs space-y-2">
            {['Tap Card', 'Scan QR', 'NETS Terminal'].map((method) => (
              <button
                key={method}
                onClick={handlePay}
                className="w-full py-3 rounded-xl border border-slate-700/60 bg-slate-800/40 hover:border-emerald-500/50 hover:bg-emerald-500/5 font-mono text-sm text-slate-300 transition-all"
              >
                {method}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function CompleteScreen({ orderNumber, onRestart }: { orderNumber: string; onRestart: () => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100 }
        return p + 2
      })
    }, 80)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 p-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center"
      >
        <Check size={32} className="text-emerald-400" />
      </motion.div>
      <div className="text-center">
        <p className="font-mono text-3xl font-bold text-white">{orderNumber}</p>
        <p className="font-mono text-sm text-slate-400 mt-1">Your order is being prepared</p>
      </div>
      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
        <p className="font-mono text-[10px] text-slate-500 text-center mt-1.5">
          {progress < 100 ? 'Sending to kitchen…' : 'Ready for pickup!'}
        </p>
      </div>
      <button
        onClick={onRestart}
        className="mt-2 px-5 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white font-mono text-xs transition-colors"
      >
        New Order
      </button>
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function KioskExperience() {
  const [step, setStep] = useState<Step>('welcome')
  const [cart, setCart] = useState<CartItem[]>([])
  const [customizing, setCustomizing] = useState<MenuItem | null>(null)
  const [direction, setDirection] = useState(1)
  const orderNum = useRef(`#K${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`)

  const goTo = useCallback(
    (next: Step) => {
      const ci = STEP_ORDER.indexOf(step)
      const ni = STEP_ORDER.indexOf(next)
      setDirection(ni > ci ? 1 : -1)
      setStep(next)
    },
    [step],
  )

  const addToCart = useCallback(
    (item: MenuItem, size: Size, addOns: string[]) => {
      setCart((prev) => {
        const existing = prev.findIndex(
          (c) => c.item.id === item.id && c.size === size && c.addOns.join(',') === addOns.join(','),
        )
        if (existing >= 0) {
          const copy = [...prev]
          copy[existing] = { ...copy[existing], qty: copy[existing].qty + 1 }
          return copy
        }
        return [...prev, { item, size, addOns, qty: 1 }]
      })
      setCustomizing(null)
      goTo('browse')
    },
    [goTo],
  )

  const updateQty = useCallback((idx: number, delta: number) => {
    setCart((prev) => {
      const copy = [...prev]
      copy[idx] = { ...copy[idx], qty: Math.max(1, copy[idx].qty + delta) }
      return copy
    })
  }, [])

  const removeItem = useCallback((idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx))
  }, [])

  const restart = useCallback(() => {
    setCart([])
    setCustomizing(null)
    orderNum.current = `#K${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`
    goTo('welcome')
  }, [goTo])

  const stepIdx = STEP_ORDER.indexOf(step)

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      aria-label="Self-service kiosk simulator"
      className="flex flex-col lg:flex-row items-start gap-6"
    >
      {/* ── Kiosk Frame ── */}
      <div className="w-full max-w-sm mx-auto lg:mx-0 shrink-0">
        <div
          className="rounded-3xl border-4 border-slate-700 overflow-hidden"
          style={{ background: '#0d1117', boxShadow: '0 25px 80px -20px rgba(16,185,129,0.15)' }}
        >
          {/* Status bar */}
          <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-800" style={{ background: '#161b22' }}>
            <span className="font-mono text-[9px] text-slate-600">EPOS KIOSK v5.4</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-mono text-[9px] text-slate-600">ONLINE</span>
            </div>
          </div>

          {/* Progress bar */}
          {step !== 'welcome' && (
            <div className="flex px-3 py-2 gap-1 border-b border-slate-800/60">
              {STEP_ORDER.slice(1).map((s, i) => (
                <div key={s} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`h-1 w-full rounded-full transition-all duration-500 ${
                      i < stepIdx ? 'bg-emerald-500' : i === stepIdx - 1 ? 'bg-emerald-500/60' : 'bg-slate-800'
                    }`}
                  />
                  <span className={`font-mono text-[8px] transition-colors ${i < stepIdx ? 'text-emerald-500' : i === stepIdx - 1 ? 'text-slate-300' : 'text-slate-600'}`}>
                    {STEP_LABELS[s]}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Content area */}
          <div className="h-[420px] overflow-hidden relative" style={{ background: '#0f1419' }}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step + (customizing?.id ?? '')}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                {step === 'welcome' && <WelcomeScreen onStart={() => goTo('browse')} />}
                {step === 'browse' && !customizing && (
                  <BrowseMenu onSelect={(item) => { setCustomizing(item); goTo('customize') }} />
                )}
                {step === 'customize' && customizing && (
                  <CustomizeItem
                    item={customizing}
                    onAdd={(size, addOns) => addToCart(customizing, size, addOns)}
                    onBack={() => { setCustomizing(null); goTo('browse') }}
                  />
                )}
                {step === 'cart' && (
                  <CartView
                    cart={cart}
                    onUpdateQty={updateQty}
                    onRemove={removeItem}
                    onCheckout={() => goTo('payment')}
                    onBack={() => goTo('browse')}
                  />
                )}
                {step === 'payment' && <PaymentScreen onComplete={() => goTo('complete')} />}
                {step === 'complete' && <CompleteScreen orderNumber={orderNum.current} onRestart={restart} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation footer */}
          {step !== 'welcome' && step !== 'complete' && (
            <div className="flex items-center justify-between px-3 py-2.5 border-t border-slate-800">
              <button
                onClick={() => {
                  if (step === 'customize') { setCustomizing(null); goTo('browse') }
                  else if (step === 'cart') goTo('browse')
                  else if (step === 'payment') goTo('cart')
                  else goTo('welcome')
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white font-mono text-xs transition-colors"
                aria-label="Go back"
              >
                <ChevronLeft size={14} /> Back
              </button>
              {step === 'browse' && cart.length > 0 && (
                <button
                  onClick={() => goTo('cart')}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-xs font-bold transition-colors"
                >
                  <ShoppingCart size={14} />
                  Cart ({cart.reduce((s, c) => s + c.qty, 0)})
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Hint */}
        <p className="text-center font-mono text-[10px] text-slate-600 mt-3">
          interactive demo · walk through a real self-service flow
        </p>
      </div>

      {/* ── Technical callouts (beside the kiosk on desktop) ── */}
      <div className="w-full lg:flex-1 lg:pt-12 space-y-3">
        {TECH_CALLOUTS.map((tc, i) => {
          const Icon = tc.icon
          return (
            <motion.div
              key={tc.text}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 rounded-xl border border-slate-700/50 bg-slate-900/40 px-4 py-3"
            >
              <span
                className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5"
                style={{ background: `${tc.color}15`, color: tc.color }}
              >
                <Icon size={16} />
              </span>
              <p className="font-mono text-xs text-slate-400 leading-relaxed">{tc.text}</p>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}
