import React, { useState, useMemo } from 'react'
import { Calculator, SlidersHorizontal } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import PageHeader from '../components/PageHeader.jsx'
import { fmt, fmtFull } from '../utils/format.js'

const BRACKETS_2024 = {
  single: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
  married: [
    { min: 0, max: 23200, rate: 0.10 },
    { min: 23200, max: 94300, rate: 0.12 },
    { min: 94300, max: 201050, rate: 0.22 },
    { min: 201050, max: 383900, rate: 0.24 },
    { min: 383900, max: 487450, rate: 0.32 },
    { min: 487450, max: 731200, rate: 0.35 },
    { min: 731200, max: Infinity, rate: 0.37 },
  ],
}

const STANDARD_DEDUCTION = { single: 14600, married: 29200 }

function calcTax(taxableIncome, brackets) {
  let tax = 0
  let remaining = taxableIncome
  const breakdown = []
  for (const b of brackets) {
    if (remaining <= 0) break
    const taxable = Math.min(remaining, b.max - b.min)
    const t = taxable * b.rate
    if (taxable > 0) breakdown.push({ rate: `${(b.rate * 100).toFixed(0)}%`, taxable: Math.round(taxable), tax: Math.round(t) })
    tax += t
    remaining -= taxable
  }
  return { tax: Math.round(tax), breakdown }
}



const Icons = {
  Calculator: () => <Calculator className="w-4 h-4" />,
  Toggle: () => <SlidersHorizontal className="w-3.5 h-3.5" />,
}

