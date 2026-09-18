// ─── Loyalty Vault — Points · Credit · On-Account ────────────────────────────
// Interactive deep-dive into the V5 POS loyalty core: tiered point-earning
// rules, a live redemption calculator with caps, the dual-field store-credit
// floor, and offline-safe on-account corporate credit.
import { useEffect, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins, ShieldCheck, Ban, Building2, RefreshCw, CreditCard, Layers, Wallet } from 'lucide-react'

const ACCENT = '#14b8a6' // points — teal
const CREDIT = '#3b82f6' // store credit — blue
const CORP = '#8b5cf6'   // on-account — violet

// ── Shared panel header — icon chip + title + one-line subtitle ─────────────
function PanelHeader({ icon: Icon, color, title, subtitle }: { icon: typeof Coins; color: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}40`, color }}
      >
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-200">{title}</p>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{subtitle}</p>
      </div>
    </div>
  )
}

// ── Member card carousel ─────────────────────────────────────────────────────
const MEMBER_CARDS = [
  { src: '/epos/linkpoint_group2.png', label: 'uLink trust · Visa Signature' },
  { src: '/epos/linkpoint_group3.png', label: 'U-Link rewards + member ID' },
  { src: '/epos/linkpoint_group4.png', label: 'U brand mark' },
]

const TIERS = [
  { name: 'Base', rate: '1.0×' },
  { name: 'Silver', rate: '1.25×' },
  { name: 'Gold', rate: '1.5×' },
  { name: 'Platinum', rate: '2.0×' },
]

// ── Point-earning rule types (real V5 POS domain model) ─────────────────────
interface RuleLine {
  text: string
  label: string
}

interface EarningRule {
  id: string
  name: string
  formula: string
  lines: RuleLine[]
  note: string
}

const EARNING_RULES: EarningRule[] = [
  {
    id: 'PercentageMarkup',
    name: 'PercentageMarkup',
    formula: 'earned = base × (1 + markup%)',
    lines: [
      { text: '$10.00 × 1 pt / $', label: 'rate' },
      { text: '= 10 pts', label: 'base' },
      { text: '× (1 + 100%)', label: 'gold tier' },
      { text: '= 20 pts', label: 'earned' },
    ],
    note: 'The tier multiplier — Gold members earn 2× on eligible SKUs while promo SKUs can be excluded per variant.',
  },
  {
    id: 'Override',
    name: 'Override',
    formula: 'earned = rate × spend   // replaces base',
    lines: [
      { text: 'promo SKU: 5 pts per $', label: 'rule' },
      { text: '$10.00 × 5 pts / $', label: 'rate' },
      { text: '= 50 pts', label: 'earned' },
      { text: 'tier ignored for this SKU', label: 'note' },
    ],
    note: 'A flat rate that replaces the base earning — per-product-variant overrides win over tier math.',
  },
  {
    id: 'FlatMarkup',
    name: 'FlatMarkup',
    formula: 'earned = base + flat',
    lines: [
      { text: '$10.00 × 1 pt / $', label: 'rate' },
      { text: '= 10 pts', label: 'base' },
      { text: '+ 15 pts', label: 'bonus' },
      { text: '= 25 pts', label: 'earned' },
    ],
    note: 'A flat bonus on every qualifying transaction — used for minimum-spend point campaigns.',
  },
  {
    id: 'AdditionalPointsPerItem',
    name: 'AdditionalPointsPerItem',
    formula: 'earned = base + N × items',
    lines: [
      { text: '3 × fresh produce items', label: 'items' },
      { text: '$10.00 → 10 pts', label: 'base' },
      { text: '+ 10 pts × 3', label: 'bonus' },
      { text: '= 40 pts', label: 'earned' },
    ],
    note: 'Per-item point boosts — fresh-produce multipliers for selected member tiers.',
  },
]

// ── Redemption math (numbers match the live config examples) ────────────────
const POINTS_BALANCE = 12480
const POINT_TO_CASH = 100 // 100 points = $1
const MAX_REDEEMABLE = 100 // MaximumRedeemableAmount ($)

// ── Store credit floor (dual-field offline-safe model) ──────────────────────
const CREDIT_IN_DB = 120.0
const CREDIT_DEDUCTED = 15.0 // this terminal's offline session
const CREDIT_AVAILABLE = CREDIT_IN_DB - CREDIT_DEDUCTED
const CREDIT_FLOOR = 10.0
const CREDIT_REDEEMABLE = CREDIT_AVAILABLE - CREDIT_FLOOR

function Money({ v }: { v: number }) {
  return <>{`$${v.toFixed(2)}`}</>
}

// ── Vault stat card ──────────────────────────────────────────────────────────
function StatCard({ icon: Icon, color, value, label, sub }: { icon: typeof Coins; color: string; value: string; label: string; sub: string }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="rounded-xl border bg-[#0d1117] p-3.5 flex flex-col items-center text-center gap-0.5"
      style={{ borderColor: `${color}35` }}
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-lg mb-1.5"
        style={{ color, background: `${color}12`, border: `1px solid ${color}30` }}
      >
        <Icon size={14} />
      </span>
      <p className="font-mono text-xl md:text-2xl font-bold leading-none" style={{ color }}>{value}</p>
      <p className="text-[10px] text-slate-400 mt-1.5">{label}</p>
      <p className="font-mono text-[9px] text-slate-600 leading-tight mt-0.5">{sub}</p>
    </motion.div>
  )
}

function LedgerRow({ label, hint, value, valueClass }: { label: string; hint?: string; value: ReactNode; valueClass?: string }) {
  return (
    <p className="flex justify-between gap-2 py-0.5">
      <span className="text-slate-500">
        {label}
        {hint && <span className="text-slate-600"> {hint}</span>}
      </span>
      <span className={`text-slate-200 ${valueClass ?? ''}`}>{value}</span>
    </p>
  )
}

export default function LoyaltyVault() {
  const [cardIdx, setCardIdx] = useState(0)
  const [ruleId, setRuleId] = useState('PercentageMarkup')
  const [points, setPoints] = useState(8000)
  const [redeem, setRedeem] = useState(60)

  // Auto-rotate the member cards
  useEffect(() => {
    const t = setInterval(() => setCardIdx((i) => (i + 1) % MEMBER_CARDS.length), 3500)
    return () => clearInterval(t)
  }, [])

  const rule = EARNING_RULES.find((r) => r.id === ruleId) ?? EARNING_RULES[0]
  const rawValue = points / POINT_TO_CASH
  const redeemValue = Math.min(rawValue, MAX_REDEEMABLE)
  const capped = rawValue > MAX_REDEEMABLE
  const creditBlocked = redeem > CREDIT_REDEEMABLE
  const creditAfter = CREDIT_AVAILABLE - (creditBlocked ? 0 : redeem)

  // Segment widths for the credit balance bar (share of DB balance)
  const segPct = (v: number) => `${(v / CREDIT_IN_DB) * 100}%`

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* ══ Row 1 — member card + vault stats ══ */}
      <div className="grid md:grid-cols-[0.9fr_1.1fr] gap-6">
        {/* Card carousel */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-5 overflow-hidden">
          <PanelHeader icon={CreditCard} color={ACCENT} title="Member Cards" subtitle="FairPrice Group / uLink — the plastic the vault reads" />
          <div className="relative h-44 rounded-xl bg-gradient-to-br from-slate-100 via-white to-slate-200 overflow-hidden border border-slate-800/60">
            <AnimatePresence mode="wait">
              <motion.img
                key={cardIdx}
                src={MEMBER_CARDS[cardIdx].src}
                alt={MEMBER_CARDS[cardIdx].label}
                loading="lazy"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="absolute inset-0 w-full h-full object-contain p-4"
              />
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="font-mono text-[10px] text-slate-500 truncate">{MEMBER_CARDS[cardIdx].label}</span>
            <div className="flex gap-1.5 shrink-0 ml-3">
              {MEMBER_CARDS.map((c, i) => (
                <button
                  key={c.src}
                  onClick={() => setCardIdx(i)}
                  aria-label={`Show card ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === cardIdx ? 'w-5' : 'w-1.5 bg-slate-600 hover:bg-slate-500'}`}
                  style={i === cardIdx ? { background: ACCENT } : undefined}
                />
              ))}
            </div>
          </div>
          {/* Tier ladder */}
          <div className="flex items-center gap-1 flex-wrap mt-4">
            {TIERS.map((t, i) => {
              const hot = t.name === 'Gold'
              return (
                <span key={t.name} className="flex items-center gap-1">
                  <span
                    className="px-2 py-0.5 rounded-full font-mono text-[10px] border"
                    style={hot
                      ? { color: ACCENT, borderColor: `${ACCENT}60`, background: `${ACCENT}12` }
                      : { color: '#64748b', borderColor: 'rgba(100,116,139,0.35)' }}
                  >
                    {t.name} <span className="opacity-70">{t.rate}</span>
                  </span>
                  {i < TIERS.length - 1 && <span className="text-slate-600 text-[10px]">→</span>}
                </span>
              )
            })}
          </div>
          <p className="font-mono text-[10px] text-slate-600 mt-2">each tier carries its own BaseEarningRate — the rules below stack on top</p>
        </div>

        {/* Vault stats */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-5 flex flex-col">
          <PanelHeader icon={Wallet} color={ACCENT} title="The Vault · CHERYL · Gold" subtitle="One member, three spendable instruments — all payment strategies" />
          <div className="grid grid-cols-3 gap-3 flex-1">
            <StatCard icon={Coins} color={ACCENT} value="12,480" label="Linkpoints balance" sub="≈ $124.80 tender value" />
            <StatCard icon={Wallet} color={CREDIT} value="$105.00" label="Store credit" sub={`floor ${'$'}${CREDIT_FLOOR.toFixed(2)} protected`} />
            <StatCard icon={Building2} color={CORP} value="$1,240" label="On-account" sub="ACME Pte Ltd · NET 30" />
          </div>
          {/* Key insight bar */}
          <div className="mt-4 rounded-lg border-l-2 px-3 py-2.5" style={{ borderColor: ACCENT, background: `${ACCENT}0a` }}>
            <p className="text-[11.5px] text-slate-400 leading-relaxed">
              Points, store credit and on-account are all <span className="font-semibold" style={{ color: ACCENT }}>payment strategies</span> — the same
              void / refund / rounding machinery that handles cash handles loyalty instruments for free.
            </p>
          </div>
        </div>
      </div>

      {/* ══ Row 2 — earning rules + redemption calculator ══ */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Earning rules */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-5">
          <PanelHeader icon={Layers} color={ACCENT} title="Point Earning — 4 Rule Types" subtitle="Pick a rule to see the math a cashier never sees" />

          <div className="grid grid-cols-2 gap-1.5 mb-4">
            {EARNING_RULES.map((r) => {
              const active = r.id === ruleId
              return (
                <button
                  key={r.id}
                  onClick={() => setRuleId(r.id)}
                  className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] border text-left transition-all duration-200 ${
                    active ? '-translate-y-0.5' : 'border-slate-700/50 text-slate-400 hover:border-slate-500/60'
                  }`}
                  style={active ? { borderColor: `${ACCENT}70`, background: `${ACCENT}12`, color: ACCENT } : undefined}
                >
                  {r.name}
                </button>
              )
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
            >
              {/* Formula bar */}
              <div className="rounded-lg border px-3 py-2" style={{ background: `${ACCENT}0d`, borderColor: `${ACCENT}35` }}>
                <p className="font-mono text-[11.5px] font-semibold" style={{ color: ACCENT }}>{rule.formula}</p>
              </div>

              {/* Worked example */}
              <div className="mt-2 rounded-lg bg-[#0d1117] border border-slate-700/40 p-3.5 space-y-1.5">
                {rule.lines.map((l, i) => {
                  const isTotal = i === rule.lines.length - 1 && l.label === 'earned'
                  return (
                    <motion.div
                      key={l.text}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.09 }}
                      className="flex items-center justify-between gap-2 font-mono text-[12.5px]"
                    >
                      <span className={isTotal ? 'font-bold' : 'text-slate-400'} style={isTotal ? { color: ACCENT } : undefined}>
                        {l.text}
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider border shrink-0"
                        style={isTotal
                          ? { color: ACCENT, borderColor: `${ACCENT}55`, background: `${ACCENT}10` }
                          : { color: '#64748b', borderColor: 'rgba(100,116,139,0.3)' }}
                      >
                        {l.label}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">{rule.note}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Redemption calculator */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-5">
          <PanelHeader icon={Coins} color={ACCENT} title="Credit Redemption Calculator" subtitle="Drag to spend points — caps and guards apply, just like live checkout" />

          <div className="flex items-end justify-between gap-4 mb-3">
            <div>
              <p className="font-mono text-[9.5px] text-slate-500 uppercase tracking-widest mb-0.5">Redeeming</p>
              <p className="font-mono text-3xl font-bold leading-none" style={{ color: ACCENT }}>{points.toLocaleString()}</p>
              <p className="font-mono text-[10px] text-slate-600 mt-1.5">points · balance {POINTS_BALANCE.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[9.5px] text-slate-500 uppercase tracking-widest mb-0.5">Tender value</p>
              <p className={`font-mono text-3xl font-bold leading-none transition-colors ${capped ? 'text-amber-400' : 'text-emerald-400'}`}>
                <Money v={redeemValue} />
              </p>
              <p className="font-mono text-[10px] text-slate-600 mt-1.5">PointToCashRatio {POINT_TO_CASH} : 1</p>
            </div>
          </div>

          <input
            type="range"
            min={0}
            max={POINTS_BALANCE}
            step={20}
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: ACCENT }}
            aria-label="Points to redeem"
          />
          <div className="flex justify-between font-mono text-[9px] text-slate-600 mt-1 px-0.5">
            <span>0 pts</span>
            <span>6,240 pts</span>
            <span>12,480 pts</span>
          </div>

          {/* Cap meter */}
          <div className="mt-5">
            <div className="flex justify-between font-mono text-[10px] mb-1.5">
              <span className="text-slate-500">MaximumRedeemableAmount</span>
              <span className={capped ? 'text-amber-400' : 'text-slate-400'}>${MAX_REDEEMABLE}.00 cap{capped ? ' · reached' : ''}</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: capped ? '#f59e0b' : ACCENT }}
                animate={{ width: `${Math.min((rawValue / MAX_REDEEMABLE) * 100, 100)}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              />
            </div>
            <AnimatePresence>
              {capped && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="font-mono text-[10px] text-amber-400 mt-2 leading-relaxed"
                >
                  ⚠ {Math.round(points - MAX_REDEEMABLE * POINT_TO_CASH).toLocaleString()} pts held back — program cap reached (or NoLimit for premium programs)
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Guards checklist */}
          <div className="mt-5 pt-3.5 border-t border-slate-700/40 space-y-1.5">
            {[
              'conversion rate + tier attribution serialized into every payment record',
              'refund-safe points_used tracking — voids return points exactly like cash',
              'CustomerHasPointPaymentToday — one gRPC guard before tender, blocks split-payment churning',
            ].map((g) => (
              <p key={g} className="flex gap-2 font-mono text-[10.5px] text-slate-400 leading-relaxed">
                <span className="shrink-0" style={{ color: ACCENT }}>✓</span>
                {g}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* ══ Row 3 — store credit floor + on-account ══ */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Store credit floor */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-5">
          <PanelHeader icon={ShieldCheck} color={CREDIT} title="Store Credit — the Floor Rule" subtitle="Dual-field balance keeps two terminals from overdrawing one account offline" />

          {/* Dual-field ledger */}
          <div className="rounded-lg bg-[#0d1117] border border-slate-700/40 p-3.5 font-mono text-[12.5px] space-y-1">
            <LedgerRow label="CreditBalanceInDb" value={<Money v={CREDIT_IN_DB} />} />
            <LedgerRow label="− CreditBalanceDeducted" hint="(offline session)" value={<Money v={CREDIT_DEDUCTED} />} />
            <p className="border-t border-slate-700/40 mt-1 pt-1 flex justify-between font-bold">
              <span className="text-slate-300">Available balance</span>
              <span style={{ color: CREDIT }}><Money v={CREDIT_AVAILABLE} /></span>
            </p>
          </div>

          {/* Segmented balance bar */}
          <div className="mt-4">
            <div className="flex h-7 rounded-lg overflow-hidden border border-slate-700/50">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: segPct(CREDIT_DEDUCTED) }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-slate-600/80"
                title="deducted offline"
              />
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: segPct(CREDIT_FLOOR) }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-amber-500/80"
                title="floor — locked"
              />
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: segPct(CREDIT_REDEEMABLE) }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gradient-to-r from-blue-500/80 to-blue-400/80"
                title="redeemable"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <span className="flex items-center gap-1.5 font-mono text-[9.5px] text-slate-500 min-w-0">
                <span className="w-2 h-2 rounded-sm bg-slate-600 shrink-0" />
                <span className="truncate">deducted <Money v={CREDIT_DEDUCTED} /></span>
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[9.5px] text-amber-400 min-w-0">
                <span className="w-2 h-2 rounded-sm bg-amber-500 shrink-0" />
                <span className="truncate">floor <Money v={CREDIT_FLOOR} /></span>
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[9.5px] min-w-0" style={{ color: CREDIT }}>
                <span className="w-2 h-2 rounded-sm bg-blue-500 shrink-0" />
                <span className="truncate">redeemable <Money v={CREDIT_REDEEMABLE} /></span>
              </span>
            </div>
          </div>

          {/* Interactive try-it slider */}
          <div className="mt-5">
            <div className="flex justify-between font-mono text-[10px] text-slate-500 mb-1.5">
              <span>try a redemption</span>
              <span className={creditBlocked ? 'text-red-400 font-semibold' : 'text-emerald-400 font-semibold'}><Money v={redeem} /></span>
            </div>
            <input
              type="range"
              min={0}
              max={110}
              step={1}
              value={redeem}
              onChange={(e) => setRedeem(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: creditBlocked ? '#f87171' : CREDIT }}
              aria-label="Store credit redemption amount"
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={creditBlocked ? 'blocked' : 'ok'}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className={`mt-2.5 rounded-lg border px-3 py-2.5 font-mono text-[11px] leading-relaxed ${
                  creditBlocked ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                }`}
              >
                {creditBlocked ? (
                  <>✗ Reject. Cannot let store credit falls below the limit — the <Money v={CREDIT_FLOOR} /> floor would be breached</>
                ) : (
                  <>✓ Approved — new balance <Money v={creditAfter} /> · floor intact · email-verified redemption</>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* On-account */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-5">
          <PanelHeader icon={Building2} color={CORP} title="On-Account — Corporate Credit" subtitle="Charge now, reconcile later — the offline queue syncs when the network returns" />

          <div className="rounded-xl border p-4" style={{ borderColor: `${CORP}35`, background: '#0d1117' }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-sm text-slate-200">ACME Pte Ltd</p>
                <p className="font-mono text-[10px] text-slate-500 mt-0.5">account customer · NET 30 terms</p>
              </div>
              <span className="px-2 py-0.5 rounded-full font-mono text-[10px] border flex items-center gap-1.5 shrink-0" style={{ borderColor: `${CORP}55`, color: CORP, background: `${CORP}10` }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: CORP }} />
                OFFLINE-SAFE
              </span>
            </div>
            <p className="font-mono text-3xl font-bold mt-3" style={{ color: CORP }}>$1,240.50</p>
            <p className="font-mono text-[10px] text-slate-600 mt-1">outstanding balance · checked at redemption</p>
          </div>

          {/* Offline queue visual */}
          <div className="mt-4 rounded-lg bg-[#0d1117] border border-slate-700/40 p-3.5">
            <div className="flex items-center gap-2 mb-2.5">
              <RefreshCw size={12} className="text-emerald-400 animate-[spin_3s_linear_infinite]" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Offline payment queue</span>
            </div>
            <div className="space-y-1.5">
              {[
                { id: '#4821', amt: 32.4, st: 'synced' },
                { id: '#4822', amt: 18.9, st: 'synced' },
                { id: '#4823', amt: 35.1, st: 'queued' },
              ].map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="flex items-center justify-between font-mono text-[11.5px]"
                >
                  <span className="text-slate-500">{q.id} · on-account charge</span>
                  <span className="flex items-center gap-2">
                    <span className="text-slate-300">${q.amt.toFixed(2)}</span>
                    <span className={`px-1.5 py-0.5 rounded border text-[9px] ${q.st === 'synced' ? 'border-emerald-500/40 text-emerald-400' : 'border-amber-500/40 text-amber-400 animate-pulse'}`}>
                      {q.st === 'synced' ? '✓ reconciled' : 'queued'}
                    </span>
                  </span>
                </motion.div>
              ))}
            </div>
            <p className="font-mono text-[10px] text-slate-600 mt-2.5 leading-relaxed">
              background sync service reconciles on reconnect · paid-detail reports + dedicated receipts
            </p>
          </div>
        </div>
      </div>

      {/* ══ Blacklists strip ══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-5"
      >
        <PanelHeader icon={Ban} color="#f87171" title="Program Blacklists" subtitle="Marketing controls exclusions without touching the product catalog" />
        <div className="flex flex-wrap gap-2">
          <span className="px-2.5 py-1 rounded-full font-mono text-[10px] border border-red-500/40 text-red-300 bg-red-500/10">
            BlacklistProductVariantIds — 4 variants never earn points
          </span>
          <span className="px-2.5 py-1 rounded-full font-mono text-[10px] border border-red-500/40 text-red-300 bg-red-500/10">
            BlacklistPaymentMethods — no points earned via Store Credit
          </span>
          <span className="px-2.5 py-1 rounded-full font-mono text-[10px] border border-slate-600/50 text-slate-400">
            enforced live at the point of sale
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}
