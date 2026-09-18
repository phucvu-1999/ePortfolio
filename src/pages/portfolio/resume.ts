// ─── Resume PDF Generator (jspdf text-based, single-page A4) ─────────────────
// jsPDF is loaded lazily on first click — keeps it out of the initial bundle.
import {
  HERO_ROLE,
  CONTACT_EMAIL,
  SOCIAL_LINKS,
  CAREER_CHAPTERS,
  SKILLS_GRAPH,
  PROJECTS,
} from './content'
import type { SkillCategory } from './content'

const NAME = 'Leo Phucvu'
const MARGIN_LEFT = 20
const MARGIN_RIGHT = 20
const PAGE_WIDTH = 210 // A4 width in mm
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT

/**
 * Builds and downloads a clean, text-based single-page A4 PDF resume.
 * Uses only jsPDF (no html2canvas).
 */
export async function downloadResume(): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = 18

  // ─── Helper functions ───
  const addLine = (yPos: number) => {
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.line(MARGIN_LEFT, yPos, PAGE_WIDTH - MARGIN_RIGHT, yPos)
  }

  const checkPageSpace = (needed: number) => {
    if (y + needed > 280) {
      // Don't add a new page — compress remaining content
      return false
    }
    return true
  }

  // ─── Header ───
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(NAME, MARGIN_LEFT, y)
  y += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(80, 80, 80)
  doc.text(HERO_ROLE, MARGIN_LEFT, y)
  y += 6

  // Contact line
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  const socialUrls = SOCIAL_LINKS.filter((l) => l.url !== '').map((l) => l.url)
  const contactParts = [CONTACT_EMAIL, ...socialUrls]
  doc.text(contactParts.join('  |  '), MARGIN_LEFT, y)
  y += 5

  addLine(y)
  y += 6

  // ─── Summary ───
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(30, 30, 30)
  doc.text('SUMMARY', MARGIN_LEFT, y)
  y += 5

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(50, 50, 50)
  const summary =
    'Senior Full-Stack Developer with 5+ years of experience building high-performance web applications. ' +
    'Specialized in React, TypeScript, and Node.js with a track record of shipping mission-critical systems ' +
    'processing $200K+ in transactions and serving 50K+ daily users.'
  const summaryLines = doc.splitTextToSize(summary, CONTENT_WIDTH)
  doc.text(summaryLines, MARGIN_LEFT, y)
  y += summaryLines.length * 4 + 4

  addLine(y)
  y += 6

  // ─── Experience ───
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(30, 30, 30)
  doc.text('EXPERIENCE', MARGIN_LEFT, y)
  y += 6

  for (const chapter of CAREER_CHAPTERS.slice().reverse()) {
    if (!checkPageSpace(20)) break

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(30, 30, 30)
    doc.text(`${chapter.role} — ${chapter.company}`, MARGIN_LEFT, y)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text(chapter.duration, PAGE_WIDTH - MARGIN_RIGHT, y, { align: 'right' })
    y += 4.5

    // Top 2 metrics as bullets
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(50, 50, 50)
    const bullets = chapter.metrics.slice(0, 2)
    for (const m of bullets) {
      if (!checkPageSpace(5)) break
      doc.text(`•  ${m.value} ${m.label}`, MARGIN_LEFT + 3, y)
      y += 4
    }
    y += 3
  }

  addLine(y)
  y += 6

  // ─── Skills ───
  if (checkPageSpace(20)) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(30, 30, 30)
    doc.text('SKILLS', MARGIN_LEFT, y)
    y += 5

    const categories: SkillCategory[] = ['frontend', 'backend', 'devops', 'design']
    const catLabels: Record<SkillCategory, string> = {
      frontend: 'Frontend',
      backend: 'Backend',
      devops: 'DevOps',
      design: 'Design',
    }

    for (const cat of categories) {
      if (!checkPageSpace(8)) break
      const nodes = SKILLS_GRAPH.nodes.filter((n) => n.category === cat)
      if (nodes.length === 0) continue

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(60, 60, 60)
      doc.text(`${catLabels[cat]}:`, MARGIN_LEFT, y)

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(50, 50, 50)
      const skillText = nodes.map((n) => n.label).join(', ')
      doc.text(skillText, MARGIN_LEFT + 22, y)
      y += 4.5
    }

    y += 2
    addLine(y)
    y += 6
  }

  // ─── Selected Projects ───
  if (checkPageSpace(15)) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(30, 30, 30)
    doc.text('SELECTED PROJECTS', MARGIN_LEFT, y)
    y += 5

    const selected = PROJECTS.filter((p) => p.featured).slice(0, 4)
    if (selected.length === 0) {
      // Fallback to first few
      selected.push(...PROJECTS.slice(0, 3))
    }

    doc.setFontSize(9)
    for (const proj of selected) {
      if (!checkPageSpace(8)) break
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 30)
      doc.text(`${proj.title}`, MARGIN_LEFT, y)
      y += 3.5

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(70, 70, 70)
      const descLines = doc.splitTextToSize(proj.desc, CONTENT_WIDTH - 3)
      doc.text(descLines.slice(0, 1), MARGIN_LEFT + 3, y)
      y += 4.5
    }
  }

  // ─── Download ───
  doc.save('leo-phucvu-resume.pdf')
}
