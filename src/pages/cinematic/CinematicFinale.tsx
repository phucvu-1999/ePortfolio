// ─── Cinematic Sections C — Testimonials · Contact · Footer ──────────────────
// Portfolio 1 (Cinematic Scroll).
// Testimonials: staggered card grid. Contact: magnetic CTA + SG clock.
// Footer: marquee band + giant outlined watermark.
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Mail, ExternalLink, Globe, Send, Quote } from 'lucide-react'
import { TESTIMONIALS_DATA, SOCIAL_LINKS, CONTACT_EMAIL, HERO_NAME } from '../portfolio/content'
import { reducedMotion, SplitReveal, Magnetic, SGClock } from './CinematicChrome'

const SOCIAL_ICON_MAP: Record<string, typeof Globe> = {
  github: Globe,
  linkedin: ExternalLink,
  twitter: Send,
}

/* ═══════════════════════════════════════════════════════════════════════════
   6. TESTIMONIALS — staggered card grid
   ═══════════════════════════════════════════════════════════════════════════ */

export function TestimonialsSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (reducedMotion()) return
      gsap.from('.testimonial-card', {
        opacity: 0,
        y: 60,
        stagger: 0.15,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 70%' },
      })
    },
    { scope: ref },
  )

  return (
    <section ref={ref} id="testimonials" className="relative px-6 py-32 md:px-16 lg:px-24">
      <div className="mb-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/40 to-transparent" />
        <span className="font-mono text-xs uppercase tracking-widest text-emerald-500/60">
          Testimonials
        </span>
      </div>

      <SplitReveal
        as="h2"
        className="mb-16 font-bold tracking-tighter text-white"
        style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
      >
        What Colleagues Say
      </SplitReveal>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS_DATA.map((t, i) => (
          <div
            key={i}
            className="testimonial-card group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-500 hover:border-white/10 hover:bg-white/[0.04]"
          >
            <Quote size={24} className="mb-4 text-emerald-500/30" />

            <p className="text-sm italic leading-relaxed text-white/45">
              &ldquo;{t.quote}&rdquo;
            </p>

            <div className="mt-6 flex items-center gap-3 border-t border-white/5 pt-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 text-xs font-bold text-white/60">
                {t.avatar}
              </div>
              <div>
                <div className="text-sm font-medium text-white/70">{t.name}</div>
                <div className="text-xs text-white/30">{t.role} · {t.company}</div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 text-[11px] text-white/20">
              <span>👍 {t.reactions.thumbsUp}</span>
              <span>❤️ {t.reactions.heart}</span>
              <span>🚀 {t.reactions.rocket}</span>
              <span className="ml-auto">{t.date}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   7. CONTACT — magnetic CTA
   ═══════════════════════════════════════════════════════════════════════════ */

export function ContactSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (reducedMotion()) return
      gsap.from('.contact-title', {
        opacity: 0,
        y: 100,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 75%' },
      })
      gsap.from('.contact-items > *', {
        opacity: 0,
        y: 40,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 60%' },
      })
    },
    { scope: ref },
  )

  return (
    <section
      ref={ref}
      id="contact"
      className="relative flex flex-col items-center px-6 py-40 text-center"
    >
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(16,185,129,0.06) 0%, transparent 70%)',
        }}
      />

      <h2
        className="contact-title relative font-bold tracking-tighter text-white"
        style={{ fontSize: 'clamp(3rem, 8vw, 8rem)' }}
      >
        Let&rsquo;s Talk
      </h2>

      <div className="contact-items relative flex flex-col items-center">
        <Magnetic
          href={`mailto:${CONTACT_EMAIL}`}
          className="mt-14 rounded-full border-2 border-emerald-500/80 px-12 py-5 text-lg font-semibold text-emerald-400 transition-colors duration-300 hover:bg-emerald-500 hover:text-black"
        >
          <span className="flex items-center gap-3">
            <Mail size={20} />
            {CONTACT_EMAIL}
          </span>
        </Magnetic>

        {/* Social links with magnetic hover */}
        <div className="mt-12 flex items-center gap-8">
          {SOCIAL_LINKS.filter((l) => l.url).map((link) => {
            const Icon = SOCIAL_ICON_MAP[link.platform.toLowerCase()] || ExternalLink
            return (
              <Magnetic
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white/35 transition-colors duration-300 hover:text-emerald-400"
              >
                <Icon size={16} />
                {link.platform}
              </Magnetic>
            )
          })}
        </div>

        {/* Clock chip */}
        <div className="mt-8">
          <SGClock />
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   8. FOOTER — marquee band + gradient background + outlined watermark
   ═══════════════════════════════════════════════════════════════════════════ */

const MARQUEE_TEXT =
  'AVAILABLE FOR HIRE \u2022 SINGAPORE \u2022 REACT \u2022 .NET 8 \u2022 GSAP \u2022 gRPC \u2022 TYPESCRIPT \u2022 ENTERPRISE POS \u2022 '

export function FooterSection() {
  return (
    <footer className="relative overflow-hidden border-t border-white/5">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(59,130,246,0.06) 50%, rgba(139,92,246,0.08) 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 8s ease infinite',
        }}
      />

      {/* Scrolling marquee text band */}
      <div className="overflow-hidden whitespace-nowrap border-b border-white/5 py-4">
        <div className="inline-flex" style={{ animation: 'marquee-scroll 30s linear infinite' }}>
          <span className="pr-4 font-mono text-sm tracking-widest text-white/15">
            {MARQUEE_TEXT.repeat(4)}
          </span>
          <span className="pr-4 font-mono text-sm tracking-widest text-white/15">
            {MARQUEE_TEXT.repeat(4)}
          </span>
        </div>
      </div>

      <div className="relative py-12 text-center">
        <p className="text-xs tracking-wider text-white/25">
          {HERO_NAME} · {new Date().getFullYear()} · Built with React + GSAP + Three.js
        </p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/15">
          Singapore · GMT+8 · Available worldwide
        </p>
      </div>

      {/* Giant outlined watermark, cropped by the footer edge */}
      <div className="pointer-events-none relative select-none" aria-hidden="true">
        <div
          className="whitespace-nowrap text-center font-bold leading-[0.75] tracking-tighter text-transparent"
          style={{
            fontSize: 'clamp(6rem, 19vw, 17rem)',
            WebkitTextStroke: '1px rgba(255,255,255,0.07)',
            transform: 'translateY(22%)',
          }}
        >
          {HERO_NAME}
        </div>
      </div>
    </footer>
  )
}
