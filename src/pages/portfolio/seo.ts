// ─── Portfolio SEO — Per-page meta, OG, JSON-LD ─────────────────────────────
import { useEffect, useRef } from 'react'
import { HERO_NAME, HERO_ROLE, SOCIAL_LINKS, CONTACT_EMAIL } from './content'

const PAGE_TITLE = 'EPOS V5 — Enterprise POS Systems Engineer'
const PAGE_DESCRIPTION =
  'Portfolio showcasing EPOS V5 — an enterprise Point-of-Sale ecosystem with 30+ modules, NETS & NETS Online QR payments, NTUC Linkpoints loyalty, NEA government e-vouchers, a membership engine with tiers, points, store credit and on-account, and 5 device types. Built with C#, .NET 8, gRPC, WPF, and Xamarin.'
// PNG (not SVG) — most social platforms reject SVG og:images
const OG_IMAGE = '/og-portfolio.png'

interface MetaTag {
  name?: string
  property?: string
  content: string
}

function buildJsonLd(): string {
  const sameAs = SOCIAL_LINKS.filter((l) => l.url !== '').map((l) => l.url)
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: HERO_NAME,
    jobTitle: HERO_ROLE,
    email: CONTACT_EMAIL,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  }
  return JSON.stringify(schema)
}

/**
 * React hook: injects SEO meta tags, OG, canonical, and JSON-LD on mount.
 * Restores previous document.title and removes injected elements on unmount.
 * Accepts optional overrides to customize title/description for sub-pages.
 */
export function usePortfolioSEO(options?: { title?: string; description?: string }) {
  const prevTitle = useRef<string>('')
  const injected = useRef<HTMLElement[]>([])
  const restored = useRef<{ el: HTMLMetaElement; original: string }[]>([])

  const resolvedTitle = options?.title ?? PAGE_TITLE
  const resolvedDesc = options?.description ?? PAGE_DESCRIPTION

  useEffect(() => {
    // Save previous title
    prevTitle.current = document.title
    document.title = resolvedTitle

    const head = document.head

    // Helper: true upsert — update existing meta in-place or create new
    const upsertMeta = (attr: 'name' | 'property', value: string, content: string) => {
      const existing = head.querySelector<HTMLMetaElement>(`meta[${attr}="${value}"]`)
      if (existing) {
        // Record original content so we can restore on unmount
        restored.current.push({ el: existing, original: existing.content })
        existing.content = content
      } else {
        const el = document.createElement('meta')
        el.setAttribute(attr, value)
        el.content = content
        head.appendChild(el)
        injected.current.push(el)
      }
    }

    // Build meta tags with resolved values
    const metaTags: MetaTag[] = [
      { name: 'description', content: resolvedDesc },
      { property: 'og:title', content: resolvedTitle },
      { property: 'og:description', content: resolvedDesc },
      { property: 'og:type', content: 'profile' },
      { property: 'og:image', content: window.location.origin + OG_IMAGE },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:image', content: window.location.origin + OG_IMAGE },
    ]

    // Inject meta tags
    for (const tag of metaTags) {
      if (tag.property) {
        upsertMeta('property', tag.property, tag.content)
      } else if (tag.name) {
        upsertMeta('name', tag.name, tag.content)
      }
    }

    // Canonical link
    let canonical = head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      canonical.href = window.location.origin + '/portfolio'
      head.appendChild(canonical)
      injected.current.push(canonical)
    }

    // JSON-LD
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = buildJsonLd()
    head.appendChild(script)
    injected.current.push(script)

    return () => {
      // Restore title
      document.title = prevTitle.current
      // Restore original content for tags we merely updated
      for (const { el, original } of restored.current) {
        el.content = original
      }
      restored.current = []
      // Remove elements we created
      for (const el of injected.current) {
        el.parentNode?.removeChild(el)
      }
      injected.current = []
    }
  }, [resolvedTitle, resolvedDesc])
}
