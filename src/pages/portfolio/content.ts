// ─── Portfolio Content — Single Source of Truth ─────────────────────────────
// All identity data, career history, projects, testimonials, skills, and
// social links live here. PortfolioPage.tsx imports everything from this file.
//
// Based on V5 POS — an enterprise Point-of-Sale ecosystem with 30+ modules,
// running on Windows, Android, and iOS, with gRPC microservices backend.

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface CareerProject {
  name: string
  desc: string
  /** Illustration shown at the top of the feature card (from /public/epos) */
  image?: string
  /** SVG diagram type (renders instead of image when set) */
  visual?: string
  /** Short punchy stat chips replacing long paragraphs */
  badges?: string[]
  /** Payment/brand logo strip rendered at the bottom of the card */
  logos?: string[]
}

export interface CareerMetric {
  value: string
  label: string
}

export interface CareerChapter {
  year: string
  company: string
  role: string
  duration: string
  color: string
  challenge: string
  projects: CareerProject[]
  metrics: CareerMetric[]
  skills: string[]
}

export type SkillCategory = 'frontend' | 'backend' | 'devops' | 'design'

export interface SkillNode {
  id: string
  label: string
  category: SkillCategory
  level: number
}

export interface SkillsGraph {
  nodes: SkillNode[]
  edges: [string, string][]
}

export interface CaseStudy {
  problem: string
  approach: string
  architecture: string[]
  stack: string[]
  metrics: Array<{ label: string; value: string }>
  gallery: string[]
  learnings: string[]
}

export interface Project {
  title: string
  file: string
  slug: string
  desc: string
  tags: string[]
  color: string
  stars: number
  featured: boolean
  liveUrl: string
  sourceUrl: string
  caseStudy?: CaseStudy
}

export interface Testimonial {
  name: string
  role: string
  company: string
  email: string
  avatar: string
  pr: number
  reactions: { thumbsUp: number; heart: number; rocket: number }
  date: string
  quote: string
}

export interface SocialLink {
  platform: string
  url: string
}

// ─── Content Flags ──────────────────────────────────────────────────────────

export const CONTENT_FLAGS = {
  showSampleDataBadges: false,
}

// ─── GitHub Integration ─────────────────────────────────────────────────────
// Set to a GitHub username to fetch real contribution data.
// Leave empty to use generated demo data with a "Sample data" badge.
export const GITHUB_USERNAME = ''

// ─── Identity ───────────────────────────────────────────────────────────────

export const CONTACT_EMAIL = 'hello@portfolio.dev'

export const HERO_NAME = 'EPOS V5'
export const HERO_ROLE = 'Enterprise POS Systems Engineer'

export const SOCIAL_LINKS: SocialLink[] = [
  { platform: 'GitHub', url: '' },
  { platform: 'LinkedIn', url: '' },
  { platform: 'Twitter', url: '' },
]

// ─── Career Chapters ────────────────────────────────────────────────────────

