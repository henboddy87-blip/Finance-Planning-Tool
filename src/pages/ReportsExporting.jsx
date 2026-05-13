import React, { useState } from 'react'
import { FileText, File, Table, Code, Download, RefreshCw, Save, Edit2, Play, Loader2 } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import PageHeader from '../components/PageHeader.jsx'
import { fmt, fmtFull, COLORS } from '../utils/format.js'
import { useToast, useLocalStorage } from '../context/AppContext.jsx'

/* ── Dynamic Mock Data Generators ── */
function generateDataForYear(yearStr) {
  const year = parseInt(yearStr)
  const baseMulti = 1 + ((year - 2021) * 0.08) // simulate 8% growth per year
  
  const monthlyData = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => {
    const income = Math.round((8000 + (Math.random() * 1000)) * baseMulti)
    const expenses = Math.round((5000 + (Math.random() * 800)) * baseMulti)
    const savings = income - expenses
    return { month: m, income, expenses, savings, investments: Math.round(1800 * baseMulti), networth: Math.round(100000 + (year-2021)*30000 + (i*savings)) }
  })

  const yearlyData = [2021,2022,2023,2024,2025].map(y => {
    const yMulti = 1 + ((y - 2021) * 0.08)
    return { year: y.toString(), income: Math.round(84000 * yMulti), expenses: Math.round(63000 * yMulti), savings: Math.round(21000 * yMulti), taxPaid: Math.round(14200 * yMulti), networth: Math.round(98000 + ((y-2021)*20000)) }
  })

  const grossIncome = Math.round(100800 * baseMulti)
  const taxData = {
    grossIncome, adjustments: Math.round(-27150 * baseMulti), agi: Math.round(73650 * baseMulti),
    deductions: Math.round(-14600 * baseMulti), taxableIncome: Math.round(59050 * baseMulti),
    fedTax: Math.round(8142 * baseMulti), stateTax: Math.round(3251 * baseMulti),
    ficaTax: Math.round(7711 * baseMulti), totalTax: Math.round(19104 * baseMulti), effectiveRate: 18.96
  }

  const expensesData = [
    { name:'Housing', value:Math.round(22200*baseMulti) }, { name:'Food', value:Math.round(7080*baseMulti) },
    { name:'Transport', value:Math.round(4440*baseMulti) }, { name:'Insurance', value:Math.round(6300*baseMulti) },
    { name:'Entertainment', value:Math.round(3480*baseMulti) }, { name:'Subscriptions', value:Math.round(2700*baseMulti) },
    { name:'Healthcare', value:Math.round(1740*baseMulti) }, { name:'Other', value:Math.round(14460*baseMulti) },
  ]

  return { monthlyData, yearlyData, taxData, expensesData }
}

