import React, { useState, useMemo } from 'react'
import { Plus, Trash2, AlertTriangle, X } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, ZAxis
} from 'recharts'
import PageHeader from '../components/PageHeader.jsx'
import StatCard from '../components/StatCard.jsx'
import { fmt, fmtFull, fmtPct, COLORS } from '../utils/format.js'
import { useToast } from '../context/AppContext.jsx'

/* ── Data ─────────────────────────────────────────────── */
const initialHoldings = [
  { id:1,  ticker:'AAPL',  name:'Apple Inc.',            shares:25,    avgCost:152.40,  currentPrice:189.50, category:'Stock',   sector:'Technology',  divYield:0.5,  beta:1.24, risk:'Medium' },
  { id:2,  ticker:'VOO',   name:'Vanguard S&P 500 ETF',  shares:40,    avgCost:381.20,  currentPrice:428.90, category:'ETF',     sector:'Broad',       divYield:1.3,  beta:1.00, risk:'Low'    },
  { id:3,  ticker:'MSFT',  name:'Microsoft Corp.',       shares:15,    avgCost:285.00,  currentPrice:412.30, category:'Stock',   sector:'Technology',  divYield:0.7,  beta:0.90, risk:'Low'    },
  { id:4,  ticker:'BND',   name:'Vanguard Total Bond',   shares:80,    avgCost:73.50,   currentPrice:74.20,  category:'Bond',    sector:'Fixed Income',divYield:3.8,  beta:0.05, risk:'Low'    },
  { id:5,  ticker:'GOOGL', name:'Alphabet Inc.',         shares:10,    avgCost:131.00,  currentPrice:175.80, category:'Stock',   sector:'Technology',  divYield:0.0,  beta:1.06, risk:'Medium' },
  { id:6,  ticker:'VNQ',   name:'Vanguard REIT ETF',     shares:30,    avgCost:88.00,   currentPrice:94.50,  category:'REIT',    sector:'Real Estate', divYield:4.2,  beta:0.72, risk:'Medium' },
  { id:7,  ticker:'BTC',   name:'Bitcoin',               shares:0.35,  avgCost:38000,   currentPrice:62000,  category:'Crypto',  sector:'Crypto',      divYield:0.0,  beta:3.20, risk:'High'   },
  { id:8,  ticker:'ETH',   name:'Ethereum',              shares:2.1,   avgCost:2100,    currentPrice:3450,   category:'Crypto',  sector:'Crypto',      divYield:0.0,  beta:3.80, risk:'High'   },
  { id:9,  ticker:'VWELX', name:'Vanguard Wellington',   shares:50,    avgCost:42.00,   currentPrice:46.80,  category:'Mutual Fund', sector:'Balanced',divYield:2.1, beta:0.65, risk:'Low'   },
  { id:10, ticker:'QQQ',   name:'Invesco QQQ Trust',     shares:12,    avgCost:360.00,  currentPrice:448.20, category:'ETF',     sector:'Technology',  divYield:0.6,  beta:1.18, risk:'Medium' },
]

const perfData = [
  { month:'Nov', portfolio:102000, spy:100000, bonds:98000 },
  { month:'Dec', portfolio:105000, spy:103000, bonds:97500 },
  { month:'Jan', portfolio:108000, spy:106000, bonds:98200 },
  { month:'Feb', portfolio:112000, spy:109000, bonds:98000 },
  { month:'Mar', portfolio:117000, spy:113000, bonds:98800 },
  { month:'Apr', portfolio:122000, spy:116000, bonds:99200 },
]

const divData = [
  { month:'Nov', amount:180 },
  { month:'Dec', amount:340 },
  { month:'Jan', amount:195 },
  { month:'Feb', amount:210 },
  { month:'Mar', amount:225 },
  { month:'Apr', amount:248 },
]

const riskRadar = [
  { metric:'Volatility',   portfolio:62, benchmark:55 },
  { metric:'Liquidity',    portfolio:80, benchmark:85 },
  { metric:'Diversify',    portfolio:72, benchmark:70 },
  { metric:'Growth',       portfolio:78, benchmark:65 },
  { metric:'Income',       portfolio:55, benchmark:60 },
  { metric:'Stability',    portfolio:68, benchmark:72 },
]



