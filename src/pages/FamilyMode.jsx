import React, { useState } from 'react'
import { UserPlus, Plus, Edit2, Trash2, BadgeDollarSign, X } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import PageHeader from '../components/PageHeader.jsx'
import { fmt, fmtFull, COLORS } from '../utils/format.js'
import { useToast, useUser, useLocalStorage } from '../context/AppContext.jsx'

/* ── Data ─────────────────────────────────────────────── */
const INCOME_SOURCES = ['Salary','Freelance','Passive','Other']
const BUDGET_CATEGORIES = ['Housing','Food','Transport','Entertainment','Education','Health','Savings','Other']

const initialMembers = []

const ROLES = ['Admin','Member','Viewer']
const ROLE_DESC = {
  Admin:  'Full access — can view, edit, invite and manage all members',
  Member: 'Can view all data and add/edit transactions',
  Viewer: 'Read-only access — cannot make any changes',
}

const sharedBudgets = []
const expenseSplits = []




// Professional icon components
const Icons = {
  Invite: () => <UserPlus className="w-4 h-4" />,
  Plus: () => <Plus className="w-4 h-4" />,
  Edit: () => <Edit2 className="w-3.5 h-3.5" />,
  Remove: () => <Trash2 className="w-3.5 h-3.5" />,
  Settle: () => <BadgeDollarSign className="w-3.5 h-3.5" />,
  Close: () => <X className="w-4 h-4" />,
}

