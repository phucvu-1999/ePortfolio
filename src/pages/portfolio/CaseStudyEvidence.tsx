import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, FileCheck2, Scale, ShieldCheck, UserRound } from 'lucide-react'
import type { CaseStudy } from './content'

interface CaseStudyEvidenceProps {
  caseStudy: CaseStudy
  color: string
}

function ListCard({ title, items, icon: Icon, color }: { title: string; items: string[]; icon: typeof UserRound; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-5">
      <div className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-widest" style={{ color }}>
        <Icon size={15} />
        {title}
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed text-slate-300">
            <CheckCircle2 size={14} className="mt-1 shrink-0" style={{ color }} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function CaseStudyEvidence({ caseStudy, color }: CaseStudyEvidenceProps) {
  return (
    <div className="space-y-12">
      <div className="grid gap-4 md:grid-cols-2">
        <ListCard title="My ownership" items={caseStudy.ownership} icon={UserRound} color={color} />
        <ListCard title="Operating constraints" items={caseStudy.constraints} icon={ShieldCheck} color={color} />
      </div>

      {caseStudy.teamContext && (
        <div className="rounded-xl border border-slate-800/70 bg-slate-900/30 px-5 py-4 text-sm text-slate-400">
          <span className="mr-2 font-mono text-xs uppercase tracking-wider" style={{ color }}>Team context</span>
          {caseStudy.teamContext}
        </div>
      )}

      <div>
        <div className="mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-slate-500">
          <Scale size={15} style={{ color }} /> Engineering decisions and trade-offs
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {caseStudy.tradeoffs.map((tradeoff, index) => (
            <motion.article
              key={tradeoff.decision}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-5"
            >
              <h3 className="mb-4 font-semibold text-slate-100">{tradeoff.decision}</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-emerald-400">Benefit</dt>
                  <dd className="mt-1 text-slate-300">{tradeoff.benefit}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-amber-400">Cost accepted</dt>
                  <dd className="mt-1 text-slate-400">{tradeoff.cost}</dd>
                </div>
              </dl>
            </motion.article>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-slate-500">
          <ArrowRight size={15} style={{ color }} /> Before and after
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-800/70">
          {caseStudy.beforeAfter.map((comparison, index) => (
            <div key={comparison.dimension} className={`grid gap-3 p-5 md:grid-cols-[0.7fr_1fr_auto_1fr] md:items-center ${index > 0 ? 'border-t border-slate-800/70' : ''}`}>
              <p className="font-mono text-xs uppercase tracking-wider" style={{ color }}>{comparison.dimension}</p>
              <p className="text-sm text-slate-500">{comparison.before}</p>
              <ArrowRight size={14} className="hidden text-slate-600 md:block" />
              <div>
                <p className="text-sm font-medium text-slate-200">{comparison.after}</p>
                {comparison.evidence && <p className="mt-1 text-xs text-slate-500">{comparison.evidence}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-slate-500">
          <FileCheck2 size={15} style={{ color }} /> Evidence available
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {caseStudy.evidence.map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-800/70 bg-slate-900/30 p-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">{item.kind}</span>
              <p className="mt-2 text-sm font-semibold text-slate-200">{item.label}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