export default function TaxCalculator() {
  const [filing, setFiling] = useState('single')
  const [income, setIncome] = useState({ wages: 100000, selfEmployed: 0, interest: 1200, dividends: 2400, capitalGains: 5000, other: 0 })
  const [deductions, setDeductions] = useState({ mortgage: 12000, charitable: 2000, medical: 0, stateLocal: 8000, other: 0 })
  const [useItemized, setUseItemized] = useState(false)
  const [retirement401k, setRetirement401k] = useState(23000)
  const [hsaContrib, setHsaContrib] = useState(4150)

  const calc = useMemo(() => {
    const grossIncome = Object.values(income).reduce((s, v) => s + v, 0)
    const selfEmployTax = income.selfEmployed * 0.9235 * 0.153 / 2
    const agi = grossIncome - retirement401k - hsaContrib - selfEmployTax
    const standardDed = STANDARD_DEDUCTION[filing]
    const itemizedDed = Math.min(deductions.stateLocal, 10000) + deductions.mortgage + deductions.charitable + deductions.medical + deductions.other
    const chosenDed = useItemized ? itemizedDed : standardDed
    const taxableIncome = Math.max(0, agi - chosenDed)
    const brackets = BRACKETS_2024[filing]
    const { tax: fedTax, breakdown } = calcTax(taxableIncome, brackets)
    const stateRate = 0.055
    const stateTax = Math.round(taxableIncome * stateRate)
    const ficaTax = Math.min(income.wages, 168600) * 0.062 + income.wages * 0.0145
    const seTax = income.selfEmployed * 0.9235 * 0.153
    const totalTax = fedTax + stateTax + Math.round(ficaTax) + Math.round(seTax)
    const effectiveRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0
    const marginalBracket = brackets.find(b => taxableIncome >= b.min && taxableIncome < b.max)
    return { grossIncome, agi, taxableIncome, fedTax, stateTax, ficaTax: Math.round(ficaTax), seTax: Math.round(seTax), totalTax, effectiveRate, breakdown, standardDed, itemizedDed, chosenDed, marginalRate: marginalBracket ? marginalBracket.rate * 100 : 0 }
  }, [income, deductions, filing, retirement401k, hsaContrib, useItemized])

  const pieData = [
    { name: 'Federal Tax', value: calc.fedTax, color: '#f43f5e' },
    { name: 'State Tax', value: calc.stateTax, color: '#f97316' },
    { name: 'FICA', value: calc.ficaTax, color: '#8b5cf6' },
    { name: 'Net Income', value: Math.max(0, calc.grossIncome - calc.totalTax), color: '#10b981' },
  ]

  const updateIncome = (k, v) => setIncome(p => ({ ...p, [k]: parseFloat(v) || 0 }))
  const updateDed = (k, v) => setDeductions(p => ({ ...p, [k]: parseFloat(v) || 0 }))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 animate-fadeIn">
      <PageHeader
        title="Tax Calculator"
        subtitle="Estimate your 2024 federal and state income taxes"
        actions={
          <div className="flex bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
            {['single', 'married'].map(f => (
              <button key={f} onClick={() => setFiling(f)} className={`px-3 py-1.5 text-sm font-medium transition-all ${
                filing === f 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-transparent text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}>
                {f === 'single' ? 'Single' : 'Married Filing Jointly'}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/5 backdrop-blur-sm rounded-xl border border-emerald-200 dark:border-emerald-500/30 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-gray-500 mb-2">Gross Income</div>
          <div className="text-2xl md:text-3xl font-bold text-emerald-700 dark:text-emerald-400">{fmt(calc.grossIncome)}</div>
        </div>
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-2">Total Tax Owed</div>
          <div className="text-2xl md:text-3xl font-bold text-rose-600 dark:text-rose-400">{fmt(calc.totalTax)}</div>
        </div>
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-2">Effective Rate</div>
          <div className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-400">{calc.effectiveRate.toFixed(1)}%</div>
        </div>
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-2">Marginal Bracket</div>
          <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">{calc.marginalRate.toFixed(0)}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Income */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">Income Sources</div>
          <div className="space-y-3">
            {[
              { label: 'W-2 Wages / Salary', key: 'wages' },
              { label: 'Self-Employment', key: 'selfEmployed' },
              { label: 'Interest Income', key: 'interest' },
              { label: 'Dividend Income', key: 'dividends' },
              { label: 'Capital Gains', key: 'capitalGains' },
              { label: 'Other Income', key: 'other' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1">{label}</label>
                <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" type="number" value={income[key]} onChange={e => updateIncome(key, e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        {/* Deductions */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">Deductions</div>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-600 dark:text-gray-500">Itemize</span>
              <div onClick={() => setUseItemized(p => !p)} className={`w-9 h-5 rounded-full cursor-pointer transition-all ${useItemized ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-all mt-0.5 ${useItemized ? 'ml-4' : 'ml-0.5'}`} />
              </div>
            </div>
          </div>
          <div className={`p-2 bg-gray-50 dark:bg-gray-900 rounded-lg mb-3 border ${!useItemized ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-500/50' : 'border-gray-300 dark:border-gray-700'}`}>
            <div className="text-xs text-gray-600 dark:text-gray-500 mb-1">Standard Deduction</div>
            <div className={`font-semibold ${!useItemized ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-500'}`}>{fmt(calc.standardDed)}</div>
          </div>
          <div className={`p-2 bg-gray-50 dark:bg-gray-900 rounded-lg mb-3 border ${useItemized ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-500/50' : 'border-gray-300 dark:border-gray-700'}`}>
            <div className="text-xs text-gray-600 dark:text-gray-500 mb-1">Itemized Total</div>
            <div className={`font-semibold ${useItemized ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-500'}`}>{fmt(calc.itemizedDed)}</div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Mortgage Interest', key: 'mortgage' },
              { label: 'State & Local Tax (SALT)', key: 'stateLocal' },
              { label: 'Charitable Donations', key: 'charitable' },
              { label: 'Medical Expenses', key: 'medical' },
              { label: 'Other', key: 'other' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className={`block text-xs font-medium mb-1 ${useItemized ? 'text-gray-600 dark:text-gray-500' : 'text-gray-400 dark:text-gray-600'}`}>{label}</label>
                <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800" type="number" value={deductions[key]} onChange={e => updateDed(key, e.target.value)} disabled={!useItemized} />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1">401(k) / IRA Contribution</label>
              <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" type="number" value={retirement401k} onChange={e => setRetirement401k(parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1">HSA Contribution</label>
              <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors" type="number" value={hsaContrib} onChange={e => setHsaContrib(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">Tax Summary</div>
          <div className="space-y-2 mb-4">
            {[
              { label: 'Gross Income', value: calc.grossIncome, color: 'text-gray-900 dark:text-gray-200' },
              { label: `Less: ${useItemized ? 'Itemized' : 'Standard'} Deduction`, value: -calc.chosenDed, color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Less: Pre-tax Contribs', value: -(retirement401k + hsaContrib), color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Taxable Income', value: calc.taxableIncome, color: 'text-amber-600 dark:text-amber-400', bold: true },
              null,
              { label: 'Federal Income Tax', value: calc.fedTax, color: 'text-rose-600 dark:text-rose-400' },
              { label: 'State Tax (est. 5.5%)', value: calc.stateTax, color: 'text-rose-600 dark:text-rose-400' },
              { label: 'FICA / SE Tax', value: calc.ficaTax + calc.seTax, color: 'text-orange-600 dark:text-orange-400' },
              { label: 'TOTAL TAX', value: calc.totalTax, color: 'text-rose-600 dark:text-rose-400', bold: true },
              null,
              { label: 'After-tax Income', value: calc.grossIncome - calc.totalTax, color: 'text-emerald-600 dark:text-emerald-400', bold: true },
              { label: 'Monthly Take-home', value: (calc.grossIncome - calc.totalTax) / 12, color: 'text-emerald-600 dark:text-emerald-400' },
            ].map((item, i) => item === null ? (
              <div key={i} className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
            ) : (
              <div key={i} className={`flex justify-between ${item.bold ? 'text-sm' : 'text-xs'}`}>
                <span className="text-gray-600 dark:text-gray-500">{item.label}</span>
                <span className={`font-semibold ${item.color}`}>{item.value < 0 ? '-' : ''}{fmt(Math.abs(item.value))}</span>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={60} paddingAngle={2} dataKey="value">
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8rem' }} className="dark:[&_div]:bg-gray-800 dark:[&_div]:border-gray-700" />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-3">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-1 text-xs">
                <span className="w-2 h-2 rounded-sm" style={{ background: d.color }} />
                <span className="text-gray-600 dark:text-gray-500">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bracket breakdown */}
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">Federal Tax Bracket Breakdown</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Bracket</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Taxable in Bracket</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Tax Owed</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Effective Rate</th>
              </tr>
            </thead>
            <tbody>
              {calc.breakdown.map((b, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">{b.rate}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-700 dark:text-gray-300">{fmt(b.taxable)}</td>
                  <td className="p-4 text-sm font-semibold text-rose-600 dark:text-rose-400">{fmt(b.tax)}</td>
                  <td className="p-4 text-sm text-gray-500 dark:text-gray-500">{calc.grossIncome > 0 ? ((b.tax / calc.grossIncome) * 100).toFixed(1) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}