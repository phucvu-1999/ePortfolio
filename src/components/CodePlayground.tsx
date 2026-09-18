import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Copy, Check, RotateCcw, Play, FlaskConical, Minus, Plus } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'

// ═══════════════════════════════════════════════════════════════════════════
// CodePlayground — "The Lab". Preset snippets with an editable editor
// (line numbers, JetBrains Mono) and a live preview: HTML/JS snippets run in
// a sandboxed <iframe srcDoc>; the React snippet renders a controlled demo.
// No new dependencies.
// ═══════════════════════════════════════════════════════════════════════════

interface Snippet {
  id: string
  label: string
  icon: string
  kind: 'html' | 'react'
  hint: string
  code: string
}

const COUNTER_CODE = `function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div className="counter">
      <button onClick={() => setCount(c => c - 1)}>−</button>
      <span>{count}</span>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  )
}`

const GRADIENT_CODE = `<!doctype html>
<style>
  body { margin:0; height:100vh; display:grid; place-items:center;
         font-family:monospace; background:#0a0a0f; color:#e2e8f0 }
  .stage { width:260px; height:150px; border-radius:16px;
           background:linear-gradient(135deg,#10b981,#3b82f6,#8b5cf6) }
  .row { display:flex; gap:12px; margin-top:16px; align-items:center }
  input[type=color] { width:42px; height:30px; border:none; background:none }
</style>
<body>
  <div>
    <div class="stage" id="stage"></div>
    <div class="row">
      <input type="color" id="a" value="#10b981">
      <input type="range" id="angle" min="0" max="360" value="135">
      <input type="color" id="b" value="#8b5cf6">
    </div>
  </div>
  <script>
    const paint = () => stage.style.background =
      \`linear-gradient(\${angle.value}deg,\${a.value},\${b.value})\`
    a.oninput = b.oninput = angle.oninput = paint
  </script>
</body>`

const SCRAMBLE_CODE = `<!doctype html>
<style>
  body { margin:0; height:100vh; display:grid; place-items:center;
         background:#0a0a0f; color:#34d399; font-family:monospace }
  h1 { font-size:2.4rem; letter-spacing:0.12em; cursor:pointer }
  p  { color:#64748b }
</style>
<body>
  <div style="text-align:center">
    <h1 id="t" onclick="run()">PORTFOLIO</h1>
    <p>click the text to scramble</p>
  </div>
  <script>
    const CHARS = '!<>-_\\\\/[]{}=+*^?#'
    function run() {
      const target = t.textContent, len = target.length
      let frame = 0
      const iv = setInterval(() => {
        t.textContent = target.split('').map((ch, i) =>
          frame / 3 > i ? ch : CHARS[Math.random() * CHARS.length | 0]
        ).join('')
        if (frame++ > len * 3 + 9) clearInterval(iv)
      }, 30)
    }
    run()
  </script>
</body>`

const SNIPPETS: Snippet[] = [
  {
    id: 'counter',
    label: 'React Counter',
    icon: '⚛️',
    kind: 'react',
    hint: 'live demo is pre-compiled for safety — edit the source to explore',
    code: COUNTER_CODE,
  },
  {
    id: 'gradient',
    label: 'Gradient Lab',
    icon: '🎨',
    kind: 'html',
    hint: 'edit the HTML/CSS/JS — preview updates as you type',
    code: GRADIENT_CODE,
  },
  {
    id: 'scramble',
    label: 'Scramble Text',
    icon: '🔀',
    kind: 'html',
    hint: 'the same effect used in the hero — remix it',
    code: SCRAMBLE_CODE,
  },
]

// ─── Controlled React demo for the counter snippet ─────────────────────────
function CounterDemo() {
  const [count, setCount] = useState(0)
  const reduce = useReducedMotion()
  return (
    <div className="h-full grid place-items-center bg-[#0a0a0f]">
      <div className="flex items-center gap-6">
        <button
          onClick={() => setCount(c => c - 1)}
          className="w-12 h-12 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 grid place-items-center transition-colors hover:border-emerald-400 hover:text-emerald-400"
          aria-label="Decrement"
        >
          <Minus size={18} />
        </button>
        <motion.span
          key={count}
          initial={reduce ? false : { scale: 1.35, color: '#34d399' }}
          animate={{ scale: 1, color: '#e2e8f0' }}
          transition={{ duration: 0.25 }}
          className="font-mono text-5xl font-bold tabular-nums w-24 text-center"
        >
          {count}
        </motion.span>
        <button
          onClick={() => setCount(c => c + 1)}
          className="w-12 h-12 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 grid place-items-center transition-colors hover:border-emerald-400 hover:text-emerald-400"
          aria-label="Increment"
        >
          <Plus size={18} />
        </button>
      </div>
      <div className="absolute bottom-3 font-mono text-[10px] text-slate-600">
        useState({count}) — rendered live by React
      </div>
    </div>
  )
}