const Icons = {
  Add: () => <Plus className="w-4 h-4" />,
  Delete: () => <Trash2 className="w-3.5 h-3.5" />,
  Warning: () => <AlertTriangle className="w-4 h-4" />,
}

/* ── Custom Tooltip ── */
const CT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
      <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">{label}</div>
      {payload.map((p,i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-600 dark:text-gray-400">{p.name}:</span>
          <span className="text-gray-900 dark:text-gray-200 font-semibold">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

const RISK_COLOR = { Low:'#10b981', Medium:'#f59e0b', High:'#f43f5e' }
const CAT_COLORS = { Stock:'#10b981', ETF:'#3b82f6', Bond:'#f59e0b', REIT:'#8b5cf6', Crypto:'#f43f5e', 'Mutual Fund':'#14b8a6' }

/* ── Main ─────────────────────────────────────────────── */
export default function InvestmentTracker() {
  const toast = useToast()
  const [holdings, setHoldings] = useState(initialHoldings)
  const [showAdd, setShowAdd]   = useState(false)
  const [tab, setTab]           = useState('portfolio')
  const [sortBy, setSortBy]     = useState('value')
  const [filter, setFilter]     = useState('All')
  const [form, setForm]         = useState({ ticker:'', name:'', shares:'', avgCost:'', currentPrice:'', category:'Stock', sector:'', beta:'1.0', risk:'Medium' })

  /* Computed */
  const portfolioValue = holdings.reduce((s,h) => s + h.shares * h.currentPrice, 0)
  const totalCost      = holdings.reduce((s,h) => s + h.shares * h.avgCost, 0)
  const totalGain      = portfolioValue - totalCost
  const gainPct        = ((totalGain / totalCost) * 100).toFixed(2)
  const annualDiv      = holdings.reduce((s,h) => s + h.shares * h.currentPrice * (h.divYield/100), 0)
  const portfolioBeta  = holdings.reduce((s,h) => s + (h.shares*h.currentPrice/portfolioValue)*h.beta, 0)

  /* Allocation by category */
  const allocationData = useMemo(() => {
    const map = {}
    holdings.forEach(h => {
      const val = h.shares * h.currentPrice
      map[h.category] = (map[h.category] || 0) + val
    })
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value), pct: ((value/portfolioValue)*100).toFixed(1) }))
  }, [holdings, portfolioValue])

  /* Sector allocation */
  const sectorData = useMemo(() => {
    const map = {}
    holdings.forEach(h => {
      const val = h.shares * h.currentPrice
      map[h.sector] = (map[h.sector] || 0) + val
    })
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) }))
  }, [holdings])

  /* Risk breakdown */
  const riskBreakdown = useMemo(() => {
    const map = { Low:0, Medium:0, High:0 }
    holdings.forEach(h => { map[h.risk] = (map[h.risk]||0) + h.shares*h.currentPrice })
    return Object.entries(map).map(([name,value]) => ({ name, value: Math.round(value), pct: ((value/portfolioValue)*100).toFixed(1) }))
  }, [holdings, portfolioValue])

  const categories = ['All', ...new Set(holdings.map(h => h.category))]
  const filtered   = filter === 'All' ? holdings : holdings.filter(h => h.category === filter)
  const sorted     = [...filtered].sort((a,b) => {
    if (sortBy==='value') return (b.shares*b.currentPrice)-(a.shares*a.currentPrice)
    if (sortBy==='gain')  return ((b.currentPrice-b.avgCost)/b.avgCost)-((a.currentPrice-a.avgCost)/a.avgCost)
    if (sortBy==='risk')  return ['Low','Medium','High'].indexOf(b.risk)-['Low','Medium','High'].indexOf(a.risk)
    return a.ticker.localeCompare(b.ticker)
  })

  const handleAdd = () => {
    if (!form.ticker || !form.shares) return
    setHoldings(prev => [...prev, {
      id: Date.now(), ticker: form.ticker.toUpperCase(), name: form.name || form.ticker,
      shares: parseFloat(form.shares)||0, avgCost: parseFloat(form.avgCost)||0,
      currentPrice: parseFloat(form.currentPrice)||0, category: form.category,
      sector: form.sector || form.category, divYield: 0, beta: parseFloat(form.beta)||1,
      risk: form.risk,
    }])
    setForm({ ticker:'', name:'', shares:'', avgCost:'', currentPrice:'', category:'Stock', sector:'', beta:'1.0', risk:'Medium' })
    setShowAdd(false)
    toast.success('Holding Added', `Successfully added ${form.ticker.toUpperCase()}`)
  }

  const TABS = ['portfolio','performance','risk','allocation']

  const techConcentration = ((holdings.filter(h=>h.sector==='Technology').reduce((s,h)=>s+h.shares*h.currentPrice,0)/portfolioValue)*100).toFixed(0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 animate-fadeIn">
      <PageHeader
        title="Investment Tracking"
        subtitle="Stocks, crypto, mutual funds · portfolio analytics & risk"
        actions={
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2" onClick={() => setShowAdd(true)}>
            <Icons.Add />
            Add Holding
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Portfolio Value"  value={fmt(portfolioValue)} trend={parseFloat(gainPct)} color="emerald" />
        <StatCard label="Total Gain/Loss"  value={fmt(totalGain)} sub={`${gainPct}% overall`} color={totalGain>=0?'emerald':'rose'} />
        <StatCard label="Annual Dividends" value={fmt(annualDiv)} sub="est. income" trend={8.4} color="amber" />
        <StatCard label="Portfolio Beta"   value={portfolioBeta.toFixed(2)} sub="vs market (1.0)" color={portfolioBeta>1.5?'rose':portfolioBeta>1?'amber':'emerald'} />
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-lg w-full animate-fadeIn shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add Holding</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label:'Ticker Symbol', key:'ticker', placeholder:'AAPL' },
                { label:'Asset Category', key:'category', type:'select', options:['Stock','ETF','Bond','REIT','Crypto','Mutual Fund','Other'] },
                { label:'Full Name', key:'name', placeholder:'Apple Inc.', full:true },
                { label:'Sector', key:'sector', placeholder:'Technology' },
                { label:'Shares / Units', key:'shares', placeholder:'10', type:'number' },
                { label:'Avg Cost / Share ($)', key:'avgCost', placeholder:'150.00', type:'number' },
                { label:'Current Price ($)', key:'currentPrice', placeholder:'180.00', type:'number' },
                { label:'Beta', key:'beta', placeholder:'1.0', type:'number' },
                { label:'Risk Level', key:'risk', type:'select', options:['Low','Medium','High'] },
              ].map(({ label, key, placeholder, type, options, full }) => (
                <div key={key} className={full ? "col-span-2" : ""}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
                  {type === 'select'
                    ? <select className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}>
                        {options.map(o => <option key={o}>{o}</option>)}
                      </select>
                    : <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" type={type||'text'} placeholder={placeholder} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                  }
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all" onClick={handleAdd}>
                Add Holding
              </button>
              <button className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-all" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 mb-5 border-b border-gray-200 dark:border-gray-700">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium capitalize transition-all border-b-2 ${
            tab === t 
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
              : 'border-transparent text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Portfolio Tab ── */}
      {tab === 'portfolio' && (
        <>
          <div className="flex justify-between items-center mb-3 flex-wrap gap-3">
            <div className="flex gap-1 flex-wrap">
              {categories.map(c => (
                <button key={c} onClick={() => setFilter(c)} className={`px-2 py-1 text-xs rounded-full transition-all ${
                  filter === c 
                    ? 'bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500' 
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}>
                  {c}
                </button>
              ))}
            </div>
            <select className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="value">Sort: Value</option>
              <option value="gain">Sort: Gain%</option>
              <option value="risk">Sort: Risk</option>
              <option value="ticker">Sort: Ticker</option>
            </select>
          </div>
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-5">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Asset</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Category</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Shares</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Avg Cost</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Price</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Value</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Gain/Loss</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Return</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Beta</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Risk</th>
                    <th className="p-4 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(h => {
                    const value = h.shares * h.currentPrice
                    const gain  = value - h.shares * h.avgCost
                    const pct   = ((h.currentPrice - h.avgCost) / h.avgCost) * 100
                    return (
                      <tr key={h.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-gray-900 dark:text-gray-200">{h.ticker}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-500 max-w-[140px] truncate">{h.name}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 text-xs rounded-full" style={{ background: `${CAT_COLORS[h.category]}20`, color: CAT_COLORS[h.category] }}>{h.category}</span>
                        </td>
                        <td className="p-4 text-sm text-gray-500 dark:text-gray-500">{h.shares}</td>
                        <td className="p-4 text-sm text-gray-500 dark:text-gray-500">{fmtFull(h.avgCost)}</td>
                        <td className="p-4 text-sm text-gray-700 dark:text-gray-300">{fmtFull(h.currentPrice)}</td>
                        <td className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-200">{fmt(value)}</td>
                        <td className={`p-4 text-sm font-semibold ${gain>=0?'text-emerald-600 dark:text-emerald-400':'text-rose-600 dark:text-rose-400'}`}>{gain>=0?'+':''}{fmt(gain)}</td>
                        <td className="p-4"><span className={`px-2 py-1 text-xs rounded-full ${gain>=0?'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400':'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'}`}>{fmtPct(pct)}</span></td>
                        <td className="p-4 text-sm text-gray-500 dark:text-gray-500">{h.beta.toFixed(2)}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 text-xs rounded-full" style={{ background: `${RISK_COLOR[h.risk]}20`, color: RISK_COLOR[h.risk] }}>{h.risk}</span>
                        </td>
                        <td className="p-4">
                          <button onClick={() => { setHoldings(prev => prev.filter(x => x.id!==h.id)); toast.success('Deleted', 'Holding removed.') }} className="text-gray-400 hover:text-rose-500 dark:text-gray-500 dark:hover:text-rose-400 transition-colors">
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
          {/* P&L Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { label:'Realized P&L (YTD)', value:fmt(18420), color:'text-emerald-600 dark:text-emerald-400', sub:'closed positions' },
              { label:'Unrealized P&L', value:fmt(totalGain), color: totalGain>=0?'text-emerald-600 dark:text-emerald-400':'text-rose-600 dark:text-rose-400', sub:'open positions' },
              { label:'Total Return', value:`${gainPct}%`, color:'text-amber-600 dark:text-amber-400', sub:'all-time' },
            ].map((s,i) => (
              <div key={i} className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-2">{s.label}</div>
                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Performance Tab ── */}
      {tab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">Portfolio vs Benchmarks</div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={perfData}>
                <defs>
                  {[['portG','#10b981'],['spyG','#f59e0b'],['bndG','#3b82f6']].map(([id,color]) => (
                    <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="month" tick={{ fill:'#6b7280', fontSize:11 }} axisLine={false} tickLine={false} className="dark:[&_tspan]:fill-gray-500" />
                <YAxis tick={{ fill:'#6b7280', fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} className="dark:[&_tspan]:fill-gray-500" />
                <Tooltip content={<CT />} />
                <Area type="monotone" dataKey="portfolio" name="Portfolio"  stroke="#10b981" strokeWidth={2} fill="url(#portG)" />
                <Area type="monotone" dataKey="spy"       name="S&P 500"   stroke="#f59e0b" strokeWidth={2} fill="url(#spyG)" />
                <Area type="monotone" dataKey="bonds"     name="Bonds"     stroke="#3b82f6" strokeWidth={2} fill="url(#bndG)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                { label:'Portfolio', ret:'+19.6%', color:'#10b981' },
                { label:'S&P 500',   ret:'+16.0%', color:'#f59e0b' },
                { label:'Bonds',     ret:'+1.2%',  color:'#3b82f6' },
              ].map((b,i) => (
                <div key={i} className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">{b.label}</div>
                  <div className="text-base font-bold" style={{ color: b.color }}>{b.ret}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">Monthly Dividends</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={divData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="month" tick={{ fill:'#6b7280', fontSize:10 }} axisLine={false} tickLine={false} className="dark:[&_tspan]:fill-gray-500" />
                <YAxis tick={{ fill:'#6b7280', fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`} className="dark:[&_tspan]:fill-gray-500" />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8rem' }} formatter={v=>fmt(v)} className="dark:[&_div]:bg-gray-800 dark:[&_div]:border-gray-700" />
                <Bar dataKey="amount" name="Dividends" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {[
                { label:'Annual Dividend Income', value:fmt(annualDiv) },
                { label:'Dividend Yield (Portfolio)', value:`${((annualDiv/portfolioValue)*100).toFixed(2)}%` },
                { label:'Highest Yielder', value:'VNQ (4.2%)' },
                { label:'Next Ex-Div Date', value:'May 15, 2026' },
              ].map((r,i) => (
                <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                  <span className="text-gray-600 dark:text-gray-500">{r.label}</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-300">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Risk Analysis Tab ── */}
      {tab === 'risk' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">Risk Profile Radar</div>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={riskRadar}>
                <PolarGrid stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <PolarAngleAxis dataKey="metric" tick={{ fill:'#6b7280', fontSize:11 }} className="dark:[&_tspan]:fill-gray-500" />
                <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false} />
                <Radar name="Portfolio"  dataKey="portfolio"  stroke="#10b981"  fill="#10b981"  fillOpacity={0.25} strokeWidth={2} />
                <Radar name="Benchmark"  dataKey="benchmark"  stroke="#f59e0b"   fill="#f59e0b"   fillOpacity={0.15} strokeWidth={2} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8rem' }} className="dark:[&_div]:bg-gray-800 dark:[&_div]:border-gray-700" />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {[['Portfolio','#10b981'],['Benchmark','#f59e0b']].map(([l,c]) => (
                <div key={l} className="flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 rounded-sm" style={{ background:c }} />
                  <span className="text-gray-600 dark:text-gray-500">{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-5">
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">Risk Breakdown by Value</div>
              <div className="space-y-3">
                {riskBreakdown.map((r,i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium" style={{ color: RISK_COLOR[r.name] }}>{r.name} Risk</span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">{fmt(r.value)} ({r.pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width:`${r.pct}%`, background: RISK_COLOR[r.name] }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">Key Risk Metrics</div>
              <div className="space-y-2">
                {[
                  { label:'Portfolio Beta',       value:portfolioBeta.toFixed(2), note:'vs market', color: portfolioBeta>1.5?'text-rose-600 dark:text-rose-400':portfolioBeta>1?'text-amber-600 dark:text-amber-400':'text-emerald-600 dark:text-emerald-400' },
                  { label:'Sharpe Ratio (est.)',   value:'1.42',  note:'risk-adjusted return', color:'text-emerald-600 dark:text-emerald-400' },
                  { label:'Max Drawdown (12mo)',   value:'-14.2%', note:'worst peak-to-trough', color:'text-rose-600 dark:text-rose-400' },
                  { label:'Volatility (Annual)',   value:'18.4%', note:'std deviation', color:'text-amber-600 dark:text-amber-400' },
                  { label:'Value at Risk (95%)',   value:fmt(6120), note:'1-day 95% VaR', color:'text-rose-600 dark:text-rose-400' },
                  { label:'Correlation to S&P',   value:'0.82',  note:'30-day rolling', color:'text-gray-500 dark:text-gray-500' },
                ].map((m,i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                    <div>
                      <div className="text-sm text-gray-900 dark:text-gray-300">{m.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">{m.note}</div>
                    </div>
                    <span className={`text-base font-bold ${m.color}`}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Allocation Tab ── */}
      {tab === 'allocation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">Asset Class Allocation</div>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={allocationData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {allocationData.map((e,i) => <Cell key={i} fill={Object.values(CAT_COLORS)[i % 6]} />)}
                </Pie>
                <Tooltip formatter={v=>fmt(v)} contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8rem' }} className="dark:[&_div]:bg-gray-800 dark:[&_div]:border-gray-700" />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-3">
              {allocationData.map((d,i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm" style={{ background:Object.values(CAT_COLORS)[i%6] }} />
                    <span className="text-xs text-gray-600 dark:text-gray-500">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width:`${d.pct}%`, background:Object.values(CAT_COLORS)[i%6] }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-10 text-right">{d.pct}%</span>
                    <span className="text-xs text-gray-500 dark:text-gray-500 w-16 text-right">{fmt(d.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">Sector Allocation</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={sectorData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" horizontal={false} />
                <XAxis type="number" tick={{ fill:'#6b7280', fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`} className="dark:[&_tspan]:fill-gray-500" />
                <YAxis dataKey="name" type="category" tick={{ fill:'#6b7280', fontSize:11 }} axisLine={false} tickLine={false} width={90} className="dark:[&_tspan]:fill-gray-500" />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8rem' }} formatter={v=>fmt(v)} className="dark:[&_div]:bg-gray-800 dark:[&_div]:border-gray-700" />
                <Bar dataKey="value" name="Value" fill="#10b981" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Icons.Warning />
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">Concentration Warning</div>
              </div>
              <div className="text-sm text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4 inline mr-1" /> Technology sector represents {techConcentration}% of your portfolio. Consider diversifying to reduce concentration risk.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}