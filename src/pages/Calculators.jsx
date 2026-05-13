import React, { useState, useMemo } from 'react'
import { Home, Calculator, PiggyBank, TrendingUp } from 'lucide-react'
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import PageHeader from '../components/PageHeader.jsx'
import { fmt, fmtFull, COLORS } from '../utils/format.js'

// --- Utility Functions for Calculators ---

function calcLoanAmortization(principal, rate, years) {
  const r = rate / 100 / 12
  const n = years * 12
  const p = principal
  const payment = r === 0 ? p / n : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  
  let balance = p
  const data = []
  let totalInterest = 0

  for (let i = 0; i <= n; i++) {
    data.push({ month: i, balance: Math.max(0, Math.round(balance)) })
    if (i < n) {
      const interest = balance * r
      const principalPaid = payment - interest
      totalInterest += interest
      balance -= principalPaid
    }
  }

  return { payment, totalInterest, data }
}

function calcSavingsGrowth(initial, monthly, rate, years) {
  const r = rate / 100 / 12
  const n = years * 12
  let total = initial
  let principal = initial
  const data = []

  for (let i = 0; i <= n; i++) {
    if (i % 12 === 0) {
      data.push({ year: i / 12, total: Math.round(total), principal: Math.round(principal) })
    }
    if (i < n) {
      total = total * (1 + r) + monthly
      principal += monthly
    }
  }

  return { finalAmount: total, totalInvested: principal, totalInterest: total - principal, data }
}


// Professional Icons
const Icons = {
  Loan: () => <Home className="w-5 h-5" />,
  EMI: () => <Calculator className="w-5 h-5" />,
  Savings: () => <PiggyBank className="w-5 h-5" />,
  Investment: () => <TrendingUp className="w-5 h-5" />,
}

