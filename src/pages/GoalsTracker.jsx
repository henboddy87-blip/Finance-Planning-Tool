import React, { useState } from 'react'
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts'
import PageHeader from '../components/PageHeader.jsx'
import { fmt } from '../utils/format.js'
import { useToast } from '../context/AppContext.jsx'

const initialGoals = [
  { id: 1, name: 'Emergency Fund', target: 25000, current: 19500, monthly: 500, deadline: '2026-09', icon: '🛡️', color: '#2a7d4f', category: 'Safety' },
  { id: 2, name: 'House Down Payment', target: 80000, current: 33600, monthly: 1200, deadline: '2028-06', icon: '🏠', color: '#c9a84c', category: 'Housing' },
  { id: 3, name: 'Retirement (401k)', target: 1500000, current: 465000, monthly: 1800, deadline: '2045-01', icon: '🏖️', color: '#4c7dc9', category: 'Retirement' },
  { id: 4, name: 'Dream Vacation', target: 8000, current: 3200, monthly: 300, deadline: '2026-12', icon: '✈️', color: '#c94c7d', category: 'Lifestyle' },
  { id: 5, name: "Children's Education", target: 120000, current: 24000, monthly: 600, deadline: '2036-08', icon: '🎓', color: '#7d4cc9', category: 'Education' },
]

function monthsLeft(deadline) {
  const [y, m] = deadline.split('-').map(Number)
  const now = new Date()
  return (y - now.getFullYear()) * 12 + (m - now.getMonth())
}

