import React, { useState } from 'react'
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
  const PageComponent = PAGES[page] || Dashboard

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar
        currentPage={page}
        onNavigate={setPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(o => !o)}
      />
      <main className={`flex-1 min-h-screen overflow-auto transition-all duration-300 ${sidebarOpen ? 'ml-[260px]' : 'ml-[72px]'}`}>
        <PageComponent onNavigate={setPage} />
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