// ═══════════════════════════════════════════════════════════════════════════
// ProjectVisual — Professional technical diagrams replacing AI-generated
// concept illustrations. Each visual renders a real engineering artifact
// (architecture diagram, data flow, migration timeline, etc.) using clean
// SVG and CSS — no raster images, no AI art.
// ═══════════════════════════════════════════════════════════════════════════

interface Props {
  type: string
  color: string
}

function ArrowDef({ color }: { color: string }) {
  const id = `arrow-${color.replace('#', '')}`
  return (
    <defs>
      <marker id={id} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <path d="M0,0 L8,3 L0,6" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
      </marker>
    </defs>
  )
}

// ─── 1. Migration Timeline ─────────────────────────────────────────────────
function MigrationVisual({ color }: { color: string }) {
  const phases = [
    { label: 'Shared Libs', sub: 'epos_models → epos_core', w: 80 },
    { label: 'Windows', sub: 'WPF · Client', w: 65 },
    { label: 'Android', sub: 'Xamarin · Kiosk', w: 65 },
    { label: 'iOS', sub: 'Kitchen · POS', w: 55 },
  ]
  let x = 20
  return (
    <svg viewBox="0 0 440 140" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <ArrowDef color={color} />
      <text x="220" y="14" fill={color} fontSize="8" fontFamily="'JetBrains Mono', monospace" opacity="0.4" textAnchor="middle" dominantBaseline="central">
        .NET Framework 4.6.2 → .NET 8 LTS
      </text>
      {phases.map((p, i) => {
        const cx = x + p.w / 2
        const el = (
          <g key={i}>
            <rect x={x} y={30} width={p.w} height={60} fill="none" stroke={color} strokeWidth={1.5} rx={6} />
            <text x={cx} y={50} fill={color} fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight={600} textAnchor="middle" dominantBaseline="central">{p.label}</text>
            <text x={cx} y={68} fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">{p.sub}</text>
            <text x={cx} y={102} fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">Phase {i + 1}</text>
            {i < phases.length - 1 && (
              <line x1={x + p.w + 2} y1={60} x2={x + p.w + 18} y2={60} stroke={color} strokeWidth={1.2} fill="none" opacity="0.5" markerEnd={`url(#arrow-${color.replace('#', '')})`} />
            )}
          </g>
        )
        x += p.w + 20
        return el
      })}
      <line x1={20} y1={125} x2={420} y2={125} stroke={color} strokeWidth="1" opacity="0.2" strokeDasharray="4,4" />
      <text x={20} y={135} fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="start">Week 1</text>
      <text x={420} y={135} fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="end">Week 15</text>
    </svg>
  )
}

// ─── 2. gRPC Microservices Mesh ────────────────────────────────────────────
function MicroservicesVisual({ color }: { color: string }) {
  const services = ['Orders', 'Products', 'Inventory', 'Payments', 'Members', 'Shifts', 'Promos', 'KDS']
  return (
    <svg viewBox="0 0 440 150" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <ArrowDef color={color} />
      <text x="220" y="14" fill={color} fontSize="8" fontFamily="'JetBrains Mono', monospace" opacity="0.4" textAnchor="middle" dominantBaseline="central">
        40+ gRPC Service Endpoints
      </text>
      <rect x="170" y="28" width="100" height="32" fill="none" stroke={color} strokeWidth={1.5} rx={6} />
      <text x="220" y="44" fill={color} fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight={600} textAnchor="middle" dominantBaseline="central">gRPC Gateway</text>
      {services.map((s, i) => {
        const col = i % 4
        const row = Math.floor(i / 4)
        const x = 30 + col * 105
        const y = 85 + row * 42
        return (
          <g key={s}>
            <rect x={x} y={y} width={85} height={28} fill="none" stroke={color} strokeWidth={1.5} rx={6} />
            <text x={x + 42} y={y + 14} fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" fontWeight={600} textAnchor="middle" dominantBaseline="central">{s}</text>
            <line x1={220} y1={60} x2={x + 42} y2={y} stroke={color} strokeWidth={1.2} fill="none" opacity="0.5" markerEnd={`url(#arrow-${color.replace('#', '')})`} />
          </g>
        )
      })}
    </svg>
  )
}

