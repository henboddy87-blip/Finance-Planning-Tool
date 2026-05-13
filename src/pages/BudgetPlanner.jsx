import React, { useState } from 'react'
import { Plus, Trash2, Check, Home, Utensils, Car, HeartPulse, Film, ShoppingBag, Lightbulb, PiggyBank, Package } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import PageHeader from '../components/PageHeader.jsx'
import StatCard from '../components/StatCard.jsx'
import { fmt, fmtFull, COLORS } from '../utils/format.js'
import { useToast } from '../context/AppContext.jsx'

const initialCategories = [
  { id: 1, name: 'Housing', budgeted: 2000, spent: 1850, icon: 'Home', color: '#4c7dc9' },
  { id: 2, name: 'Food & Dining', budgeted: 600, spent: 720, icon: 'Utensils', color: '#c9a84c' },
  { id: 3, name: 'Transportation', budgeted: 400, spent: 310, icon: 'Car', color: '#2a7d4f' },
  { id: 4, name: 'Healthcare', budgeted: 200, spent: 145, icon: 'HeartPulse', color: '#7d4cc9' },
  { id: 5, name: 'Entertainment', budgeted: 250, spent: 310, icon: 'Film', color: '#c94c4c' },
  { id: 6, name: 'Shopping', budgeted: 300, spent: 225, icon: 'ShoppingBag', color: '#c94c7d' },
  { id: 7, name: 'Utilities', budgeted: 180, spent: 162, icon: 'Lightbulb', color: '#4cc9c9' },
  { id: 8, name: 'Savings/Invest', budgeted: 1500, spent: 1500, icon: 'PiggyBank', color: '#7dc94c' },
]

const transactions = [
  { desc: 'Whole Foods Market', cat: 'Food & Dining', date: 'Apr 28', amount: 127.40 },
  { desc: 'Netflix', cat: 'Entertainment', date: 'Apr 27', amount: 15.99 },
  { desc: 'Shell Gas Station', cat: 'Transportation', date: 'Apr 26', amount: 62.00 },
  { desc: 'Mortgage Payment', cat: 'Housing', date: 'Apr 25', amount: 1850.00 },
  { desc: 'CVS Pharmacy', cat: 'Healthcare', date: 'Apr 24', amount: 34.50 },
  { desc: 'Amazon.com', cat: 'Shopping', date: 'Apr 23', amount: 89.99 },
  { desc: 'Electric Bill', cat: 'Utilities', date: 'Apr 22', amount: 92.14 },
  { desc: 'Spotify', cat: 'Entertainment', date: 'Apr 21', amount: 9.99 },
  { desc: 'Restaurant Le Bistro', cat: 'Food & Dining', date: 'Apr 20', amount: 78.60 },
  { desc: 'Gym Membership', cat: 'Healthcare', date: 'Apr 19', amount: 49.00 },
]


// Professional icon components
const Icons = {
  Add: () => <Plus className="w-4 h-4" />,
  Delete: () => <Trash2 className="w-3.5 h-3.5" />,
  Check: () => <Check className="w-3.5 h-3.5" />,
  CategoryIcon: ({ name }) => {
    const iconProps = { className: "w-4 h-4 text-gray-500 dark:text-gray-400" }
    const icons = {
      'Housing': <Home {...iconProps} />,
      'Food & Dining': <Utensils {...iconProps} />,
      'Transportation': <Car {...iconProps} />, 
      'Healthcare': <HeartPulse {...iconProps} />,
      'Entertainment': <Film {...iconProps} />,
      'Shopping': <ShoppingBag {...iconProps} />,
      'Utilities': <Lightbulb {...iconProps} />,
      'Savings/Invest': <PiggyBank {...iconProps} />
    }
    return icons[name] || <Package {...iconProps} />
  }
}

