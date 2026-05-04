export const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export const fmtFull = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

export const fmtPct = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`

export const fmtNum = (n) => new Intl.NumberFormat('en-US').format(n)

export const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function generateMonthData(months = 12, startVal = 50000, growth = 0.007) {
  const data = []
  let val = startVal
  for (let i = 0; i < months; i++) {
    val = val * (1 + growth + (Math.random() - 0.45) * 0.02)
    data.push({ month: monthNames[i % 12], value: Math.round(val) })
  }
  return data
}

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max)
}

export const COLORS = [
  '#2a7d4f', '#c9a84c', '#4c7dc9', '#c94c7d', '#7d4cc9',
  '#4cc9c9', '#c97d4c', '#7dc94c', '#4cc97d', '#c94c4c'
]