const CT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
      <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">{label}</div>
      {payload.map((p,i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-600 dark:text-gray-400">{p.name}:</span>
          <span className="text-gray-900 dark:text-gray-200 font-semibold">
            {p.name.includes('Rate') ? `${p.value}%` : fmt(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ── Initial Templates ── */
const initialCustomReports = [
  { id: 1, name:'Monthly Budget Review',    icon:'bar', lastRun:'Apr 30', freq:'Monthly' },
  { id: 2, name:'Annual Tax Summary',       icon:'clipboard', lastRun:'Apr 15', freq:'Yearly'  },
  { id: 3, name:'Investment Performance',   icon:'trending', lastRun:'Apr 28', freq:'Weekly'  },
]


// Professional icon components
const Icons = {
  CSV: () => <FileText className="w-3.5 h-3.5" />,
  PDF: () => <File className="w-3.5 h-3.5" />,
  Excel: () => <Table className="w-3.5 h-3.5" />,
  JSON: () => <Code className="w-3.5 h-3.5" />,
  Download: () => <Download className="w-4 h-4" />,
  Generate: () => <RefreshCw className="w-4 h-4" />,
  Save: () => <Save className="w-4 h-4" />,
  Edit: () => <Edit2 className="w-3.5 h-3.5" />,
  Run: () => <Play className="w-3.5 h-3.5" />,
  Bar: () => <BarChart2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
  Clipboard: () => <List className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
  Trending: () => <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
  FileText: () => <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
}

/* ── Main ─────────────────────────────────────────────── */
export default function ReportsExporting() {
  const toast = useToast()
  const [tab, setTab] = useState('monthly')
  const [reportYear, setYear] = useState('2025')
  const [reportMonth, setMonth] = useState('Apr')
  const [generating, setGen] = useState(null)
  
  const [customReports, setCustomReports] = useLocalStorage('wp_custom_reports', initialCustomReports)
  const [customForm, setCustomForm] = useState({ name: '', type: 'Income Summary', range: 'This Month', groupBy: 'Category', format: 'PDF Report' })

  // Re-generate dynamic data whenever reportYear changes
  const dynamicData = React.useMemo(() => generateDataForYear(reportYear), [reportYear])

  const handleExport = (format, name) => {
    setGen(format)
    setTimeout(() => { 
      setGen(null)
      let dataToExport = []
      if (tab === 'monthly') dataToExport = dynamicData.monthlyData
      else if (tab === 'yearly') dataToExport = dynamicData.yearlyData
      else if (tab === 'tax') dataToExport = [dynamicData.taxData]
      else dataToExport = customReports

      if (format === 'CSV' || format === 'Excel') {
        if (dataToExport.length > 0) {
          const keys = Object.keys(dataToExport[0])
          const csvContent = [keys.join(','), ...dataToExport.map(row => keys.map(k => row[k]).join(','))].join('\n')
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.setAttribute('download', `${name.replace(/\s+/g,'_')}.csv`)
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      } else if (format === 'JSON') {
        const jsonContent = JSON.stringify(dataToExport, null, 2)
        const blob = new Blob([jsonContent], { type: 'application/json' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.setAttribute('download', `${name.replace(/\s+/g,'_')}.json`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else if (format === 'PDF') {
        window.print() // Native print dialog handles PDF properly
      }
      toast.success('Export Complete', `"${name}" downloaded as ${format.toUpperCase()}`)
    }, 800)
  }

  const ExportBar = ({ name }) => (
    <div className="flex gap-2 flex-wrap mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <span className="text-xs text-gray-500 dark:text-gray-500 self-center">Export:</span>
      {['CSV','PDF','Excel','JSON'].map(f => {
        const Icon = Icons[f]
        return (
          <button 
            key={f} 
            onClick={() => handleExport(f, name)} 
            className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-1"
          >
            {generating === f ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Icon />
            )}
            {f}
          </button>
        )
      })}
    </div>
  )

  const TABS = ['monthly','yearly','tax','custom']

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 animate-fadeIn">
      <PageHeader
        title="Reports & Exporting"
        subtitle="Financial reports, tax summaries and data exports"
        actions={
          <div className="flex gap-3">
            <select 
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
              value={reportYear} 
              onChange={e=>setYear(e.target.value)}
            >
              {['2021','2022','2023','2024','2025'].map(y=><option key={y}>{y}</option>)}
            </select>
            <button 
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
              onClick={() => handleExport('PDF','Full Report')}
            >
              <Icons.Download />
              Export All
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-0 mb-5 border-b border-gray-200 dark:border-gray-700">
        {TABS.map(t => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            className={`px-4 py-2 text-sm font-medium capitalize transition-all border-b-2 ${
              tab === t 
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                : 'border-transparent text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t} Report
          </button>
        ))}
      </div>

      {/* ── Monthly Report ── */}
      {tab === 'monthly' && (
        <div>
          <div className="flex gap-2 mb-4 items-center flex-wrap">
            <span className="text-xs text-gray-500 dark:text-gray-500">Showing:</span>
            {['Jan','Feb','Mar','Apr'].map(m => (
              <button 
                key={m} 
                onClick={() => setMonth(m)} 
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  reportMonth === m 
                    ? 'bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500' 
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {m} {reportYear}
              </button>
            ))}
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            {[
              { label:'Total Income',   value:fmt(8400),  color:'text-emerald-600 dark:text-emerald-400' },
              { label:'Total Expenses', value:fmt(5200),  color:'text-rose-600 dark:text-rose-400' },
              { label:'Net Savings',    value:fmt(3200),  color:'text-amber-600 dark:text-amber-400' },
              { label:'Savings Rate',   value:'38.1%',    color:'text-blue-600 dark:text-blue-400' },
            ].map((s,i) => (
              <div key={i} className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-2">{s.label}</div>
                <div className={`text-2xl md:text-3xl font-bold ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">4-Month Overview</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dynamicData.monthlyData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis dataKey="month" tick={{ fill:'#6b7280', fontSize:11 }} axisLine={false} tickLine={false} className="dark:[&_tspan]:fill-gray-500" />
                  <YAxis tick={{ fill:'#6b7280', fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v/1000}k`} className="dark:[&_tspan]:fill-gray-500" />
                  <Tooltip content={<CT />} />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4,4,0,0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4,4,0,0]} />
                  <Bar dataKey="savings" name="Savings" fill="#3b82f6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <ExportBar name={`Monthly Report ${reportMonth} ${reportYear}`} />
            </div>
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-3">Expense Breakdown</div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={dynamicData.expensesData} cx="50%" cy="50%" outerRadius={65} paddingAngle={2} dataKey="value">
                    {dynamicData.expensesData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v=>fmt(v)} contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8rem' }} className="dark:[&_div]:bg-gray-800 dark:[&_div]:border-gray-700" />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2 max-h-24 overflow-y-auto">
                {dynamicData.expensesData.map((d,i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <div className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-sm" style={{ background:COLORS[i%COLORS.length] }} />
                      <span className="text-gray-600 dark:text-gray-500">{d.name}</span>
                    </div>
                    <span className="text-gray-900 dark:text-gray-300">{fmt(d.value/12)}/mo</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed table */}
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">Month-by-Month Breakdown</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Month</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Income</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Expenses</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Savings</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Investments</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Net Worth</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Save Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {dynamicData.monthlyData.map((r,i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="p-4 text-sm font-medium text-gray-900 dark:text-gray-300">{r.month} {reportYear}</td>
                      <td className="p-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">{fmt(r.income)}</td>
                      <td className="p-4 text-sm text-rose-600 dark:text-rose-400">{fmt(r.expenses)}</td>
                      <td className="p-4 text-sm font-semibold text-amber-600 dark:text-amber-400">{fmt(r.savings)}</td>
                      <td className="p-4 text-sm text-blue-600 dark:text-blue-400">{fmt(r.investments)}</td>
                      <td className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300">{fmt(r.networth)}</td>
                      <td className="p-4"><span className="px-2 py-1 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">{((r.savings/r.income)*100).toFixed(1)}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-5 border-t border-gray-200 dark:border-gray-700">
              <ExportBar name={`Full Monthly Report ${reportYear}`} />
            </div>
          </div>
        </div>
      )}

      {/* ── Yearly Report ── */}
      {tab === 'yearly' && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            {[
              { label:`${reportYear} Income`,   value:fmt(100800), color:'text-emerald-600 dark:text-emerald-400' },
              { label:`${reportYear} Expenses`, value:fmt(62400),  color:'text-rose-600 dark:text-rose-400' },
              { label:`${reportYear} Savings`,  value:fmt(38400),  color:'text-amber-600 dark:text-amber-400' },
              { label:`${reportYear} Tax Paid`, value:fmt(18200),  color:'text-purple-600 dark:text-purple-400' },
            ].map((s,i) => (
              <div key={i} className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-2">{s.label}</div>
                <div className={`text-2xl md:text-3xl font-bold ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-5">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">5-Year Financial History</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dynamicData.yearlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="year" tick={{ fill:'#6b7280', fontSize:11 }} axisLine={false} tickLine={false} className="dark:[&_tspan]:fill-gray-500" />
                <YAxis tick={{ fill:'#6b7280', fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v/1000}k`} className="dark:[&_tspan]:fill-gray-500" />
                <Tooltip content={<CT />} />
                <Bar dataKey="income"   name="Income"   fill="#10b981" radius={[4,4,0,0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4,4,0,0]} />
                <Bar dataKey="savings"  name="Savings"  fill="#3b82f6" radius={[4,4,0,0]} />
                <Bar dataKey="taxPaid"  name="Tax"      fill="#8b5cf6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <ExportBar name={`Yearly Report ${reportYear}`} />
          </div>
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">Year-over-Year Summary</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Year</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Income</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Expenses</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Savings</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Tax Paid</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Net Worth</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Save Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {dynamicData.yearlyData.map((r,i) => (
                    <tr key={i} className={`border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${r.year===reportYear ? 'bg-emerald-50 dark:bg-emerald-900/10' : ''}`}>
                      <td className="p-4 text-sm font-medium text-gray-900 dark:text-gray-300">
                        {r.year} {r.year===reportYear && <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">current</span>}
                      </td>
                      <td className="p-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">{fmt(r.income)}</td>
                      <td className="p-4 text-sm text-rose-600 dark:text-rose-400">{fmt(r.expenses)}</td>
                      <td className="p-4 text-sm font-semibold text-amber-600 dark:text-amber-400">{fmt(r.savings)}</td>
                      <td className="p-4 text-sm text-purple-600 dark:text-purple-400">{fmt(r.taxPaid)}</td>
                      <td className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300">{fmt(r.networth)}</td>
                      <td className="p-4"><span className="px-2 py-1 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">{((r.savings/r.income)*100).toFixed(1)}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tax Report ── */}
      {tab === 'tax' && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">Tax-Ready Summary — {reportYear}</div>
              <div className="space-y-0">
                {[
                  { label:'Gross Income',           value:dynamicData.taxData.grossIncome,    color:'text-emerald-600 dark:text-emerald-400', bold:false },
                  { label:'Pre-tax Adjustments',    value:dynamicData.taxData.adjustments,    color:'text-emerald-600 dark:text-emerald-400', bold:false },
                  { label:'Adjusted Gross Income',  value:dynamicData.taxData.agi,            color:'text-amber-600 dark:text-amber-400',  bold:true },
                  null,
                  { label:'Standard Deduction',     value:dynamicData.taxData.deductions,     color:'text-emerald-600 dark:text-emerald-400', bold:false },
                  { label:'Taxable Income',         value:dynamicData.taxData.taxableIncome,  color:'text-amber-600 dark:text-amber-400',  bold:true },
                  null,
                  { label:'Federal Income Tax',     value:dynamicData.taxData.fedTax,         color:'text-rose-600 dark:text-rose-400', bold:false },
                  { label:'State Tax (est.)',       value:dynamicData.taxData.stateTax,       color:'text-rose-600 dark:text-rose-400', bold:false },
                  { label:'FICA / Payroll Tax',     value:dynamicData.taxData.ficaTax,        color:'text-pink-600 dark:text-pink-400', bold:false },
                  { label:'TOTAL TAX OWED',         value:dynamicData.taxData.totalTax,       color:'text-rose-600 dark:text-rose-400', bold:true },
                  null,
                  { label:'After-Tax Income',       value:dynamicData.taxData.grossIncome-dynamicData.taxData.totalTax, color:'text-emerald-600 dark:text-emerald-400', bold:true },
                  { label:'Effective Tax Rate',     value:`${dynamicData.taxData.effectiveRate}%`, color:'text-amber-600 dark:text-amber-400', bold:false, isStr:true },
                ].map((item,i) => item === null ? (
                  <div key={i} className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
                ) : (
                  <div key={i} className={`flex justify-between py-2 ${item.bold ? 'text-sm' : 'text-xs'}`}>
                    <span className="text-gray-600 dark:text-gray-500">{item.label}</span>
                    <span className={`${item.color} font-semibold`}>{item.isStr ? item.value : (item.value<0?'-':'')+fmt(Math.abs(item.value))}</span>
                  </div>
                ))}
              </div>
              <ExportBar name={`Tax Summary ${reportYear}`} />
            </div>
            <div className="space-y-5">
              <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">Tax Deduction Opportunities</div>
                {[
                  { label:'Max 401(k) Contribution', limit:23000, used:23000 },
                  { label:'HSA Contribution',         limit:4150,  used:4150 },
                  { label:'IRA Contribution',         limit:7000,  used:0 },
                  { label:'Charitable Donations',     limit:null,  used:2000 },
                ].map((d,i) => (
                  <div key={i} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{d.label}</span>
                      <span className={`font-semibold ${d.limit && d.used>=d.limit ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {d.limit ? `${fmt(d.used)} / ${fmt(d.limit)}` : fmt(d.used)}
                      </span>
                    </div>
                    {d.limit && (
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width:`${(d.used/d.limit)*100}%`, background: d.used>=d.limit ? '#10b981' : '#f59e0b' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-3">Important Tax Dates</div>
                {[
                  { date:'Jan 31', event:'W-2s must be sent by employers', done:true },
                  { date:'Apr 15', event:'Federal tax return deadline', done:true },
                  { date:'Jun 15', event:'Q2 estimated tax payment due', done:false },
                  { date:'Sep 15', event:'Q3 estimated tax payment due', done:false },
                  { date:'Jan 15', event:'Q4 estimated tax payment due', done:false },
                ].map((d,i) => (
                  <div key={i} className="flex gap-2 items-center py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                    <span className={`text-xs font-bold min-w-[50px] ${d.done ? 'text-gray-400 dark:text-gray-500' : 'text-amber-600 dark:text-amber-400'}`}>{d.date}</span>
                    <span className={`text-xs flex-1 ${d.done ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}`}>{d.event}</span>
                    {d.done && <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">✓</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom Report ── */}
      {tab === 'custom' && (
        <div>
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-5">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">Custom Report Generator</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1">Report Name</label>
                <input type="text" placeholder="E.g., My Q3 Budget" className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500" value={customForm.name} onChange={e => setCustomForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1">Report Type</label>
                <select className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500" value={customForm.type} onChange={e => setCustomForm(p => ({ ...p, type: e.target.value }))}>
                  {['Income Summary','Expense Analysis','Net Worth Trend','Investment Performance','Debt Payoff','Tax Projection','Budget vs Actual','Savings Progress'].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1">Date Range</label>
                <select className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500" value={customForm.range} onChange={e => setCustomForm(p => ({ ...p, range: e.target.value }))}>
                  {['This Month','Last Month','Last 3 Months','Last 6 Months','This Year','Last Year','Custom Range'].map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1">Group By</label>
                <select className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500" value={customForm.groupBy} onChange={e => setCustomForm(p => ({ ...p, groupBy: e.target.value }))}>
                  {['Category','Month','Week','Account','Payee'].map(g=><option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1">Output Format</label>
                <select className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500" value={customForm.format} onChange={e => setCustomForm(p => ({ ...p, format: e.target.value }))}>
                  {['PDF Report','Excel Spreadsheet','CSV Data','JSON Export'].map(f=><option key={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => handleExport(customForm.format.includes('CSV') ? 'CSV' : customForm.format.includes('JSON') ? 'JSON' : customForm.format.includes('PDF') ? 'PDF' : 'Excel', customForm.name || 'Custom Report')}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Icons.Generate />
                Generate Report
              </button>
              <button 
                onClick={() => {
                  if (!customForm.name) { toast.error('Name Required', 'Please enter a name for the report.'); return }
                  const existing = customReports.find(r => r.name === customForm.name)
                  if (existing) {
                    setCustomReports(prev => prev.map(r => r.name === customForm.name ? { ...r, ...customForm } : r))
                    toast.success('Updated', 'Template updated successfully.')
                  } else {
                    setCustomReports(prev => [...prev, { id: Date.now(), name: customForm.name, icon: 'file', lastRun: 'Never', freq: 'On Demand', ...customForm }])
                    toast.success('Saved', 'Template saved successfully.')
                  }
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Icons.Save />
                Save Template
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">Saved Report Templates</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {customReports.map((t,i) => (
                <div key={t.id} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer">
                  <div className="flex gap-2 items-center mb-2">
                    <span className="text-xl">{t.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-200">{t.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">Last: {t.lastRun}</div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">{t.freq}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleExport(t.format?.includes('CSV') ? 'CSV' : t.format?.includes('JSON') ? 'JSON' : t.format?.includes('PDF') ? 'PDF' : 'Excel', t.name)} className="flex-1 px-2 py-1 text-xs font-medium bg-emerald-100 dark:bg-emerald-600/20 hover:bg-emerald-200 dark:hover:bg-emerald-600/40 text-emerald-700 dark:text-emerald-400 rounded-md transition-all flex items-center justify-center gap-1">
                      <Icons.Run /> Run
                    </button>
                    <button onClick={() => setCustomForm({ name: t.name, type: t.type||'Income Summary', range: t.range||'This Month', groupBy: t.groupBy||'Category', format: t.format||'PDF Report' })} className="px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-all flex items-center justify-center gap-1">
                      <Icons.Edit /> Edit
                    </button>
                    <button onClick={() => { setCustomReports(prev => prev.filter(x => x.id !== t.id)); toast.success('Deleted', 'Template removed.') }} className="px-2 py-1 text-xs font-medium bg-rose-100 dark:bg-rose-900/20 hover:bg-rose-200 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-md transition-all flex items-center justify-center">
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}