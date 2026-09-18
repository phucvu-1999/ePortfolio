// ─── Lightweight i18n — EN/VI dictionary (no dependencies) ──────────────────
import { useState, useEffect, useCallback } from 'react'

export type Lang = 'en' | 'vi'

const STORAGE_KEY = 'portfolio-lang'

// ─── Dictionary ─────────────────────────────────────────────────────────────

const dict: Record<string, { en: string; vi: string }> = {
  // Navigation / chrome
  'nav.about': { en: 'About', vi: 'Giới thiệu' },
  'nav.projects': { en: 'Projects', vi: 'Dự án' },
  'nav.contact': { en: 'Contact', vi: 'Liên hệ' },
  'nav.resume': { en: 'Resume', vi: 'Hồ sơ' },

  // Section headings
  'section.about': { en: 'About Me', vi: 'Về tôi' },
  'section.chronicle': { en: 'Career Chronicle', vi: 'Hành trình sự nghiệp' },
  'section.activity': { en: 'Activity', vi: 'Hoạt động' },
  'section.skills': { en: 'Skills Graph', vi: 'Kỹ năng' },
  'section.projects': { en: 'Featured Projects', vi: 'Dự án nổi bật' },
  'section.lab': { en: 'The Lab', vi: 'Phòng thí nghiệm' },
  'section.testimonials': { en: 'Testimonials', vi: 'Đánh giá' },
  'section.contact': { en: 'Get In Touch', vi: 'Liên hệ' },

  // Hero
  'hero.greeting': { en: 'Welcome, visitor.', vi: 'Chào mừng bạn.' },
  'hero.tagline': { en: 'Creative Developer & Designer', vi: 'Nhà phát triển & Thiết kế sáng tạo' },
  'hero.cta': { en: 'View Projects', vi: 'Xem dự án' },
  'hero.contact': { en: 'Contact Me', vi: 'Liên hệ' },

  // Footer
  'footer.rights': { en: 'All rights reserved.', vi: 'Bảo lưu mọi quyền.' },
  'footer.built': { en: 'Built with', vi: 'Xây dựng với' },
  'footer.top': { en: 'Back to top', vi: 'Về đầu trang' },
  'footer.visitors': { en: 'visitors', vi: 'lượt truy cập' },

  // Common
  'common.loading': { en: 'loading...', vi: 'đang tải...' },
  'common.sampleData': { en: 'Sample data', vi: 'Dữ liệu mẫu' },
  'common.viewCaseStudy': { en: 'View case study', vi: 'Xem case study' },
  'common.contributions': { en: 'contributions', vi: 'đóng góp' },
  'common.activeDays': { en: 'active days', vi: 'ngày hoạt động' },
  'common.lastYear': { en: 'in the last year', vi: 'trong năm qua' },

  // Command palette
  'cmd.language': { en: 'Switch Language', vi: 'Chuyển ngôn ngữ' },
  'cmd.theme': { en: 'Toggle Theme', vi: 'Đổi giao diện' },
}

// ─── State ──────────────────────────────────────────────────────────────────

let currentLang: Lang = 'en'

try {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'vi' || stored === 'en') currentLang = stored
} catch { /* ignore */ }

// ─── Public API ─────────────────────────────────────────────────────────────

/** Get the current language. */
export function getLang(): Lang {
  return currentLang
}

/** Set the language, persist to localStorage, update document lang attribute. */
export function setLang(lang: Lang): void {
  currentLang = lang
  try { localStorage.setItem(STORAGE_KEY, lang) } catch { /* ignore */ }
  document.documentElement.lang = lang
  // Dispatch event so React components can re-render
  window.dispatchEvent(new CustomEvent('lang-change', { detail: lang }))
}

/** Toggle between EN and VI. Returns the new language. */
export function toggleLang(): Lang {
  const next: Lang = currentLang === 'en' ? 'vi' : 'en'
  setLang(next)
  return next
}

/** Translate a key. Falls back to the key itself if not found. */
export function t(key: string): string {
  const entry = dict[key]
  if (!entry) return key
  return entry[currentLang] ?? entry.en
}

/** React hook: subscribe to language changes and get the t() function. */
export function useI18n(): { lang: Lang; t: (key: string) => string; toggle: () => void } {
  const [lang, setLangState] = useState<Lang>(currentLang)

  useEffect(() => {
    const handler = (e: Event) => setLangState((e as CustomEvent<Lang>).detail)
    window.addEventListener('lang-change', handler)
    return () => window.removeEventListener('lang-change', handler)
  }, [])

  const toggle = useCallback(() => { toggleLang() }, [])

  return { lang, t, toggle }
}