// ─── 3. Third-Party Integration Flow ───────────────────────────────────────
function IntegrationVisual({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 440 140" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <ArrowDef color={color} />
      <rect x="20" y="30" width="90" height="35" fill="none" stroke={color} strokeWidth={1.5} rx={6} />
      <text x="65" y="42" fill={color} fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight={600} textAnchor="middle" dominantBaseline="central">Foodpanda</text>
      <text x="65" y="56" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">webhook</text>

      <rect x="20" y="80" width="90" height="35" fill="none" stroke={color} strokeWidth={1.5} rx={6} />
      <text x="65" y="92" fill={color} fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight={600} textAnchor="middle" dominantBaseline="central">Hawk</text>
      <text x="65" y="106" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">REST API</text>

      <rect x="150" y="50" width="100" height="40" fill="none" stroke={color} strokeWidth={1.5} rx={6} />
      <text x="200" y="64" fill={color} fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight={600} textAnchor="middle" dominantBaseline="central">HMAC-SHA256</text>
      <text x="200" y="80" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">signature verify</text>

      <rect x="290" y="50" width="80" height="40" fill="none" stroke={color} strokeWidth={1.5} rx={6} />
      <text x="330" y="64" fill={color} fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight={600} textAnchor="middle" dominantBaseline="central">Router</text>
      <text x="330" y="80" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">order_type</text>

      <rect x="380" y="30" width="50" height="80" fill="none" stroke={color} strokeWidth={1.5} rx={6} />
      <text x="405" y="58" fill={color} fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight={600} textAnchor="middle" dominantBaseline="central">KDS</text>
      <text x="405" y="80" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">stream</text>

      <line x1="110" y1="47" x2="150" y2="60" stroke={color} strokeWidth={1.2} fill="none" opacity="0.5" markerEnd={`url(#arrow-${color.replace('#', '')})`} />
      <line x1="110" y1="97" x2="150" y2="75" stroke={color} strokeWidth={1.2} fill="none" opacity="0.5" markerEnd={`url(#arrow-${color.replace('#', '')})`} />
      <line x1="250" y1="70" x2="290" y2="70" stroke={color} strokeWidth={1.2} fill="none" opacity="0.5" markerEnd={`url(#arrow-${color.replace('#', '')})`} />
      <line x1="370" y1="70" x2="380" y2="70" stroke={color} strokeWidth={1.2} fill="none" opacity="0.5" markerEnd={`url(#arrow-${color.replace('#', '')})`} />

      <text x="220" y="130" fill={color} fontSize="8" fontFamily="'JetBrains Mono', monospace" opacity="0.4" textAnchor="middle" dominantBaseline="central">
        HMAC verified → routed → kitchen display stream
      </text>
    </svg>
  )
}

// ─── 4. Payment Telemetry Pipeline ─────────────────────────────────────────
function TelemetryVisual({ color }: { color: string }) {
  const events = ['started', 'qr_gen', 'validating', 'success', 'failed', 'timeout', 'cancelled', 'retry']
  return (
    <svg viewBox="0 0 440 140" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <ArrowDef color={color} />
      <rect x="20" y="40" width="80" height="60" fill="none" stroke={color} strokeWidth={1.5} rx={6} />
      <text x="60" y="62" fill={color} fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight={600} textAnchor="middle" dominantBaseline="central">POS</text>
      <text x="60" y="78" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">7 methods</text>
      <text x="60" y="92" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">× 14 actions</text>

      <rect x="140" y="55" width="120" height="30" fill="none" stroke={color} strokeWidth={1.5} rx={6} />
      <text x="200" y="70" fill={color} fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight={600} textAnchor="middle" dominantBaseline="central">Telemetry Bus</text>
      <text x="200" y="82" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">fault-isolated</text>

      <rect x="300" y="40" width="120" height="60" fill="none" stroke={color} strokeWidth={1.5} rx={6} />
      <text x="360" y="58" fill={color} fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight={600} textAnchor="middle" dominantBaseline="central">Aliyun SLS</text>
      <text x="360" y="76" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">log analytics</text>
      <text x="360" y="92" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">dashboards</text>

      <line x1="100" y1="70" x2="140" y2="70" stroke={color} strokeWidth={1.2} fill="none" opacity="0.5" markerEnd={`url(#arrow-${color.replace('#', '')})`} />
      <line x1="260" y1="70" x2="300" y2="70" stroke={color} strokeWidth={1.2} fill="none" opacity="0.5" markerEnd={`url(#arrow-${color.replace('#', '')})`} />

      {events.map((e, i) => (
        <text key={e} x={140 + (i % 4) * 32} y={115 + Math.floor(i / 4) * 12} fill={color} fontSize="7" fontFamily="'JetBrains Mono', monospace" opacity="0.5" textAnchor="middle" dominantBaseline="central">
          {e}
        </text>
      ))}
    </svg>
  )
}

