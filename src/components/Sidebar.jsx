import React from 'react'
import { useTheme, useUser } from '../context/AppContext.jsx'
import {
  LayoutDashboard, CircleDollarSign, FileBarChart,
  PieChart, Zap, Building2, FileStack, Calculator,
  TrendingUp, CreditCard, CalendarDays, Receipt,
  Users, Settings, Sun, Moon, ChevronsLeft, X
} from 'lucide-react'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'networth', label: 'Net Worth', icon: CircleDollarSign },
      { id: 'reports', label: 'Reports & Export', icon: FileBarChart },
    ]
  },
  {
    label: 'Planning',
    items: [
      { id: 'budget', label: 'Budget Planner', icon: PieChart },
      { id: 'goals', label: 'Goals', icon: Zap },
      { id: 'retirement', label: 'Retirement', icon: Building2 },
      { id: 'debt', label: 'Debt Manager', icon: FileStack },
      { id: 'calculators', label: 'Calculators', icon: Calculator },
    ]
  },
  {
    label: 'Money',
    items: [
      { id: 'investments', label: 'Investments', icon: TrendingUp },
      { id: 'bank', label: 'Bank & Payments', icon: CreditCard },
      { id: 'bills', label: 'Bills & Subs', icon: CalendarDays },
      { id: 'tax', label: 'Tax Calculator', icon: Receipt },
    ]
  },
  {
    label: 'Account',
    items: [
      { id: 'family', label: 'Family Mode', icon: Users },
      { id: 'settings', label: 'Settings', icon: Settings },
    ]
  },
]

export default function Sidebar({ currentPage, onNavigate, isOpen, onToggle }) {
  const { isDark, toggleTheme } = useTheme()
  const { user, updateUser } = useUser()

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
          <X className="w-5 h-5 md:hidden" />
          <ChevronsLeft className={`hidden md:block w-4 h-4 transition-transform duration-300 ${!isOpen ? 'rotate-180' : ''}`} />
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
              const IconComp = item.icon
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
                  
                  <IconComp className={`w-5 h-5 shrink-0 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-105'}`} />

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

      {/* Toggles */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
        <button
          onClick={() => updateUser({ language: user?.language === 'Khmer' ? 'English' : 'Khmer' })}
          className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-all text-gray-600 dark:text-gray-300"
        >
          <span className="text-base shrink-0 flex items-center justify-center">
            {user?.language === 'Khmer' ? '🇰🇭' : '🇺🇸'}
          </span>
          {isOpen && (
            <span className="text-xs font-bold uppercase tracking-tight">
              {user?.language === 'Khmer' ? 'Khmer' : 'English'}
            </span>
          )}
        </button>

        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-all text-gray-600 dark:text-gray-300"
        >
          <span className="text-base shrink-0">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
              <div className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate leading-tight">{user?.name || 'Peter Son'}</div>
              <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5 uppercase tracking-wide">{user?.plan || 'Pro'} Member</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}