import React, { useState } from 'react'
import { Plus, Trash2, Flame, Snowflake, Calendar } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import PageHeader from '../components/PageHeader.jsx'
import StatCard from '../components/StatCard.jsx'
import { fmt, fmtFull } from '../utils/format.js'
import { useToast } from '../context/AppContext.jsx'

const initialDebts = [
  { id: 1, name: 'Home Mortgage', type: 'Mortgage', balance: 285000, rate: 3.75, minPayment: 1450, payment: 1850, color: '#4c7dc9' },
  { id: 2, name: 'Car Loan', type: 'Auto', balance: 18500, rate: 5.9, minPayment: 385, payment: 450, color: '#c9a84c' },
  { id: 3, name: 'Student Loan', type: 'Student', balance: 22000, rate: 4.5, minPayment: 225, payment: 350, color: '#7d4cc9' },
  { id: 4, name: 'Credit Card (Visa)', type: 'Credit Card', balance: 4200, rate: 22.99, minPayment: 105, payment: 400, color: '#c94c4c' },
  { id: 5, name: 'Personal Loan', type: 'Personal', balance: 6000, rate: 9.5, minPayment: 145, payment: 200, color: '#c94c7d' },
]

function payoffMonths(balance, rate, payment) {
  if (payment <= 0 || balance <= 0) return Infinity
  const r = rate / 100 / 12
  if (r === 0) return Math.ceil(balance / payment)
  return Math.ceil(-Math.log(1 - (r * balance) / payment) / Math.log(1 + r))
}

function generatePayoff(balance, rate, payment, months = 60) {
  const data = []
  let b = balance
  const r = rate / 100 / 12
  for (let i = 0; i <= Math.min(months, payoffMonths(balance, rate, payment)); i++) {
    data.push({ month: i, balance: Math.max(0, Math.round(b)) })
    const interest = b * r
    const principal = payment - interest
    b = b - principal
    if (b <= 0) break
  }
  return data
}



const Icons = {
  Add: () => <Plus className="w-4 h-4" />,
  Delete: () => <Trash2 className="w-3.5 h-3.5" />,
  Fire: () => <Flame className="w-4 h-4" />,
  Snowflake: () => <Snowflake className="w-4 h-4" />,
  Calendar: () => <Calendar className="w-4 h-4" />,
}