export default function Calculators() {
  const [tab, setTab] = useState('loan')

  // Shared state for all calculators to persist user input when switching tabs
  const [loanState, setLoanState] = useState({ amount: 250000, rate: 6.5, years: 30 })
  const [emiState, setEmiState] = useState({ amount: 25000, rate: 8.5, years: 5 })
  const [savingsState, setSavingsState] = useState({ initial: 5000, monthly: 500, rate: 4.0, years: 10 })
  const [investState, setInvestState] = useState({ initial: 10000, monthly: 1000, rate: 8.0, years: 20 })

  const TABS = [
    { id: 'loan', label: 'Loan Calculator', icon: <Icons.Loan /> },
    { id: 'emi', label: 'EMI Calculator', icon: <Icons.EMI /> },
    { id: 'savings', label: 'Savings Growth', icon: <Icons.Savings /> },
    { id: 'investment', label: 'Investment Return', icon: <Icons.Investment /> },
  ]

  // Computations
  const loanResult = useMemo(() => calcLoanAmortization(loanState.amount || 0, loanState.rate || 0, loanState.years || 1), [loanState])
  const emiResult = useMemo(() => calcLoanAmortization(emiState.amount || 0, emiState.rate || 0, emiState.years || 1), [emiState])
  const savingsResult = useMemo(() => calcSavingsGrowth(savingsState.initial || 0, savingsState.monthly || 0, savingsState.rate || 0, savingsState.years || 1), [savingsState])
  const investResult = useMemo(() => calcSavingsGrowth(investState.initial || 0, investState.monthly || 0, investState.rate || 0, investState.years || 1), [investState])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 animate-fadeIn">
      <PageHeader
        title="Financial Calculators"
        subtitle="Plan your loans, investments, and savings with precision"
      />

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              tab === t.id 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Panel (Left side) */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            
            {tab === 'loan' && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Loan Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loan Amount ($)</label>
                    <input type="number" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" value={loanState.amount} onChange={e => setLoanState(p => ({ ...p, amount: parseFloat(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interest Rate (%)</label>
                    <input type="number" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" value={loanState.rate} onChange={e => setLoanState(p => ({ ...p, rate: parseFloat(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loan Term (Years)</label>
                    <input type="number" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" value={loanState.years} onChange={e => setLoanState(p => ({ ...p, years: parseFloat(e.target.value) }))} />
                  </div>
                </div>
              </>
            )}

            {tab === 'emi' && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">EMI Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Principal Amount ($)</label>
                    <input type="number" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" value={emiState.amount} onChange={e => setEmiState(p => ({ ...p, amount: parseFloat(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interest Rate (%)</label>
                    <input type="number" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" value={emiState.rate} onChange={e => setEmiState(p => ({ ...p, rate: parseFloat(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tenure (Years)</label>
                    <input type="number" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" value={emiState.years} onChange={e => setEmiState(p => ({ ...p, years: parseFloat(e.target.value) }))} />
                  </div>
                </div>
              </>
            )}

            {tab === 'savings' && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Savings Growth</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Initial Deposit ($)</label>
                    <input type="number" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" value={savingsState.initial} onChange={e => setSavingsState(p => ({ ...p, initial: parseFloat(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Contribution ($)</label>
                    <input type="number" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" value={savingsState.monthly} onChange={e => setSavingsState(p => ({ ...p, monthly: parseFloat(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Annual Interest Rate (%)</label>
                    <input type="number" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" value={savingsState.rate} onChange={e => setSavingsState(p => ({ ...p, rate: parseFloat(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Period (Years)</label>
                    <input type="number" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" value={savingsState.years} onChange={e => setSavingsState(p => ({ ...p, years: parseFloat(e.target.value) }))} />
                  </div>
                </div>
              </>
            )}

            {tab === 'investment' && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Investment Return</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Initial Investment ($)</label>
                    <input type="number" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" value={investState.initial} onChange={e => setInvestState(p => ({ ...p, initial: parseFloat(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Investment ($)</label>
                    <input type="number" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" value={investState.monthly} onChange={e => setInvestState(p => ({ ...p, monthly: parseFloat(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Return (CAGR %)</label>
                    <input type="number" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" value={investState.rate} onChange={e => setInvestState(p => ({ ...p, rate: parseFloat(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Horizon (Years)</label>
                    <input type="number" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" value={investState.years} onChange={e => setInvestState(p => ({ ...p, years: parseFloat(e.target.value) }))} />
                  </div>
                </div>
              </>
            )}

          </div>
        </div>

        {/* Results Panel (Right side) */}
        <div className="lg:col-span-2 space-y-6">
          
          {(tab === 'loan' || tab === 'emi') && (() => {
            const result = tab === 'loan' ? loanResult : emiResult
            const state = tab === 'loan' ? loanState : emiState
            const pieData = [
              { name: 'Principal', value: state.amount || 0, color: '#10b981' },
              { name: 'Total Interest', value: result.totalInterest || 0, color: '#f59e0b' },
            ]
            
            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-1">Monthly Payment</div>
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{fmtFull(result.payment || 0)}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-1">Total Interest</div>
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{fmtFull(result.totalInterest || 0)}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-1">Total Payment</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{fmtFull((state.amount || 0) + (result.totalInterest || 0))}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Payment Breakdown</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                          {pieData.map((e,i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip formatter={v => fmt(v)} contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8rem' }} className="dark:[&_div]:bg-gray-800 dark:[&_div]:border-gray-700" />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-2">
                      {pieData.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="w-3 h-3 rounded-sm" style={{ background: d.color }} />
                          <span className="text-gray-600 dark:text-gray-400">{d.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Amortization Schedule</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={result.data}>
                        <defs>
                          <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                        <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} className="dark:[&_tspan]:fill-gray-500" />
                        <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} className="dark:[&_tspan]:fill-gray-500" />
                        <Tooltip formatter={(v) => fmt(v)} labelFormatter={v => `Month ${v}`} contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8rem' }} className="dark:[&_div]:bg-gray-800 dark:[&_div]:border-gray-700" />
                        <Area type="monotone" dataKey="balance" name="Remaining Balance" stroke="#10b981" strokeWidth={2} fill="url(#balGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )
          })()}

          {(tab === 'savings' || tab === 'investment') && (() => {
            const result = tab === 'savings' ? savingsResult : investResult
            const title = tab === 'savings' ? 'Savings' : 'Investment'
            
            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-1">Final Balance</div>
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{fmtFull(result.finalAmount || 0)}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-1">Total {title}</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{fmtFull(result.totalInvested || 0)}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-1">Total Interest Earned</div>
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{fmtFull(result.totalInterest || 0)}</div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Wealth Projection</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={result.data}>
                      <defs>
                        <linearGradient id="totGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="prinGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                      <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} className="dark:[&_tspan]:fill-gray-500" />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} className="dark:[&_tspan]:fill-gray-500" />
                      <Tooltip formatter={(v) => fmt(v)} labelFormatter={v => `Year ${v}`} contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8rem' }} className="dark:[&_div]:bg-gray-800 dark:[&_div]:border-gray-700" />
                      <Area type="monotone" dataKey="total" name="Total Balance" stroke="#10b981" strokeWidth={2} fill="url(#totGrad)" />
                      <Area type="monotone" dataKey="principal" name="Total Deposited" stroke="#3b82f6" strokeWidth={2} fill="url(#prinGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            )
          })()}

        </div>
      </div>
    </div>
  )
}