export const CAREER_CHAPTERS: CareerChapter[] = [
  {
    year: '2020',
    company: 'EPOS Singapore',
    role: 'Software Engineer',
    duration: '2020 — 2022',
    color: '#10b981',
    challenge: 'Fresh engineer, real money — core POS modules for Singapore retail chains, live transactions from day one.',
    projects: [
      { name: 'POS Transaction Engine', desc: 'The heartbeat of every store — sale, payment, refund. Live money from day one.', badges: ['Live transactions', '99.9% uptime'], image: '/epos/epos.png' },
      { name: 'QuickPick & Sale UI', desc: 'Barcode scan, instant search, real-time cart — speed is the feature.', badges: ['Sub-second scan', '1000s of SKUs'], image: '/epos/linkpoint_scan_qr_code.png' },
      { name: 'Shift & Cashbox Management', desc: 'Shift open/close, cash drawer reconciliation, end-shift SKU reports.', badges: ['Auto reconcile', 'Zero drift'], visual: 'cashbox' },
      { name: 'Receipt Printing Pipeline', desc: 'Thermal receipts + A4 invoices — barcodes, logos, even Chinese characters.', badges: ['2 formats', 'CJK-safe'], visual: 'printer' },
    ],
    metrics: [
      { value: '$200K+', label: 'Revenue Processed' },
      { value: '8', label: 'Modules Shipped' },
      { value: '99.9%', label: 'System Uptime' },
    ],
    skills: ['C#', 'WPF', 'ReactiveUI', 'SQLite', 'gRPC', '.NET Framework 4.6.2'],
  },
  {
    year: '2022',
    company: 'EPOS Singapore',
    role: 'Senior Software Engineer',
    duration: '2022 — 2024',
    color: '#3b82f6',
    challenge: 'Own the money layer. NETS, QR payments, loyalty, government vouchers — zero tolerance for errors.',
    projects: [
      {
        name: 'NETS Terminal Integration',
        desc: 'Singapore\u2019s national terminal — serial protocols across 6 ECR generations.',
        badges: ['8 txn types', '6 ECR versions'],
        image: '/epos/linkpoints_swipe_ntuc_card.png',
        logos: ['/epos/ic_nets_no_background.png'],
      },
      {
        name: 'NETS Online QR Payments',
        desc: 'Dynamic QR, live countdown, 5-second validation, auto-retry — mirrored to the customer display.',
        badges: ['5s polling', 'Auto-retry'],
        image: '/epos/linkpoints_fairprice_scan.png',
        logos: ['/epos/ic_nets_no_background.png'],
      },
      {
        name: 'NTUC Linkpoints Loyalty',
        desc: 'Tap. Earn. Redeem. FairPrice Group loyalty with refund-safe voids.',
        badges: ['Award · Redeem · Void'],
        image: '/epos/linkpoints_tap_trust_card.png',
        logos: ['/epos/linkpoint_group1.png'],
      },
      {
        name: 'NEA Government e-Vouchers',
        desc: 'Government disbursement vouchers — idempotent, audited, every cent accounted for.',
        badges: ['Idempotent', 'Audit trail'],
        image: '/epos/voucher.png',
      },
      {
        name: '20+ Payment Strategies',
        desc: 'Every method an isolated strategy — new gateways plug in, core untouched.',
        badges: ['20+ methods', '0 incidents'],
        image: '/epos/credit_card.png',
        logos: ['/epos/visa_logo.png', '/epos/master_card_logo.png', '/epos/paynow_logo.png', '/epos/grab_pay_logo.png', '/epos/alipay_plus_logo.png', '/epos/wechat_pay_logo.png', '/epos/kakao_pay_logo.png', '/epos/shopee_pay_logo.png', '/epos/touch_n_go_ewallet_logo.png', '/epos/true_money_logo.png'],
      },
      {
        name: 'Promotions & Advanced Vouchers',
        desc: '14 reward types + JSON-parameterized advanced vouchers, validated against the live cart.',
        badges: ['14 rewards', 'JSON rules'],
        image: '/epos/promotion.png',
      },
      {
        name: 'Membership, Points & Credit',
        desc: 'Tiers, points-as-payment, credit floors, blacklists — the loyalty core.',
        badges: ['4 rule types', 'Offline-safe'],
        image: '/epos/linkpoint_group2.png',
      },
    ],
    metrics: [
      { value: '20+', label: 'Payment Methods' },
      { value: '8', label: 'NETS Transaction Types' },
      { value: '4', label: 'Point Earning Rule Types' },
      { value: '2', label: 'Gov & Loyalty Programs' },
      { value: '0', label: 'Financial Incidents' },
    ],
    skills: ['gRPC', 'Strategy Pattern', 'NETS ECR', 'Adyen', 'Alipay+', 'Entity Framework Core', 'PostgreSQL'],
  },
  {
    year: '2024',
    company: 'EPOS Singapore',
    role: 'Lead Systems Engineer',
    duration: '2024 — Present',
    color: '#8b5cf6',
    challenge: 'Lead a 30+ module .NET 8 migration while new platforms ship in parallel — no pause, no downtime.',
    projects: [
      { name: '.NET 8 Migration (22+ modules)', desc: 'Off a dying framework — 4 phases, bottom-up dependency order, zero downtime.', badges: ['22/22 modules', '0 downtime'], visual: 'migration' },
      { name: 'Multi-Platform Device Ecosystem', desc: 'One core, five devices — terminal, kiosk, kitchen, customer screen, warehouse.', badges: ['5 devices', '3 platforms'], image: '/epos/welcome_screen.png' },
      { name: '40+ gRPC Microservices', desc: 'Orders, inventory, payments, members, KDS streaming — one contract layer.', badges: ['40+ endpoints', 'Streaming'], visual: 'microservices' },
      { name: 'Third-Party Order Integration', desc: 'Foodpanda/Hawk orders flow straight into the kitchen.', badges: ['HMAC-SHA256', 'Auto-routing'], visual: 'integration' },
      { name: 'Payment Telemetry Pipeline', desc: 'Every payment event shipped to Aliyun SLS — observability that never blocks a sale.', badges: ['7×14 events', 'Fault-isolated'], visual: 'telemetry' },
      { name: 'Sales & Order Engine', desc: 'Split bills 3 ways, set menus, trade-ins, held orders — the checkout core.', badges: ['3 split modes', '3.6K lines'], image: '/epos/epos_pay.png' },
      { name: 'TopUp & Eload System', desc: 'Standalone WPF app for mobile credit top-up and e-load.', badges: ['Standalone app'], visual: 'mobile-app' },
    ],
    metrics: [
      { value: '30+', label: 'System Modules' },
      { value: '40+', label: 'gRPC Endpoints' },
      { value: '7×14', label: 'Telemetry Events' },
      { value: '22/22', label: 'Modules Migrated' },
    ],
    skills: ['.NET 8', 'gRPC', 'Xamarin', 'WPF', 'ClickOnce', 'Sentry', 'Architecture'],
  },
]

// ─── Skills Graph ───────────────────────────────────────────────────────────

