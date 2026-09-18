import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Theme = 'romantic' | 'light' | 'dark'

const STORAGE_KEY = 'theme-preference'
const VALID_THEMES: Theme[] = ['romantic', 'light', 'dark']

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'romantic'
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw && (VALID_THEMES as string[]).includes(raw)) {
      return raw as Theme
    }
  } catch {
    /* ignore — localStorage may be unavailable */
  }
  return 'romantic'
}

function applyThemeClass(theme: Theme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  VALID_THEMES.forEach((t) => root.classList.remove(`theme-${t}`))
  root.classList.add(`theme-${theme}`)
  root.dataset.theme = theme
}

type ThemeProviderProps = {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => readStoredTheme())

  useEffect(() => {
    applyThemeClass(theme)
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme }),
    [theme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
