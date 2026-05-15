import React, { useState, useRef } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import { useTheme } from '../context/AppContext.jsx'
import { useToast } from '../context/AppContext.jsx'
import { useUser } from '../context/AppContext.jsx'

const Toggle = ({ value, onChange }) => (
  <div onClick={() => onChange(!value)} className={`w-10 h-5 rounded-full cursor-pointer transition-all ${value ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'} relative`}>
    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-md ${value ? 'left-5' : 'left-0.5'}`} />
  </div>
)

import { Upload, Trash2, Save, Eye, EyeOff, Lock, Download, AlertTriangle, Calendar, Sun, Moon } from 'lucide-react'

// Professional theme icons matching sidebar
const ThemeIcons = {
  Light: () => <Sun className="w-5 h-5" />,
  Dark: () => <Moon className="w-5 h-5" />,
}

// Professional icon components
const Icons = {
  Upload: () => <Upload className="w-4 h-4" />,
  Remove: () => <Trash2 className="w-4 h-4" />,
  Save: () => <Save className="w-4 h-4" />,
  Eye: () => <Eye className="w-4 h-4" />,
  EyeOff: () => <EyeOff className="w-4 h-4" />,
  Lock: () => <Lock className="w-4 h-4" />,
  Export: () => <Download className="w-4 h-4" />,
  Danger: () => <AlertTriangle className="w-4 h-4" />,
  Calendar: () => <Calendar className="w-4 h-4" />,
  Download: () => <Download className="w-4 h-4" />,
}

// Helper function to export data
const exportData = (format, data, filename) => {
  let content = ''
  let mimeType = ''
  let extension = ''
  
  switch(format) {
    case 'CSV':
      if (Array.isArray(data)) {
        const headers = Object.keys(data[0] || {})
        const rows = data.map(obj => headers.map(h => JSON.stringify(obj[h] || '')).join(','))
        content = [headers.join(','), ...rows].join('\n')
      } else {
        content = JSON.stringify(data, null, 2)
      }
      mimeType = 'text/csv'
      extension = 'csv'
      break
    case 'JSON':
      content = JSON.stringify(data, null, 2)
      mimeType = 'application/json'
      extension = 'json'
      break
    default:
      content = `Financial Report\nGenerated: ${new Date().toLocaleString()}\n\n${JSON.stringify(data, null, 2)}`
      mimeType = 'text/plain'
      extension = 'txt'
  }
  
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.${extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const Section = ({ title, subtitle, children }) => (
  <div className="bg-white dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-5 shadow-sm">
    <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{title}</div>
      {subtitle && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</div>}
    </div>
    {children}
  </div>
)

const Row = ({ label, sub, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0 gap-3 sm:gap-0">
    <div className="pr-0 sm:pr-4">
      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</div>
      {sub && <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</div>}
    </div>
    <div className="self-start sm:self-auto shrink-0 w-full sm:w-auto">
      {children}
    </div>
  </div>
)

export default function Settings() {
  const { isDark, toggleTheme } = useTheme()
  const toast = useToast()
  const { user, updateUser } = useUser()

  const fileInputRef = useRef(null)
  const [localUser, setLocal] = useState({ ...user })
  const [pwForm, setPw] = useState({ current:'', newPw:'', confirm:'' })
  const [pwVisible, setPwVisible] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setTab] = useState('profile')
  const [deleteConfirm, setDeleteConfirm] = useState('')

  const set = (k, v) => setLocal(p => ({ ...p, [k]: v }))
  const setNested = (parent, k, v) => setLocal(p => ({ ...p, [parent]: { ...p[parent], [k]: v } }))

  const handleSaveProfile = () => {
    if (!localUser.name.trim()) { toast.error('Validation Error', 'Name cannot be empty.'); return }
    if (!localUser.email.includes('@')) { toast.error('Validation Error', 'Please enter a valid email address.'); return }
    const initials = localUser.name.trim().split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()
    updateUser({ ...localUser, initials })
    toast.success('Profile Updated', 'Your profile information has been saved successfully.')
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('File Too Large', 'Please choose an image under 5 MB.'); return }
    if (!file.type.startsWith('image/')) { toast.error('Invalid File', 'Please upload a valid image file (JPG, PNG, etc.)'); return }
    setUploading(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target.result
      setLocal(p => ({ ...p, avatar: base64 }))
      updateUser({ avatar: base64 })
      setUploading(false)
      toast.success('Photo Updated', 'Your profile picture has been updated.')
    }
    reader.onerror = () => { setUploading(false); toast.error('Upload Failed', 'Could not read the image file.') }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setLocal(p => ({ ...p, avatar: null }))
    updateUser({ avatar: null })
    toast.info('Photo Removed', 'Profile picture has been removed.')
  }

  const handleChangePw = () => {
    if (!pwForm.current) { toast.error('Required', 'Please enter your current password.'); return }
    if (pwForm.newPw.length < 8) { toast.error('Too Short', 'New password must be at least 8 characters.'); return }
    if (pwForm.newPw !== pwForm.confirm) { toast.error('Mismatch', 'New passwords do not match.'); return }
    setPw({ current:'', newPw:'', confirm:'' })
    toast.success('Password Changed', 'Your password has been updated successfully.')
  }

  const handleSaveNotifs = () => {
    updateUser({ notifications: localUser.notifications })
    toast.success('Notifications Saved', 'Your notification preferences have been updated.')
  }

  const handleSavePrivacy = () => {
    updateUser({ privacy: localUser.privacy })
    toast.success('Privacy Settings Saved', 'Security preferences updated.')
  }

  const handleSaveDisplay = () => {
    updateUser({ display: localUser.display, currency: localUser.currency, language: localUser.language })
    toast.success('Display Settings Saved', 'Your display preferences have been applied.')
  }

  const handleExport = (format, exportType) => {
    let exportData_obj = {}
    let filename = ''
    
    switch(exportType) {
      case 'transactions':
        exportData_obj = {
          transactions: localUser.transactions || [],
          exportDate: new Date().toISOString(),
          user: { name: localUser.name, email: localUser.email }
        }
        filename = `wealthpath_transactions_${new Date().toISOString().split('T')[0]}`
        break
      case 'report':
        exportData_obj = {
          report: {
            generated: new Date().toISOString(),
            user: localUser.name,
            accountSummary: {
              totalIncome: 8400,
              totalExpenses: 5200,
              savings: 3200,
              netWorth: 164800
            }
          }
        }
        filename = `wealthpath_financial_report_${new Date().toISOString().split('T')[0]}`
        break
      case 'all':
        exportData_obj = {
          userProfile: {
            name: localUser.name,
            email: localUser.email,
            plan: localUser.plan,
            joinDate: localUser.joinDate
          },
          settings: {
            notifications: localUser.notifications,
            privacy: localUser.privacy,
            display: localUser.display
          },
          exportDate: new Date().toISOString()
        }
        filename = `wealthpath_full_export_${new Date().toISOString().split('T')[0]}`
        break
      default:
        exportData_obj = { message: 'Export data', exportDate: new Date().toISOString() }
        filename = `wealthpath_export_${new Date().toISOString().split('T')[0]}`
    }
    
    exportData(format, exportData_obj, filename)
    toast.success('Export Complete', `Your ${format} file has been downloaded.`)
  }

  const handleDelete = () => {
    if (deleteConfirm !== 'DELETE') { toast.error('Confirmation Required', 'Please type DELETE to confirm account deletion.'); return }
    toast.warning('Account Deletion', 'Account deletion has been scheduled. You will receive a confirmation email.')
    setDeleteConfirm('')
  }

  const TABS = ['profile', 'notifications', 'security', 'display', 'data']

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 animate-fadeIn max-w-4xl mx-auto">
      <PageHeader
        title="Settings"
        subtitle="Manage your account, preferences and security"
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-0 mb-5 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium capitalize transition-all border-b-2 whitespace-nowrap ${
            activeTab === t 
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Section title="Profile Information" subtitle="Update your personal details and profile picture">
          {/* Avatar upload area */}
          <div className="flex flex-col sm:flex-row gap-6 items-center mb-6 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full flex items-center justify-center font-bold text-white text-3xl overflow-hidden border-4 border-white dark:border-gray-800 shadow-md" style={{ background: localUser.avatar ? 'transparent' : 'linear-gradient(135deg, #10b981, #f59e0b)' }}>
                {localUser.avatar
                  ? <img src={localUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                  : localUser.initials
                }
              </div>
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left flex flex-col items-center sm:items-start w-full">
              <div className="font-bold text-xl text-gray-900 dark:text-white mb-1">{localUser.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">{localUser.email}</div>
              <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                <button className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all flex items-center gap-2 shadow-sm hover:shadow-md" onClick={() => fileInputRef.current?.click()}>
                  <Icons.Upload /> Upload Photo
                </button>
                {localUser.avatar && (
                  <button className="px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-all flex items-center gap-2 shadow-sm hover:shadow-md" onClick={handleRemovePhoto}>
                    <Icons.Remove /> Remove
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-3 font-medium">JPG, PNG, GIF or WebP · Max 5 MB</div>
            </div>
            <div className="sm:pl-6 sm:border-l border-gray-200 dark:border-gray-700 flex flex-col items-center sm:items-end w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 mt-2 sm:mt-0">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">{localUser.plan} Plan</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center sm:text-right">Active since<br/>{localUser.joinDate}</span>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Full Name</label>
              <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" value={localUser.name} onChange={e=>set('name',e.target.value)} placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email Address</label>
              <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" type="email" value={localUser.email} onChange={e=>set('email',e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Phone Number</label>
              <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" type="tel" value={localUser.phone} onChange={e=>set('phone',e.target.value)} placeholder="+1 (555) 000-0000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Currency</label>
              <select className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500 transition-all" value={localUser.currency} onChange={e=>set('currency',e.target.value)}>
                {['USD','EUR','GBP','CAD','AUD','JPY','CHF','INR','SGD','KHR'].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Language</label>
              <select className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500 transition-all" value={localUser.language} onChange={e=>set('language',e.target.value)}>
                {['English','Khmer','Spanish','French','German','Japanese','Korean','Chinese','Arabic'].map(l=><option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Timezone</label>
              <select className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500 transition-all" value={localUser.timezone} onChange={e=>set('timezone',e.target.value)}>
                {['America/New_York','America/Chicago','America/Denver','America/Los_Angeles','Europe/London','Europe/Paris','Asia/Tokyo','Asia/Singapore','Asia/Phnom_Penh'].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-sm" onClick={handleSaveProfile}>
            <Icons.Save /> Save Profile
          </button>
        </Section>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Section title="Notification Preferences" subtitle="Control what alerts and updates you receive">
          {[
            { key:'budgetAlerts',    label:'Budget Alerts',       sub:'Notify when you exceed a spending category' },
            { key:'goalMilestones',  label:'Goal Milestones',     sub:'Celebrate savings goal achievements' },
            { key:'weeklyReport',    label:'Weekly Summary',      sub:'Receive a financial summary every Monday' },
            { key:'marketUpdates',   label:'Market Updates',      sub:'Daily portfolio performance updates' },
            { key:'taxReminders',    label:'Tax Reminders',       sub:'Quarterly estimated tax and deadline alerts' },
          ].map(item => (
            <Row key={item.key} label={item.label} sub={item.sub}>
              <Toggle value={localUser.notifications[item.key]} onChange={v=>setNested('notifications',item.key,v)} />
            </Row>
          ))}
          <button className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-sm" onClick={handleSaveNotifs}>
            <Icons.Save /> Save Preferences
          </button>
        </Section>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <>
          <Section title="Change Password" subtitle="Use a strong, unique password">
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Current Password</label>
                <div className="relative">
                  <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all pr-10" type={pwVisible?'text':'password'} value={pwForm.current} onChange={e=>setPw(p=>({...p,current:e.target.value}))} placeholder="Enter current password" />
                  <button onClick={()=>setPwVisible(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    {pwVisible ? <Icons.EyeOff /> : <Icons.Eye />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">New Password</label>
                <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" type={pwVisible?'text':'password'} value={pwForm.newPw} onChange={e=>setPw(p=>({...p,newPw:e.target.value}))} placeholder="At least 8 characters" />
                {pwForm.newPw && (
                  <div className="flex gap-1 mt-2">
                    {[pwForm.newPw.length>=8, /[A-Z]/.test(pwForm.newPw), /[0-9]/.test(pwForm.newPw), /[^a-zA-Z0-9]/.test(pwForm.newPw)].map((pass,i)=>(
                      <div key={i} className="flex-1 h-1 rounded-full transition-all" style={{ background: pass ? '#10b981' : '#d1d5db' }} />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Confirm New Password</label>
                <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" style={{ borderColor: pwForm.confirm && pwForm.confirm!==pwForm.newPw ? '#ef4444' : undefined }} type={pwVisible?'text':'password'} value={pwForm.confirm} onChange={e=>setPw(p=>({...p,confirm:e.target.value}))} placeholder="Repeat new password" />
              </div>
            </div>
            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-sm" onClick={handleChangePw}>
              <Icons.Lock /> Change Password
            </button>
          </Section>

          <Section title="Security Options" subtitle="Protect your account with additional layers">
            {[
              { key:'twoFactor', label:'Two-Factor Authentication', sub:'Require a code from your phone when signing in' },
              { key:'biometric', label:'Biometric Unlock',          sub:'Use fingerprint or face to unlock the app' },
              { key:'autoLock',  label:'Auto-Lock',                 sub:'Lock app after 5 minutes of inactivity' },
              { key:'dataMasking',label:'Data Masking',             sub:'Hide sensitive numbers on the dashboard' },
            ].map(item => (
              <Row key={item.key} label={item.label} sub={item.sub}>
                <Toggle value={localUser.privacy[item.key]} onChange={v=>setNested('privacy',item.key,v)} />
              </Row>
            ))}
            <button className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-sm" onClick={handleSavePrivacy}>
              <Icons.Lock /> Save Security Settings
            </button>
          </Section>

          <Section title="Active Sessions">
            {[
              { device:'MacBook Pro · Chrome', location:'New York, US', time:'Active now',    current:true },
              { device:'iPhone 15 · Safari',   location:'New York, US', time:'2 hours ago',   current:false },
              { device:'iPad · Safari',         location:'New York, US', time:'3 days ago',    current:false },
            ].map((s,i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0 gap-3 sm:gap-0">
                <div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.device}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{s.location} · {s.time}</div>
                </div>
                <div className="self-start sm:self-auto">
                  {s.current
                    ? <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 inline-block">Current</span>
                    : <button className="px-3 py-1.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-all" onClick={()=>toast.success('Session Revoked','The session has been signed out.')}>Revoke</button>
                  }
                </div>
              </div>
            ))}
          </Section>
        </>
      )}

      {/* Display Tab */}
      {activeTab === 'display' && (
        <Section title="Display & Appearance" subtitle="Customize how WealthPath looks and feels">
          {/* Theme picker with professional icons matching sidebar */}
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">Color Theme</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label:'Dark Mode', icon: <ThemeIcons.Dark />, active: isDark },
                { label:'Light Mode', icon: <ThemeIcons.Light />, active: !isDark },
              ].map((t,i) => (
                <div key={i} onClick={toggleTheme} className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                  t.active 
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm' 
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600'
                }`}>
                  <span className="text-gray-700 dark:text-gray-300">{t.icon}</span>
                  <div>
                    <div className={`text-sm font-semibold ${
                      t.active 
                        ? 'text-emerald-700 dark:text-emerald-400' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>{t.label}</div>
                    {t.active && <div className="text-xs text-emerald-600 dark:text-emerald-400">● Active</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {[
            { key:'compactMode', label:'Compact Mode',  sub:'Reduce spacing for a denser layout' },
            { key:'showCents',   label:'Show Cents',    sub:'Display decimal places in currency values' },
            { key:'animations',  label:'Animations',    sub:'Enable smooth transitions and micro-interactions' },
          ].map(item => (
            <Row key={item.key} label={item.label} sub={item.sub}>
              <Toggle value={localUser.display[item.key]} onChange={v=>setNested('display',item.key,v)} />
            </Row>
          ))}
          <button className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-sm" onClick={handleSaveDisplay}>
            <Icons.Save /> Save Display Settings
          </button>
        </Section>
      )}

      {/* Data Tab with working exports */}
      {activeTab === 'data' && (
        <>
          <Section title="Import & Export" subtitle="Move your financial data in and out of WealthPath">
            {[
              { label:'Import Transactions',       sub:'Upload a CSV from your bank or credit card', btn:'Import CSV',  action:() => document.getElementById('import-file')?.click(), type:'import' },
              { label:'Export All Data (CSV)',     sub:'Download all your data as a spreadsheet',   btn:'Export CSV',  action:() => handleExport('CSV', 'all'), type:'export' },
              { label:'Export Financial Report',   sub:'Download a full PDF report of your finances',btn:'Export PDF',  action:() => handleExport('PDF', 'report'), type:'export' },
              { label:'Export to Excel',           sub:'Download all data in Excel format (.xlsx)', btn:'Export Excel',action:() => handleExport('Excel', 'all'), type:'export' },
              { label:'Export Raw Data (JSON)',    sub:'Machine-readable export for developers',    btn:'Export JSON', action:() => handleExport('JSON', 'all'), type:'export' },
            ].map((item,i) => (
              <Row key={i} label={item.label} sub={item.sub}>
                <button className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-all flex items-center gap-1" onClick={item.action}>
                  <Icons.Download /> {item.btn}
                </button>
              </Row>
            ))}
            <input id="import-file" type="file" accept=".csv,.json" className="hidden" onChange={(e) => {
              if(e.target.files?.[0]) {
                toast.info('Import Started', `Importing ${e.target.files[0].name}...`)
              }
            }} />
          </Section>

          <Section title="Connected Services" subtitle="Manage external integrations">
            {[
              { name:'Plaid (Bank Sync)',    status:'Connected', icon:'🏦', color:'text-emerald-600 dark:text-emerald-400' },
              { name:'Google Calendar',      status:'Disconnected',icon:'📅', color:'text-gray-500 dark:text-gray-400' },
              { name:'Dropbox',             status:'Disconnected',icon:'📂', color:'text-gray-500 dark:text-gray-400' },
            ].map((s,i) => (
              <Row key={i} label={<span className="flex items-center gap-2"><span>{s.icon}</span>{s.name}</span>} sub={<span className={s.color}>{s.status}</span>}>
                <button className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-all"
                  onClick={()=> s.status==='Connected' ? toast.warning('Disconnected', `${s.name} has been disconnected.`) : toast.success('Connected!', `${s.name} has been connected.`)}>
                  {s.status==='Connected'?'Disconnect':'Connect'}
                </button>
              </Row>
            ))}
          </Section>

          <Section title="Danger Zone" subtitle="Irreversible actions — proceed with caution">
            <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-500/20 rounded-xl">
              <div className="mb-4">
                <div className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-1">Delete My Account</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">This will permanently delete your account and all associated data. This action cannot be undone.</div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Type DELETE to confirm</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-rose-300 dark:border-rose-500/30 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all text-sm" placeholder="DELETE" value={deleteConfirm} onChange={e=>setDeleteConfirm(e.target.value)} />
                  <button className="w-full sm:w-auto px-4 py-2 bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 font-medium rounded-lg transition-all whitespace-nowrap text-center" onClick={handleDelete}>
                    Delete Account
                  </button>
                </div>
              </div>
              <div className="h-px bg-rose-200 dark:bg-rose-500/20 my-4" />
              <div>
                <div className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-1">Reset All Data</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">Clears all transactions, budgets, and goals — keeps your account.</div>
                <button className="px-4 py-2 bg-rose-100 dark:bg-rose-900/20 hover:bg-rose-200 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 font-medium rounded-lg transition-all text-sm"
                  onClick={()=>toast.warning('Data Reset', 'All financial data has been cleared. Your account remains active.')}>
                  Reset All Data
                </button>
              </div>
            </div>
          </Section>

          <div className="bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-center shadow-sm">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WealthPath Financial Planner</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Version 3.0.0 · React + Vite · Member since {user.joinDate}</div>
          </div>
        </>
      )}
    </div>
  )
}