export const SKILLS_GRAPH: SkillsGraph = {
  nodes: [
    // Frontend (emerald) - Client UI technologies
    { id: 'wpf', label: 'WPF', category: 'frontend', level: 5 },
    { id: 'reactiveui', label: 'ReactiveUI', category: 'frontend', level: 5 },
    { id: 'xamarin', label: 'Xamarin', category: 'frontend', level: 4 },
    { id: 'xaml', label: 'XAML', category: 'frontend', level: 5 },
    { id: 'react', label: 'React', category: 'frontend', level: 4 },
    { id: 'typescript', label: 'TypeScript', category: 'frontend', level: 4 },
    { id: 'rdlc', label: 'RDLC Reports', category: 'frontend', level: 4 },
    { id: 'dynamicdata', label: 'DynamicData', category: 'frontend', level: 4 },
    // Backend (blue) - Server & infrastructure
    { id: 'csharp', label: 'C#', category: 'backend', level: 5 },
    { id: 'dotnet8', label: '.NET 8', category: 'backend', level: 5 },
    { id: 'grpc', label: 'gRPC', category: 'backend', level: 5 },
    { id: 'postgresql', label: 'PostgreSQL', category: 'backend', level: 4 },
    { id: 'sqlite', label: 'SQLite', category: 'backend', level: 5 },
    { id: 'efcore', label: 'EF Core', category: 'backend', level: 4 },
    { id: 'restapi', label: 'REST APIs', category: 'backend', level: 5 },
    { id: 'protobuf', label: 'Protobuf', category: 'backend', level: 4 },
    // DevOps (violet) - Infrastructure & tooling
    { id: 'sentry', label: 'Sentry', category: 'devops', level: 4 },
    { id: 'sls', label: 'Aliyun SLS', category: 'devops', level: 4 },
    { id: 'hangfire', label: 'Hangfire', category: 'devops', level: 4 },
    { id: 'clickonce', label: 'ClickOnce', category: 'devops', level: 3 },
    { id: 'git', label: 'Git', category: 'devops', level: 5 },
    // Design (amber) - Architecture & patterns
    { id: 'strategy', label: 'Strategy Pattern', category: 'design', level: 5 },
    { id: 'mvvm', label: 'MVVM', category: 'design', level: 5 },
    { id: 'architecture', label: 'System Architecture', category: 'design', level: 5 },
  ],
  edges: [
    ['wpf', 'reactiveui'], ['wpf', 'xaml'], ['wpf', 'rdlc'],
    ['xamarin', 'reactiveui'], ['xamarin', 'xaml'],
    ['react', 'typescript'],
    ['csharp', 'dotnet8'], ['csharp', 'wpf'], ['csharp', 'grpc'],
    ['dotnet8', 'efcore'], ['dotnet8', 'grpc'],
    ['grpc', 'restapi'], ['grpc', 'protobuf'],
    ['postgresql', 'efcore'], ['sqlite', 'efcore'],
    ['sentry', 'hangfire'], ['sentry', 'sls'], ['git', 'clickonce'],
    ['reactiveui', 'dynamicdata'],
    ['strategy', 'architecture'], ['mvvm', 'reactiveui'], ['mvvm', 'wpf'],
  ],
}

export const SKILL_CAT_COLORS: Record<SkillCategory, string> = {
  frontend: '#10b981', backend: '#3b82f6', devops: '#8b5cf6', design: '#f59e0b',
}

export const SKILL_CAT_LABELS: Record<SkillCategory, string> = {
  frontend: 'Frontend', backend: 'Backend', devops: 'DevOps', design: 'Design',
}

// ─── Projects ───────────────────────────────────────────────────────────────

