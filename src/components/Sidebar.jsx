import React from 'react'
import { useTheme, useUser } from '../context/AppContext.jsx'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      { id: 'networth', label: 'Net Worth', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
      { id: 'reports', label: 'Reports & Export', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    ]
  },
  {
    label: 'Planning',
    items: [
      { id: 'budget', label: 'Budget Planner', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z' },
      { id: 'goals', label: 'Goals', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
      { id: 'retirement', label: 'Retirement', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
      { id: 'debt', label: 'Debt Manager', icon: 'M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2' },
      { id: 'calculators', label: 'Calculators', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    ]
  },
  {
    label: 'Money',
    items: [
      { id: 'investments', label: 'Investments', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' },
      { id: 'bank', label: 'Bank & Payments', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
      { id: 'bills', label: 'Bills & Subs', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { id: 'tax', label: 'Tax Calculator', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    ]
  },
  {
    label: 'Account',
    items: [
      { id: 'family', label: 'Family Mode', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
      { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    ]
  },
]

const ThemeIcons = {
  Light: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Dark: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
}

export default function Sidebar({ currentPage, onNavigate, isOpen, onToggle }) {
  const { isDark, toggleTheme } = useTheme()
  const { user } = useUser()

  return (
    <aside className={`fixed top-0 left-0 h-screen flex flex-col z-[100] transition-all duration-300 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 ${isOpen ? 'w-[260px]' : 'w-[72px]'}`}>
      {/* Logo row */}
      <div className="flex items-center gap-3 px-5 min-h-[68px] shrink-0 border-b border-gray-100 dark:border-gray-800">
        <div className="w-[34px] h-[34px]  rounded-lg flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm">
          <img src="/budget.svg" alt="icon" />
        </div>
        {isOpen && (
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-800 dark:text-gray-100 text-base leading-none whitespace-nowrap tracking-tight">Smart Money</div>
            <div className="text-[10px] font-bold tracking-widest mt-0.5 uppercase text-gray-400 dark:text-gray-600">Financial Planner</div>
          </div>
        )}
        <button onClick={onToggle} className="ml-auto p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors shrink-0">
          <svg className={`w-4 h-4 transition-transform duration-300 ${!isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className="mb-4">
            {isOpen && (
              <div className="px-6 mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-600 animate-in fade-in">
                {group.label}
              </div>
            )}
            {!isOpen && gi > 0 && <div className="h-px bg-gray-100 dark:bg-gray-800 mx-4 mb-4" />}
            
            {group.items.map(item => {
              const active = currentPage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={!isOpen ? item.label : ''}
                  className={`relative flex items-center w-full px-5 py-2.5 transition-all duration-200 group ${
                    active 
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  {active && <div className="absolute left-0 w-0.5 h-6 bg-emerald-500 rounded-r-full" />}
                  
                  <svg className={`w-5 h-5 shrink-0 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-105'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>

                  {isOpen && (
                    <span className="ml-3.5 text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-all text-gray-600 dark:text-gray-300"
        >
          <span className="text-base shrink-0">
            {isDark ? <ThemeIcons.Light /> : <ThemeIcons.Dark />}
          </span>
          {isOpen && (
            <span className="text-xs font-bold uppercase tracking-tight">
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>
      </div>

      {/* User Footer */}
      {isOpen && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border-2 border-white dark:border-gray-700 shadow-sm overflow-hidden bg-gradient-to-tr from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {user?.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : user?.initials || 'AJ'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate leading-tight">{user?.name || 'Alex Johnson'}</div>
              <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5 uppercase tracking-wide">{user?.plan || 'Pro'} Member</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}