export default function BudgetPlanner() {
  const toast = useToast()
  const [categories, setCategories] = useState(initialCategories)
  const [showAdd, setShowAdd] = useState(false)
  const [newCat, setNewCat] = useState({ name: '', budgeted: '' })
  const [editId, setEditId] = useState(null)
  const [editVal, setEditVal] = useState('')

  const totalBudgeted = categories.reduce((s, c) => s + c.budgeted, 0)
  const totalSpent = categories.reduce((s, c) => s + c.spent, 0)
  const totalIncome = 8400

  const handleAddCat = () => {
    if (!newCat.name || !newCat.budgeted) { 
      toast.error('Validation Error', 'Please enter a category name and budget amount.')
      return 
    }
    setCategories(prev => [...prev, {
      id: Date.now(),
      name: newCat.name,
      budgeted: parseFloat(newCat.budgeted),
      spent: 0,
      icon: 'Package',
      color: COLORS[prev.length % COLORS.length],
    }])
    setNewCat({ name: '', budgeted: '' })
    setShowAdd(false)
    toast.success('Category Added', `"${newCat.name}" budget category has been created.`)
  }

  const handleDelete = (id) => {
    const cat = categories.find(c => c.id === id)
    setCategories(prev => prev.filter(c => c.id !== id))
    toast.info('Category Removed', `"${cat?.name}" has been deleted.`)
  }
  
  const handleEditSave = (id) => {
    const cat = categories.find(c => c.id === id)
    if (!editVal || isNaN(parseFloat(editVal))) { 
      toast.error('Invalid Amount', 'Please enter a valid budget amount.')
      return 
    }
    setCategories(prev => prev.map(c => c.id === id ? { ...c, budgeted: parseFloat(editVal) || c.budgeted } : c))
    setEditId(null)
    toast.success('Budget Updated', `"${cat?.name}" budget set to $${parseFloat(editVal).toLocaleString()}.`)
  }

  const pieData = categories.map(c => ({ name: c.name, value: c.spent, color: c.color }))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 animate-fadeIn">
      <PageHeader
        title="Budget Planner"
        subtitle="Track and manage your monthly spending"
        actions={
          <button 
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
            onClick={() => setShowAdd(true)}
          >
            <Icons.Add />
            Add Category
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Budget" value={fmt(totalBudgeted)} sub="this month" color="emerald" />
        <StatCard 
          label="Total Spent" 
          value={fmt(totalSpent)} 
          sub={`${((totalSpent/totalBudgeted)*100).toFixed(0)}% of budget`} 
          color={totalSpent > totalBudgeted ? 'rose' : 'amber'} 
        />
        <StatCard label="Remaining" value={fmt(totalBudgeted - totalSpent)} sub="left to spend" color="emerald" />
        <StatCard 
          label="Savings Left" 
          value={fmt(totalIncome - totalSpent)} 
          sub={`${(((totalIncome-totalSpent)/totalIncome)*100).toFixed(0)}% savings rate`} 
          color="blue" 
        />
      </div>

      {/* Add category modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full animate-fadeIn shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">New Budget Category</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category Name</label>
                <input 
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="e.g. Subscriptions" 
                  value={newCat.name} 
                  onChange={e => setNewCat(p => ({ ...p, name: e.target.value }))} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Budget ($)</label>
                <input 
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  type="number" 
                  placeholder="200" 
                  value={newCat.budgeted} 
                  onChange={e => setNewCat(p => ({ ...p, budgeted: e.target.value }))} 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all" onClick={handleAddCat}>
                  Add Category
                </button>
                <button className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-all" onClick={() => setShowAdd(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Categories */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">Categories</div>
          <div className="space-y-3">
            {categories.map(cat => {
              const pct = Math.min((cat.spent / cat.budgeted) * 100, 100)
              const over = cat.spent > cat.budgeted
              return (
                <div key={cat.id}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <Icons.CategoryIcon name={cat.name} />
                      <span className="text-sm text-gray-700 dark:text-gray-200">{cat.name}</span>
                      {over && <span className="px-1.5 py-0.5 text-xs rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">Over</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      {editId === cat.id ? (
                        <div className="flex gap-1 items-center">
                          <input 
                            className="w-20 px-2 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-xs text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
                            value={editVal} 
                            onChange={e => setEditVal(e.target.value)} 
                            type="number" 
                          />
                          <button 
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs transition-colors"
                            onClick={() => handleEditSave(cat.id)}
                          >
                            <Icons.Check />
                          </button>
                        </div>
                      ) : (
                        <span 
                          className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                          onClick={() => { setEditId(cat.id); setEditVal(cat.budgeted) }}
                        >
                          {fmtFull(cat.spent)} / {fmt(cat.budgeted)}
                        </span>
                      )}
                      <button 
                        onClick={() => handleDelete(cat.id)} 
                        className="text-gray-400 hover:text-rose-500 dark:text-gray-500 dark:hover:text-rose-400 transition-colors"
                      >
                        <Icons.Delete />
                      </button>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all" 
                      style={{ width: `${pct}%`, background: over ? '#f43f5e' : cat.color }} 
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pie chart */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-3">Spending Breakdown</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} paddingAngle={2} dataKey="value">
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip 
                formatter={(v) => fmt(v)} 
                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8rem' }}
                className="dark:[&_div]:bg-gray-800 dark:[&_div]:border-gray-700"
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-3 max-h-40 overflow-y-auto">
            {categories.map((c, i) => (
              <div key={i} className="flex justify-between text-xs">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-sm" style={{ background: c.color }} />
                  <span className="text-gray-600 dark:text-gray-500">{c.name}</span>
                </div>
                <span className="text-gray-900 dark:text-gray-300">{fmt(c.spent)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">Recent Transactions</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Description</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Category</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Date</th>
                <th className="text-right p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="p-4 text-sm text-gray-700 dark:text-gray-300">{tx.desc}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">{tx.cat}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-500 dark:text-gray-500">{tx.date}</td>
                  <td className="p-4 text-right text-sm font-semibold text-rose-600 dark:text-rose-400">-{fmtFull(tx.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}