import React, { useState } from 'react'
import { Plus, RefreshCw, ChevronRight, Unlink, X, Search, Lock, Shield, Eye, Link as LinkIcon, Wallet, CreditCard, Smartphone } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import PageHeader from '../components/PageHeader.jsx'
import StatCard from '../components/StatCard.jsx'
import { fmt, fmtFull } from '../utils/format.js'
import { useToast } from '../context/AppContext.jsx'

// Connected Account
const connectedAccounts = [
  { id: 1, bank: 'ABA Bank', type: 'Checking', last4: '4821', balance: 8247.33, currency: 'USD', status: 'active', synced: '2 min ago', logo: 'https://play-lh.googleusercontent.com/WU6sZMD1UspzwqYnlACtmN60rckp8hoINSgsR21mKLJBbsHPwXtzwvOocpjC7FcO1g', color: '#005b82' },
  { id: 2, bank: 'Canadia Bank', type: 'Savings', last4: '4822', balance: 19500.00, currency: 'USD', status: 'active', synced: '2 min ago', logo: 'https://play-lh.googleusercontent.com/neBoLmWSd3k5JBQhlM8GBFfREecG2ZZyZfao5zgr0koHOQvZL_HZkX_9LkkXABUmBK4', color: '#b91d22' },
  { id: 3, bank: 'Aceleda Bank', type: 'Credit Card', last4: '7731', balance: -4200.00, currency: 'USD', status: 'active', synced: '5 min ago', logo: 'https://cccbic.org/businesses/430-logo.jpg', color: '#00478f' },
  { id: 4, bank: 'Wing Bank', type: 'Checking', last4: '3309', balance: 12200.00, currency: 'USD', status: 'active', synced: '15 min ago', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMTnHfaEfTex5H6zVSUHv0SeW6NYrd3RsYlg&s', color: '#a0cd4a' },
  { id: 5, bank: 'ChipMong Bank', type: 'Savings', last4: '8801', balance: 46500.00, currency: 'USD', status: 'active', synced: '1 hr ago', logo: 'https://www.chipmongbank.com/fb-og-image.jpg', color: '#d8232a' },
]

const availableBanks = [
  { name: 'ABA Bank', logo: 'https://play-lh.googleusercontent.com/WU6sZMD1UspzwqYnlACtmN60rckp8hoINSgsR21mKLJBbsHPwXtzwvOocpjC7FcO1g', users: '2M+' },
  { name: 'Canadia Bank', logo: 'https://play-lh.googleusercontent.com/neBoLmWSd3k5JBQhlM8GBFfREecG2ZZyZfao5zgr0koHOQvZL_HZkX_9LkkXABUmBK4', users: '2M+' },
  { name: 'Aceleda Bank', logo: 'https://cccbic.org/businesses/430-logo.jpg', users: '2M+' },
  { name: 'Wing Bank', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMTnHfaEfTex5H6zVSUHv0SeW6NYrd3RsYlg&s', users: '2M+' },
  { name: 'ChipMong Bank', logo: 'https://www.chipmongbank.com/fb-og-image.jpg', users: '2M+' },
]

const availableWallets = [
  { name: 'Apple Pay', logo: 'https://img.icons8.com/external-tal-revivo-color-tal-revivo/1200/external-apple-pay-a-mobile-payment-and-digital-wallet-service-by-apple-logo-color-tal-revivo.jpg', users: '1.5M+' },
  { name: 'Google Pay', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQR4ArUxtci1ip0bL0K9hs9QtwcJGy_gu9iYA&s', users: '900K+' },
  { name: 'PayPal', logo: 'https://thumbs.dreamstime.com/b/paypal-logo-printed-paper-chisinau-moldova-september-internet-based-digital-money-transfer-service-128373487.jpg', users: '1.2M+' },
  { name: 'Venmo', logo: 'https://play-lh.googleusercontent.com/YAKMX5YFcuE8_NogkbM7gkqrhBY6CUefbpULAVnNZLSitbo9S3Dw2FIYNqhW0d5G94Y', users: '880K+' },
  { name: 'Zelle', logo: 'https://www.citypng.com/public/uploads/preview/zelle-round-logo-icon-png-701751694968675lxmjumweha.png?v=2026040403', users: '600K+' },
  { name: 'Cash App', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Square_Cash_app_logo.svg/960px-Square_Cash_app_logo.svg.png', users: '700K+' },
]

const wallets = [
  { name: 'Apple Pay', icon: 'https://img.icons8.com/external-tal-revivo-color-tal-revivo/1200/external-apple-pay-a-mobile-payment-and-digital-wallet-service-by-apple-logo-color-tal-revivo.jpg', status: 'connected', balance: 240.00 },
  { name: 'Google Pay', icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQR4ArUxtci1ip0bL0K9hs9QtwcJGy_gu9iYA&s', status: 'connected', balance: 85.50 },
  { name: 'PayPal', icon: 'https://thumbs.dreamstime.com/b/paypal-logo-printed-paper-chisinau-moldova-september-internet-based-digital-money-transfer-service-128373487.jpg', status: 'connected', balance: 1240.32 },
  { name: 'Venmo', icon: 'https://play-lh.googleusercontent.com/YAKMX5YFcuE8_NogkbM7gkqrhBY6CUefbpULAVnNZLSitbo9S3Dw2FIYNqhW0d5G94Y', status: 'disconnected', balance: 0 },
  { name: 'Zelle', icon: 'https://www.citypng.com/public/uploads/preview/zelle-round-logo-icon-png-701751694968675lxmjumweha.png?v=2026040403', status: 'connected', balance: 0 },
]

const recentSynced = [
  { bank: 'ABA Bank', desc: 'Whole Foods Market', cat: 'Food', date: 'Apr 28', amount: -127.40, synced: true },
  { bank: 'Canadia Bank', desc: 'Salary - Employer Inc.', cat: 'Income', date: 'Apr 28', amount: 4200.00, synced: true },
  { bank: 'Aceleda Bank', desc: 'Amazon.com', cat: 'Shopping', date: 'Apr 27', amount: -89.99, synced: true },
  { bank: 'Wing Bank', desc: 'Netflix', cat: 'Entertainment', date: 'Apr 26', amount: -15.99, synced: true },
  { bank: 'ChipMong Bank', desc: 'Shell Gas Station', cat: 'Transport', date: 'Apr 26', amount: -62.00, synced: true },
  { bank: 'ABA Bank', desc: 'Mortgage Payment', cat: 'Housing', date: 'Apr 25', amount: -1850.00, synced: true },
  { bank: 'PayPal', desc: 'Freelance Payment', cat: 'Income', date: 'Apr 24', amount: 350.00, synced: false },
  { bank: 'Canadia Bank', desc: 'Gym Membership', cat: 'Health', date: 'Apr 23', amount: -49.00, synced: true },
]

const balanceHistory = [
  { date: 'Nov', checking: 6200, savings: 14000, credit: -3800 },
  { date: 'Dec', checking: 5800, savings: 15200, credit: -5100 },
  { date: 'Jan', checking: 7400, savings: 16800, credit: -2900 },
  { date: 'Feb', checking: 6900, savings: 17900, credit: -3400 },
  { date: 'Mar', checking: 7800, savings: 18700, credit: -4100 },
  { date: 'Apr', checking: 8247, savings: 19500, credit: -4200 },
]

const syncActivity = [
  { day: 'Mon', txCount: 3 },
  { day: 'Tue', txCount: 7 },
  { day: 'Wed', txCount: 2 },
  { day: 'Thu', txCount: 5 },
  { day: 'Fri', txCount: 9 },
  { day: 'Sat', txCount: 11 },
  { day: 'Sun', txCount: 4 },
]


// Professional icon components
const Icons = {
  Add: () => <Plus className="w-4 h-4" />,
  Sync: () => <RefreshCw className="w-3.5 h-3.5" />,
  Details: () => <ChevronRight className="w-3.5 h-3.5" />,
  Unlink: () => <Unlink className="w-3.5 h-3.5" />,
  Close: () => <X className="w-4 h-4" />,
  Search: () => <Search className="w-4 h-4" />,
  Lock: () => <Lock className="w-4 h-4" />,
  Shield: () => <Shield className="w-4 h-4" />,
  Eye: () => <Eye className="w-4 h-4" />,
  LinkIcon: () => <LinkIcon className="w-5 h-5" />,
  Wallet: () => <Wallet className="w-5 h-5" />,
  CreditCard: () => <CreditCard className="w-5 h-5" />,
  Smartphone: () => <Smartphone className="w-5 h-5" />,
}

/* ── Custom Tooltip ──────────────────────────────────── */
const CT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
      <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-600 dark:text-gray-400">{p.name}:</span>
          <span className="text-gray-900 dark:text-gray-200 font-semibold">{typeof p.value === 'number' ? fmt(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Main Component ──────────────────────────────────── */
export default function BankIntegration() {
  const toast = useToast()
  const [accounts, setAccounts]     = useState(connectedAccounts)
  const [showConnect, setShowConn]  = useState(false)
  const [connecting, setConnecting] = useState(null)
  const [connected, setConnected]   = useState(null)
  const [searchBank, setSearchBank] = useState('')
  const [activeTab, setActiveTab]   = useState('accounts')
  const [autoSync, setAutoSync]     = useState(true)
  const [realTime, setRealTime]     = useState(false)
  const [txFilter, setTxFilter]     = useState('All')
  const [detailsAcc, setDetailsAcc] = useState(null)
  const [selectedBank, setSelectedBank] = useState(null)
  const [inputBalance, setInputBalance] = useState('')

  const [walletState, setWalletState] = useState(wallets)
  const [txState, setTxState]         = useState(recentSynced)
  const [connectType, setConnectType] = useState('bank')

  const totalBalance   = accounts.filter(a => a.balance > 0).reduce((s, a) => s + a.balance, 0)
  const totalDebt      = Math.abs(accounts.filter(a => a.balance < 0).reduce((s, a) => s + a.balance, 0))
  const activeCount    = accounts.filter(a => a.status === 'active').length
  const walletTotal    = walletState.filter(w => w.status === 'connected').reduce((s, w) => s + w.balance, 0)

  const filteredList = connectType === 'bank' 
    ? availableBanks.filter(b => b.name.toLowerCase().includes(searchBank.toLowerCase()))
    : availableWallets.filter(w => w.name.toLowerCase().includes(searchBank.toLowerCase()))
  const txCategories   = ['All', ...new Set(txState.map(t => t.cat))]
  const filteredTx     = txFilter === 'All' ? txState : txState.filter(t => t.cat === txFilter)

  const handleConnect = (name) => {
    setConnecting(name)
    setTimeout(() => {
      setConnecting(null)
      setConnected(name)
      const balanceVal = parseFloat(inputBalance)
      const actualBalance = isNaN(balanceVal) ? Math.floor(Math.random() * 8000) + 1000 : balanceVal

      if (connectType === 'bank') {
        const bObj = availableBanks.find(b => b.name === name)
        if (bObj) {
          setAccounts(prev => [...prev, {
            id: Date.now(),
            bank: bObj.name,
            type: 'Checking',
            last4: Math.floor(1000 + Math.random() * 9000).toString(),
            balance: actualBalance,
            currency: 'USD',
            status: 'active',
            synced: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            logo: bObj.logo,
            color: '#10b981'
          }])
        }
        toast.success('Account Connected', `Successfully connected to ${name}`)
      } else {
        const wObj = availableWallets.find(w => w.name === name)
        if (wObj) {
          setWalletState(prev => {
            const exists = prev.find(w => w.name === name)
            if (exists) {
              return prev.map(w => w.name === name ? { ...w, status: 'connected', balance: actualBalance, icon: wObj.logo } : w)
            } else {
              return [...prev, { name: wObj.name, icon: wObj.logo, status: 'connected', balance: actualBalance }]
            }
          })
        }
        toast.success('Wallet Connected', `Successfully linked ${name}`)
      }

      setTimeout(() => {
        setConnected(null)
        setSelectedBank(null)
        setInputBalance('')
        setShowConn(false)
      }, 1000)
    }, 1500)
  }

  const handleDisconnect = (id) => {
    setAccounts(prev => prev.filter(a => a.id !== id))
    toast.info('Account Disconnected', 'Account has been removed.')
    if (detailsAcc?.id === id) setDetailsAcc(null)
  }

  const handleSyncAcc = (acc) => {
    toast.success('Sync Started', `Pulling latest transactions for ${acc.bank}...`)
    setTimeout(() => {
      const nowStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, synced: nowStr } : a))
      if (detailsAcc?.id === acc.id) setDetailsAcc(prev => ({ ...prev, synced: nowStr }))
      toast.success('Sync Complete', 'Account is up to date.')
    }, 1500)
  }

  const handleWalletManage = (wallet) => {
    if (wallet.status === 'connected') {
      setWalletState(prev => prev.map(w => w.name === wallet.name ? { ...w, status: 'disconnected', balance: 0 } : w))
      toast.info('Wallet Disconnected', `${wallet.name} has been unlinked.`)
    } else {
      setWalletState(prev => prev.map(w => w.name === wallet.name ? { ...w, status: 'connected', balance: Math.floor(Math.random() * 500) + 50 } : w))
      toast.success('Wallet Connected', `Successfully linked ${wallet.name}.`)
    }
  }

  const handleSyncAll = () => {
    toast.success('Syncing All', 'Connecting to all institutions...')
    setTimeout(() => {
      const nowStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      setAccounts(prev => prev.map(a => ({ ...a, synced: nowStr })))
      if (detailsAcc) setDetailsAcc(prev => ({ ...prev, synced: nowStr }))
      toast.success('Sync Complete', 'All accounts are up to date.')
    }, 2000)
  }

  const tabs = ['accounts', 'transactions', 'wallets', 'settings']

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 animate-fadeIn">
      <PageHeader
        title="Bank & Payment Integration"
        subtitle="Connect and sync all your financial accounts in one place"
        actions={
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2" onClick={() => { setConnectType('bank'); setShowConn(true); }}>
            <Icons.Add />
            Connect Account
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Connected Accounts" value={activeCount} sub="all syncing" color="emerald" icon={<Icons.LinkIcon />} />
        <StatCard label="Total Balance" value={fmt(totalBalance)} sub="across all accounts" trend={2.1} color="emerald" icon={<Icons.Wallet />} />
        <StatCard label="Credit Balances" value={fmt(totalDebt)} sub="total owed" color="rose" icon={<Icons.CreditCard />} />
        <StatCard label="Digital Wallets" value={fmt(walletTotal)} sub={`${walletState.filter(w=>w.status==='connected').length} connected`} color="amber" icon={<Icons.Smartphone />} />
      </div>

      {/* Connect Modal */}
      {showConnect && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-lg w-full max-h-[85vh] flex flex-col animate-fadeIn shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Connect {connectType === 'bank' ? 'Account' : 'Wallet'}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Secured via 256-bit encryption · Read-only access</p>
              </div>
              <button onClick={() => { setShowConn(false); setConnecting(null); setConnected(null); setSelectedBank(null); setInputBalance(''); setInputLogo(''); }} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <Icons.Close />
              </button>
            </div>
            {/* Security badges */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {[
                { text: 'Bank-grade SSL', icon: <Icons.Lock /> },
                { text: 'Read-only', icon: <Icons.Eye /> },
                { text: 'SOC 2 Compliant', icon: <Icons.Shield /> },
                { text: 'OAuth 2.0', icon: <Icons.Lock /> },
              ].map((b, i) => (
                <span key={i} className="px-2 py-1 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  {b.icon} {b.text}
                </span>
              ))}
            </div>

            {!selectedBank ? (
              <>
                <div className="relative mb-4">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <Icons.Search />
                  </div>
                  <input 
                    className="w-full px-3 py-2 pl-9 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors placeholder-gray-500"
                    placeholder={`Search ${connectType === 'bank' ? 'banks, credit unions' : 'wallets'}...`} 
                    value={searchBank} 
                    onChange={e => setSearchBank(e.target.value)} 
                  />
                </div>
                <div className="overflow-y-auto flex-1">
                  <div className="grid grid-cols-2 gap-2">
                    {filteredList.map((item, i) => (
                      <div 
                        key={i} 
                        onClick={() => setSelectedBank(item)} 
                        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                      >
                        <img src={item.logo} alt={item.name} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full bg-white object-contain" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-200">{item.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">{item.users} users</div>
                        </div>
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">→</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-4">
                <img src={selectedBank.logo} alt={selectedBank.name} referrerPolicy="no-referrer" className="w-16 h-16 rounded-full bg-white object-contain mb-4 shadow-sm border border-gray-200 dark:border-gray-700" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Connect to {selectedBank.name}</h4>
                
                <div className="w-full max-w-sm mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">Initial Account Balance</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">$</span>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 pl-8 text-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors text-center font-semibold"
                      placeholder="0.00" 
                      value={inputBalance} 
                      onChange={e => setInputBalance(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex gap-3 w-full max-w-sm">
                  <button onClick={() => { setSelectedBank(null); setInputBalance(''); }} className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all" disabled={connecting !== null}>
                    Back
                  </button>
                  <button onClick={() => handleConnect(selectedBank.name)} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2" disabled={connecting !== null}>
                    {connecting ? <span className="animate-spin"><Icons.Sync /></span> : 'Connect'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 mb-5 border-b border-gray-200 dark:border-gray-700">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 text-sm font-medium capitalize transition-all border-b-2 ${
            activeTab === t 
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
              : 'border-transparent text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Accounts Tab */}
      {activeTab === 'accounts' && (
        <div>
          {/* Balance History */}
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-5">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-1">Account Balance History</div>
                <div className="text-sm text-gray-500 dark:text-gray-500">Real-time balance tracking across connected accounts</div>
              </div>
              <div className="flex gap-3 items-center text-xs">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500"></span><span className="text-gray-600 dark:text-gray-500">Checking</span></div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500"></span><span className="text-gray-600 dark:text-gray-500">Savings</span></div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-rose-500"></span><span className="text-gray-600 dark:text-gray-500">Credit</span></div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={balanceHistory}>
                <defs>
                  <linearGradient id="chkG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="savG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} className="dark:[&_tspan]:fill-gray-500" />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} className="dark:[&_tspan]:fill-gray-500" />
                <Tooltip content={<CT />} />
                <Area type="monotone" dataKey="checking" name="Checking" stroke="#10b981" strokeWidth={2} fill="url(#chkG)" />
                <Area type="monotone" dataKey="savings" name="Savings" stroke="#3b82f6" strokeWidth={2} fill="url(#savG)" />
                <Area type="monotone" dataKey="credit" name="Credit" stroke="#f43f5e" strokeWidth={2} fill="none" strokeDasharray="5 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Accounts list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map(acc => (
              <div key={acc.id} className="relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:scale-[1.02] duration-200 overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${acc.balance < 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2 items-center">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                        <img src={acc.logo} alt={acc.bank} referrerPolicy="no-referrer" className="w-7 h-7 object-contain" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">{acc.bank}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">{acc.type} ···· {acc.last4}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live
                    </span>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">Current Balance</div>
                      <div className={`text-2xl font-bold ${acc.balance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {acc.balance < 0 ? '-' : ''}{fmtFull(Math.abs(acc.balance))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">Last synced</div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Icons.Sync /> {acc.synced}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => handleSyncAcc(acc)} className="flex-1 px-2 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all flex items-center justify-center gap-1">
                      <Icons.Sync /> Sync
                    </button>
                    <button onClick={() => setDetailsAcc(acc)} className="flex-1 px-2 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all flex items-center justify-center gap-1">
                      <Icons.Details /> Details
                    </button>
                    <button onClick={() => handleDisconnect(acc.id)} className="px-2 py-1.5 text-xs font-medium bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 rounded-lg transition-all">
                      <Icons.Unlink />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {/* Add new card */}
            <div 
              className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[180px]"
              onClick={() => { setConnectType('bank'); setShowConn(true); }}
            >
              <div className="text-3xl text-gray-400 dark:text-gray-600 mb-2">+</div>
              <div className="text-sm text-gray-500 dark:text-gray-500">Connect new account</div>
              <div className="text-xs text-gray-400 dark:text-gray-600 mt-1">10,000+ institutions supported</div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-3">Sync Activity (This Week)</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={syncActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} className="dark:[&_tspan]:fill-gray-500" />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} className="dark:[&_tspan]:fill-gray-500" />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8rem' }} className="dark:[&_div]:bg-gray-800 dark:[&_div]:border-gray-700" />
                  <Bar dataKey="txCount" name="Transactions" fill="#10b981" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-3">Sync Status</div>
              <div className="space-y-3">
                {[
                  { label: 'Transactions synced today', value: '41', color: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Pending categorization', value: '3', color: 'text-amber-600 dark:text-amber-400' },
                  { label: 'Sync errors', value: '0', color: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Last full sync', value: '2 min ago', color: 'text-gray-500 dark:text-gray-500' },
                  { label: 'Next auto-sync', value: 'in 58 min', color: 'text-gray-500 dark:text-gray-500' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                    <span className="text-sm text-gray-600 dark:text-gray-500">{item.label}</span>
                    <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
              <button onClick={handleSyncAll} className="w-full mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2">
                <Icons.Sync /> Sync All Now
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center flex-wrap gap-3">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">Auto-Synced Transactions</div>
                <div className="flex gap-1 flex-wrap">
                  {txCategories.map(c => (
                    <button key={c} onClick={() => setTxFilter(c)} className={`px-2 py-1 text-xs rounded-full transition-all ${
                      txFilter === c 
                        ? 'bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Description</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Bank</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Category</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Date</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Status</th>
                    <th className="text-right p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Amount</th>
                    <th className="text-right p-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTx.map((tx, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="p-4 text-sm font-medium text-gray-900 dark:text-gray-300">{tx.desc}</td>
                      <td className="p-4 text-sm text-gray-500 dark:text-gray-500">{tx.bank}</td>
                      <td className="p-4"><span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">{tx.cat}</span></td>
                      <td className="p-4 text-sm text-gray-500 dark:text-gray-500">{tx.date}</td>
                      <td className="p-4">
                        {tx.synced
                          ? <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-1 w-fit"><span className="w-1 h-1 rounded-full bg-emerald-500"></span> Synced</span>
                          : <span className="px-2 py-0.5 text-xs rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">Pending</span>
                        }
                      </td>
                      <td className={`p-4 text-right text-sm font-semibold ${tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {tx.amount > 0 ? '+' : ''}{fmtFull(tx.amount)}
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => { setTxState(p => p.filter((_, idx) => idx !== i)); toast.info('Transaction Deleted', 'Record removed.') }} className="text-gray-400 hover:text-rose-500 transition-colors">
                          <Icons.Close />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Wallets Tab */}
      {activeTab === 'wallets' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            {walletState.map((w, i) => (
              <div key={i} className="relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:scale-[1.02] duration-200">
                <div className={`absolute top-0 left-0 w-1 h-full ${w.status === 'connected' ? 'bg-emerald-500' : 'bg-gray-400 dark:bg-gray-600'}`} />
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-2 items-center">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <img src={w.icon} alt={w.name} referrerPolicy="no-referrer" className="w-6 h-6 object-contain" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">{w.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">Digital Wallet</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${w.status === 'connected' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-500'}`}>
                      {w.status === 'connected' ? '● Connected' : '○ Disconnected'}
                    </span>
                  </div>
                  {w.status === 'connected' && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">Wallet Balance</div>
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{fmtFull(w.balance)}</div>
                    </div>
                  )}
                  <button onClick={() => handleWalletManage(w)} className={`w-full py-2 text-sm font-medium rounded-lg transition-all ${w.status === 'connected' ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
                    {w.status === 'connected' ? 'Manage' : 'Connect'}
                  </button>
                </div>
              </div>
            ))}
            {/* Add wallet */}
            <div onClick={() => { setConnectType('wallet'); setShowConn(true); }} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[160px]">
              <div className="text-2xl text-gray-400 dark:text-gray-600 mb-2">+</div>
              <div className="text-sm text-gray-500 dark:text-gray-500">Add wallet</div>
            </div>
          </div>
          {/* Info card */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/10 dark:to-blue-900/10 backdrop-blur-sm rounded-xl border border-emerald-200 dark:border-emerald-500/25 p-5">
            <div className="flex gap-3 items-start">
              <Icons.Shield />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-gray-200 mb-1">Secure Wallet Integration</div>
                <div className="text-sm text-gray-600 dark:text-gray-500 mb-3">
                  All wallet connections use OAuth 2.0 and read-only API access. Your credentials are never stored. Transactions are encrypted using AES-256 and synced in real-time via secure webhooks.
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['End-to-end encrypted', 'PCI DSS compliant', 'OAuth 2.0', 'Read-only access'].map((b, i) => (
                    <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <Icons.Lock /> {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl">
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-5">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">Sync Settings</div>
            <div className="space-y-3">
              {[
                { label: 'Auto-sync transactions', sub: 'Automatically sync every 60 minutes', state: autoSync, setter: setAutoSync },
                { label: 'Real-time balance updates', sub: 'Push updates on every transaction (may increase API usage)', state: realTime, setter: setRealTime },
              ].map((row, ri) => (
                <div key={ri} className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                  <div>
                    <div className="text-sm text-gray-900 dark:text-gray-200">{row.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">{row.sub}</div>
                  </div>
                  <div onClick={() => row.setter(p => !p)} className={`w-10 h-5 rounded-full cursor-pointer transition-all ${row.state ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-all mt-0.5 ${row.state ? 'ml-5' : 'ml-0.5'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-5">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">Data & Privacy</div>
            <div className="space-y-3">
              {[
                { label: 'Export transaction data', btn: 'Export CSV', variant: 'ghost', act: () => toast.success('Export Started', 'Check your downloads folder.') },
                { label: 'Delete synced transactions', btn: 'Delete All', variant: 'danger', act: () => toast.info('Transactions Cleared', 'Local cache emptied.') },
                { label: 'Revoke all bank access', btn: 'Revoke', variant: 'danger', act: () => toast.info('Access Revoked', 'All OAuth tokens deleted.') },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                  <span className="text-sm text-gray-900 dark:text-gray-200">{item.label}</span>
                  <button onClick={item.act} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    item.variant === 'danger' 
                      ? 'bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400' 
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}>
                    {item.btn}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Plaid info */}
          <div className="bg-blue-50 dark:bg-blue-900/10 backdrop-blur-sm rounded-xl border border-blue-200 dark:border-blue-500/25 p-5">
            <div className="flex gap-3 items-start">
              <Icons.Shield />
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-200 mb-1">Powered by Plaid</div>
                <div className="text-sm text-gray-600 dark:text-gray-500">
                  Bank connections are secured through Plaid, trusted by millions. WealthPath only receives read-only access to your transaction data and balances. We never see your credentials.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsAcc && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full animate-fadeIn shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <img src={detailsAcc.logo} alt={detailsAcc.bank} referrerPolicy="no-referrer" className="w-8 h-8 object-contain" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{detailsAcc.bank}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{detailsAcc.type} ···· {detailsAcc.last4}</p>
                </div>
              </div>
              <button onClick={() => setDetailsAcc(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <Icons.Close />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Current Balance</span>
                <span className={`text-xl font-bold ${detailsAcc.balance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {detailsAcc.balance < 0 ? '-' : ''}{fmtFull(Math.abs(detailsAcc.balance))}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500">Status</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live Synced
                </span>
              </div>
              <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500">Last Successful Sync</span>
                <span className="text-gray-900 dark:text-gray-200">{detailsAcc.synced}</span>
              </div>
              <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500">Currency</span>
                <span className="text-gray-900 dark:text-gray-200">{detailsAcc.currency}</span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => { handleSyncAcc(detailsAcc); setDetailsAcc(null) }} className="flex-1 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all flex items-center justify-center gap-2">
                <Icons.Sync /> Resync Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}