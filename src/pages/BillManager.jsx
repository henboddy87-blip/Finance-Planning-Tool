import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import PageHeader from '../components/PageHeader.jsx'
import StatCard from '../components/StatCard.jsx'
import { fmt, fmtFull, COLORS } from '../utils/format.js'
import { useToast } from '../context/AppContext.jsx'

/* ── Data ─────────────────────────────────────────────── */
const initialBills = [
  { id:1,  name:'Mortgage',         category:'Housing',       amount:1850.00, dueDay:1,  freq:'Monthly',  autoPay:true,  status:'paid',    lastPaid:'Apr 1',  icon:'Home', color:'#4c7dc9' },
  { id:2,  name:'Electricity',      category:'Utilities',     amount:92.00,   dueDay:8,  freq:'Monthly',  autoPay:false, status:'due',     lastPaid:'Mar 8',  icon:'Zap', color:'#c9a84c' },
  { id:3,  name:'Internet',         category:'Utilities',     amount:79.99,   dueDay:12, freq:'Monthly',  autoPay:true,  status:'paid',    lastPaid:'Apr 12', icon:'Wifi', color:'#c9a84c' },
  { id:4,  name:'Car Insurance',    category:'Insurance',     amount:145.00,  dueDay:15, freq:'Monthly',  autoPay:true,  status:'paid',    lastPaid:'Apr 15', icon:'Car', color:'#7d4cc9' },
  { id:5,  name:'Phone Bill',       category:'Utilities',     amount:55.00,   dueDay:20, freq:'Monthly',  autoPay:false, status:'upcoming',lastPaid:'Mar 20', icon:'Smartphone', color:'#c9a84c' },
  { id:6,  name:'Health Insurance', category:'Insurance',     amount:380.00,  dueDay:1,  freq:'Monthly',  autoPay:true,  status:'paid',    lastPaid:'Apr 1',  icon:'HeartPulse', color:'#7d4cc9' },
  { id:7,  name:'Water Bill',       category:'Utilities',     amount:38.50,   dueDay:25, freq:'Monthly',  autoPay:false, status:'upcoming',lastPaid:'Mar 25', icon:'Droplet', color:'#c9a84c' },
  { id:8,  name:'Property Tax',     category:'Housing',       amount:620.00,  dueDay:1,  freq:'Quarterly',autoPay:false, status:'upcoming',lastPaid:'Jan 1',  icon:'Building', color:'#4c7dc9' },
]