export default function DebtManager() {
  const toast = useToast()
  const [debts, setDebts] = useState(initialDebts)
  const [showAdd, setShowAdd] = useState(false)
  const [strategy, setStrategy] = useState('avalanche')
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ name: '', type: 'Credit Card', balance: '', rate: '', minPayment: '', payment: '' })

  const totalDebt = debts.reduce((s, d) => s + d.balance, 0)
  const totalPayment = debts.reduce((s, d) => s + d.payment, 0)
  const totalMinPayment = debts.reduce((s, d) => s + d.minPayment, 0)
  const totalInterest = debts.reduce((s, d) => s + (d.balance * d.rate / 100 / 12), 0)

  const handleAdd = () => {
    if (!form.name || !form.balance) return
    setDebts(prev => [...prev, {
      id: Date.now(),
      name: form.name,
      type: form.type,
      balance: parseFloat(form.balance) || 0,
      rate: parseFloat(form.rate) || 0,
      minPayment: parseFloat(form.minPayment) || 0,
      payment: parseFloat(form.payment) || parseFloat(form.minPayment) || 0,
      color: ['#4c7dc9','#c9a84c','#7d4cc9','#c94c4c','#c94c7d','#2a7d4f'][prev.length % 6],
    }])
    setForm({ name: '', type: 'Credit Card', balance: '', rate: '', minPayment: '', payment: '' })
    setShowAdd(false)
    toast.success('Debt Added', `Successfully added ${form.name}`)
  }

  const strategyOrder = strategy === 'avalanche'
    ? [...debts].sort((a, b) => b.rate - a.rate)
    : [...debts].sort((a, b) => a.balance - b.balance)

  const selectedDebt = selected ? debts.find(d => d.id === selected) : debts[0]
  const payoffData = selectedDebt ? generatePayoff(selectedDebt.balance, selectedDebt.rate, selectedDebt.payment) : []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 animate-fadeIn">
      <PageHeader
        title="Debt Manager"
        subtitle="Track and accelerate your debt payoff journey"
        actions={
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2" onClick={() => setShowAdd(true)}>
            <Icons.Add />
            Add Debt
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Debt" value={fmt(totalDebt)} sub="all accounts" color="rose" />
        <StatCard label="Monthly Payment" value={fmt(totalPayment)} sub={`min: ${fmt(totalMinPayment)}`} color="amber" />
        <StatCard label="Monthly Interest" value={fmtFull(totalInterest)} sub="total interest" color="rose" />
        <StatCard label="Extra Payment" value={fmt(totalPayment - totalMinPayment)} sub="above minimum" color="emerald" />
      </div>

      {/* Add Debt Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full animate-fadeIn shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add Debt Account</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Name</label>
                <input 
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Ex. Banking" 
                  value={form.name} 
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Debt Type</label>
                <select 
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  value={form.type} 
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                >
                  {['Credit Card','Personal','Auto','Student','Mortgage','Medical','Other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Balance ($)</label>
                <input 
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  type="number" 
                  placeholder="5000" 
                  value={form.balance} 
                  onChange={e => setForm(p => ({ ...p, balance: e.target.value }))} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interest Rate (%)</label>
                <input 
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  type="number" 
                  placeholder="18.99" 
                  step="0.01" 
                  value={form.rate} 
                  onChange={e => setForm(p => ({ ...p, rate: e.target.value }))} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min. Payment ($)</label>
                <input 
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  type="number" 
                  placeholder="100" 
                  value={form.minPayment} 
                  onChange={e => setForm(p => ({ ...p, minPayment: e.target.value }))} 
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Payment ($)</label>
                <input 
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  type="number" 
                  placeholder="200" 
                  value={form.payment} 
                  onChange={e => setForm(p => ({ ...p, payment: e.target.value }))} 
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all" onClick={handleAdd}>
                Add Debt
              </button>
              <button className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-all" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Strategy */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">Payoff Strategy</div>
            <div className="flex bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
              {['avalanche', 'snowball'].map(s => (
                <button 
                  key={s} 
                  onClick={() => setStrategy(s)} 
                  className={`px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                    strategy === s 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className={`text-xs text-gray-600 dark:text-gray-400 mb-4 p-2 rounded-lg ${
            strategy === 'avalanche' 
              ? 'bg-rose-50 dark:bg-rose-900/20 border-l-3 border-rose-400' 
              : 'bg-blue-50 dark:bg-blue-900/20 border-l-3 border-blue-400'
          }`}>
            {strategy === 'avalanche' ? (
              <div className="flex items-center gap-2">
                <Icons.Fire /> Avalanche: Pay highest interest first — saves the most money overall
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Icons.Snowflake /> Snowball: Pay smallest balance first — builds motivation and momentum
              </div>
            )}
          </div>
          <div className="space-y-3">
            {strategyOrder.map((debt, idx) => {
              const months = payoffMonths(debt.balance, debt.rate, debt.payment)
              return (
                <div 
                  key={debt.id} 
                  className={`p-3 rounded-lg cursor-pointer transition-all border ${
                    selected === debt.id 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500' 
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`} 
                  onClick={() => setSelected(debt.id)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: debt.color }}
                      >
                        {idx + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{debt.name}</span>
                      <span className="px-1.5 py-0.5 text-xs rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">{debt.rate}%</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{months === Infinity ? '∞' : months}mo</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-500 mb-1">
                    <span>{fmt(debt.balance)} remaining</span>
                    <span>{fmt(debt.payment)}/mo</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, (1 - debt.balance / (debt.balance * 1.2)) * 100 + 15)}%`, background: debt.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Payoff chart */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-1">Payoff Projection</div>
          {selectedDebt && (
            <div className="text-xs text-gray-500 dark:text-gray-500 mb-4">{selectedDebt.name}</div>
          )}
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={payoffData}>
              <defs>
                <linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: 'Months', position: 'insideBottom', fill: '#6b7280', fontSize: 10, dy: 5 }} className="dark:[&_tspan]:fill-gray-500" />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} className="dark:[&_tspan]:fill-gray-500" />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8rem' }} formatter={(v) => fmt(v)} className="dark:[&_div]:bg-gray-800 dark:[&_div]:border-gray-700" />
              <Area type="monotone" dataKey="balance" name="Balance" stroke="#f43f5e" strokeWidth={2} fill="url(#debtGrad)" />
            </AreaChart>
          </ResponsiveContainer>
          {selectedDebt && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-500 mb-1">Monthly Interest</div>
                <div className="text-sm font-semibold text-rose-600 dark:text-rose-400">{fmtFull(selectedDebt.balance * selectedDebt.rate / 100 / 12)}</div>
              </div>
              <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-500 mb-1 flex items-center gap-1">
                  <Icons.Calendar /> Payoff Date
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                  {(() => {
                    const m = payoffMonths(selectedDebt.balance, selectedDebt.rate, selectedDebt.payment)
                    if (m === Infinity) return '∞'
                    const d = new Date(); d.setMonth(d.getMonth() + m)
                    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Debt table */}
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">All Accounts</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Account</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Type</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Balance</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Rate</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Min Pay</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Your Pay</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Payoff</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {debts.map(d => {
                const months = payoffMonths(d.balance, d.rate, d.payment)
                const payoffDate = months === Infinity ? '∞' : (() => {
                  const date = new Date(); date.setMonth(date.getMonth() + months)
                  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                })()
                return (
                  <tr key={d.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-900 dark:text-gray-200">{d.name}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">{d.type}</span>
                    </td>
                    <td className="p-4 text-sm font-semibold text-rose-600 dark:text-rose-400">{fmt(d.balance)}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">{d.rate}%</span>
                    </td>
                    <td className="p-4 text-sm text-gray-500 dark:text-gray-500">{fmt(d.minPayment)}</td>
                    <td className="p-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">{fmt(d.payment)}</td>
                    <td className="p-4 text-sm text-gray-500 dark:text-gray-500">{payoffDate}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => { setDebts(prev => prev.filter(x => x.id !== d.id)); toast.success('Deleted', 'Debt removed.') }} 
                        className="text-gray-400 hover:text-rose-500 dark:text-gray-500 dark:hover:text-rose-400 transition-colors"
                      >
                        <Icons.Delete />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}