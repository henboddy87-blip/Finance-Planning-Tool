import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error saving to localStorage', error)
    }
  }, [key, value])

  return [value, setValue]
}

const ThemeContext = createContext(null)
export const useTheme = () => useContext(ThemeContext)

const ToastContext = createContext(null)
export const useToast = () => useContext(ToastContext)

const UserContext = createContext(null)
export const useUser = () => useContext(UserContext)

// Toast Component
function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), toast.duration || 3500)
    return () => clearTimeout(t)
  }, [toast.id, onRemove])

  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }
  const colors = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  }

  return (
    <div 
      onClick={() => onRemove(toast.id)}
      className={`flex items-start gap-3 p-3 rounded-xl border backdrop-blur-sm cursor-pointer transition-all hover:scale-105 ${colors[toast.type] || colors.info} bg-gray-800/95`}
      style={{ minWidth: '280px', maxWidth: '380px' }}
    >
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold border-current flex-shrink-0">
        {icons[toast.type] || icons.info}
      </div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className="text-sm font-semibold mb-0.5">{toast.title}</div>
        )}
        <div className="text-xs opacity-90">{toast.message}</div>
      </div>
      <button className="text-gray-500 hover:text-gray-300 transition-colors text-sm">✕</button>
    </div>
  )
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-[9999] pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={removeToast} />
        </div>
      ))}
    </div>
  )
}

const DEFAULT_USER = {
  name: 'Peter son',
  email: 'peter@gmail.com',
  phone: '+855 (097) 123 4567',
  currency: 'KHR',
  timezone: 'Asia/Phnom Penh',
  language: 'English',
  avatar: null,
  initials: 'AJ',
  plan: 'Free',
  joinDate: 'May 2026',
  notifications: {
    budgetAlerts: true, goalMilestones: true,
    weeklyReport: true, marketUpdates: false, taxReminders: true,
  },
  privacy: {
    twoFactor: false, biometric: true, autoLock: true, dataMasking: false,
  },
  display: {
    compactMode: false, showCents: true, animations: true,
  },
}

export function AppProviders({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('wp_theme')
    return saved ? saved === 'dark' : true
  })
  const [toasts, setToasts] = useState([])
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('wp_user')
      return saved ? { ...DEFAULT_USER, ...JSON.parse(saved) } : DEFAULT_USER
    } catch { return DEFAULT_USER }
  })

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('wp_theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = useCallback(() => setIsDark(d => !d), [])

  const addToast = useCallback((type, title, message, duration) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev.slice(-4), { id, type, title, message, duration }])
  }, [])
  const removeToast = useCallback(id => setToasts(prev => prev.filter(t => t.id !== id)), [])

  const toast = {
    success: (title, msg, dur) => addToast('success', title, msg, dur),
    error: (title, msg, dur) => addToast('error', title, msg, dur),
    warning: (title, msg, dur) => addToast('warning', title, msg, dur),
    info: (title, msg, dur) => addToast('info', title, msg, dur),
  }

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const next = { ...prev, ...updates }
      localStorage.setItem('wp_user', JSON.stringify(next))
      return next
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <ToastContext.Provider value={toast}>
        <UserContext.Provider value={{ user, updateUser }}>
          {children}
          <ToastContainer toasts={toasts} removeToast={removeToast} />
        </UserContext.Provider>
      </ToastContext.Provider>
    </ThemeContext.Provider>
  )
}