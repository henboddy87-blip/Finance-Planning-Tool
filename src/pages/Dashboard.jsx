import React, { useState } from 'react'
import { ArrowUp, ArrowDown, Target, Settings, ChevronRight, Check, Diamond, PieChart as PieChartIcon } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, ComposedChart
} from 'recharts'
import PageHeader from '../components/PageHeader.jsx'
import StatCard from '../components/StatCard.jsx'
import { fmt, fmtFull, COLORS } from '../utils/format.js'
import { useTheme, useUser, useLocalStorage } from '../context/AppContext.jsx'

/* ── Static Demo Data (For History Graphs) ──────────────── */
const incomeVsExpense = {
  daily: [
    { label: 'Mon', income: 380, expenses: 210 },
    { label: 'Tue', income: 420, expenses: 185 },
    { label: 'Wed', income: 390, expenses: 340 },
    { label: 'Thu', income: 410, expenses: 220 },
    { label: 'Fri', income: 460, expenses: 290 },
    { label: 'Sat', income: 200, expenses: 380 },
    { label: 'Sun', income: 150, expenses: 260 },
  ],
  monthly: [
    { label: 'Nov', income: 8200, expenses: 5400 },
    { label: 'Dec', income: 9100, expenses: 6200 },
    { label: 'Jan', income: 8400, expenses: 5100 },
    { label: 'Feb', income: 8400, expenses: 4900 },
    { label: 'Mar', income: 8700, expenses: 5300 },
    { label: 'Apr', income: 8400, expenses: 5200 },
  ],
  yearly: [
    { label: '2020', income: 72000, expenses: 58000 },
    { label: '2021', income: 84000, expenses: 63000 },
    { label: '2022', income: 91000, expenses: 68000 },
    { label: '2023', income: 98000, expenses: 71000 },
    { label: '2024', income: 104000, expenses: 74000 },
    { label: '2025', income: 100800, expenses: 62400 },
  ],
}

const cashflowMonthly = [
  { month: 'Nov', inflow: 8200, outflow: 5400, net: 2800 },
  { month: 'Dec', inflow: 9100, outflow: 6200, net: 2900 },
  { month: 'Jan', inflow: 8400, outflow: 5100, net: 3300 },
  { month: 'Feb', inflow: 8400, outflow: 4900, net: 3500 },
  { month: 'Mar', inflow: 8700, outflow: 5300, net: 3400 },
  { month: 'Apr', inflow: 8400, outflow: 5200, net: 3200 },
]

const networthHistory = [
  { month: 'Nov', net: 142000 },
  { month: 'Dec', net: 148000 },
  { month: 'Jan', net: 151000 },
  { month: 'Feb', net: 155000 },
  { month: 'Mar', net: 159000 },
  { month: 'Apr', net: 164800 },
]

const savingsRateData = [
  { month: 'Nov', rate: 34.1 },
  { month: 'Dec', rate: 31.8 },
  { month: 'Jan', rate: 39.3 },
  { month: 'Feb', rate: 41.7 },
  { month: 'Mar', rate: 39.1 },
  { month: 'Apr', rate: 38.1 },
]

const spendingTrends = {
  daily: [
    { label: 'Mon', housing: 0, food: 42, transport: 15, entertain: 0, other: 30 },
    { label: 'Tue', housing: 0, food: 28, transport: 62, entertain: 15, other: 18 },
    { label: 'Wed', housing: 0, food: 95, transport: 0, entertain: 80, other: 42 },
    { label: 'Thu', housing: 0, food: 35, transport: 15, entertain: 0, other: 22 },
    { label: 'Fri', housing: 0, food: 68, transport: 15, entertain: 60, other: 35 },
    { label: 'Sat', housing: 0, food: 120, transport: 40, entertain: 95, other: 55 },
    { label: 'Sun', housing: 0, food: 88, transport: 20, entertain: 45, other: 38 },
  ],
  monthly: [
    { label: 'Nov', housing: 1850, food: 540, transport: 310, entertain: 240, other: 560 },
    { label: 'Dec', housing: 1850, food: 680, transport: 290, entertain: 480, other: 900 },
    { label: 'Jan', housing: 1850, food: 510, transport: 320, entertain: 180, other: 420 },
    { label: 'Feb', housing: 1850, food: 490, transport: 280, entertain: 210, other: 520 },
    { label: 'Mar', housing: 1850, food: 620, transport: 350, entertain: 310, other: 520 },
    { label: 'Apr', housing: 1850, food: 590, transport: 310, entertain: 290, other: 510 },
  ],
  yearly: [
    { label: '2020', housing: 21600, food: 5800, transport: 3200, entertain: 2800, other: 5600 },
    { label: '2021', housing: 21600, food: 6400, transport: 3600, entertain: 3200, other: 6200 },
    { label: '2022', housing: 22200, food: 7100, transport: 3900, entertain: 3600, other: 7200 },
    { label: '2023', housing: 22200, food: 7400, transport: 4100, entertain: 3800, other: 7500 },
    { label: '2024', housing: 22200, food: 7800, transport: 4300, entertain: 4200, other: 7800 },
    { label: '2025', housing: 22200, food: 5900, transport: 3700, entertain: 3480, other: 6240 },
  ],
}

