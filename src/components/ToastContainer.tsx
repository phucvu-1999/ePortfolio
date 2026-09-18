import { AnimatePresence, motion } from 'framer-motion'
import { useToast, type ToastType } from '../contexts/ToastContext'

// Icon per type
const TOAST_ICONS: Record<ToastType, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
}

// Styling per type using CSS variables where possible
const TOAST_STYLES: Record<
  ToastType,
  { bg: string; border: string; accent: string }
> = {
  info: {
    bg: 'var(--card-bg)',
    border: 'var(--card-border)',
    accent: 'var(--btn-primary-bg)',
  },
  success: { bg: 'var(--card-bg)', border: '#22c55e40', accent: '#22c55e' },
  warning: { bg: 'var(--card-bg)', border: '#f59e0b40', accent: '#f59e0b' },
  error: { bg: 'var(--card-bg)', border: '#ef444440', accent: '#ef4444' },
}

export default function ToastContainer() {
  const { toasts, dismissToast } = useToast()

  return (
    <div
      style={{
        position: 'fixed',
        top: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        pointerEvents: 'none',
        maxWidth: '380px',
        width: '100%',
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const style = TOAST_STYLES[toast.type]
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={() => dismissToast(toast.id)}
              style={{
                pointerEvents: 'auto',
                cursor: 'pointer',
                background: style.bg,
                border: `1px solid ${style.border}`,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: '1rem',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: `0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px ${style.border}`,
              }}
            >
              {/* Accent bar on left */}
              <div
                style={{
                  width: '4px',
                  alignSelf: 'stretch',
                  minHeight: '2rem',
                  borderRadius: '2px',
                  background: style.accent,
                  flexShrink: 0,
                }}
              />

              <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>
                {TOAST_ICONS[toast.type]}
              </span>

              <p
                style={{
                  color: 'var(--text-body)',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                {toast.message}
              </p>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
