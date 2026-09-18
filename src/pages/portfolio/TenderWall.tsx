// ─── Tender Wall — The Money Layer ──────────────────────────────────────────
// Interactive POS tender screen: every payment method I wired into V5 POS,
// grouped like a real checkout, with a receipt panel that prints the
// integration facts for the selected strategy.
import { useEffect, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Banknote, CreditCard, Coins, Wallet, Building2, Package, Zap } from 'lucide-react'

interface TenderMethod {
  id: string
  name: string
  /** One-line micro tagline under the tile name */
  tagline: string
  group: string
  desc: string
  /** Illustration tile (from /public/epos) */
  image?: string
  /** Brand logos rendered inside the tile */
  logos?: string[]
  /** lucide icon used when no logo exists */
  icon?: typeof Banknote
  iconColor?: string
  facts: string[]
  strategy: string
  lifecycle: string[]
}

const TENDER_GROUPS = ['Cards & Terminals', 'QR & Wallets', 'Loyalty & Credit', 'Vouchers & Packages']

/** Accent per group — drives group headers, active tiles and receipt chips */
const GROUP_COLORS: Record<string, string> = {
  'Cards & Terminals': '#3b82f6',
  'QR & Wallets': '#10b981',
  'Loyalty & Credit': '#f59e0b',
  'Vouchers & Packages': '#8b5cf6',
}