// ─── Editor with line numbers ──────────────────────────────────────────────
function CodeEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const taRef = useRef<HTMLTextAreaElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)

  const lineCount = useMemo(() => value.split('\n').length, [value])

  const syncScroll = () => {
    if (gutterRef.current && taRef.current) gutterRef.current.scrollTop = taRef.current.scrollTop
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.currentTarget
      const { selectionStart, selectionEnd } = ta
      const next = value.slice(0, selectionStart) + '  ' + value.slice(selectionEnd)
      onChange(next)
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = selectionStart + 2 })
    }
  }

  return (
    <div className="flex h-[340px] rounded-b-xl overflow-hidden bg-[#0d1117] text-[13px] leading-6">
      {/* Gutter */}
      <div
        ref={gutterRef}
        aria-hidden
        className="w-10 shrink-0 select-none overflow-hidden border-r border-slate-800/70 bg-[#0a0e14] py-3 text-right pr-2.5 font-mono text-slate-600"
      >
        {Array.from({ length: lineCount }).map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      {/* Code area */}
      <textarea
        ref={taRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onScroll={syncScroll}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className="flex-1 resize-none bg-transparent py-3 px-4 font-mono text-emerald-200/90 caret-emerald-400 outline-none placeholder:text-slate-600"
        aria-label="Code editor"
      />
    </div>
  )
}

// ─── Main playground ───────────────────────────────────────────────────────
export default function CodePlayground() {
  const [activeId, setActiveId] = useState(SNIPPETS[0].id)
  const [sources, setSources] = useState<Record<string, string>>(() =>
    Object.fromEntries(SNIPPETS.map(s => [s.id, s.code])),
  )
  const [rendered, setRendered] = useState(SNIPPETS[0].code)
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const active = SNIPPETS.find(s => s.id === activeId)!
  const source = sources[activeId]

  // Debounce the iframe preview while typing
  useEffect(() => {
    if (active.kind !== 'html') return
    const t = window.setTimeout(() => setRendered(source), 350)
    return () => window.clearTimeout(t)
  }, [source, active.kind])

  const selectSnippet = (id: string) => {
    setActiveId(id)
    const snip = SNIPPETS.find(s => s.id === id)!
    if (snip.kind === 'html') setRendered(sources[id])
  }

  // Arrow-key navigation across tabs (roving focus)
  const onTabKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = (idx + (e.key === 'ArrowRight' ? 1 : -1) + SNIPPETS.length) % SNIPPETS.length
    selectSnippet(SNIPPETS[next].id)
    tabRefs.current[SNIPPETS[next].id]?.focus()
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(source)
      setCopied(true)
      showToast('📋 Copied to clipboard', 'success')
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      showToast('Copy failed — select and copy manually', 'error')
    }
  }

  const resetCode = () => {
    setSources(prev => ({ ...prev, [activeId]: active.code }))
    if (active.kind === 'html') setRendered(active.code)
    showToast('↺ Snippet reset', 'info')
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d1117]/80 overflow-hidden">
      {/* Tab bar */}
      <div role="tablist" aria-label="Code snippets" className="flex items-center gap-1 border-b border-slate-800 bg-[#0a0e14] px-3 pt-2.5 overflow-x-auto">
        <FlaskConical size={14} className="text-violet-400 mr-2 shrink-0" />
        {SNIPPETS.map((s, idx) => (
          <button
            key={s.id}
            ref={el => { tabRefs.current[s.id] = el }}
            role="tab"
            aria-selected={s.id === activeId}
            tabIndex={s.id === activeId ? 0 : -1}
            onClick={() => selectSnippet(s.id)}
            onKeyDown={e => onTabKeyDown(e, idx)}
            className={`flex items-center gap-1.5 rounded-t-lg px-3.5 py-2 font-mono text-xs transition-colors whitespace-nowrap ${
              s.id === activeId
                ? 'bg-[#0d1117] text-emerald-300 border border-b-0 border-slate-800'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            aria-pressed={s.id === activeId}
          >
            <span>{s.icon}</span>
            {s.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 pb-1.5 pl-3 shrink-0">
          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[11px] text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
            title="Copy code"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            {copied ? 'copied' : 'copy'}
          </button>
          <button
            onClick={resetCode}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[11px] text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
            title="Reset snippet"
          >
            <RotateCcw size={13} />
            reset
          </button>
        </div>
      </div>

      {/* Editor + preview */}
      <div className="grid lg:grid-cols-2">
        <CodeEditor value={source} onChange={v => setSources(prev => ({ ...prev, [activeId]: v }))} />

        <div className="relative border-t lg:border-t-0 lg:border-l border-slate-800 min-h-[340px]">
          <div className="absolute top-2.5 right-3 z-10 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-600">
            <Play size={10} className="text-emerald-500" />
            live preview
          </div>
          {active.kind === 'html' ? (
            <iframe
              title={`${active.label} preview`}
              srcDoc={rendered}
              sandbox="allow-scripts"
              className="w-full h-[340px] bg-[#0a0a0f]"
            />
          ) : (
            <div className="relative h-[340px]">
              <CounterDemo />
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-slate-800 bg-[#0a0e14] px-4 py-2 font-mono text-[11px] text-slate-500">
        <span className="truncate">{active.hint}</span>
        <span className="shrink-0 pl-4 text-slate-600">
          {source.split('\n').length} lines · {new Blob([source]).size} B
        </span>
      </div>
    </div>
  )
}
