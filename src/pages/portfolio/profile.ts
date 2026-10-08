export interface PortfolioLink {
  platform: 'GitHub' | 'LinkedIn' | 'Twitter'
  url: string
}

export interface PortfolioProfile {
  name: string
  displayName: string
  role: string
  location: string
  experience: string
  availability: string
  currentFocus: string
  email: string
  githubUsername: string
  links: PortfolioLink[]
}

export const PORTFOLIO_PROFILE: PortfolioProfile = {
  name: 'Leo Phucvu',
  displayName: 'Leo Phucvu',
  role: 'Enterprise POS Systems Engineer',
  location: 'Singapore',
  experience: '5+ years',
  availability: 'Open to opportunities',
  currentFocus: 'Leading a .NET 8 migration at EPOS Singapore',
  email: 'hello@portfolio.dev',
  githubUsername: '',
  links: [
    { platform: 'GitHub', url: '' },
    { platform: 'LinkedIn', url: '' },
    { platform: 'Twitter', url: '' },
  ],
}

export const hasConfiguredGitHub = PORTFOLIO_PROFILE.githubUsername.trim().length > 0
export const publishedSocialLinks = PORTFOLIO_PROFILE.links.filter((link) => link.url.trim().length > 0)

const UNPUBLISHED_METRIC_LABELS = new Set([
  'Revenue Processed',
  'System Uptime',
  'Financial Incidents',
  'Offline Sales Capacity',
  'Sync Recovery Time',
  'Data Loss During Outages',
  'Promotion Evaluation Time',
])

export function isPublishableMetric(metric: { label: string }): boolean {
  return !UNPUBLISHED_METRIC_LABELS.has(metric.label)
}
