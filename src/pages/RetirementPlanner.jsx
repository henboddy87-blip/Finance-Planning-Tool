import React, { useState, useMemo } from 'react'
import { CheckCircle, CircleDollarSign, TrendingUp, Users, Calendar, SlidersHorizontal, Check, AlertTriangle } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import PageHeader from '../components/PageHeader.jsx'
import { fmt } from '../utils/format.js'

function generateRetirementProjection({ currentAge, retireAge, currentSavings, monthlyContrib, annualReturn, inflationRate }) {
  const data = []
  let balance = currentSavings
  const monthlyReturn = annualReturn / 100 / 12
  const monthlyInflation = inflationRate / 100 / 12
  let realBalance = currentSavings

  for (let age = currentAge; age <= 90; age++) {
    const isRetired = age >= retireAge
    for (let m = 0; m < 12; m++) {
      if (!isRetired) {
        balance = balance * (1 + monthlyReturn) + monthlyContrib
        realBalance = realBalance * (1 + monthlyReturn - monthlyInflation) + monthlyContrib
      } else {
        const withdrawal = 5000
        balance = Math.max(0, balance * (1 + monthlyReturn) - withdrawal)
        realBalance = Math.max(0, realBalance * (1 + monthlyReturn - monthlyInflation) - withdrawal)
      }
    }
    data.push({ age, balance: Math.round(balance), real: Math.round(realBalance) })
  }
  return data
}



const Icons = {
  Target: () => <CheckCircle className="w-4 h-4" />,
  Income: () => <CircleDollarSign className="w-4 h-4" />,
  Growth: () => <TrendingUp className="w-4 h-4" />,
  Social: () => <Users className="w-4 h-4" />,
  Calendar: () => <Calendar className="w-4 h-4" />,
  Sliders: () => <SlidersHorizontal className="w-4 h-4" />,
}

export default function RetirementPlanner() {
  const [params, setParams] = useState({
    currentAge: 32,
    retireAge: 65,
    currentSavings: 465000,
    monthlyContrib: 1800,
    annualReturn: 7,
    inflationRate: 3,
    desiredIncome: 60000,
  })

  const data = useMemo(() => generateRetirementProjection(params), [params])
  const retireData = data.find(d => d.age === params.retireAge)
  const retireBalance = retireData?.balance || 0
  const safeWithdrawal = retireBalance * 0.04
  const target = params.desiredIncome * 25
  const onTrack = retireBalance >= target

  const yearsToRetire = params.retireAge - params.currentAge
  const totalContribs = params.monthlyContrib * 12 * yearsToRetire
  const investmentGrowth = retireBalance - params.currentSavings - totalContribs

  const update = (k, v) => setParams(p => ({ ...p, [k]: parseFloat(v) || 0 }))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 animate-fadeIn">
      <PageHeader
        title="Retirement Planner"
        subtitle="Model your path to financial independence"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:scale-[1.02] transition-all duration-200 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none opacity-30 dark:opacity-20" style={{ background: `radial-gradient(circle at top right, ${onTrack ? '#10b981' : '#f43f5e'}20, transparent 70%)` }} />
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-2">Projected at Retirement</div>
          <div className={`text-2xl md:text-3xl font-bold ${onTrack ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{fmt(retireBalance)}</div>
          <span className={`inline-flex items-center gap-1 mt-2 px-2 py-1 text-xs rounded-full ${
            onTrack 
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
              : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
          }`}>
            <div className="flex items-center gap-1">{onTrack ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />} {onTrack ? 'On Track' : 'Below Target'}</div>
          </span>
        </div>
        
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:scale-[1.02] transition-all duration-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-2">Target Needed</div>
          <div className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-400">{fmt(target)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">25× desired income</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:scale-[1.02] transition-all duration-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-2">Safe Annual Income</div>
          <div className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{fmt(safeWithdrawal)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">4% withdrawal rule</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:scale-[1.02] transition-all duration-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-2">Investment Growth</div>
          <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">{fmt(investmentGrowth)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">from compounding</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Chart */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-1">Wealth Projection</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">Nominal vs inflation-adjusted</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-500">Retire at age</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{params.retireAge}</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="nomGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="realGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="age" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: 'Age', position: 'insideBottom', fill: '#6b7280', fontSize: 11, dy: 5 }} className="dark:[&_tspan]:fill-gray-500" />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000000 ? `$${(v/1000000).toFixed(1)}M` : `$${(v/1000).toFixed(0)}k`} className="dark:[&_tspan]:fill-gray-500" />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8rem' }} formatter={(v) => fmt(v)} labelFormatter={v => `Age ${v}`} className="dark:[&_div]:bg-gray-800 dark:[&_div]:border-gray-700" />
              <ReferenceLine x={params.retireAge} stroke="#f59e0b" strokeDasharray="6 3" label={{ value: 'Retire', fill: '#f59e0b', fontSize: 10 }} />
              <ReferenceLine y={target} stroke="#f43f5e" strokeDasharray="6 3" label={{ value: 'Target', fill: '#f43f5e', fontSize: 10, position: 'right' }} />
              <Area type="monotone" dataKey="balance" name="Nominal" stroke="#10b981" strokeWidth={2} fill="url(#nomGrad)" />
              <Area type="monotone" dataKey="real" name="Real (Adj.)" stroke="#3b82f6" strokeWidth={2} fill="url(#realGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Icons.Sliders />
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">Adjust Assumptions</div>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Current Age', key: 'currentAge', min: 18, max: 80, suffix: ' yrs' },
              { label: 'Retirement Age', key: 'retireAge', min: 40, max: 80, suffix: ' yrs' },
              { label: 'Current Savings', key: 'currentSavings', min: 0, max: 2000000, step: 5000, suffix: '', fmt: true },
              { label: 'Monthly Contribution', key: 'monthlyContrib', min: 0, max: 10000, step: 100, suffix: '', fmt: true },
              { label: 'Annual Return', key: 'annualReturn', min: 1, max: 15, step: 0.5, suffix: '%' },
              { label: 'Inflation Rate', key: 'inflationRate', min: 0, max: 8, step: 0.5, suffix: '%' },
              { label: 'Desired Income/yr', key: 'desiredIncome', min: 20000, max: 300000, step: 5000, suffix: '', fmt: true },
            ].map(({ label, key, min, max, step = 1, suffix, fmt: isFmt }) => (
              <div key={key}>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-gray-600 dark:text-gray-500 font-medium">{label}</label>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {isFmt ? fmt(params[key]) : `${params[key]}${suffix}`}
                  </span>
                </div>
                <input 
                  type="range" 
                  min={min} 
                  max={max} 
                  step={step} 
                  value={params[key]} 
                  onChange={e => update(key, e.target.value)}
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:scale-[1.02] transition-all duration-200">
          <div className="flex items-center gap-2 mb-3">
            <Icons.Income />
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500">Total Contributions</div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{fmt(totalContribs)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500">{yearsToRetire} yrs × {fmt(params.monthlyContrib * 12)}/yr</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:scale-[1.02] transition-all duration-200">
          <div className="flex items-center gap-2 mb-3">
            <Icons.Growth />
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500">Investment Growth</div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">{fmt(investmentGrowth)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500">{params.annualReturn}% annual return</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:scale-[1.02] transition-all duration-200">
          <div className="flex items-center gap-2 mb-3">
            <Icons.Social />
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500">Social Security Est.</div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">{fmt(24000)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500">age 67 estimated benefit</div>
        </div>
      </div>
    </div>
  )
}