// ─── 5. Cash Drawer / Shift Management ─────────────────────────────────────
function CashboxVisual({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 440 140" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <ArrowDef color={color} />
      <rect x="20" y="30" width="90" height="35" fill="none" stroke={color} strokeWidth={1.5} rx={6} />
      <text x="65" y="44" fill={color} fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight={600} textAnchor="middle" dominantBaseline="central">Open Shift</text>
      <text x="65" y="58" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">count cash</text>

      <rect x="135" y="30" width="90" height="35" fill="none" stroke={color} strokeWidth={1.5} rx={6} />
      <text x="180" y="44" fill={color} fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight={600} textAnchor="middle" dominantBaseline="central">Transactions</text>
      <text x="180" y="58" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">live tracking</text>

      <rect x="250" y="30" width="90" height="35" fill="none" stroke={color} strokeWidth={1.5} rx={6} />
      <text x="295" y="44" fill={color} fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight={600} textAnchor="middle" dominantBaseline="central">Close Shift</text>
      <text x="295" y="58" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">reconcile</text>

      <rect x="365" y="30" width="65" height="35" fill="none" stroke={color} strokeWidth={1.5} rx={6} />
      <text x="397" y="44" fill={color} fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight={600} textAnchor="middle" dominantBaseline="central">Report</text>
      <text x="397" y="58" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">SKU audit</text>

      <line x1="110" y1="47" x2="135" y2="47" stroke={color} strokeWidth={1.2} fill="none" opacity="0.5" markerEnd={`url(#arrow-${color.replace('#', '')})`} />
      <line x1="225" y1="47" x2="250" y2="47" stroke={color} strokeWidth={1.2} fill="none" opacity="0.5" markerEnd={`url(#arrow-${color.replace('#', '')})`} />
      <line x1="340" y1="47" x2="365" y2="47" stroke={color} strokeWidth={1.2} fill="none" opacity="0.5" markerEnd={`url(#arrow-${color.replace('#', '')})`} />

      <rect x="120" y="85" width="200" height="40" rx="4" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
      <line x1="170" y1="85" x2="170" y2="125" stroke={color} strokeWidth="0.5" opacity="0.2" />
      <line x1="220" y1="85" x2="220" y2="125" stroke={color} strokeWidth="0.5" opacity="0.2" />
      <line x1="270" y1="85" x2="270" y2="125" stroke={color} strokeWidth="0.5" opacity="0.2" />
      <text x="145" y="108" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">SGD</text>
      <text x="195" y="108" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">USD</text>
      <text x="245" y="108" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">Cards</text>
      <text x="295" y="108" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">Vouchers</text>
    </svg>
  )
}

// ─── 6. Receipt Printing Pipeline ──────────────────────────────────────────
function PrinterVisual({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 440 140" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <ArrowDef color={color} />
      <rect x="20" y="35" width="80" height="50" fill="none" stroke={color} strokeWidth={1.5} rx={6} />
      <text x="60" y="52" fill={color} fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight={600} textAnchor="middle" dominantBaseline="central">Order</text>
      <text x="60" y="68" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">items · tax</text>
      <text x="60" y="80" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">total</text>

      <rect x="140" y="35" width="100" height="50" fill="none" stroke={color} strokeWidth={1.5} rx={6} />
      <text x="190" y="48" fill={color} fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight={600} textAnchor="middle" dominantBaseline="central">Print Engine</text>
      <text x="190" y="64" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">layout builder</text>
      <text x="190" y="78" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">barcode · logo</text>

      <rect x="280" y="25" width="70" height="80" rx="3" fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
      <text x="315" y="38" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">58mm</text>
      <text x="315" y="52" fill={color} fontSize="8" fontFamily="'JetBrains Mono', monospace" fontWeight={600} textAnchor="middle" dominantBaseline="central">RECEIPT</text>
      <text x="315" y="66" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">────────</text>
      <text x="315" y="80" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">Item 1  $12.00</text>
      <text x="315" y="94" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">中文 日本語</text>

      <rect x="380" y="25" width="50" height="80" rx="3" fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
      <text x="405" y="38" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">A4</text>
      <text x="405" y="55" fill={color} fontSize="8" fontFamily="'JetBrains Mono', monospace" fontWeight={600} textAnchor="middle" dominantBaseline="central">INVOICE</text>
      <text x="405" y="72" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">tax · GST</text>
      <text x="405" y="88" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">company</text>

      <line x1="100" y1="60" x2="140" y2="60" stroke={color} strokeWidth={1.2} fill="none" opacity="0.5" markerEnd={`url(#arrow-${color.replace('#', '')})`} />
      <line x1="240" y1="50" x2="280" y2="50" stroke={color} strokeWidth={1.2} fill="none" opacity="0.5" markerEnd={`url(#arrow-${color.replace('#', '')})`} />
      <line x1="240" y1="70" x2="380" y2="70" stroke={color} strokeWidth={1.2} fill="none" opacity="0.5" markerEnd={`url(#arrow-${color.replace('#', '')})`} />

      <text x="220" y="130" fill={color} fontSize="8" fontFamily="'JetBrains Mono', monospace" opacity="0.4" textAnchor="middle" dominantBaseline="central">
        thermal 58/80mm + A4 · CJK-safe · barcodes · logos
      </text>
    </svg>
  )
}