const METHODS: TenderMethod[] = [
  {
    id: 'cash',
    name: 'Cash',
    tagline: 'change · drawer · shift',
    group: 'Cards & Terminals',
    desc: 'Change calculation, cash drawer pop, shift reconciliation.',
    icon: Banknote,
    iconColor: '#10b981',
    facts: ['Instant change calc', 'Drawer + shift reconcile', 'End-shift SKU reports'],
    strategy: 'CashPaymentStrategy',
    lifecycle: ['tender', 'change', 'refund', 'shift-close'],
  },
  {
    id: 'card',
    name: 'Visa / Mastercard',
    tagline: 'EMV · contactless',
    group: 'Cards & Terminals',
    desc: 'Credit and contactless cards routed through ECR terminal types.',
    image: '/epos/credit_card.png',
    logos: ['/epos/visa_logo.png', '/epos/master_card_logo.png'],
    facts: ['EMV + contactless', 'Via NETS ECR credit types', 'Adyen terminal service'],
    strategy: 'CardPaymentStrategy',
    lifecycle: ['authorise', 'capture', 'verify-last', 'void'],
  },
  {
    id: 'nets',
    name: 'NETS Terminal',
    tagline: '8 txn types · 6 ECR',
    group: 'Cards & Terminals',
    desc: 'Singapore\u2019s national terminal — 8 transaction types across 6 ECR protocol generations.',
    image: '/epos/linkpoints_swipe_ntuc_card.png',
    logos: ['/epos/ic_nets_no_background.png'],
    facts: ['8 txn types — Pay · FlashPay · CashCard · Credit · QR · Auto · UOB · UnionPay', '6 ECR versions (V2.58 → ECR3 V3.0.008)', 'Logon · TMS · settlement · last-txn · void'],
    strategy: 'NetsEcrPaymentStrategy',
    lifecycle: ['logon', 'sale', 'settlement', 'last-txn', 'void'],
  },
  {
    id: 'adyen',
    name: 'Adyen Terminal',
    tagline: 'terminal API service',
    group: 'Cards & Terminals',
    desc: 'Adyen terminal service as an isolated strategy class.',
    icon: CreditCard,
    iconColor: '#0abf53',
    facts: ['Payment · diagnosis · verify', 'Last-transaction retrieval', 'Terminal API service layer'],
    strategy: 'AdyenPaymentStrategy',
    lifecycle: ['payment', 'diagnose', 'verify-last'],
  },
  {
    id: 'nets-qr',
    name: 'NETS Online QR',
    tagline: '5s polling · auto-retry',
    group: 'QR & Wallets',
    desc: 'Dynamic QR with 5-second validation polling and auto-retry — mirrored to the customer display.',
    image: '/epos/linkpoints_fairprice_scan.png',
    logos: ['/epos/ic_nets_no_background.png'],
    facts: ['Server-side expiry countdown', '5s polling state machine', 'Auto-retry re-issues paymentId', 'Dual-display mirror'],
    strategy: 'NetsOnlineQrPaymentStrategy',
    lifecycle: ['qr_generated', 'validating', 'success', 'timeout', 'retry', 'cancel'],
  },
  {
    id: 'paynow',
    name: 'PayNow QR',
    tagline: 'A_next · UOB variants',
    group: 'QR & Wallets',
    desc: 'Two acquiring variants with payload generation and validation services.',
    logos: ['/epos/paynow_logo.png'],
    facts: ['A_next + UOB acquiring variants', 'Dynamic payload generation', 'Live validation service'],
    strategy: 'PayNowPaymentStrategy',
    lifecycle: ['generate', 'validate', 'success', 'void'],
  },
  {
    id: 'alipay',
    name: 'Alipay+ / Antom',
    tagline: 'gateway · inquiry',
    group: 'QR & Wallets',
    desc: 'Antom gateway integration — payment, inquiry and card info flows.',
    logos: ['/epos/alipay_plus_logo.png'],
    facts: ['Gateway payment + inquiry', 'Card info service', 'Cross-border QR standard'],
    strategy: 'AlipayPlusPaymentStrategy',
    lifecycle: ['payment', 'inquiry', 'card-info'],
  },
  {
    id: 'ewallets',
    name: 'Regional e-Wallets',
    tagline: '6 wallets · 1 contract',
    group: 'QR & Wallets',
    desc: 'Six wallet strategies sharing one contract — GrabPay, WeChat Pay, Kakao Pay, Shopee Pay, Touch \u2019n Go, TrueMoney.',
    logos: ['/epos/grab_pay_logo.png', '/epos/wechat_pay_logo.png', '/epos/kakao_pay_logo.png', '/epos/shopee_pay_logo.png', '/epos/touch_n_go_ewallet_logo.png', '/epos/true_money_logo.png'],
    facts: ['6 wallet integrations', 'Shared strategy contract', 'Wallet-side auth + inquiry'],
    strategy: 'EWalletPaymentStrategy',
    lifecycle: ['authorise', 'inquiry', 'success', 'void'],
  },
  {
    id: 'linkpoints',
    name: 'NTUC Linkpoints',
    tagline: 'award · redeem · void',
    group: 'Loyalty & Credit',
    desc: 'Tap. Earn. Redeem. FairPrice Group loyalty with refund-safe voids.',
    image: '/epos/linkpoints_tap_trust_card.png',
    logos: ['/epos/linkpoint_group1.png'],
    facts: ['Client-credential auth + token refresh', 'Dollar, balance & expiring-balance inquiry', 'Award / redeem / void with receipt print'],
    strategy: 'LinkpointsPaymentStrategy',
    lifecycle: ['authenticate', 'inquiry', 'award', 'redeem', 'void'],
  },
  {
    id: 'points',
    name: 'Points as Payment',
    tagline: 'pay with points',
    group: 'Loyalty & Credit',
    desc: 'Loyalty points spent like cash — conversion rate and tier attribution serialized into every payment record.',
    icon: Coins,
    iconColor: '#f59e0b',
    facts: ['PointToCashRatio conversion', 'Max redeemable caps', 'Refund-safe points_used tracking', 'Daily point-payment guard'],
    strategy: 'PointsPaymentStrategy',
    lifecycle: ['quote', 'redeem', 'refund-compensate'],
  },
  {
    id: 'store-credit',
    name: 'Store Credit',
    tagline: 'floor-protected balance',
    group: 'Loyalty & Credit',
    desc: 'Balance with a floor — never drops below the limit. Offline-safe dual-field math.',
    icon: Wallet,
    iconColor: '#3b82f6',
    facts: ['Fall-below-limit floor enforcement', 'Dual-field offline balance', 'Email-verified redemption'],
    strategy: 'StoreCreditPaymentStrategy',
    lifecycle: ['check-floor', 'redeem', 'refund-credit'],
  },
  {
    id: 'on-account',
    name: 'On-Account',
    tagline: 'corporate · NET 30',
    group: 'Loyalty & Credit',
    desc: 'Corporate credit for account customers — sells offline, reconciles later.',
    icon: Building2,
    iconColor: '#8b5cf6',
    facts: ['Balance-checked redemption', 'Offline payment queue + background sync', 'Paid-detail reports + receipts'],
    strategy: 'OnAccountPaymentStrategy',
    lifecycle: ['balance-check', 'charge', 'queue-offline', 'reconcile'],
  },
  {
    id: 'nea',
    name: 'NEA e-Vouchers',
    tagline: 'idempotent · audited',
    group: 'Vouchers & Packages',
    desc: 'Government disbursement vouchers — idempotent, audited, every cent accounted for.',
    image: '/epos/voucher.png',
    facts: ['Idempotency keys on redemption', 'AuditId compliance trail', 'Campaign + eligible-SKU enforcement', 'Re-redeem handling'],
    strategy: 'NeaVoucherPaymentStrategy',
    lifecycle: ['validate-campaign', 'redeem', 'audit', 'retrieve-by-order'],
  },
  {
    id: 'vouchers',
    name: 'Vouchers',
    tagline: '3 classes · JSON rules',
    group: 'Vouchers & Packages',
    desc: 'Cash, discount and advanced vouchers — per-SKU redemption lines validated server-side; advanced vouchers arrive as JSON rules.',
    image: '/epos/promotion.png',
    facts: ['3 voucher classes', 'JSON condition × reward params', 'Per-SKU redemption line items', 'Void releases the code'],
    strategy: 'VoucherPaymentStrategy',
    lifecycle: ['list', 'apply', 'server-validate', 'void'],
  },
  {
    id: 'package',
    name: 'Package Redemption',
    tagline: 'prepaid packages',
    group: 'Vouchers & Packages',
    desc: 'Prepaid packages redeemed at the tender screen — package fixed price wired into promotions.',
    icon: Package,
    iconColor: '#06b6d4',
    facts: ['Package fixed-price rewards', 'Redemption balance tracking', 'Set-menu + add-on compatible'],
    strategy: 'PackageRedemptionPaymentStrategy',
    lifecycle: ['check-balance', 'redeem', 'refund-release'],
  },
  {
    id: 'topup',
    name: 'TopUp & eLoad',
    tagline: 'mobile credit top-up',
    group: 'Vouchers & Packages',
    desc: 'Standalone WPF app for mobile credit top-up and e-load, wired to the same money layer.',
    image: '/epos/topup_eload.png',
    facts: ['Standalone WPF app', 'Mobile credit + e-load SKUs', 'Same strategy contract'],
    strategy: 'TopUpPaymentStrategy',
    lifecycle: ['select-denomination', 'charge', 'activate'],
  },
]