/* Custom Tooltip Component */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  // Filter out duplicates
  const uniquePayload = payload.filter((item, index, self) => 
    index === self.findIndex((t) => t.name === item.name)
  )

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 shadow-2xl ring-1 ring-black/5 dark:ring-white/5 animate-scaleIn min-w-[140px]">
      {label && <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 border-b border-gray-100 dark:border-gray-800/50 pb-1.5">{label}</div>}
      <div className="space-y-2">
        {uniquePayload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shadow-sm" style={{ background: p.color || p.payload?.fill || '#555' }} />
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{p.name}</span>
            </div>
            <span className="text-xs text-gray-900 dark:text-gray-100 font-bold">
              {fmt(p.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function FamilyMode() {
  const toast = useToast()
  const { user } = useUser()
  const currentUserFirstName = user?.name?.split(' ')[0] || 'Alex'
  
  // Persistence for Family Mode data
  const [members, setMembers] = useLocalStorage('fm_members', [])
  const [budgets, setBudgets] = useLocalStorage('fm_budgets', [])
  const [splits, setSplits]   = useLocalStorage('fm_splits', [])

  // Initialize with current user if members is empty
  React.useEffect(() => {
    if (members.length === 0 && user) {
      setMembers([{
        id: 'self',
        name: user.name,
        role: 'Admin',
        email: user.email,
        avatar: user.initials || 'AJ',
        color: '#10b981',
        income: 5000,
        incomeSources: { Salary: 5000, Freelance: 0, Passive: 0, Other: 0 },
        expenses: 0,
        budgetShare: 0,
        joined: 'Jan 2024',
        lastActive: 'Just now',
        permissions: { view: true, edit: true, invite: true, delete: true }
      }])
    }
  }, [user, members.length, setMembers])

  const [tab, setTab]             = useState('overview')
  const [showInvite, setInvite]   = useState(false)
  const [showPerm, setPerm]       = useState(null)
  const [inviteForm, setInvForm]  = useState({ name:'', email:'', role:'Member', income:'', budgetShare:'' })
  const [showSplit, setShowSplit] = useState(false)
  const [splitForm, setSplitForm] = useState({ desc: '', amount: '', paidBy: user?.name || 'Alex Johnson', splitType: 'equal' })
  const [showAddBudget, setShowAddBudget] = useState(false)
  const [budgetForm, setBudgetForm] = useState({ 
    name: '', total: '', color: '#2a7d4f', isGoal: false, category: 'Housing', 
    selectedMembers: user ? [user.initials || 'AJ'] : [],
    memberAmounts: {} 
  })
  const [editingMember, setEditingMember] = useState(null)
  const [confirmRemove, setConfirmRemove] = useState(null)
  const [incomeEditing, setIncomeEditing] = useState(null)
  const [updateBudget, setUpdateBudget] = useState(null) // { id, amount }
  const [updateAmount, setUpdateAmount] = useState('')

  const totalFamilyIncome   = members.reduce((s,m) => s + m.income, 0)
  const totalFamilyExpenses = members.reduce((s,m) => s + m.expenses, 0)
  const unsettledAmt        = splits.filter(s=>!s.settled).reduce((sum,s)=>sum+s.amount,0)

  const handleInvite = () => {
    if (!inviteForm.name || !inviteForm.email) return
    const initials = inviteForm.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()
    const now = new Date().toLocaleString('en-US', { month:'short', year:'numeric' })
    const incomeVal = parseFloat(inviteForm.income) || 0
    const budgetShareVal = parseFloat(inviteForm.budgetShare) || 0
    const newMember = {
      id: Date.now(), name: inviteForm.name, role: inviteForm.role, email: inviteForm.email,
      avatar: initials, color: COLORS[members.length % COLORS.length],
      income: incomeVal, incomeSources:{ Salary: incomeVal, Freelance:0, Passive:0, Other:0 },
      expenses:0, budgetShare: budgetShareVal, joined: now, lastActive:'Just now',
      permissions: inviteForm.role==='Admin' ? { view:true,edit:true,invite:true,delete:true } : inviteForm.role==='Member' ? { view:true,edit:true,invite:false,delete:false } : { view:true,edit:false,invite:false,delete:false },
    }
    setMembers(prev => [...prev, newMember])
    // Auto-add to all existing budgets with their budget share contribution
    if (budgetShareVal > 0) {
      setBudgets(prev => prev.map(b => ({
        ...b,
        members: [...b.members, initials],
        contributions: { ...b.contributions, [initials]: budgetShareVal }
      })))
    }
    setInvForm({ name:'', email:'', role:'Member', income:'', budgetShare:'' })
    setInvite(false)
    toast.success('Member Added', `${inviteForm.name} has been added to the family group`)
  }

  const handleSettle = (id) => {
    setSplits(prev => prev.map(s => s.id===id ? { ...s, settled:true } : s))
    toast.success('Settled', 'Expense split has been settled.')
  }

  const handleAddSplit = () => {
    if (!splitForm.desc || !splitForm.amount) return
    const amt = parseFloat(splitForm.amount)
    const perPerson = amt / members.length
    
    // Determine who paid (first name)
    const payerName = splitForm.paidBy.split(' ')[0]
    
    const newSplit = {
      id: Date.now(),
      desc: splitForm.desc,
      amount: amt,
      paidBy: payerName,
      date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric' }),
      settled: false,
      split: members.reduce((acc, m) => ({ ...acc, [m.name.split(' ')[0]]: parseFloat(perPerson.toFixed(2)) }), {})
    }
    setSplits(prev => [newSplit, ...prev])
    setShowSplit(false)
    setSplitForm({ desc: '', amount: '', paidBy: user?.name || 'Alex Johnson', splitType: 'equal' })
    toast.success('Split Created', `Expense for "${splitForm.desc}" split successfully.`)
  }

  const handleAddBudget = () => {
    if (!budgetForm.name || !budgetForm.total) return
    
    // Check if total contributions match total budget, or just use entered values
    const newBudget = {
      id: Date.now(),
      name: budgetForm.name,
      total: parseFloat(budgetForm.total),
      spent: 0,
      saved: 0,
      members: budgetForm.selectedMembers,
      contributions: budgetForm.selectedMembers.reduce((acc, av) => {
        acc[av] = parseFloat(budgetForm.memberAmounts[av] || 0)
        return acc
      }, {}),
      color: budgetForm.color,
      category: budgetForm.category,
      isGoal: budgetForm.isGoal
    }
    setBudgets(prev => [...prev, newBudget])
    setShowAddBudget(false)
    setBudgetForm({ 
      name: '', total: '', color: '#2a7d4f', isGoal: false, category: 'Housing', 
      selectedMembers: user ? [user.initials || 'AJ'] : [],
      memberAmounts: {} 
    })
    toast.success('Budget Created', `Shared budget "${budgetForm.name}" created with ${newBudget.members.length} members.`)
  }

  const handleUpdateProgress = () => {
    if (!updateBudget || !updateAmount) return
    const val = parseFloat(updateAmount)
    setBudgets(prev => prev.map(b => {
      if (b.id !== updateBudget.id) return b
      if (b.isGoal) {
        return { ...b, saved: b.saved + val }
      } else {
        return { ...b, spent: b.spent + val }
      }
    }))
    setUpdateBudget(null)
    setUpdateAmount('')
    toast.success('Progress Updated', `Successfully added ${fmt(val)} to "${updateBudget.name}".`)
  }

  const updateMemberIncome = (id, income) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, income: parseFloat(income) || 0 } : m))
    toast.success('Income Updated', 'Family member income allocation saved.')
  }

  const updateMemberIncomeSource = (id, source, value) => {
    setMembers(prev => prev.map(m => {
      if (m.id !== id) return m
      const newSources = { ...m.incomeSources, [source]: parseFloat(value) || 0 }
      const newTotal = Object.values(newSources).reduce((s, v) => s + v, 0)
      return { ...m, incomeSources: newSources, income: newTotal }
    }))
  }

  const handleConfirmRemove = () => {
    if (!confirmRemove) return
    const name = confirmRemove.name
    setMembers(prev => prev.filter(x => x.id !== confirmRemove.id))
    setConfirmRemove(null)
    toast.success('Member Removed', `${name} has been removed from the family group.`)
  }

  const updateRole = (id, role) => {
    setMembers(prev => prev.map(m => m.id===id ? { 
      ...m, 
      role,
      permissions: role==='Admin' ? { view:true,edit:true,invite:true,delete:true } : role==='Member' ? { view:true,edit:true,invite:false,delete:false } : { view:true,edit:false,invite:false,delete:false }
    } : m))
    toast.info('Role Updated', 'Member permissions changed.')
  }

  const togglePermission = (id, perm) => {
    setMembers(prev => prev.map(m => m.id===id ? { 
      ...m, 
      permissions: { ...m.permissions, [perm]: !m.permissions[perm] } 
    } : m))
    toast.info('Permission Toggled', 'Custom access level applied.')
  }

  const handleEditMember = () => {
    if (!editingMember.name) return
    setMembers(prev => prev.map(m => m.id === editingMember.id ? editingMember : m))
    setEditingMember(null)
    toast.success('Member Updated', 'Member details have been saved.')
  }

  const TABS = ['overview','members','budgets','splits','permissions']

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 animate-fadeIn">
      <PageHeader
        title="Family Mode"
        subtitle="Shared finances, expense splitting and family budgeting"
        actions={
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2" onClick={() => setInvite(true)}>
            <Icons.Invite /> Add Member
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-2">Family Members</div>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{members.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-2">Combined Income</div>
          <div className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{fmt(totalFamilyIncome)}/mo</div>
        </div>
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-2">Combined Expenses</div>
          <div className="text-2xl md:text-3xl font-bold text-rose-600 dark:text-rose-400">{fmt(totalFamilyExpenses)}/mo</div>
        </div>
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-2">Unsettled Splits</div>
          <div className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-400">{fmt(unsettledAmt)}</div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full animate-fadeIn shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add Family Member</h3>
              <button onClick={() => setInvite(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <Icons.Close />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" placeholder="Sok Dara" value={inviteForm.name} onChange={e=>setInvForm(p=>({...p,name:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" type="email" placeholder="dara@gmail.com" value={inviteForm.email} onChange={e=>setInvForm(p=>({...p,email:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
                <select className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" value={inviteForm.role} onChange={e=>setInvForm(p=>({...p,role:e.target.value}))}>
                  {ROLES.map(r=><option key={r}>{r}</option>)}
                </select>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded-lg leading-relaxed">
                  {ROLE_DESC[inviteForm.role]}
                </div>
              </div>
              {/* Income & Budget Share Section */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Financial Details</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Income ($)</label>
                    <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" type="number" placeholder="5000" value={inviteForm.income} onChange={e=>setInvForm(p=>({...p,income:e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Budget Share ($)</label>
                    <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" type="number" placeholder="500" value={inviteForm.budgetShare} onChange={e=>setInvForm(p=>({...p,budgetShare:e.target.value}))} />
                  </div>
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-500 mt-2 p-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-200 dark:border-emerald-800 leading-relaxed">
                  <strong className="text-emerald-700 dark:text-emerald-400">Income</strong> sets this member's monthly earnings. <strong className="text-emerald-700 dark:text-emerald-400">Budget Share</strong> is how much they contribute to shared family expense budgets each month.
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all" onClick={handleInvite}>Add Member</button>
                <button className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-all" onClick={() => setInvite(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 mb-5 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium capitalize transition-all border-b-2 whitespace-nowrap ${
            tab===t 
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
              : 'border-transparent text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div>
          {members.length === 0 ? (
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                <Icons.Invite />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Family Members Yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">Start by adding your first family member. You can set their income, role, and budget sharing amount.</p>
              <button onClick={() => setInvite(true)} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 mx-auto">
                <Icons.Invite /> Add First Member
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">Member Contribution</div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={members.map(m => ({ name: m.name.split(' ')[0], expenses: m.expenses, income: m.income }))} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                      <XAxis dataKey="name" tick={{ fill:'#6b7280', fontSize:11 }} axisLine={false} tickLine={false} className="dark:[&_tspan]:fill-gray-500" />
                      <YAxis tick={{ fill:'#6b7280', fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v/1000}k`} className="dark:[&_tspan]:fill-gray-500" />
                      <Tooltip content={<ChartTooltip />} contentStyle={{ backgroundColor: 'transparent', border: 'none' }} cursor={{ fill: 'rgba(0,0,0,0.05)' }} wrapperStyle={{ zIndex: 100 }} />
                      <Bar dataKey="income"   name="Income"   fill="#10b981" radius={[4,4,0,0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col">
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4 flex justify-between items-center">
                    <span>Family Expense Share</span>
                    <span className="text-[10px] bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full font-medium">Monthly</span>
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative w-full sm:w-1/2 aspect-square max-w-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={members.map(m=>({ name:m.name.split(' ')[0], value:m.expenses || 0 }))} 
                            cx="50%" cy="50%" 
                            innerRadius="65%" outerRadius="90%" 
                            paddingAngle={4} 
                            dataKey="value"
                            stroke="none"
                          >
                            {members.map((m,i)=><Cell key={i} fill={m.color} className="outline-none hover:opacity-80 transition-opacity cursor-pointer" />)}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} contentStyle={{ backgroundColor: 'transparent', border: 'none' }} wrapperStyle={{ zIndex: 100 }} />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center Label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="text-[10px] text-gray-500 dark:text-gray-500 font-medium uppercase tracking-tighter">Total</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{fmt(totalFamilyExpenses)}</div>
                      </div>
                    </div>
                    
                    <div className="flex-1 w-full space-y-2.5">
                      {members.map((m,i) => {
                        const share = totalFamilyExpenses > 0 ? (m.expenses / totalFamilyExpenses) * 100 : 0
                        return (
                          <div key={i} className="group flex flex-col gap-1">
                            <div className="flex justify-between text-xs items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full shadow-sm" style={{ background:m.color }} />
                                <span className="text-gray-700 dark:text-gray-300 font-medium">{m.name.split(' ')[0]}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-gray-900 dark:text-gray-100 font-bold">{fmt(m.expenses)}</span>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-1.5 font-medium">{share.toFixed(1)}%</span>
                              </div>
                            </div>
                            <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-700 ease-out shadow-sm" 
                                style={{ width: `${share}%`, background: m.color }} 
                              />
                            </div>
                          </div>
                        )
                      })}
                      {members.length === 0 && (
                        <div className="text-center py-4">
                          <div className="text-xs text-gray-400 italic">No expense data available</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Member avatars strip */}
              <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">Family Members</div>
                  <button onClick={() => setInvite(true)} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"><Icons.Plus /> Add</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {members.map(m => (
                    <div key={m.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{ background: m.color }}>{m.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate">{m.name.split(' ')[0]}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">{m.role} · {fmt(m.income)}/mo</div>
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        m.role==='Admin' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 
                        m.role==='Member' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 
                        'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-500'
                      }`}>{m.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Members Tab */}
      {tab === 'members' && (
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Member</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Role</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Income</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Expenses</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Joined</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Last Active</th>
                  <th className="p-4 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs" style={{ background: m.color }}>{m.avatar}</div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-200 text-sm">{m.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <select value={m.role} onChange={e=>updateRole(m.id,e.target.value)} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500">
                        {ROLES.map(r=><option key={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="p-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">{fmt(m.income)}</td>
                    <td className="p-4 text-sm text-rose-600 dark:text-rose-400">{fmt(m.expenses)}</td>
                    <td className="p-4 text-sm text-gray-500 dark:text-gray-500">{m.joined}</td>
                    <td className="p-4 text-sm text-gray-500 dark:text-gray-500">{m.lastActive}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button onClick={() => setEditingMember(m)} className="p-1.5 text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"><Icons.Edit /></button>
                        {m.id !== 1 && <button onClick={() => setConfirmRemove(m)} className="p-1.5 text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors"><Icons.Remove /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Shared Budgets Tab */}
      {tab === 'budgets' && (
        <div className="space-y-6">
          {/* Member Income Sources */}
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider">Member Income Allocation</h3>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Total: {fmt(totalFamilyIncome)}/mo</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {members.map(m => {
                const isExpanded = incomeEditing === m.id
                const pctOfTotal = totalFamilyIncome > 0 ? ((m.income / totalFamilyIncome) * 100).toFixed(0) : 0
                return (
                  <div key={m.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs" style={{ background: m.color }}>{m.avatar}</div>
                        <div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">{m.name.split(' ')[0]}</span>
                          <div className="text-[10px] text-gray-500 dark:text-gray-500">{pctOfTotal}% of family income</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{fmt(m.income)}</div>
                        <button onClick={() => setIncomeEditing(isExpanded ? null : m.id)} className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline">
                          {isExpanded ? 'Collapse' : 'Edit Sources'}
                        </button>
                      </div>
                    </div>
                    {/* Income progress bar */}
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2 flex">
                      {INCOME_SOURCES.map((src, i) => {
                        const val = m.incomeSources?.[src] || 0
                        const w = m.income > 0 ? (val / m.income) * 100 : 0
                        const colors = ['#10b981','#3b82f6','#f59e0b','#8b5cf6']
                        return w > 0 ? <div key={i} className="h-full transition-all" style={{ width: `${w}%`, background: colors[i] }} /> : null
                      })}
                    </div>
                    <div className="flex gap-3 flex-wrap mb-1">
                      {INCOME_SOURCES.map((src, i) => {
                        const val = m.incomeSources?.[src] || 0
                        const colors = ['#10b981','#3b82f6','#f59e0b','#8b5cf6']
                        return val > 0 ? (
                          <div key={i} className="flex items-center gap-1 text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-sm" style={{ background: colors[i] }} />
                            <span className="text-gray-500 dark:text-gray-500">{src}: {fmt(val)}</span>
                          </div>
                        ) : null
                      })}
                    </div>
                    {/* Expanded income editing */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-2">
                        {INCOME_SOURCES.map(src => (
                          <div key={src}>
                            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-500 mb-1">{src}</label>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">$</span>
                              <input
                                type="number"
                                className="w-full pl-5 pr-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                                value={m.incomeSources?.[src] || 0}
                                onChange={e => updateMemberIncomeSource(m.id, src, e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Shared Budget Cards */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider">Shared Expense Budgets</h3>
              <button onClick={() => setShowAddBudget(true)} className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all flex items-center gap-1">
                <Icons.Plus /> New Budget
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {budgets.map(b => {
                const pct = b.isGoal ? (b.saved/b.total)*100 : (b.spent/b.total)*100
                const over = !b.isGoal && b.spent > b.total
                const userJoined = b.members.includes('AJ')
                return (
                  <div key={b.id} className="relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-all overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full" style={{ background: b.color }} />
                    <div className="pl-2">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate">{b.name}</div>
                            {b.category && <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 shrink-0">{b.category}</span>}
                          </div>
                          {/* Member avatars */}
                          <div className="flex -space-x-1 overflow-visible">
                            {members.map(m => {
                              const isIncluded = b.members.includes(m.avatar)
                              return (
                                <button
                                  key={m.id}
                                  onClick={() => toggleBudgetMember(b.id, m.avatar)}
                                  title={isIncluded ? `Remove ${m.name.split(' ')[0]}` : `Add ${m.name.split(' ')[0]}`}
                                  className={`w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-[8px] font-bold text-white transition-all hover:scale-125 z-10 ${isIncluded ? '' : 'grayscale opacity-30 hover:grayscale-0 hover:opacity-100'}`}
                                  style={{ background: m.color }}
                                >
                                  {m.avatar}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-0.5 text-[10px] rounded-full shrink-0 ${
                            over ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' :
                            b.isGoal ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                            'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                          }`}>
                            {b.isGoal ? 'Goal' : over ? 'Over Budget' : 'On Track'}
                          </span>
                          <button
                            onClick={() => setUpdateBudget(b)}
                            className={`px-2 py-0.5 text-[10px] font-medium rounded-full transition-all bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-emerald-500 hover:text-white`}
                          >
                            Add {b.isGoal ? 'Savings' : 'Expense'}
                          </button>
                          <button
                            onClick={() => {
                              const isMember = b.members.includes(user?.initials || 'AJ')
                              const memberAvatar = user?.initials || 'AJ'
                              setBudgets(prev => prev.map(bud => {
                                if (bud.id !== b.id) return bud
                                const newMembers = isMember ? bud.members.filter(m => m !== memberAvatar) : [...bud.members, memberAvatar]
                                const newContribs = { ...bud.contributions }
                                if (isMember) { delete newContribs[memberAvatar] } else { newContribs[memberAvatar] = 0 }
                                return { ...bud, members: newMembers, contributions: newContribs }
                              }))
                              toast.info(isMember ? 'Left Budget' : 'Joined Budget', isMember ? 'You have left this shared budget.' : 'You have joined this shared budget.')
                            }}
                            className={`px-2 py-0.5 text-[10px] font-medium rounded-full transition-all ${
                              b.members.includes(user?.initials || 'AJ')
                                ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100'
                                : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                            }`}
                          >
                            {b.members.includes(user?.initials || 'AJ') ? 'Leave' : 'Join'}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-end mb-1">
                        <span className="text-xl font-bold" style={{ color: over ? '#f43f5e' : b.color }}>{fmt(b.isGoal ? b.saved : b.spent)}</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-500">/ {fmt(b.total)}</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct,100)}%`, background: over ? '#f43f5e' : b.color }} />
                      </div>

                      {/* Member contributions */}
                      {b.contributions && Object.keys(b.contributions).length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                          <div className="text-[10px] text-gray-500 dark:text-gray-500 mb-1 font-medium">Member Contributions</div>
                          <div className="space-y-1">
                            {Object.entries(b.contributions).map(([avatar, amount]) => {
                              const member = members.find(m => m.avatar === avatar)
                              const contribPct = b.total > 0 ? (amount / b.total) * 100 : 0
                              return member ? (
                                <div key={avatar} className="flex items-center gap-2">
                                  <span className="text-[9px] text-gray-500 dark:text-gray-400 w-12 truncate">{member.name.split(' ')[0]}</span>
                                  <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full rounded-full transition-all duration-500" 
                                      style={{ width: `${Math.min(contribPct, 100)}%`, background: member.color }} 
                                    />
                                  </div>
                                  <span className="text-[9px] text-gray-600 dark:text-gray-300 w-12 text-right font-medium">{fmt(amount)}</span>
                                </div>
                              ) : null
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] text-gray-600 dark:text-gray-500">{pct.toFixed(0)}% {b.isGoal?'saved':'used'} · {b.members.length} members</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Budget Modal */}
      {showAddBudget && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full animate-fadeIn shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add Shared Budget</h3>
              <button onClick={() => setShowAddBudget(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <Icons.Close />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Budget Name</label>
                <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" placeholder="e.g. Groceries" value={budgetForm.name} onChange={e=>setBudgetForm(p=>({...p,name:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" value={budgetForm.category} onChange={e=>setBudgetForm(p=>({...p,category:e.target.value}))}>
                  {BUDGET_CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Amount ($)</label>
                <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" type="number" placeholder="1000" value={budgetForm.total} onChange={e=>setBudgetForm(p=>({...p,total:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Share with Members & Allocate Contribution</label>
                <div className="space-y-3">
                  {members.map(m => {
                    const isSelected = budgetForm.selectedMembers.includes(m.avatar)
                    return (
                      <div key={m.id} className={`p-3 rounded-xl border transition-all ${isSelected ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'}`}>
                        <div className="flex items-center justify-between">
                          <button 
                            onClick={() => setBudgetForm(p => ({
                              ...p,
                              selectedMembers: isSelected 
                                ? p.selectedMembers.filter(av => av !== m.avatar)
                                : [...p.selectedMembers, m.avatar]
                            }))}
                            className="flex items-center gap-3"
                          >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm" style={{ background: m.color }}>{m.avatar}</div>
                            <div className="text-left">
                              <div className={`text-sm font-semibold ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-400'}`}>{m.name.split(' ')[0]}</div>
                              <div className="text-[10px] text-gray-500">{isSelected ? 'Included' : 'Not included'}</div>
                            </div>
                          </button>
                          
                          {isSelected && (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-500 font-medium">Spending:</span>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                <input 
                                  type="number"
                                  className="w-24 pl-5 pr-2 py-1 bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-700 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                  placeholder="0.00"
                                  value={budgetForm.memberAmounts[m.avatar] || ''}
                                  onChange={e => setBudgetForm(p => ({
                                    ...p,
                                    memberAmounts: { ...p.memberAmounts, [m.avatar]: e.target.value }
                                  }))}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div onClick={()=>setBudgetForm(p=>({...p,isGoal:!p.isGoal}))} className={`w-9 h-5 rounded-full cursor-pointer transition-all ${budgetForm.isGoal ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-all mt-0.5 ${budgetForm.isGoal ? 'ml-4' : 'ml-0.5'}`} />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Set as Savings Goal</span>
              </div>
              <div className="flex gap-3 pt-2">
                <button className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all" onClick={handleAddBudget}>Add Budget</button>
                <button className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-all" onClick={() => setShowAddBudget(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expense Splits Tab */}
      {tab === 'splits' && (
        <div>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <div className="flex gap-3">
              <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-600 dark:text-gray-500 mb-1">You Owe</div>
                <div className="text-lg font-bold text-rose-600 dark:text-rose-400">{fmt(splits.filter(s=>!s.settled&&s.paidBy!==currentUserFirstName).reduce((sum,s)=>sum+(s.split[currentUserFirstName]||0),0))}</div>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-600 dark:text-gray-500 mb-1">Owed to You</div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{fmt(splits.filter(s=>!s.settled&&s.paidBy===currentUserFirstName).reduce((sum,s)=>sum+s.amount-(s.split[currentUserFirstName]||0),0))}</div>
              </div>
            </div>
            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all flex items-center gap-2" onClick={()=>setShowSplit(true)}>
              <Icons.Plus /> Split Expense
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Description</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Date</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Paid By</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Split</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Total</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Status</th>
                    <th className="p-4 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {splits.map(s => (
                    <tr key={s.id} className={`border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${s.settled ? 'opacity-60' : ''}`}>
                      <td className="p-4 text-sm font-medium text-gray-900 dark:text-gray-300">{s.desc}</td>
                      <td className="p-4 text-sm text-gray-500 dark:text-gray-500">{s.date}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: members.find(m=>m.name.split(' ')[0]===s.paidBy)?.color || '#555' }}>{s.paidBy[0]}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{s.paidBy}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(s.split).map(([name, amt], i) => (
                            <span key={i} className="text-xs text-gray-500 dark:text-gray-500">{name}: {fmtFull(amt)}</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-sm font-semibold text-amber-600 dark:text-amber-400">{fmtFull(s.amount)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          s.settled ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                        }`}>
                          {s.settled ? '✓ Settled' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-4">
                        {!s.settled && (
                          <button onClick={()=>handleSettle(s.id)} className="px-2 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-all flex items-center gap-1">
                            <Icons.Settle /> Settle
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Split Expense Modal */}
      {showSplit && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full animate-fadeIn shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Split New Expense</h3>
              <button onClick={() => setShowSplit(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <Icons.Close />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" placeholder="e.g. Weekly Groceries" value={splitForm.desc} onChange={e=>setSplitForm(p=>({...p,desc:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Amount ($)</label>
                <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" type="number" placeholder="0.00" value={splitForm.amount} onChange={e=>setSplitForm(p=>({...p,amount:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Paid By</label>
                <select className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" value={splitForm.paidBy} onChange={e=>setSplitForm(p=>({...p,paidBy:e.target.value}))}>
                  {members.map(m=><option key={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Equal Split Logic</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-1">Amount will be divided equally among all {members.length} active family members.</div>
              </div>
              <div className="flex gap-3 pt-2">
                <button className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all" onClick={handleAddSplit}>Create Split</button>
                <button className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-all" onClick={() => setShowSplit(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full animate-fadeIn shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Member</h3>
              <button onClick={() => setEditingMember(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <Icons.Close />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" value={editingMember.name} onChange={e=>setEditingMember(p=>({...p,name:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" value={editingMember.email} onChange={e=>setEditingMember(p=>({...p,email:e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Income ($)</label>
                  <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" type="number" value={editingMember.income} onChange={e=>setEditingMember(p=>({...p,income:parseFloat(e.target.value)||0}))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expenses ($)</label>
                  <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" type="number" value={editingMember.expenses} onChange={e=>setEditingMember(p=>({...p,expenses:parseFloat(e.target.value)||0}))} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all" onClick={handleEditMember}>Save Changes</button>
                <button className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-all" onClick={() => setEditingMember(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Tab */}
      {tab === 'permissions' && (
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">Permission Control (View / Edit)</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Member</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Role</th>
                  <th className="text-center p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">View Data</th>
                  <th className="text-center p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Edit</th>
                  <th className="text-center p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Invite</th>
                  <th className="text-center p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Delete</th>
                  <th className="text-center p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Manage Budgets</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-[10px]" style={{ background: m.color }}>{m.avatar}</div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-300">{m.name.split(' ')[0]}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        m.role==='Admin' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 
                        m.role==='Member' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 
                        'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-500'
                      }`}>{m.role}</span>
                    </td>
                    {['view','edit','invite','delete'].map(perm => (
                      <td key={perm} className="p-4 text-center">
                        <button 
                          onClick={() => togglePermission(m.id, perm)}
                          className={`text-base font-bold transition-all hover:scale-125 ${m.permissions[perm] ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-300 dark:text-gray-600'}`}
                        >
                          {m.permissions[perm] ? '✓' : '✕'}
                        </button>
                      </td>
                    ))}
                    <td className="p-4 text-center">
                      <span className={`text-base font-bold ${m.role!=='Viewer' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-300 dark:text-gray-600'}`}>
                        {m.role !== 'Viewer' ? '✓' : '✕'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 p-4 bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wider">Role Descriptions</div>
            {Object.entries(ROLE_DESC).map(([role, desc]) => (
              <div key={role} className="flex gap-3 mb-2 text-xs">
                <span className={`font-semibold min-w-[60px] ${
                  role==='Admin' ? 'text-amber-600 dark:text-amber-400' : 
                  role==='Member' ? 'text-emerald-600 dark:text-emerald-400' : 
                  'text-gray-500 dark:text-gray-500'
                }`}>{role}</span>
                <span className="text-gray-600 dark:text-gray-500">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Confirm Remove Member Modal */}
      {confirmRemove && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm w-full animate-fadeIn shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-3">
                <Icons.Remove />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Remove Member</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Are you sure you want to remove <strong className="text-gray-900 dark:text-gray-200">{confirmRemove.name}</strong> from the family group?</p>
              <p className="text-xs text-rose-500 dark:text-rose-400 mt-2">This action cannot be undone. All shared budgets and splits involving this member will be updated.</p>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-all" onClick={handleConfirmRemove}>Remove</button>
              <button className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-all" onClick={() => setConfirmRemove(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Update Progress Modal */}
      {updateBudget && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm w-full animate-fadeIn shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add {updateBudget.isGoal ? 'Savings' : 'Expense'}</h3>
              <button onClick={() => setUpdateBudget(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Icons.Close />
              </button>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Adding progress to <span className="font-bold text-gray-900 dark:text-gray-200">{updateBudget.name}</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Amount ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input 
                    className="w-full pl-8 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500 transition-all font-bold"
                    type="number"
                    autoFocus
                    placeholder="0.00"
                    value={updateAmount}
                    onChange={e => setUpdateAmount(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleUpdateProgress()}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-all"
                  onClick={handleUpdateProgress}
                >
                  Update Budget
                </button>
                <button 
                  className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 font-bold rounded-lg transition-all"
                  onClick={() => setUpdateBudget(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}