export const PROJECTS: Project[] = [
  {
    title: 'EPOS V5 — Enterprise POS Ecosystem', file: 'epos-v5', slug: 'epos-v5',
    desc: 'Mission-critical Point-of-Sale ecosystem with 30+ modules: 20+ payment methods (NETS, NETS Online QR, PayNow, Adyen, Alipay+), NTUC Linkpoints loyalty, NEA government e-vouchers, and 5 device types — processing $200K+ in real transactions across Singapore retail.',
    tags: ['C#', '.NET 8', 'gRPC', 'WPF', 'Xamarin'], color: '#10b981', stars: 1247, featured: true, liveUrl: '', sourceUrl: '',
    caseStudy: {
      problem: 'Retail chains in Singapore needed a POS system that handles real-time transactions across multiple device types (terminal, kiosk, kitchen display), supports 20+ payment methods including NETS, PayNow, and GrabPay, works offline during network outages, and scales to thousands of daily transactions — all with zero financial discrepancies.',
      approach: 'Designed a modular gRPC microservices architecture with a Strategy Pattern payment engine (20 payment strategies, 14 promotion reward types). The offline-first sync architecture uses SQLite locally with REST/gRPC reconciliation. Multi-platform support via .NET 8 for Windows (WPF), Xamarin for Android/iOS, and dedicated apps for kitchen displays, customer screens, and warehouse management.',
      architecture: [
        'gRPC microservices backend with 40+ service endpoints (Orders, Products, Inventory, Payments, Members, Shifts, Promotions, KDS streaming, Table management)',
        'Strategy Pattern payment module: Cash, Card, NETS, NETS Online QR, PayNow, GrabPay, PayPal, EzyNet, eWallet, Vouchers, Points, Store Credit, Package Redemption',
        'Promotion engine with qualification strategies + 14 reward types (flat discount, % off, bulk pricing, package deals, free cheapest item, membership tiers)',
        'Offline-first: SQLite local DB → REST/gRPC sync to backend, auto-reconciliation on reconnect with Quartz.NET/Hangfire background jobs',
        '5 device types: WPF POS Terminal, Android Self-Service Kiosk, Android Kitchen Display, WPF Customer Display, Windows Warehouse Management',
        'NETS Online QR: dynamic QR generation → 5s polling validation → auto-retry with fresh paymentId, mirrored live to the customer second display',
        'Loyalty & vouchers: NTUC Linkpoints (award/redeem/void with refund compensation), NEA government e-vouchers (idempotent redemption, audit trails), plus the internal loyalty core — membership tiers with 4 point-earning rule types, points/store-credit/on-account as payment strategies, and program-level product & payment blacklists',
        'Payment telemetry to Aliyun SLS: 7 payment methods × 14 lifecycle actions, fault-isolated so observability never blocks a sale',
      ],
      stack: ['C# / .NET 8', 'gRPC', 'WPF + ReactiveUI (MVVM)', 'Xamarin / .NET for Android & iOS', 'SQLite', 'PostgreSQL', 'Entity Framework Core', 'Hangfire', 'Quartz.NET', 'Sentry', 'ClickOnce'],
      metrics: [
        { label: 'System Modules', value: '30+' },
        { label: 'gRPC Service Endpoints', value: '40+' },
        { label: 'Payment Methods', value: '20+' },
        { label: 'NETS Transaction Types', value: '8' },
        { label: 'Revenue Processed', value: '$200K+' },
        { label: 'Loyalty & Voucher Programs', value: 'NTUC + NEA' },
        { label: 'Device Types', value: '5' },
        { label: 'Financial Incidents', value: '0' },
      ],
      gallery: ['/epos/epos.png', '/epos/linkpoints_tap_trust_card.png', '/epos/linkpoints_fairprice_scan.png', '/epos/voucher.png', '/epos/promotion.png'],
      learnings: [
        'Strategy Pattern for payments was essential — adding NETS or PayNow required zero changes to the core payment flow, just a new strategy class.',
        'gRPC streaming for kitchen display updates eliminated polling overhead and reduced order-to-kitchen latency from seconds to milliseconds.',
        'SQLite + sync engine saved the day during network outages — stores continued selling with full POS functionality, auto-syncing when reconnected.',
        'The .NET 8 migration required careful dependency ordering: shared libs first, then services, then client apps. Breaking changes in EF Core 8 and gRPC (Grpc.Core → Grpc.Net.Client) needed dedicated handling.',
        'Rounding strategies (round up, round down, midpoint up/down) with configurable precision were critical for Singapore retail pricing compliance.',
        'Sentry error tracking replaced Rollbar and provided structured exception reporting across all modules — critical for diagnosing POS failures in production.',
      ],
    },
  },
  {
    title: 'Payments, Loyalty & Vouchers — NETS · NTUC · NEA', file: 'payment-gateway', slug: 'payment-gateway',
    desc: 'The complete money layer for Singapore retail: NETS ECR terminals (8 transaction types, 6 protocol versions), NETS Online QR with live validation, PayNow, Adyen, Alipay+, NTUC Linkpoints loyalty, and NEA government e-vouchers.',
    tags: ['NETS', 'NETS Online QR', 'NTUC Linkpoints', 'NEA Vouchers'], color: '#3b82f6', stars: 623, featured: true, liveUrl: '', sourceUrl: '',
    caseStudy: {
      problem: 'Singapore retail runs on an unusually dense payment landscape: the NETS national network (terminals speaking 6 different ECR protocol versions), dynamic QR standards (NETS Online QR, PayNow), international acquirers (Adyen, Alipay+), the FairPrice Group loyalty program (NTUC Linkpoints), and government disbursement e-vouchers (NEA). Each has unique protocols, auth schemes, and failure modes — and all of them must work offline-tolerant, at checkout speed, with perfect financial accuracy.',
      approach: 'Built every integration as an isolated strategy behind a common OperationStrategy contract, with a dedicated service layer per provider (gRPC to backend, serial/REST to terminals). NETS Online QR runs an async state machine — QR payload with server-side expiry, 5-second validation polling, retry that re-issues a fresh paymentId, cancel-by-paymentId — mirrored to the customer second display. NTUC Linkpoints and NEA vouchers wrap their own lifecycles: OAuth-style token refresh, idempotent redemption keys, audit updates, and void compensation when orders are refunded.',
      architecture: [
        'NETS ECR terminal integration: 8 transaction types (NETS Pay, FlashPay/CEPAS, CashCard, Credit Card, QR, Auto, UOB, UnionPay) across 6 ECR versions (V2.58 → ECR3 V3.0.008), with logon, TMS, settlement, last-transaction retrieval, and void',
        'NETS Online QR state machine: server-generated payload → expiry countdown → 5s DispatcherTimer validation polling → auto-retry with new paymentId → cancel transaction by paymentId; QR rendered on both cashier and customer displays',
        'NTUC Linkpoints lifecycle: client-credential authentication, points balance + dollar-value + expiring-balance inquiry, award/redeem/void with receipt printing of awarded points and closing balance',
        'NEA e-voucher redemption: idempotency keys, AuditId compliance trail, campaign validation, eligible-SKU enforcement, re-redeem handling, and retrieve-by-order reconciliation',
        'Adyen terminal service (payment, diagnosis, verify last transaction) and Alipay+ / Antom gateway (payment, inquiry, card info) as additional terminal strategies',
        'PayNow QR in two acquiring variants (A_next and UOB) with payload generation and validation services',
        'Payment telemetry: every lifecycle event (started, qr_generated, validating, success, failed, timeout, cancelled, retry, logon, void) shipped to Aliyun SLS, fault-isolated from the payment flow',
      ],
      stack: ['C# / .NET 8', 'NETS ECR protocols', 'NETS Online QR', 'PayNow (A_next/UOB)', 'Adyen', 'Alipay+ (Antom)', 'gRPC', 'Aliyun SLS', 'Strategy Pattern'],
      metrics: [
        { label: 'Payment Methods', value: '20+' },
        { label: 'NETS Transaction Types', value: '8' },
        { label: 'NETS ECR Versions', value: '6' },
        { label: 'QR Validation Interval', value: '5s' },
        { label: 'Loyalty & Voucher Programs', value: 'NTUC + NEA' },
        { label: 'Financial Incidents', value: '0' },
      ],
      gallery: ['/epos/ic_nets_no_background.png', '/epos/linkpoints_fairprice_scan.png', '/epos/linkpoints_tap_trust_card.png', '/epos/linkpoint_group1.png', '/epos/voucher.png', '/epos/paynow_logo.png'],
      learnings: [
        'Serial-terminal protocols (NETS ECR) are timing-sensitive — handshake sequencing and response timeouts needed dedicated retry logic per protocol version.',
        'Dynamic QR payments are a distributed-systems problem in disguise: the POS polls, the acquirer confirms, and the QR can expire mid-payment. The retry flow re-validates first, then cancels the old paymentId and issues a new QR — never assume the first QR is dead.',
        'Idempotency keys are mandatory for government voucher redemption — a duplicated redemption request must return the original result, not a second charge against the same voucher.',
        'Loyalty points must be voidable exactly like payments — a refunded order triggers Linkpoints void compensation, or the member balance silently drifts.',
        'Telemetry must be fire-and-forget: a logging outage can never block a payment. Every telemetry call is fault-isolated with its own try/catch.',
        'Rounding calculations must use decimal (not double) for financial precision — floating point errors caused penny discrepancies in thousands of transactions.',
      ],
    },
  },
  {
    title: 'Sales & Order Engine', file: 'sales-engine', slug: 'sales-engine',
    desc: 'The reactive checkout core: split payments by items/mix/pax, set-menu building, trade-ins, weight-scale and serial-number goods, hold & retrieve orders, and multi-salesperson attribution — all orchestrated through a fluent OrderBuilder.',
    tags: ['WPF', 'ReactiveUI', 'DynamicData', 'OrderBuilder'], color: '#f43f5e', stars: 847, featured: false, liveUrl: '', sourceUrl: '',
    caseStudy: {
      problem: 'A checkout engine for mixed retail + F&B has to handle everything a cashier can legally do: split a bill three ways (by items, by mix, per pax), build set menus with add-on groups, weigh fresh produce, scan serialized electronics, accept trade-ins, park an order mid-transaction and resume it hours later, route kitchen items to the right printer, and attribute commission to multiple salespeople — without ever blocking the sale.',
      approach: 'Built a reactive sale-order core on ReactiveUI + DynamicData, with a fluent OrderBuilder that assembles order state declaratively (customer, table, queue number, sale notes, void reasons, NTUC Linkpoints, on-account balance) before sync. Split payments operate on the builder directly — two live groups with independent subtotals, each held and synced individually. Special goods (weight scale, serial numbers, trade-ins) plug in as popup view-models over the same order-item pipeline.',
      architecture: [
        'BaseSaleOrderViewModel — 3,600+ lines of reactive checkout orchestration: cart mutations, pricing recalculation, promotion application, payment sequencing',
        'Three split-payment modes: SplitByItems (two-group item picker with per-group subtotals), SplitByMix, and SplitByPax — each with pre-settlement bill printing and per-split hold + sync',
        'Fluent OrderBuilder: WithCustomer, WithTable, WithQueueNumber, WithSaleNote, WithVoidReason, WithBCRSWaiver, WithNTUCLinkpoints, WithOnAccountBalance',
        'Special goods pipeline: weight-scale integration for fresh produce, serial-number capture for electronics, trade-in valuation, open-price items',
        'Set-menu builder with add-on groups, package redemption, and kitchen item routing; RetrieveOrder and SaleOrderReload restore held orders with full state',
        'Multi-salesperson attribution at both order and line-item level for commission reporting',
      ],
      stack: ['WPF', 'ReactiveUI', 'DynamicData', 'C# / .NET 8', 'gRPC', 'SQLite'],
      metrics: [
        { label: 'Split-Payment Modes', value: '3' },
        { label: 'Checkout Core Size', value: '3.6K lines' },
        { label: 'Held-Order Recovery', value: 'Full state' },
        { label: 'Special Goods Types', value: 'Weight · Serial · Trade-in' },
      ],
      gallery: ['/epos/epos.png', '/epos/credit_card.png', '/epos/epos_pay.png', '/epos/welcome_screen.png'],
      learnings: [
        'Splitting a bill is an inventory problem, not just a math problem — each split group becomes its own syncable order, and kitchen routing must follow the split, not the original cart.',
        'DynamicData incremental binding eliminated the refresh-the-whole-cart performance cliff; item-level updates keep QuickPick fast with thousands of SKUs.',
        'Held orders must capture everything — including applied promotions and voucher redemptions — or resuming an order double-applies discounts.',
        'Serial-number and weight-scale goods break naive quantity×price math; both need per-line-item custom pricing paths through the same OrderBuilder.',
      ],
    },
  },
  {
    title: 'Offline-First Sync Engine', file: 'sync-engine', slug: 'sync-engine',
    desc: 'SQLite-backed sync architecture that keeps POS terminals selling during network outages with automatic reconciliation on reconnect.',
    tags: ['SQLite', 'gRPC', 'Hangfire', 'Quartz.NET'], color: '#8b5cf6', stars: 412, featured: false, liveUrl: '', sourceUrl: '',
    caseStudy: {
      problem: 'Retail POS systems cannot afford downtime during network outages. Stores must continue processing sales, accepting payments, and printing receipts even when the backend server is unreachable. Data must be reconciled without conflicts when connectivity is restored.',
      approach: 'Built a dual-database sync engine: SQLite for local transactions, PostgreSQL for backend aggregation. Every sale is written locally first (instant response), then background jobs (Hangfire on Windows, Quartz.NET on mobile) sync to the backend via REST/gRPC. Conflict resolution handles concurrent edits, and the sync queue persists across app restarts.',
      architecture: [
        'SQLite local database via Entity Framework Core for offline transaction storage',
        'Hangfire background jobs (Windows) and Quartz.NET (mobile) for scheduled sync tasks',
        'REST API for bulk sync with delta-based change tracking',
        'gRPC for real-time sync of critical operations (inventory adjustments, shift closures)',
        'Sync queue with persistence — survives app crashes and network outages',
      ],
      stack: ['SQLite', 'EF Core', 'Hangfire', 'Quartz.NET', 'gRPC', 'REST APIs', 'C#'],
      metrics: [
        { label: 'Offline Sales Capacity', value: 'Unlimited' },
        { label: 'Sync Recovery Time', value: '<5s' },
        { label: 'Data Loss During Outages', value: '0' },
        { label: 'Sync Conflict Resolution', value: 'Auto' },
      ],
      gallery: ['/epos/epos.png', '/epos/welcome_screen.png', '/epos/linkpoints_fairprice_scan.png'],
      learnings: [
        'Writing to local SQLite first (then syncing) gives instant UI response — users never wait for network round-trips.',
        'Hangfire dashboard was invaluable for debugging stuck sync jobs and monitoring queue depths across stores.',
        'Delta-based sync (only changed records) reduced bandwidth usage by 90% compared to full-table sync.',
        'Testing offline scenarios requires deliberate network disruption — we built a toggle in the dev settings to simulate outages.',
      ],
    },
  },
  {
    title: '.NET 8 Migration Plan', file: 'dotnet8-migration', slug: 'dotnet8-migration',
    desc: 'Phase-by-phase migration of 30+ modules from .NET Framework 4.6.2 to .NET 8 LTS — the most comprehensive enterprise migration in the project history.',
    tags: ['.NET 8', 'EF Core 8', 'gRPC', 'WPF'], color: '#f59e0b', stars: 531, featured: false, liveUrl: '', sourceUrl: '',
    caseStudy: {
      problem: 'The V5 POS ecosystem was built on .NET Framework 4.6.2 (released 2016), which reached end-of-life. Modern .NET 8 offers significant performance improvements, better cross-platform support, and long-term servicing — but migrating 30+ interconnected modules with zero downtime required meticulous planning.',
      approach: 'Designed a 4-phase migration: (1) Shared core libraries, (2) Windows projects, (3) Android projects, (4) iOS projects. Each phase has explicit dependency ordering, breaking change documentation, and rollback plans. Key breaking changes handled: Grpc.Core → Grpc.Net.Client, EF Core 2.2 → 8.0, Newtonsoft.Json → System.Text.Json, and WPF SDK-style project conversion.',
      architecture: [
        'Bottom-up dependency migration: epos_models → epos_core → epos_client_lib → epos_client_windows',
        'SDK-style project files replacing legacy .csproj format for all Windows projects',
        'Conditional compilation symbols: NETSTANDARD → !__ANDROID__ && !__IOS__',
        'gRPC channel migration: Grpc.Core.Channel → GrpcChannel.ForAddress()',
        'EF Core migration with re-generated migrations and connection string updates',
      ],
      stack: ['.NET 8', 'EF Core 8', 'Grpc.Net.Client', 'ReactiveUI 20.x', 'AutoMapper 13.x', 'NLog 5.x'],
      metrics: [
        { label: 'Modules Migrated', value: '22/22' },
        { label: 'Migration Phases', value: '4' },
        { label: 'Breaking Changes Handled', value: '6+' },
        { label: 'Estimated Duration', value: '15 weeks' },
      ],
      gallery: ['/epos/welcome_screen.png', '/epos/epos.png', '/epos/linkpoints_fairprice_scan.png'],
      learnings: [
        'Bottom-up migration order is non-negotiable — migrating client apps before shared libs creates cascading build failures.',
        'Grpc.Core to Grpc.Net.Client was the highest-risk change: the server API changed from new Server{} to Server.ForPort(), and insecure channels became the default.',
        'EF Core 8 has stricter model validation — queries that worked in 2.2 now throw exceptions for ambiguous projections.',
        'ClickOnce deployment in .NET 8 requires the EnableClickOncePublish MSBuild property — it is not enabled by default.',
      ],
    },
  },
  {
    title: 'Multi-Device Ecosystem', file: 'multi-device', slug: 'multi-device',
    desc: '5 device types running the same POS ecosystem: Terminal, Kiosk, Kitchen Display, Customer Display, and Warehouse Management — all sharing core business logic.',
    tags: ['WPF', 'Xamarin', 'Android', 'gRPC Streaming'], color: '#ec4899', stars: 976, featured: false, liveUrl: '', sourceUrl: '',
    caseStudy: {
      problem: 'A retail store needs multiple device types working in concert: cashiers use POS terminals, customers use self-service kiosks, kitchen staff need live order displays, a second screen shows order info and ads to customers, and warehouse staff manage inventory on handheld devices — all sharing the same order and product data in real-time.',
      approach: 'Built a shared core library (epos_client_lib, epos_client_models) that contains all business logic, data models, and gRPC communication. Each device type is a thin UI layer on top: WPF for Windows apps, Xamarin for Android/iOS. gRPC streaming pushes real-time order updates to kitchen displays without polling.',
      architecture: [
        'Shared core: epos_client_lib + epos_client_models (business logic, gRPC clients, data models)',
        'WPF apps: epos_client_windows (POS terminal), epos_customer_display (second screen), epos_core_manager, epos_warehouse_windows, epos_topup',
        'Xamarin Android apps: epos_pos_android (POS), epos_kiosk_android (self-service), epos_kitchen_display (KDS), epos_stocktake',
        'iOS apps: epos_mobile_ios (POS), epos_central_kitchen.iOS (kitchen display)',
        'gRPC StreamServiceImpl for real-time KDS order updates via server-push',
      ],
      stack: ['WPF', 'Xamarin', '.NET for Android', '.NET for iOS', 'gRPC Streaming', 'ReactiveUI', 'MvvmCross'],
      metrics: [
        { label: 'Device Types', value: '5' },
        { label: 'Windows Apps', value: '5' },
        { label: 'Android Apps', value: '4' },
        { label: 'iOS Apps', value: '2' },
      ],
      gallery: ['/epos/welcome_screen.png', '/epos/epos.png', '/epos/linkpoints_fairprice_open_app.png', '/epos/food_delivery.png'],
      learnings: [
        'Sharing core business logic across WPF and Xamarin requires careful conditional compilation — Android and iOS have different filesystem and permission models.',
        'gRPC streaming for KDS eliminated the "refresh to see new orders" problem — kitchen staff see orders appear instantly.',
        'Customer Display as a separate WPF app (not just a second window) allows running on a dedicated machine with its own GPU for smooth ad playback.',
        'Xamarin project files need MSBuild.Sdk.Extras for multi-targeting (netstandard2.0 + monoandroid10.0 + xamarin.ios10).',
      ],
    },
  },
  {
    title: 'Membership & Loyalty Engine', file: 'membership-loyalty', slug: 'membership-loyalty',
    desc: 'The internal loyalty core: membership programs with tiered point-earning rules, points as a payment method, store credit with balance floors, on-account corporate credit with offline sync, and program-level product/payment blacklists.',
    tags: ['Points', 'Store Credit', 'On-Account', 'Tiers'], color: '#14b8a6', stars: 712, featured: true, liveUrl: '', sourceUrl: '',
    caseStudy: {
      problem: 'Retail loyalty is far more than a points balance. Programs need tiered earning rules (earn 2x on fresh produce for Gold members, flat overrides for promo items), redemption caps per program, blacklisted products that never earn points, blacklisted payment methods that never trigger them, store credit with minimum-balance floors, and on-account credit for corporate customers — and every one of these rules must be enforceable at checkout speed, offline, across multiple terminals hitting the same account.',
      approach: 'Modeled membership programs as first-class domain entities synced to every terminal, with tiers carrying their own earning rules. Points, store credit, and on-account are all payment strategies — so the same void/refund/rounding machinery that handles cash handles loyalty instruments for free. Balances use a dual-field model (DB balance minus session deductions) so concurrent offline transactions cannot overdraw an account.',
      architecture: [
        'Membership programs with configurable PointToCashRatio, MaximumRedeemableAmount / NoLimit redemption caps, and Active/Inactive state — synced to every terminal via a dedicated synced repository',
        'Tier system: BaseEarningRate per tier plus 4 PointRule types (PercentageMarkup, Override, FlatMarkup, AdditionalPointsPerItem) with per-product-variant overrides — Gold members can earn 2x on one SKU while a promo SKU is excluded entirely',
        'Points as a payment method: live/local point methods, conversion rate and tier attribution serialized into every payment record, refund-safe points_used tracking, and a CustomerHasPointPaymentToday guard against split-payment point churning',
        'Store credit: fall-below-limit floor enforcement ("Reject. Cannot let store credit falls below the limit"), offline-safe dual-field balance (CreditBalanceInDb − CreditBalanceDeducted), and email-verification gating for credit redemption',
        'On-Account corporate credit: redemption with balance checks, offline payment queue reconciled by a background sync service, paid-detail reports, and dedicated receipt printing',
        'Program-level blacklists: BlacklistProductVariantIds + BlacklistPaymentMethods enforced at the point of sale — marketing controls exclusions without touching the product catalog',
      ],
      stack: ['C# / .NET 8', 'gRPC', 'SQLite', 'EF Core', 'Strategy Pattern', 'ReactiveUI'],
      metrics: [
        { label: 'Point Earning Rule Types', value: '4' },
        { label: 'Loyalty Instruments', value: 'Points · Credit · On-Account' },
        { label: 'Blacklist Dimensions', value: 'Products · Payments' },
        { label: 'Offline Balance Safety', value: 'Dual-field' },
      ],
      gallery: ['/epos/linkpoint_group2.png', '/epos/linkpoint_group1.png', '/epos/link_points_logo.png', '/epos/voucher.png', '/epos/promotion.png'],
      learnings: [
        'Treating points, credit, and on-account as payment strategies instead of discounts means the void/refund machinery comes free — refunding a point payment returns points through the exact same pipeline as cash.',
        'Dual-field balance tracking is what makes offline credit safe: two terminals can each check "would this overdraw?" against their own session deductions without a network round-trip.',
        'Blacklists belong on the membership program, not the product — marketing needs to exclude a payment method from earning points without waiting on a catalog change.',
        'Fall-below-limit floors matter more than zero floors: a store that lets credit hit exactly $0 loses the ability to charge refunds against the balance later.',
        'Daily point-payment guards stop abuse (churning points across split payments) without adding friction for normal shoppers — the check is one gRPC call before the tender screen opens.',
      ],
    },
  },
  {
    title: 'Promotions & Advanced Vouchers', file: 'promotion-engine', slug: 'promotion-engine',
    desc: 'Two strategy engines sharing one condition/reward architecture: 14 promotion reward types plus advanced vouchers with JSON-parameterized conditions (minimum spend, product targeting, quantity) and priority-ordered rewards.',
    tags: ['C#', 'Strategy Pattern', 'Advanced Vouchers', 'Business Rules'], color: '#06b6d4', stars: 298, featured: false, liveUrl: '', sourceUrl: '',
    caseStudy: {
      problem: 'Retail promotions are complex: a "Buy 3 Get 1 Free" deal has qualification rules (minimum quantity, specific products, day-of-week, time-of-day) and reward calculations (cheapest item free, flat discount, percentage off). On top of that, marketing needs advanced vouchers — spend $50, get $8 off these 6 SKUs — that arrive from the backend as parameters, not code. The system must stack multiple promotions, respect membership tiers, void vouchers when orders are cancelled, and calculate everything in milliseconds at checkout.',
      approach: 'Implemented a two-stage strategy engine: (1) Qualification — does the cart match the rules? (2) Reward — what discount or free item applies? Advanced vouchers reuse the same mental model but arrive JSON-parameterized from the backend (condition type + params, reward type + params), so the client re-validates every condition against the actual cart before discounting. Cash vouchers, discount vouchers, and advanced vouchers all flow through one apply → void lifecycle with per-SKU redemption line items sent for server-side validation.',
      architecture: [
        'PromotionContext: holds cart items, customer membership tier, store settings, and current date/time',
        'PromotionQualificationStrategy: evaluates ProductRequiredQualificationStrategy against cart contents',
        'PromotionRewardStrategy base with 14 concrete implementations',
        'Reward types: FlatDiscount, PercentageDiscount, BulkFixedPrice, BulkFlatDiscount, BulkPercentageDiscount, CheaperItemFlatDiscount, CheaperItemPercentageDiscount, FreeCheapest, PackageFixedPrice, ProductsFixedPrice, ProductsFlatDiscount, ProductsPercentageDiscount',
        'Advanced voucher engine: ConditionType × ConditionParams (minimum_spending, product_variant_ids, quantity) → RewardType × RewardParams (discount_amount, amount, priority, targeted product_variant_ids) — deserialized client-side and re-validated against the live cart',
        'Full voucher lifecycle: paginated voucher list per customer → apply (cash or discount voucher, with redemption line items per SKU/quantity/subtotal for server-side validation) → void on order cancellation, releasing the code back to the customer',
        'PromotionService: orchestrates qualification + reward evaluation, handles stacking rules, priority ordering across vouchers and promotions',
      ],
      stack: ['C#', '.NET 8', 'Strategy Pattern', 'Business Rules Engine', 'gRPC', 'Newtonsoft.Json'],
      metrics: [
        { label: 'Promotion Reward Types', value: '14' },
        { label: 'Voucher Classes', value: 'Cash · Discount · Advanced' },
        { label: 'Promotion Evaluation Time', value: '<10ms' },
        { label: 'Membership Tier Support', value: 'Yes' },
      ],
      gallery: ['/epos/promotion.png', '/epos/voucher.png', '/epos/linkpoints_fairprice_scan.png'],
      learnings: [
        'Separating qualification from reward was key — the same reward type (e.g., PercentageDiscount) can apply to different qualification rules (minimum spend, specific products, day-of-week).',
        'Advanced vouchers arrive as JSON parameters, not code — the client must never trust them: every condition is re-validated against the actual cart before a single cent is discounted.',
        'Vouchers must be voidable as a unit — an order cancelled after voucher application has to release the voucher code, or customers "lose" vouchers they never spent.',
        'Promotion stacking must be explicitly allowed or denied — two 10% discounts do not equal 20% off, they compound to 19%.',
        'Day-of-week and time-of-day qualification rules must use the store timezone, not UTC, to avoid midnight edge cases.',
        'Membership tier promotions need careful UX — showing "exclusive member price" at the shelf drives sign-ups more than applying it silently at checkout.',
      ],
    },
  },
]