const initialSubs = [
  { id:101, name:'Netflix',          category:'Entertainment', amount:15.99,  freq:'Monthly',  autoPay:true,  status:'active', nextDate:'May 3',  logo:'https://images.icon-icons.com/2699/PNG/512/netflix_logo_icon_170919.png', color:'#c94c4c',  since:'Jan 2021' },
  { id:102, name:'Spotify',          category:'Music',         amount:9.99,   freq:'Monthly',  autoPay:true,  status:'active', nextDate:'May 7',  logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/3840px-Spotify_logo_without_text.svg.png', color:'#1db954',  since:'Mar 2020' },
  { id:103, name:'Amazon Prime',     category:'Shopping',      amount:14.99,  freq:'Monthly',  autoPay:true,  status:'active', nextDate:'May 10', logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Amazon_Prime_Video_logo_%282024%29.svg/960px-Amazon_Prime_Video_logo_%282024%29.svg.png', color:'#ff9900',  since:'Feb 2019' },
  { id:104, name:'Adobe CC',         category:'Software',      amount:54.99,  freq:'Monthly',  autoPay:true,  status:'active', nextDate:'May 14', logo:'https://upload.wikimedia.org/wikipedia/commons/4/42/Adobe_Acrobat_DC_logo_2020.svg', color:'#ff0000',  since:'Jun 2022' },
  { id:105, name:'YouTube Premium',  category:'Entertainment', amount:13.99,  freq:'Monthly',  autoPay:true,  status:'active', nextDate:'May 18', logo:'https://logowik.com/content/uploads/images/youtube-premium8029.logowik.com.webp', color:'#c94c4c',  since:'Nov 2021' },
  { id:106, name:'iCloud Storage',   category:'Cloud',         amount:2.99,   freq:'Monthly',  autoPay:true,  status:'active', nextDate:'May 22', logo:'https://upload.wikimedia.org/wikipedia/commons/1/1c/ICloud_logo.svg', color:'#007aff',  since:'Aug 2018' },
  { id:107, name:'Gym Membership',   category:'Health',        amount:49.00,  freq:'Monthly',  autoPay:false, status:'active', nextDate:'May 1',  logo:'https://ui-avatars.com/api/?name=Gym+Membership&background=2a7d4f&color=fff', color:'#2a7d4f',  since:'Jan 2024' },
  { id:108, name:'Disney+',          category:'Entertainment', amount:10.99,  freq:'Monthly',  autoPay:true,  status:'paused', nextDate:'—',      logo:'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg', color:'#00285e',  since:'Dec 2022' },
  { id:109, name:'LinkedIn Premium', category:'Career',        amount:39.99,  freq:'Monthly',  autoPay:true,  status:'active', nextDate:'May 5',  logo:'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png', color:'#0077b5',  since:'Sep 2023' },
  { id:110, name:'Dropbox Plus',     category:'Cloud',         amount:11.99,  freq:'Monthly',  autoPay:true,  status:'active', nextDate:'May 9',  logo:'https://cdn.prod.website-files.com/66c503d081b2f012369fc5d2/674000d6c0a42d41f8c331be_dropbox-2-logo-png-transparent.png', color:'#0061ff',  since:'Apr 2021' },
]

const STATUS_COLOR = { 
  paid: '#10b981', 
  due: '#f43f5e', 
  upcoming: '#f59e0b', 
  active: '#10b981', 
  paused: '#9ca3af', 
  overdue: '#f43f5e' 
}

const monthlyTrend = [
  { month:'Nov', bills:3260, subs:198 },
  { month:'Dec', bills:3310, subs:204 },
  { month:'Jan', bills:3260, subs:218 },
  { month:'Feb', bills:3260, subs:218 },
  { month:'Mar', bills:3260, subs:225 },
  { month:'Apr', bills:3260, subs:225 },
]

// Professional icon components
const Icons = {
  AddBill: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  AddSub: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Close: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Pay: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  Pause: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Play: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Cancel: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Delete: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  AutoPay: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  Home: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Zap: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Wifi: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>,
  Car: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M4 11h16M5 15h14M3 21h18M8 15v2a1 1 0 001 1h2a1 1 0 001-1v-2m4 0v2a1 1 0 001 1h2a1 1 0 001-1v-2" /></svg>,
  Smartphone: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  HeartPulse: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  Droplet: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a5.5 5.5 0 005.5-5.5C17.5 12.5 12 5 12 5S6.5 12.5 6.5 15.5A5.5 5.5 0 0012 21z" /></svg>,
  Building: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  FileText: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
}

/* ── Main ─────────────────────────────────────────────── */
export default function BillManager() {
  const toast = useToast()
  const [bills, setBills]       = useState(initialBills)
  const [subs, setSubs]         = useState(initialSubs)
  const [tab, setTab]           = useState('bills')
  const [showAdd, setShowAdd]   = useState(false)
  const [addType, setAddType]   = useState('bill')
  const [filter, setFilter]     = useState('All')
  const [form, setForm]         = useState({ name:'', category:'Utilities', amount:'', dueDay:'1', freq:'Monthly', autoPay:false, icon:'', color:'#10b981' })

  /* Computed */
  const monthlyBills = bills.reduce((s,b) => {
    if (b.freq==='Monthly') return s + b.amount
    if (b.freq==='Quarterly') return s + b.amount/3
    if (b.freq==='Annual') return s + b.amount/12
    return s
  }, 0)
  const monthlySubs = subs.filter(s=>s.status==='active').reduce((s,sub) => {
    if (sub.freq==='Monthly') return s + sub.amount
    if (sub.freq==='Annual') return s + sub.amount/12
    return s
  }, 0)
  const totalMonthly  = monthlyBills + monthlySubs
  const upcomingCount = bills.filter(b => b.status==='due'||b.status==='upcoming').length
  const activeSubsCount = subs.filter(s=>s.status==='active').length

  /* Category pie data */
  const catMap = {}
  ;[...bills, ...subs.filter(s=>s.status==='active')].forEach(item => {
    const amt = item.freq==='Monthly' ? item.amount : item.freq==='Quarterly' ? item.amount/3 : item.amount/12
    catMap[item.category] = (catMap[item.category]||0) + amt
  })
  const pieData = Object.entries(catMap).map(([name, value]) => ({ name, value: Math.round(value*100)/100 }))

  /* Upcoming bills */
  const today = new Date()
  const upcomingBills = bills.filter(b => b.status!=='paid').sort((a,b) => a.dueDay - b.dueDay)

  const billCats = ['All','Housing','Utilities','Insurance','Tax']
  const subCats  = ['All','Entertainment','Music','Shopping','Software','Health','Cloud','Career']

  const handleAdd = () => {
    if (!form.name || !form.amount) return
    const item = {
      id: Date.now(), name: form.name, category: form.category,
      amount: parseFloat(form.amount)||0, freq: form.freq,
      autoPay: form.autoPay, status: 'upcoming', color: form.color || '#10b981',
    }
    if (addType === 'bill') {
      setBills(prev => [...prev, { ...item, icon: form.icon || 'FileText', dueDay: parseInt(form.dueDay)||1, lastPaid: '—' }])
      toast.success('Bill Added', `Successfully added ${item.name}`)
    } else {
      setSubs(prev => [...prev, { ...item, status: 'active', logo: form.icon || 'https://ui-avatars.com/api/?name=' + form.name, nextDate: `May ${form.dueDay||1}`, since: `${today.toLocaleDateString('en-US',{month:'short',year:'numeric'})}` }])
      toast.success('Subscription Added', `Successfully added ${item.name}`)
    }
    setForm({ name:'', category:'Utilities', amount:'', dueDay:'1', freq:'Monthly', autoPay:false, icon:'', color:'#10b981' })
    setShowAdd(false)
  }

  const markPaid = (id) => {
    setBills(prev => prev.map(b => b.id===id ? { ...b, status:'paid', lastPaid:`Apr ${b.dueDay}` } : b))
    toast.success('Bill Paid', 'Marked as paid.')
  }
  const togglePause = (id) => {
    setSubs(prev => prev.map(s => s.id===id ? { ...s, status: s.status==='active'?'paused':'active' } : s))
    toast.info('Subscription Updated', 'Status changed.')
  }

  const filteredBills = filter==='All' ? bills : bills.filter(b=>b.category===filter)
  const filteredSubs  = filter==='All' ? subs  : subs.filter(s=>s.category===filter)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 animate-fadeIn">
      <PageHeader
        title="Bills & Subscriptions"
        subtitle="Track upcoming bills, recurring payments and subscriptions"
        actions={
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2" onClick={() => { setAddType('bill'); setShowAdd(true) }}>
              <Icons.AddBill /> Add Bill
            </button>
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2" onClick={() => { setAddType('sub'); setShowAdd(true) }}>
              <Icons.AddSub /> Add Subscription
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Monthly" value={fmt(totalMonthly)} sub="bills + subscriptions" color="emerald" />
        <StatCard label="Monthly Bills" value={fmt(monthlyBills)} sub={`${bills.length} bills`} color="amber" />
        <StatCard label="Subscriptions" value={fmt(monthlySubs)} sub={`${activeSubsCount} active`} color="blue" />
        <StatCard label="Upcoming Due" value={upcomingCount} sub="within 30 days" color={upcomingCount>3?'rose':'emerald'} />
      </div>

      {/* Add Modal - Responsive */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto animate-fadeIn shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Add {addType==='bill'?'Bill':'Subscription'}</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <Icons.Close />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" placeholder="e.g. Netflix" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount ($)</label>
                <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" type="number" placeholder="9.99" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
                <select className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" value={form.freq} onChange={e=>setForm(p=>({...p,freq:e.target.value}))}>
                  {['Monthly','Quarterly','Annual','Weekly'].map(f=><option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                  {[...new Set([...billCats,...subCats].filter(c=>c!=='All'))].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Day (1–31)</label>
                <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" type="number" min="1" max="31" placeholder="15" value={form.dueDay} onChange={e=>setForm(p=>({...p,dueDay:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{addType === 'bill' ? 'Icon Name (e.g. Home, Zap)' : 'Logo URL'}</label>
                <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" placeholder={addType === 'bill' ? 'Home' : 'https://logo.url'} value={form.icon} onChange={e=>setForm(p=>({...p,icon:e.target.value}))} />
              </div>
              <div className="sm:col-span-2 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div onClick={()=>setForm(p=>({...p,autoPay:!p.autoPay}))} className={`w-9 h-5 rounded-full cursor-pointer transition-all ${form.autoPay ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-all mt-0.5 ${form.autoPay ? 'ml-4' : 'ml-0.5'}`} />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1"><Icons.AutoPay /> Auto-pay enabled</span>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all" onClick={handleAdd}>Add</button>
              <button className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-all" onClick={()=>setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">Monthly Spend Trend</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="month" tick={{ fill:'#6b7280', fontSize:11 }} axisLine={false} tickLine={false} className="dark:[&_tspan]:fill-gray-500" />
              <YAxis tick={{ fill:'#6b7280', fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(1)}k`} className="dark:[&_tspan]:fill-gray-500" />
              <Tooltip contentStyle={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'0.5rem', fontSize:'0.8rem' }} formatter={v=>fmt(v)} className="dark:[&_div]:bg-gray-800 dark:[&_div]:border-gray-700" />
              <Bar dataKey="bills" name="Bills" stackId="a" fill="#10b981" radius={[0,0,0,0]} />
              <Bar dataKey="subs"  name="Subscriptions" stackId="a" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-3">Spend by Category</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={65} paddingAngle={2} dataKey="value">
                {pieData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v=>fmt(v)} contentStyle={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'0.5rem', fontSize:'0.8rem' }} className="dark:[&_div]:bg-gray-800 dark:[&_div]:border-gray-700" />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2 max-h-28 overflow-y-auto">
            {pieData.map((d,i) => (
              <div key={i} className="flex justify-between text-xs">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-sm" style={{ background:COLORS[i%COLORS.length] }} />
                  <span className="text-gray-600 dark:text-gray-500">{d.name}</span>
                </div>
                <span className="text-gray-900 dark:text-gray-300 font-medium">{fmt(d.value)}/mo</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming alert banner */}
      {upcomingBills.length > 0 && (
        <div className="mb-5 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/30 rounded-xl flex gap-3 items-center flex-wrap">
          <span className="text-xl">⏰</span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">Upcoming Bills This Month</div>
            <div className="flex gap-2 flex-wrap">
              {upcomingBills.slice(0,4).map((b,i) => (
                <span key={i} className="text-xs text-gray-600 dark:text-gray-400">{b.icon} {b.name} — due {b.dueDay < today.getDate() ? 'overdue' : `May ${b.dueDay}`} · {fmt(b.amount)}</span>
              ))}
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">{upcomingBills.length} pending</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 mb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {['bills','subscriptions'].map(t => (
          <button key={t} onClick={() => { setTab(t); setFilter('All') }} className={`px-4 py-2 text-sm font-medium capitalize transition-all border-b-2 whitespace-nowrap ${
            tab===t 
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
              : 'border-transparent text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}>
            {t} {t==='bills'?`(${bills.length})`:`(${subs.filter(s=>s.status==='active').length} active)`}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {(tab==='bills'?billCats:subCats).map(c => (
          <button key={c} onClick={() => setFilter(c)} className={`px-2 py-1 text-xs rounded-full transition-all ${
            filter===c 
              ? 'bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}>
            {c}
          </button>
        ))}
      </div>

      {/* Bills list - Responsive Table */}
      {tab === 'bills' && (
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Bill</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Category</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Due Day</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Frequency</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Auto-Pay</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Status</th>
                  <th className="text-right p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Amount</th>
                  <th className="p-4 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map(b => (
                  <tr key={b.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                          {Icons[b.icon] ? Icons[b.icon]() : <Icons.FileText />}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-200 text-sm">{b.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">Last: {b.lastPaid}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><span className="px-2 py-1 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">{b.category}</span></td>
                    <td className="p-4 text-sm text-gray-500 dark:text-gray-500">Day {b.dueDay}</td>
                    <td className="p-4 text-sm text-gray-500 dark:text-gray-500">{b.freq}</td>
                    <td className="p-4">
                      {b.autoPay
                        ? <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-1 w-fit"><Icons.AutoPay /> Auto</span>
                        : <span className="text-xs text-gray-500 dark:text-gray-500">Manual</span>
                      }
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 text-xs rounded-full capitalize" style={{ background: `${STATUS_COLOR[b.status]}20`, color: STATUS_COLOR[b.status] }}>
                        {b.status}
                      </span>
                    </td>
                    <td className={`p-4 text-right text-sm font-semibold ${b.status==='paid' ? 'text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-gray-200'}`}>{fmtFull(b.amount)}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {b.status !== 'paid' && (
                          <button onClick={() => markPaid(b.id)} className="px-2 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-all flex items-center gap-1">
                            <Icons.Pay /> Pay
                          </button>
                        )}
                        <button onClick={() => { setBills(prev => prev.filter(x => x.id!==b.id)); toast.success('Deleted', 'Bill removed.') }} className="text-gray-400 hover:text-rose-500 dark:text-gray-500 dark:hover:text-rose-400 transition-colors">
                          <Icons.Delete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subscriptions grid - Responsive */}
      {tab === 'subscriptions' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubs.map(s => (
            <div key={s.id} className="relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:scale-[1.02] duration-200 overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${s.status==='active' ? 'bg-emerald-500' : 'bg-gray-400 dark:bg-gray-600'}`} />
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center bg-white shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                      <img src={s.logo} alt={s.name} className="w-6 h-6 object-contain" onError={e => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=' + s.name }} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-200 text-sm">{s.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">{s.category} · since {s.since}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${s.status==='active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-500'}`}>
                    {s.status}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className={`text-2xl font-bold ${s.status==='active' ? 'text-gray-900 dark:text-gray-200' : 'text-gray-500 dark:text-gray-500'}`}>
                      {fmtFull(s.amount)}<span className="text-xs text-gray-500 dark:text-gray-500 ml-1">/{s.freq==='Monthly'?'mo':'yr'}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">Next: {s.nextDate}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-500">Annual</div>
                    <div className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{fmt(s.amount * (s.freq==='Monthly'?12:1))}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => togglePause(s.id)} className="flex-1 px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all flex items-center justify-center gap-1">
                    {s.status==='active' ? <Icons.Pause /> : <Icons.Play />}
                    {s.status==='active' ? 'Pause' : 'Resume'}
                  </button>
                  <button onClick={() => { setSubs(prev => prev.filter(x => x.id!==s.id)); toast.success('Deleted', 'Subscription removed.') }} className="px-3 py-1.5 text-xs font-medium bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 rounded-lg transition-all">
                    <Icons.Cancel />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}