/* Widget registry */
const ALL_WIDGETS = [
  { id: 'stats', label: 'KPI Stats' },
  { id: 'incomeExp', label: 'Income vs Expenses' },
  { id: 'cashflow', label: 'Cash Flow Analysis' },
  { id: 'networth', label: 'Net Worth Tracking' },
  { id: 'savingsRate', label: 'Savings Rate' },
  { id: 'spending', label: 'Spending Trends' },
  { id: 'allocation', label: 'Portfolio Allocation' },
  { id: 'transactions', label: 'Recent Transactions' },
  { id: 'goals', label: 'Active Goals' },
]

/* Custom Tooltip */
const CT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  // Filter out duplicates (e.g. same data for Bar and Line)
  const uniquePayload = payload.filter((item, index, self) => 
    index === self.findIndex((t) => t.name === item.name)
  )
  
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 shadow-2xl ring-1 ring-black/5 dark:ring-white/5 animate-scaleIn min-w-[140px]">
      <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 border-b border-gray-100 dark:border-gray-800/50 pb-1.5">{label}</div>
      <div className="space-y-2">
        {uniquePayload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shadow-sm" style={{ background: p.color }} />
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{p.name}</span>
            </div>
            <span className="text-xs text-gray-900 dark:text-gray-100 font-bold">
              {p.name.includes('Rate') ? `${p.value}%` : fmt(p.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* Period Pills */
function PeriodPills({ period, setPeriod }) {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
      {['daily', 'monthly', 'yearly'].map(p => (
        <button
          key={p}
          onClick={() => setPeriod(p)}
          className={`px-3 py-1.5 text-xs font-medium capitalize transition-all ${
            period === p
              ? 'bg-emerald-600 text-white'
              : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────── */
export default function Dashboard({ onNavigate }) {
  const { user } = useUser()
  const [period, setPeriod] = useState('monthly')
  const [showCustomize, setShow] = useState(false)
  const [activeWidgets, setActive] = useState(ALL_WIDGETS.map(w => w.id))

  // Real Data Connectors
  const [realAssets]      = useLocalStorage('wp_assets', [])
  const [realLiabilities] = useLocalStorage('wp_liabilities', [])
  const [realGoals]       = useLocalStorage('wp_goals', [])
  const [realHoldings]    = useLocalStorage('wp_holdings', [])
  const [realSplits]      = useLocalStorage('fm_splits', [])

  // Derived Real KPI Stats
  const totalAssetsValue = realAssets.reduce((s, a) => s + a.value, 0)
  const totalLiabilitiesValue = realLiabilities.reduce((s, l) => s + l.value, 0)
  const netWorthValue = totalAssetsValue - totalLiabilitiesValue
  
  // Real Portfolio Allocation
  const allocationData = React.useMemo(() => {
    if (realHoldings.length === 0) return [
      { name: 'Stocks', value: 58 }, { name: 'Bonds', value: 18 },
      { name: 'Real Estate', value: 14 }, { name: 'Cash', value: 6 }, { name: 'Crypto', value: 4 }
    ]
    const map = {}
    const total = realHoldings.reduce((s, h) => s + (h.shares * h.currentPrice), 0)
    realHoldings.forEach(h => {
      const val = h.shares * h.currentPrice
      map[h.category] = (map[h.category] || 0) + val
    })
    return Object.entries(map).map(([name, value]) => ({ 
      name, 
      value: Math.round((value / total) * 100) 
    }))
  }, [realHoldings])

  // Real Recent Transactions (from Family Mode Splits)
  const recentTx = React.useMemo(() => {
    if (realSplits.length === 0) return [
      { desc: 'Salary Deposit', cat: 'Income', date: 'Apr 28', amount: 4200, type: 'income' },
      { desc: 'Mortgage Payment', cat: 'Housing', date: 'Apr 27', amount: -1850, type: 'expense' },
      { desc: 'Grocery Store', cat: 'Food', date: 'Apr 25', amount: -187, type: 'expense' },
    ]
    return realSplits.slice(0, 6).map(s => ({
      desc: s.desc,
      cat: s.category,
      date: s.date.slice(5), // simplified date
      amount: -s.amount,
      type: 'expense'
    }))
  }, [realSplits])

  // Real Goals
  const goals = React.useMemo(() => {
    if (realGoals.length === 0) return [
      { name: 'Emergency Fund', progress: 78, target: 25000, current: 19500, color: '#10b981' },
      { name: 'House Down Payment', progress: 42, target: 80000, current: 33600, color: '#f59e0b' },
    ]
    return realGoals.slice(0, 3).map(g => ({
      name: g.name,
      progress: Math.round((g.current / g.target) * 100),
      target: g.target,
      current: g.current,
      color: g.color || '#10b981'
    }))
  }, [realGoals])

  const has = (id) => activeWidgets.includes(id)
  const toggle = (id) => setActive(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const ieData = incomeVsExpense[period]
  const spendData = spendingTrends[period]
  
  // Real Income/Expense Connection
  const realPeriodTotalOut = realSplits.reduce((s, d) => s + d.amount, 0)
  const totalIn = ieData.reduce((s, d) => s + d.income, 0)
  const totalOut = realPeriodTotalOut > 0 ? realPeriodTotalOut : ieData.reduce((s, d) => s + d.expenses, 0)
  
  const surplus = totalIn - totalOut
  const avgSR = savingsRateData.reduce((s, d) => s + d.rate, 0) / savingsRateData.length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Complete analytics overview · April 2026
          </p>
        </div>
        <div className="flex gap-3">
          <PeriodPills period={period} setPeriod={setPeriod} />
          <button
            onClick={() => setShow(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-4 h-4" /> Customize
          </button>
        </div>
      </div>

      {/* Customize Modal */}
      {showCustomize && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full animate-fadeIn shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Customize Dashboard</h3>
              <button
                onClick={() => setShow(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors text-xl"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Toggle widgets to show or hide on your dashboard.</p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {ALL_WIDGETS.map(w => (
                <div
                  key={w.id}
                  onClick={() => toggle(w.id)}
                  className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all border ${
                    has(w.id)
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500'
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <span className={`text-sm ${has(w.id) ? 'text-gray-900 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}>
                    {w.label}
                  </span>
                  <div className={`w-9 h-5 rounded-full relative transition-colors ${
                    has(w.id) ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                      has(w.id) ? 'left-4' : 'left-0.5'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShow(false)}
              className="w-full mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      {has('stats') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Net Worth" value={fmt(netWorthValue)} sub="Current Balance" trend={3.2} color="emerald" icon={<Diamond className="w-5 h-5 text-emerald-500" />} />
          <StatCard label="Monthly Income" value={fmt(totalIn)} sub="This period" trend={2.4} color="amber" icon={<ArrowUp className="w-5 h-5 text-amber-500" />} />
          <StatCard label="Monthly Expenses" value={fmt(totalOut)} sub="This period" trend={-1.8} color="rose" icon={<ArrowDown className="w-5 h-5 text-rose-500" />} />
          <StatCard label="Savings Rate" value={`${avgSR.toFixed(1)}%`} sub="6-month avg" trend={4.1} color="blue" icon={<Target className="w-5 h-5 text-blue-500" />} />
        </div>
      )}

      {/* Income vs Expenses */}
      {has('incomeExp') && (
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-5">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Income vs Expenses
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {fmt(totalIn)} <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">income</span>
                </span>
                <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                  {fmt(totalOut)} <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">expenses</span>
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  surplus >= 0 
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                    : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                }`}>
                  {surplus >= 0 ? '+' : ''}{fmt(surplus)} {period} surplus
                </span>
              </div>
            </div>
            <PeriodPills period={period} setPeriod={setPeriod} />
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <ComposedChart data={ieData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} className="dark:[&_tspan]:fill-gray-500" />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`} className="dark:[&_tspan]:fill-gray-500" />
              <Tooltip content={<CT />} contentStyle={{ backgroundColor: 'transparent', border: 'none' }} cursor={{ fill: 'rgba(0,0,0,0.05)' }} wrapperStyle={{ zIndex: 100 }} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4,4,0,0]} opacity={0.9} />
              <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4,4,0,0]} opacity={0.9} />
              <Line type="monotone" dataKey="income" stroke="#34d399" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Cash Flow + Net Worth */}
      {(has('cashflow') || has('networth')) && (
        <div className={`grid gap-5 mb-5 ${has('cashflow') && has('networth') ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {has('cashflow') && (
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="mb-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Cash Flow Analysis
                </div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  +{fmt(3200)} <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">avg monthly surplus</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Total Inflow', value: fmt(50200), color: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Total Outflow', value: fmt(32100), color: 'text-rose-600 dark:text-rose-400' },
                  { label: 'Net Cash', value: fmt(18100), color: 'text-amber-600 dark:text-amber-400' },
                ].map((s, i) => (
                  <div key={i} className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s.label}</div>
                    <div className={`text-sm font-bold ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={cashflowMonthly}>
                  <defs>
                    <linearGradient id="inflowG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="outflowG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} className="dark:[&_tspan]:fill-gray-500" />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} className="dark:[&_tspan]:fill-gray-500" />
                  <Tooltip content={<CT />} contentStyle={{ backgroundColor: 'transparent', border: 'none' }} wrapperStyle={{ zIndex: 100 }} />
                  <Area type="monotone" dataKey="inflow" name="Inflow" stroke="#10b981" strokeWidth={2} fill="url(#inflowG)" />
                  <Area type="monotone" dataKey="outflow" name="Outflow" stroke="#f43f5e" strokeWidth={2} fill="url(#outflowG)" />
                  <Line type="monotone" dataKey="net" name="Net" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {has('networth') && (
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Net Worth Tracking
                  </div>
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{fmt(164800)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1"><ArrowUp className="w-3 h-3 text-emerald-500" /> +{fmt(22800)} YTD · All-time high</div>
                </div>
                <button 
                  onClick={() => onNavigate('networth')}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Details <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: 'Total Assets', value: fmt(700000), color: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Total Liabilities', value: fmt(326000), color: 'text-rose-600 dark:text-rose-400' },
                  { label: 'Debt-to-Asset', value: '46.6%', color: 'text-amber-600 dark:text-amber-400' },
                  { label: 'Monthly Growth', value: '+$5,800', color: 'text-blue-600 dark:text-blue-400' },
                ].map((s, i) => (
                  <div key={i} className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s.label}</div>
                    <div className={`text-sm font-bold ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={175}>
                <AreaChart data={networthHistory}>
                  <defs>
                    <linearGradient id="nwG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} className="dark:[&_tspan]:fill-gray-500" />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} className="dark:[&_tspan]:fill-gray-500" />
                  <Tooltip content={<CT />} contentStyle={{ backgroundColor: 'transparent', border: 'none' }} wrapperStyle={{ zIndex: 100 }} />
                  <Area type="monotone" dataKey="net" name="Net Worth" stroke="#10b981" strokeWidth={2.5} fill="url(#nwG)" dot={{ r: 4, fill: '#10b981' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Savings Rate + Spending Trends */}
      {(has('savingsRate') || has('spending')) && (
        <div className={`grid gap-5 mb-5 ${has('savingsRate') && has('spending') ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {has('savingsRate') && (
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="mb-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Savings Rate
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{avgSR.toFixed(1)}%</span>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                    <ArrowUp className="w-3 h-3" /> Healthy
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Recommended minimum: 20%</div>
              </div>
              <div className="mb-4">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(avgSR, 100)}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                  <span>0%</span><span className="text-amber-600 dark:text-amber-400 flex items-center gap-1"><ArrowUp className="w-3 h-3" /> 20% min</span><span>50%</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={savingsRateData}>
                  <defs>
                    <linearGradient id="srG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} className="dark:[&_tspan]:fill-gray-500" />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 60]} className="dark:[&_tspan]:fill-gray-500" />
                  <Tooltip content={<CT />} contentStyle={{ backgroundColor: 'transparent', border: 'none' }} wrapperStyle={{ zIndex: 100 }} />
                  <Area type="monotone" dataKey="rate" name="Savings Rate" stroke="#3b82f6" strokeWidth={2} fill="url(#srG)" dot={{ r: 4, fill: '#3b82f6' }} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {[
                  { label: 'Emergency Fund', pct: 6.0, color: '#10b981' },
                  { label: 'Retirement (401k)', pct: 21.4, color: '#3b82f6' },
                  { label: 'Investments', pct: 6.0, color: '#f59e0b' },
                  { label: 'Other Savings', pct: 4.7, color: '#8b5cf6' },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{s.label}</span>
                      <span className="font-semibold" style={{ color: s.color }}>{s.pct}%</span>
                    </div>
                    <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(s.pct / 38.1) * 100}%`, background: s.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {has('spending') && (
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Spending Trends
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {fmt(spendData.reduce((s, d) => s + d.housing + d.food + d.transport + d.entertain + d.other, 0))}
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 capitalize">{period}</span>
                  </div>
                </div>
                <PeriodPills period={period} setPeriod={setPeriod} />
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={spendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} className="dark:[&_tspan]:fill-gray-500" />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `$${v/1000}k` : `$${v}`} className="dark:[&_tspan]:fill-gray-500" />
                  <Tooltip content={<CT />} contentStyle={{ backgroundColor: 'transparent', border: 'none' }} cursor={{ fill: 'rgba(0,0,0,0.05)' }} wrapperStyle={{ zIndex: 100 }} />
                  <Legend formatter={(v) => <span className="text-gray-600 dark:text-gray-400 text-xs capitalize">{v}</span>} />
                  <Bar dataKey="housing" name="Housing" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="food" name="Food" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="transport" name="Transport" stackId="a" fill="#10b981" />
                  <Bar dataKey="entertain" name="Entertainment" stackId="a" fill="#f43f5e" />
                  <Bar dataKey="other" name="Other" stackId="a" fill="#8b5cf6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Allocation + Transactions + Goals */}
      {(has('allocation') || has('transactions') || has('goals')) && (
        <div className={`grid gap-5 ${(() => {
          const count = [has('allocation'), has('transactions'), has('goals')].filter(Boolean).length
          if (count === 3) return 'grid-cols-1 lg:grid-cols-3'
          if (count === 2) return 'grid-cols-1 lg:grid-cols-2'
          return 'grid-cols-1'
        })()}`}>
          {has('allocation') && (
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                Portfolio Allocation
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={allocationData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {allocationData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip content={<CT />} contentStyle={{ backgroundColor: 'transparent', border: 'none' }} wrapperStyle={{ zIndex: 100 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {allocationData.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-sm" style={{ background: COLORS[i] }} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${item.value * 1.6}%`, background: COLORS[i] }} />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-8 text-right">{item.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {has('transactions') && (
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">Recent Transactions</div>
                <button 
                  onClick={() => onNavigate('budget')}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  All 
                </button>
              </div>
              <div className="space-y-3">
                {recentTx.map((tx, i) => (
                  <div key={i} className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div className="flex gap-2 items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                        tx.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                        tx.type === 'invest' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                      }`}>
                        {tx.type === 'income' ? <ArrowUp className="w-4 h-4" /> : tx.type === 'invest' ? <PieChartIcon className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-sm text-gray-900 dark:text-gray-200">{tx.desc}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">{tx.cat} · {tx.date}</div>
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${
                      tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' :
                      tx.type === 'invest' ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {tx.amount > 0 ? '+' : ''}{fmtFull(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {has('goals') && (
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">Active Goals</div>
                <button 
                  onClick={() => onNavigate('goals')}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  All 
                </button>
              </div>
              <div className="space-y-4">
                {goals.map((g, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-900 dark:text-gray-200">{g.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{fmt(g.current)} / {fmt(g.target)}</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${g.progress}%`, background: g.color }} />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-500">
                      <span>{g.progress}% complete</span>
                      <span>{fmt(g.target - g.current)} left</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="w-full mt-4 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                onClick={() => onNavigate('goals')}
              >
                + Add New Goal
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}