const AMOUNT_DUE = '$ 128.40'

// Deterministic pseudo-barcode widths for the receipt footer
const BARCODE = [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 1, 2, 3, 1, 2, 1, 1, 2, 4]

const FOOTER_STATS = [
  { value: '16', label: 'tender strategies' },
  { value: '0', label: 'financial incidents' },
  { value: '7×14', label: 'telemetry events' },
  { value: '$200K+', label: 'processed live' },
]

// ── Tiny receipt helpers ─────────────────────────────────────────────────────
const DashDivider = () => <div className="my-3.5 border-t border-dashed border-slate-400" />

function ReceiptRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p className="flex justify-between gap-3 py-0.5">
      <span className="shrink-0 pt-0.5 text-[9.5px] uppercase tracking-widest text-slate-500">{label}</span>
      <span className="text-right text-slate-800">{children}</span>
    </p>
  )
}

export default function TenderWall() {
  const [selectedId, setSelectedId] = useState('nets')
  const [status, setStatus] = useState<'idle' | 'authorizing' | 'approved'>('approved')
  const selected = METHODS.find((m) => m.id === selectedId) ?? METHODS[0]
  const groupColor = GROUP_COLORS[selected.group] ?? '#10b981'

  // Re-run the authorizing → approved stamp each time a method is picked
  useEffect(() => {
    setStatus('authorizing')
    const t = setTimeout(() => setStatus('approved'), 650)
    return () => clearTimeout(t)
  }, [selectedId])

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="grid lg:grid-cols-[1.55fr_1fr] gap-6 items-start"
    >
      {/* ══ Terminal: tender selection grid ══ */}
      <div className="rounded-2xl border border-slate-700/60 overflow-hidden" style={{ background: '#0d1117' }}>
        {/* POS chrome header */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-700/50" style={{ background: '#161b22' }}>
          <div className="flex items-center gap-2 min-w-0">
            <Zap size={14} className="text-emerald-400 shrink-0" />
            <span className="font-mono text-xs text-slate-400 uppercase tracking-widest truncate">Select Tender</span>
            <span className="hidden sm:inline-block w-[7px] h-[14px] bg-emerald-400/70" style={{ animation: 'blink-cursor 1s step-end infinite' }} />
          </div>
          <span className="hidden md:block font-mono text-[10px] text-slate-600">REG 01 · SALE #4823 · CASHIER: LEO</span>
          <div className="text-right shrink-0">
            <span className="block font-mono text-[10px] text-slate-500 uppercase tracking-widest">Amount Due</span>
            <span className="font-mono text-2xl font-bold text-emerald-400" style={{ textShadow: '0 0 12px rgba(16,185,129,0.45)' }}>{AMOUNT_DUE}</span>
          </div>
        </div>

        {/* Groups */}
        <div className="p-5 space-y-7">
          {TENDER_GROUPS.map((group, gi) => {
            const groupMethods = METHODS.filter((m) => m.group === group)
            const color = GROUP_COLORS[group]
            return (
              <div key={group}>
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: gi * 0.08 }}
                  className="flex items-center gap-2.5 mb-3"
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                  <span className="font-mono text-[11px] uppercase tracking-widest font-semibold" style={{ color }}>{group}</span>
                  <span className="font-mono text-[10px] text-slate-600">· {groupMethods.length} strategies</span>
                  <span className="h-px flex-1 bg-slate-700/40" />
                </motion.div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {groupMethods.map((m, i) => {
                    const active = m.id === selectedId
                    const mColor = GROUP_COLORS[m.group]
                    return (
                      <motion.button
                        key={m.id}
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: gi * 0.06 + i * 0.05 }}
                        onClick={() => setSelectedId(m.id)}
                        className={`group relative flex h-full flex-col items-center gap-1.5 px-3 pt-4 pb-3 rounded-xl border text-center transition-all duration-300 ${
                          active
                            ? '-translate-y-0.5'
                            : 'border-slate-700/50 bg-slate-900/40 hover:border-slate-500/70 hover:-translate-y-0.5'
                        }`}
                        style={active ? { borderColor: `${mColor}80`, background: `${mColor}0d`, boxShadow: `0 8px 28px -10px ${mColor}55` } : undefined}
                        aria-pressed={active}
                      >
                        {/* Illustration, logos or icon */}
                        {m.image ? (
                          <span className="block h-14 w-full overflow-hidden rounded-md bg-gradient-to-br from-slate-100 via-white to-slate-200">
                            <img src={m.image} alt="" loading="lazy" className="h-full w-full object-contain p-1.5 transition-transform duration-500 group-hover:scale-110" />
                          </span>
                        ) : m.logos && m.logos.length > 0 ? (
                          <span className="flex h-14 w-full items-center justify-center gap-1 overflow-hidden">
                            {m.logos.slice(0, 3).map((l) => (
                              <img key={l} src={l} alt="" loading="lazy" className="h-9 w-auto max-w-[54px] object-contain rounded-md bg-white px-1 py-0.5 border border-slate-200/80" />
                            ))}
                          </span>
                        ) : m.icon ? (
                          <span
                            className="flex h-14 w-14 items-center justify-center rounded-xl"
                            style={{ background: `${m.iconColor}15`, border: `1px solid ${m.iconColor}40`, color: m.iconColor }}
                          >
                            <m.icon size={24} />
                          </span>
                        ) : null}

                        <span className={`font-mono text-[11.5px] font-semibold leading-tight ${active ? '' : 'text-slate-300'}`} style={active ? { color: mColor } : undefined}>
                          {m.name}
                        </span>
                        <span className="font-mono text-[9px] text-slate-500 leading-tight truncate w-full">{m.tagline}</span>

                        {/* Selection tick */}
                        <AnimatePresence>
                          {active && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-[9px] font-bold text-slate-950 flex items-center justify-center"
                              style={{ background: mColor }}
                            >
                              ✓
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          <p className="font-mono text-[10px] text-slate-600 text-center pt-1">
            Every tile is an isolated strategy — new gateways plug in, the checkout core stays untouched.
          </p>
        </div>
      </div>

      {/* ══ Receipt panel ══ */}
      <div className="lg:sticky lg:top-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl border border-slate-700/60 overflow-hidden"
          style={{ background: '#f8fafc' }}
        >
          {/* Receipt header strip */}
          <div className="px-5 py-2.5 border-b border-slate-300/70 bg-slate-200/70 flex items-center justify-between">
            <span className="font-mono text-[9.5px] uppercase tracking-widest text-slate-500">Strategy Receipt</span>
            <span className="font-mono text-[9.5px] text-slate-400">non-fiscal · demo</span>
          </div>

          {/* Receipt paper */}
          <div className="p-5 font-mono text-[12.5px] leading-relaxed text-slate-800">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.22 }}
              >
                {/* Method header */}
                <div className="text-center">
                  <p className="font-bold text-[15px] tracking-wide text-slate-900">{selected.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{selected.tagline}</p>
                  <span
                    className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border"
                    style={{ color: groupColor, borderColor: `${groupColor}55`, background: `${groupColor}10` }}
                  >
                    {selected.group}
                  </span>
                </div>

                <DashDivider />

                <ReceiptRow label="Strategy">
                  <span className="inline-block px-2 py-0.5 rounded bg-violet-100 border border-violet-300 text-violet-700 text-[11px] break-all">
                    {selected.strategy}
                  </span>
                </ReceiptRow>

                <DashDivider />

                <p className="text-[9.5px] uppercase tracking-widest text-slate-500 mb-1.5">What I built</p>
                <p className="text-slate-700 leading-relaxed">{selected.desc}</p>

                <DashDivider />

                <p className="text-[9.5px] uppercase tracking-widest text-slate-500 mb-1.5">Facts</p>
                <ul className="space-y-1">
                  {selected.facts.map((f) => (
                    <li key={f} className="flex gap-1.5">
                      <span className="text-emerald-600 shrink-0">✓</span>
                      <span className="text-slate-700">{f}</span>
                    </li>
                  ))}
                </ul>

                <DashDivider />

                <p className="text-[9.5px] uppercase tracking-widest text-slate-500 mb-2">Lifecycle events</p>
                <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5">
                  {selected.lifecycle.map((l, i) => (
                    <span key={l} className="flex items-center gap-1">
                      <span className="px-1.5 py-0.5 rounded border border-slate-300 bg-slate-100 text-[10px] text-slate-700">{l}</span>
                      {i < selected.lifecycle.length - 1 && <span className="text-slate-400 text-[10px]">→</span>}
                    </span>
                  ))}
                </div>
                <p className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  every event → Aliyun SLS · fault-isolated · never blocks a sale
                </p>

                <DashDivider />

                {/* Authorisation stamp */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">TOTAL <span className="font-bold text-slate-900">{AMOUNT_DUE}</span></span>
                  {status === 'authorizing' ? (
                    <span className="text-amber-600 animate-pulse font-semibold text-[11px] tracking-widest">AUTHORIZING…</span>
                  ) : (
                    <motion.span
                      initial={{ scale: 1.6, opacity: 0, rotate: -8 }}
                      animate={{ scale: 1, opacity: 1, rotate: -6 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                      className="px-2 py-0.5 rounded border-2 border-emerald-600 text-emerald-700 font-bold text-[11px] tracking-widest"
                    >
                      APPROVED ✓
                    </motion.span>
                  )}
                </div>

                {/* Pseudo-barcode */}
                <div className="mt-5 flex items-end justify-center gap-[2px] h-10" aria-hidden>
                  {BARCODE.map((w, i) => (
                    <span key={i} className="h-full bg-slate-800 rounded-[1px]" style={{ width: w }} />
                  ))}
                </div>
                <p className="text-center text-[9px] text-slate-500 mt-1 tracking-[0.3em]">*{selected.id.toUpperCase().replace(/-/g, '')}*</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Torn receipt edge */}
          <div className="h-3 bg-[#f8fafc]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 40%, 97% 100%, 94% 40%, 91% 100%, 88% 40%, 85% 100%, 82% 40%, 79% 100%, 76% 40%, 73% 100%, 70% 40%, 67% 100%, 64% 40%, 61% 100%, 58% 40%, 55% 100%, 52% 40%, 49% 100%, 46% 40%, 43% 100%, 40% 40%, 37% 100%, 34% 40%, 31% 100%, 28% 40%, 25% 100%, 22% 40%, 19% 100%, 16% 40%, 13% 100%, 10% 40%, 7% 100%, 4% 40%, 0 100%)' }} />
        </motion.div>

        {/* Stat chips */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FOOTER_STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="rounded-lg border border-slate-700/50 bg-slate-900/40 px-2 py-2 text-center"
            >
              <p className="font-mono text-base font-bold text-emerald-400">{s.value}</p>
              <p className="font-mono text-[9px] text-slate-500 uppercase tracking-wider mt-0.5 leading-tight">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
