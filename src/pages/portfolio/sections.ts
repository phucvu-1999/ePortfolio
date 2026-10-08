export const PORTFOLIO_SECTIONS = [
  { id: 'hero', label: 'Hero', index: 0, recruiter: true },
  { id: 'skill-checkout', label: 'Skill Checkout', index: 1, recruiter: false },
  { id: 'about', label: 'About', index: 2, recruiter: true },
  { id: 'chronicle', label: 'Chronicle', index: 3, recruiter: true },
  { id: 'money-layer', label: 'Money Layer', index: 4, recruiter: false },
  { id: 'loyalty-vault', label: 'Loyalty Vault', index: 5, recruiter: false },
  { id: 'device-fleet', label: 'Device Fleet', index: 6, recruiter: false },
  { id: 'kiosk', label: 'Kiosk', index: 7, recruiter: false },
  { id: 'stock-take', label: 'Stock Take', index: 8, recruiter: false },
  { id: 'kitchen-display', label: 'Kitchen Display', index: 9, recruiter: false },
  { id: 'ecosystem', label: 'Ecosystem', index: 10, recruiter: false },
  { id: 'sale-pipeline', label: 'Sale Pipeline', index: 11, recruiter: false },
  { id: 'promo-engine', label: 'Promo Engine', index: 12, recruiter: false },
  { id: 'reliability-lab', label: 'Reliability Lab', index: 13, recruiter: false },
  { id: 'metrics', label: 'Metrics', index: 14, recruiter: false },
  { id: 'activity', label: 'Activity', index: 15, recruiter: false },
  { id: 'skills', label: 'Skills', index: 16, recruiter: false },
  { id: 'works', label: 'Works', index: 17, recruiter: true },
  { id: 'explorer', label: 'Explorer', index: 18, recruiter: false },
  { id: 'lab', label: 'The Lab', index: 19, recruiter: false },
  { id: 'reviews', label: 'Reviews', index: 20, recruiter: true },
  { id: 'kanban', label: 'Kanban', index: 21, recruiter: false },
  { id: 'contact', label: 'Contact', index: 22, recruiter: true },
  { id: 'footer', label: 'Footer', index: 23, recruiter: true },
] as const

export type PortfolioSection = (typeof PORTFOLIO_SECTIONS)[number]
export type PortfolioSectionId = PortfolioSection['id']

export const SECTION_BY_ID = new Map<PortfolioSectionId, PortfolioSection>(
  PORTFOLIO_SECTIONS.map((section) => [section.id, section]),
)

export const SECTION_BY_INDEX = new Map<number, PortfolioSection>(
  PORTFOLIO_SECTIONS.map((section) => [section.index, section]),
)

export function visiblePortfolioSections(recruiterMode: boolean): readonly PortfolioSection[] {
  return recruiterMode ? PORTFOLIO_SECTIONS.filter((section) => section.recruiter) : PORTFOLIO_SECTIONS
}
