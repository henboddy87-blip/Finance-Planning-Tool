import React, { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import BudgetPlanner from './pages/BudgetPlanner.jsx'
import GoalsTracker from './pages/GoalsTracker.jsx'
import InvestmentTracker from './pages/InvestmentTracker.jsx'
import DebtManager from './pages/DebtManager.jsx'
import RetirementPlanner from './pages/RetirementPlanner.jsx'
import TaxCalculator from './pages/TaxCalculator.jsx'
import NetWorth from './pages/NetWorth.jsx'
import BankIntegration from './pages/BankIntegration.jsx'
import BillManager from './pages/BillManager.jsx'
import ReportsExporting from './pages/ReportsExporting.jsx'
import FamilyMode from './pages/FamilyMode.jsx'
import Settings from './pages/Settings.jsx'
import Calculators from './pages/Calculators.jsx'
import { AppProviders } from './context/AppContext.jsx'

const PAGES = {
  dashboard: Dashboard,
  budget: BudgetPlanner,
  goals: GoalsTracker,
  investments: InvestmentTracker,
  debt: DebtManager,
  retirement: RetirementPlanner,
  tax: TaxCalculator,
  networth: NetWorth,
  bank: BankIntegration,
  bills: BillManager,
  reports: ReportsExporting,
  family: FamilyMode,
  settings: Settings,
  calculators: Calculators,
}

function AppContent() {
  const [page, setPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const PageComponent = PAGES[page] || Dashboard

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 relative">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[90] backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-[100] transition-transform duration-300 ${!sidebarOpen ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
        <Sidebar
          currentPage={page}
          onNavigate={(p) => { setPage(p); if(window.innerWidth < 768) setSidebarOpen(false); }}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(o => !o)}
        />
      </div>

      <main className={`flex-1 min-w-0 min-h-screen overflow-auto transition-all duration-300 flex flex-col ml-0 ${sidebarOpen ? 'md:ml-[260px]' : 'md:ml-[72px]'}`}>
        {/* Mobile Header */}
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between sticky top-0 z-[80]">
          <div className="flex items-center gap-3">
            <div className="w-[34px] h-[34px] rounded-lg flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm">
              <img src="/budget.svg" alt="icon" />
            </div>
            <div>
              <div className="font-semibold text-gray-800 dark:text-gray-100 text-base leading-none tracking-tight">Smart Money</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1">
          <PageComponent onNavigate={setPage} />
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  )
}