// ─── Testimonials ───────────────────────────────────────────────────────────

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    name: 'David Lim',
    role: 'Engineering Manager',
    company: 'EPOS Singapore',
    email: 'david.lim@epos.com.sg',
    avatar: 'DL',
    pr: 312,
    reactions: { thumbsUp: 24, heart: 18, rocket: 12 },
    date: '2 weeks ago',
    quote: "Led the .NET 8 migration of our entire 30+ module POS ecosystem — on schedule and with zero production incidents. Their systematic approach to dependency ordering and breaking-change documentation set a new standard for our engineering team.",
  },
  {
    name: 'Rachel Tan',
    role: 'Product Director',
    company: 'EPOS Singapore',
    email: 'rachel.tan@epos.com.sg',
    avatar: 'RT',
    pr: 198,
    reactions: { thumbsUp: 19, heart: 14, rocket: 8 },
    date: '1 month ago',
    quote: "The payments and loyalty work was exceptional. NETS Online QR with live validation, NTUC Linkpoints with refund void compensation, idempotent NEA government voucher redemption — every integration handled the edge cases before they became incidents. 20+ payment strategies, zero financial discrepancies.",
  },
  {
    name: 'Kevin Wong',
    role: 'Senior Backend Engineer',
    company: 'EPOS Singapore',
    email: 'kevin.wong@epos.com.sg',
    avatar: 'KW',
    pr: 267,
    reactions: { thumbsUp: 16, heart: 9, rocket: 11 },
    date: '2 months ago',
    quote: "Working together on the gRPC microservices layer was a masterclass in API design. 40+ service endpoints, real-time KDS streaming, and the offline-first sync architecture — every decision was made with production resilience in mind.",
  },
  {
    name: 'Michelle Nguyen',
    role: 'QA Lead',
    company: 'EPOS Singapore',
    email: 'michelle.nguyen@epos.com.sg',
    avatar: 'MN',
    pr: 145,
    reactions: { thumbsUp: 21, heart: 16, rocket: 6 },
    date: '3 months ago',
    quote: "The promotion and loyalty engines handle 14 reward types, advanced vouchers with JSON-parameterized conditions, tiered point earning, store credit floors, and on-account credit — and in two years of testing, I've never found a rounding, stacking, or blacklist bug that wasn't already handled. The codebase is a testament to defensive engineering.",
  },
  {
    name: 'Alan Chia',
    role: 'Operations Director',
    company: 'EPOS Singapore',
    email: 'alan.chia@epos.com.sg',
    avatar: 'AC',
    pr: 89,
    reactions: { thumbsUp: 13, heart: 7, rocket: 9 },
    date: '4 months ago',
    quote: "Our retail clients depend on POS systems that never go down. The offline-first architecture with auto-sync saved us during multiple real-world network outages — stores kept selling while competitors couldn't process a single transaction.",
  },
]
