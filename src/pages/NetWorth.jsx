import React, { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { ArrowUp, X } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import { fmt } from '../utils/format.js'
import { useToast } from '../context/AppContext.jsx'

const initialAssets = [
  { id: 1, name: 'Primary Home', category: 'Real Estate', value: 520000, type: 'asset' },
  { id: 2, name: '401(k)', category: 'Retirement', value: 465000, type: 'asset' },
  { id: 3, name: 'Brokerage Account', category: 'Investments', value: 122000, type: 'asset' },
  { id: 4, name: 'Emergency Fund', category: 'Cash', value: 19500, type: 'asset' },
  { id: 5, name: 'Checking Account', category: 'Cash', value: 8200, type: 'asset' },
  { id: 6, name: 'Savings Account', category: 'Cash', value: 12000, type: 'asset' },
  { id: 7, name: 'Vehicle', category: 'Personal', value: 22000, type: 'asset' },
  { id: 8, name: 'HSA', category: 'Retirement', value: 14500, type: 'asset' },
]

const initialLiabilities = [
  { id: 1, name: 'Home Mortgage', category: 'Real Estate', value: 285000, type: 'liability' },
  { id: 2, name: 'Car Loan', category: 'Auto', value: 18500, type: 'liability' },
  { id: 3, name: 'Student Loans', category: 'Education', value: 22000, type: 'liability' },
  { id: 4, name: 'Credit Cards', category: 'Revolving', value: 4200, type: 'liability' },
  { id: 5, name: 'Personal Loan', category: 'Other', value: 6000, type: 'liability' },
]

const historyData = [
  { date: 'Apr\'25', networth: 128000 },
  { date: 'Jul\'25', networth: 136000 },
  { date: 'Oct\'25', networth: 142000 },
  { date: 'Jan\'26', networth: 151000 },
  { date: 'Apr\'26', networth: 164800 },
]

const assetCats = ['Real Estate','Retirement','Investments','Cash','Personal']
const liabCats = ['Real Estate','Auto','Education','Revolving','Other']

export default function NetWorth() {
  const toast = useToast()
  const [assets, setAssets] = useState(initialAssets)
  const [liabilities, setLiabilities] = useState(initialLiabilities)
  const [showAdd, setShowAdd] = useState(null) // 'asset' | 'liability'
  const [form, setForm] = useState({ name: '', category: '', value: '' })

  const totalAssets = assets.reduce((s, a) => s + a.value, 0)
  const totalLiabilities = liabilities.reduce((s, l) => s + l.value, 0)
  const netWorth = totalAssets - totalLiabilities
  const debtToAsset = totalLiabilities / totalAssets

  const assetsByCategory = assetCats.map(cat => ({
    name: cat,
    value: assets.filter(a => a.category === cat).reduce((s, a) => s + a.value, 0),
  })).filter(c => c.value > 0)

  const handleAdd = () => {
    if (!form.name || !form.value) return
    const item = { id: Date.now(), name: form.name, category: form.category, value: parseFloat(form.value) || 0, type: showAdd }
    if (showAdd === 'asset') {
      setAssets(prev => [...prev, item])
      toast.success('Asset Added', `Successfully added ${item.name}`)
    } else {
      setLiabilities(prev => [...prev, item])
      toast.success('Liability Added', `Successfully added ${item.name}`)
    }
    setForm({ name: '', category: '', value: '' })
    setShowAdd(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 animate-fadeIn">
      <PageHeader
        title="Net Worth"
        subtitle="Your complete financial balance sheet"
        actions={
          <div className="flex gap-3">
            <button 
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-emerald-500/20"
              onClick={() => { setShowAdd('asset'); setForm({ name: '', category: assetCats[0], value: '' }) }}
            >
              + Asset
            </button>
            <button 
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-all duration-200 border border-gray-300 dark:border-gray-600"
              onClick={() => { setShowAdd('liability'); setForm({ name: '', category: liabCats[0], value: '' }) }}
            >
              + Liability
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/5 backdrop-blur-sm rounded-xl border border-emerald-200 dark:border-emerald-500/30 p-5 transition-all hover:scale-[1.02] duration-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-gray-400 mb-2">Net Worth</div>
          <div className="text-2xl md:text-3xl font-bold text-emerald-700 dark:text-emerald-400">{fmt(netWorth)}</div>
          <div className="text-xs text-emerald-600/70 dark:text-gray-500 mt-2 flex items-center gap-1"><ArrowUp className="w-3 h-3" /> {fmt(36800)} this year</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-all hover:scale-[1.02] duration-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Total Assets</div>
          <div className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{fmt(totalAssets)}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-all hover:scale-[1.02] duration-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Total Liabilities</div>
          <div className="text-2xl md:text-3xl font-bold text-rose-600 dark:text-rose-400">{fmt(totalLiabilities)}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-all hover:scale-[1.02] duration-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Debt-to-Asset</div>
          <div className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-400">{(debtToAsset * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full animate-fadeIn shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Add {showAdd === 'asset' ? 'Asset' : 'Liability'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input 
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder={showAdd === 'asset' ? 'e.g. Savings Account' : 'e.g. Car Loan'} 
                  value={form.name} 
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select 
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  value={form.category} 
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                >
                  {(showAdd === 'asset' ? assetCats : liabCats).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Value ($)</label>
                <input 
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  type="number" 
                  placeholder="10000" 
                  value={form.value} 
                  onChange={e => setForm(p => ({ ...p, value: e.target.value }))} 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all" onClick={handleAdd}>
                  Add
                </button>
                <button className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-all" onClick={() => setShowAdd(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">Net Worth History</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="nwHistGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} className="dark:[&_tspan]:fill-gray-500" />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} className="dark:[&_tspan]:fill-gray-500" />
              <Tooltip 
                contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8rem' }}
                formatter={(v) => fmt(v)} 
                className="dark:[&_div]:bg-gray-800 dark:[&_div]:border-gray-700"
              />
              <Area type="monotone" dataKey="networth" name="Net Worth" stroke="#10b981" strokeWidth={2.5} fill="url(#nwHistGrad)" dot={{ fill: '#10b981', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">Assets by Category</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={assetsByCategory} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} className="dark:[&_tspan]:fill-gray-500" />
              <YAxis dataKey="name" type="category" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} width={90} className="dark:[&_tspan]:fill-gray-500" />
              <Tooltip 
                contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8rem' }}
                formatter={(v) => fmt(v)} 
                className="dark:[&_div]:bg-gray-800 dark:[&_div]:border-gray-700"
              />
              <Bar dataKey="value" name="Value" fill="#10b981" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Assets Table */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">Assets</div>
            <div className="font-semibold text-emerald-600 dark:text-emerald-400">{fmt(totalAssets)}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="text-right p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
                  <th className="p-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {assets.map(a => (
                  <tr key={a.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-900 dark:text-gray-200">{a.name}</td>
                    <td className="p-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                        {a.category}
                      </span>
                    </td>
                    <td className="p-4 text-right text-sm font-semibold text-emerald-600 dark:text-emerald-400">{fmt(a.value)}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => { setAssets(prev => prev.filter(x => x.id !== a.id)); toast.success('Deleted', 'Asset removed.') }} 
                        className="text-gray-400 hover:text-rose-500 dark:text-gray-500 dark:hover:text-rose-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Liabilities Table */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">Liabilities</div>
            <div className="font-semibold text-rose-600 dark:text-rose-400">{fmt(totalLiabilities)}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="text-right p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</th>
                  <th className="p-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {liabilities.map(l => (
                  <tr key={l.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-900 dark:text-gray-200">{l.name}</td>
                    <td className="p-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">
                        {l.category}
                      </span>
                    </td>
                    <td className="p-4 text-right text-sm font-semibold text-rose-600 dark:text-rose-400">{fmt(l.value)}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => { setLiabilities(prev => prev.filter(x => x.id !== l.id)); toast.success('Deleted', 'Liability removed.') }} 
                        className="text-gray-400 hover:text-rose-500 dark:text-gray-500 dark:hover:text-rose-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}