// ─── 7. Mobile App Mockup (TopUp & Eload) ──────────────────────────────────
function MobileAppVisual({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 440 140" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <rect x="170" y="10" width="100" height="120" rx="12" fill="none" stroke={color} strokeWidth="1.5" />
      <rect x="195" y="14" width="50" height="4" rx="2" fill={color} opacity="0.3" />
      <rect x="178" y="24" width="84" height="98" rx="4" fill={color} opacity="0.04" />
      <text x="220" y="38" fill={color} fontSize="8" fontFamily="'JetBrains Mono', monospace" fontWeight={600} textAnchor="middle" dominantBaseline="central">TopUp & Eload</text>
      <rect x="183" y="48" width="36" height="20" rx="3" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
      <text x="201" y="60" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">$10</text>
      <rect x="223" y="48" width="36" height="20" rx="3" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
      <text x="241" y="60" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">$20</text>
      <rect x="183" y="72" width="36" height="20" rx="3" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
      <text x="201" y="84" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">$50</text>
      <rect x="223" y="72" width="36" height="20" rx="3" fill={color} opacity="0.15" stroke={color} strokeWidth="1" />
      <text x="241" y="84" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="middle" dominantBaseline="central">$100</text>
      <rect x="183" y="98" width="76" height="18" rx="4" fill={color} opacity="0.15" stroke={color} strokeWidth="1" />
      <text x="221" y="109" fill={color} fontSize="8" fontFamily="'JetBrains Mono', monospace" fontWeight={600} textAnchor="middle" dominantBaseline="central">Confirm</text>

      <text x="130" y="50" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="end" dominantBaseline="central">Standalone</text>
      <text x="130" y="64" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="end" dominantBaseline="central">WPF app</text>
      <text x="130" y="78" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="end" dominantBaseline="central">ClickOnce</text>
      <line x1="135" y1="60" x2="170" y2="60" stroke={color} strokeWidth={1.2} fill="none" opacity="0.5" markerEnd={`url(#arrow-${color.replace('#', '')})`} />

      <text x="310" y="50" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="start" dominantBaseline="central">Mobile</text>
      <text x="310" y="64" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="start" dominantBaseline="central">credit</text>
      <text x="310" y="78" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" opacity="0.6" textAnchor="start" dominantBaseline="central">top-up</text>
      <line x1="270" y1="60" x2="305" y2="60" stroke={color} strokeWidth={1.2} fill="none" opacity="0.5" markerEnd={`url(#arrow-${color.replace('#', '')})`} />
    </svg>
  )
}

// ─── Dispatcher ─────────────────────────────────────────────────────────────

export default function ProjectVisual({ type, color }: Props) {
  switch (type) {
    case 'migration': return <MigrationVisual color={color} />
    case 'microservices': return <MicroservicesVisual color={color} />
    case 'integration': return <IntegrationVisual color={color} />
    case 'telemetry': return <TelemetryVisual color={color} />
    case 'cashbox': return <CashboxVisual color={color} />
    case 'printer': return <PrinterVisual color={color} />
    case 'mobile-app': return <MobileAppVisual color={color} />
    default: return null
  }
}