function projectedDate(goal) {
  const remaining = goal.target - goal.current
  if (goal.monthly <= 0) return '—'
  const months = Math.ceil(remaining / goal.monthly)
  const date = new Date()
  date.setMonth(date.getMonth() + months)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

// Professional icon components
const Icons = {
  Shield: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Home: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Retirement: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Vacation: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Education: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Add: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Contribute: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>,
  Remove: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Check: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  Target: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Calendar: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Monthly: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  CategoryIcon: ({ category }) => {
    const icons = {
      'Safety': <Icons.Shield />,
      'Housing': <Icons.Home />,
      'Retirement': <Icons.Retirement />,
      'Lifestyle': <Icons.Vacation />,
      'Education': <Icons.Education />,
      'Travel': <Icons.Vacation />,
      'Vehicle': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      'Business': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      'Other': <Icons.Target />
    }
    return <div className="text-gray-600 dark:text-gray-200">{icons[category] || <Icons.Target />}</div>
  }
}

export default function GoalsTracker() {
  const toast = useToast()
  const [goals, setGoals] = useState(initialGoals)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', target: '', current: '', monthly: '', deadline: '', category: 'Savings', icon: '🎯' })
  const [selected, setSelected] = useState(null)
  const [contribution, setContribution] = useState('')

  const handleAdd = () => {
    if (!form.name || !form.target) { toast.error('Validation Error', 'Please enter a goal name and target amount.'); return }
    setGoals(prev => [...prev, {
      id: Date.now(),
      name: form.name,
      target: parseFloat(form.target) || 0,
      current: parseFloat(form.current) || 0,
      monthly: parseFloat(form.monthly) || 0,
      deadline: form.deadline || '2030-01',
      icon: form.icon,
      color: ['#2a7d4f','#c9a84c','#4c7dc9','#c94c7d','#7d4cc9'][prev.length % 5],
      category: form.category,
    }])
    setForm({ name: '', target: '', current: '', monthly: '', deadline: '', category: 'Savings', icon: '🎯' })
    setShowAdd(false)
    toast.success('Goal Created', `"${form.name}" has been added to your goals!`)
  }

  const handleContribute = () => {
    const amt = parseFloat(contribution)
    if (!amt || amt <= 0) { toast.error('Invalid Amount', 'Please enter a valid contribution amount.'); return }
    if (!selected) return
    const goal = goals.find(g => g.id === selected.id)
    const newCurrent = Math.min((goal?.current || 0) + amt, goal?.target || amt)
    setGoals(prev => prev.map(g => g.id === selected.id ? { ...g, current: newCurrent } : g))
    setContribution('')
    setSelected(null)
    const finished = newCurrent >= (goal?.target || Infinity)
    if (finished) toast.success('🎉 Goal Achieved!', `Congratulations! You reached your "${goal?.name}" goal!`)
    else toast.success('Contribution Added', `$${amt.toLocaleString()} added to "${goal?.name}".`)
  }

  const totalSaved = goals.reduce((s, g) => s + g.current, 0)
  const totalTarget = goals.reduce((s, g) => s + g.target, 0)
  const completed = goals.filter(g => g.current >= g.target).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 animate-fadeIn">
      <PageHeader
        title="Goals Tracker"
        subtitle="Set, track, and achieve your financial milestones"
        actions={
          <button 
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
            onClick={() => setShowAdd(true)}
          >
            <Icons.Add />
            New Goal
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-2">Active Goals</div>
          <div className="text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400">{goals.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-2">Total Saved</div>
          <div className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{fmt(totalSaved)}</div>
        </div>
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-2">Total Target</div>
          <div className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-400">{fmt(totalTarget)}</div>
        </div>
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-2">Completed</div>
          <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">{completed}</div>
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full animate-fadeIn shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create New Goal</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Goal Name</label>
                <input 
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="e.g. Emergency Fund" 
                  value={form.name} 
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Amount ($)</label>
                <input 
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  type="number" 
                  placeholder="10000" 
                  value={form.target} 
                  onChange={e => setForm(p => ({ ...p, target: e.target.value }))} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Savings ($)</label>
                <input 
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  type="number" 
                  placeholder="0" 
                  value={form.current} 
                  onChange={e => setForm(p => ({ ...p, current: e.target.value }))} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Contribution ($)</label>
                <input 
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  type="number" 
                  placeholder="200" 
                  value={form.monthly} 
                  onChange={e => setForm(p => ({ ...p, monthly: e.target.value }))} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Date</label>
                <input 
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  type="month" 
                  value={form.deadline} 
                  onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select 
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  value={form.category} 
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                >
                  {['Safety','Housing','Retirement','Lifestyle','Education','Travel','Vehicle','Business','Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all" onClick={handleAdd}>
                Create Goal
              </button>
              <button className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-all" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contribution Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full animate-fadeIn shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Add Contribution</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{selected.name} · {fmt(selected.current)} saved</p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount ($)</label>
            <input 
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors mb-4"
              type="number" 
              placeholder="500" 
              value={contribution} 
              onChange={e => setContribution(e.target.value)} 
            />
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2" onClick={handleContribute}>
                <Icons.Contribute />
                Add Funds
              </button>
              <button className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-all" onClick={() => setSelected(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map(goal => {
          const pct = Math.min((goal.current / goal.target) * 100, 100)
          const ml = monthsLeft(goal.deadline)
          const done = goal.current >= goal.target
          const remaining = goal.target - goal.current

          return (
            <div key={goal.id} className="relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:scale-[1.02] duration-200 overflow-hidden">
              <div 
                className="absolute top-0 right-0 w-20 h-20 pointer-events-none opacity-30 dark:opacity-20"
                style={{ background: `radial-gradient(circle at top right, ${goal.color}, transparent 70%)` }}
              />
              
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center">
                    {goal.category === 'Safety' && <Icons.Shield />}
                    {goal.category === 'Housing' && <Icons.Home />}
                    {goal.category === 'Retirement' && <Icons.Retirement />}
                    {goal.category === 'Lifestyle' && <Icons.Vacation />}
                    {goal.category === 'Education' && <Icons.Education />}
                    {goal.category === 'Travel' && <Icons.Vacation />}
                    {!['Safety','Housing','Retirement','Lifestyle','Education','Travel'].includes(goal.category) && <Icons.Target />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">{goal.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">{goal.category}</div>
                  </div>
                </div>
                {done ? (
                  <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <Icons.Check /> Done
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">{ml}mo left</span>
                )}
              </div>

              <div className="flex justify-between items-end mb-1">
                <span className="text-2xl font-bold" style={{ color: goal.color }}>{fmt(goal.current)}</span>
                <span className="text-xs text-gray-500 dark:text-gray-500">of {fmt(goal.target)}</span>
              </div>

              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: goal.color }} />
              </div>
              
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-500 mb-3">
                <span>{pct.toFixed(0)}% complete</span>
                <span>{fmt(remaining)} remaining</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500 mb-1">
                    <Icons.Monthly />
                    <span>Monthly</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">{fmt(goal.monthly)}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500 mb-1">
                    <Icons.Calendar />
                    <span>Projected</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">{projectedDate(goal)}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  className="flex-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1"
                  onClick={() => setSelected(goal)}
                >
                  <Icons.Contribute />
                  Contribute
                </button>
                <button 
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1"
                  onClick={() => { 
                    const g = goals.find(x=>x.id===goal.id)
                    setGoals(prev => prev.filter(g => g.id !== goal.id))
                    toast.info('Goal Removed', `"${g?.name}" has been removed.`)
                  }}
                >
                  <Icons.Remove />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}