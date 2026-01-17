'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Plus, Trash2, Loader2, AlertCircle, LogOut, Eye, EyeOff, Lock, Globe, FileText, Zap, Twitter, MessageCircle, Mail, Archive, RotateCcw, X, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ADMIN_CREDENTIALS } from '@/lib/constants'
import { addListedToken, removeListedToken, getListedTokens, ListedToken, getListingApplications, updateApplicationStatus, ListingApplication } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [activeAdminTab, setActiveAdminTab] = useState<'tokens' | 'applications' | 'archive'>('tokens')
  const [listedTokens, setListedTokens] = useState<ListedToken[]>([])
  const [applications, setApplications] = useState<ListingApplication[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mintAddress, setMintAddress] = useState('')
  const [symbol, setSymbol] = useState('')
  const [name, setName] = useState('')
  const [logoUri, setLogoUri] = useState('')
  const [isAddingToken, setIsAddingToken] = useState(false)
  const [addError, setAddError] = useState('')

  useEffect(() => {
    const savedSession = localStorage.getItem('fomodex_admin_session')
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession)
        if (session.expiry > Date.now()) {
          setIsLoggedIn(true)
          setUsername(session.username)
        } else {
          localStorage.removeItem('fomodex_admin_session')
        }
      } catch {
        localStorage.removeItem('fomodex_admin_session')
      }
    }
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      if (activeAdminTab === 'tokens') loadTokens()
      else loadApplications()
    }
  }, [isLoggedIn, activeAdminTab])

  const loadTokens = async () => {
    setIsLoading(true)
    const tokens = await getListedTokens()
    setListedTokens(tokens)
    setIsLoading(false)
  }

  const loadApplications = async () => {
    setIsLoading(true)
    const apps = await getListingApplications()
    setApplications(apps)
    setIsLoading(false)
  }

  const handleLogin = async () => {
    setLoginError('')
    setIsLoggingIn(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    const validCred = ADMIN_CREDENTIALS.find(cred => cred.username === username && cred.password === password)
    if (validCred) {
      localStorage.setItem('fomodex_admin_session', JSON.stringify({ username, expiry: Date.now() + 86400000 }))
      setIsLoggedIn(true)
    } else {
      setLoginError('Authentication failed.')
    }
    setIsLoggingIn(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('fomodex_admin_session')
    setIsLoggedIn(false)
    setUsername('')
    setPassword('')
  }

  const handleAddToken = async () => {
    setAddError('')
    if (!mintAddress || !symbol || !name) { setAddError('Fill all fields.'); return }
    if (mintAddress.length < 32) { setAddError('Invalid address.'); return }
    setIsAddingToken(true)
    const result = await addListedToken({ mint_address: mintAddress, symbol: symbol.toUpperCase(), name, logo_uri: logoUri || null, decimals: 9, listed_by: username })
    if (result) { setMintAddress(''); setSymbol(''); setName(''); setLogoUri(''); await loadTokens() }
    else { setAddError('Token already listed.') }
    setIsAddingToken(false)
  }

  const handleRemoveToken = async (addr: string) => { if (confirm('Remove?')) { await removeListedToken(addr); await loadTokens() } }
  const handleApproveApp = async (app: ListingApplication) => {
    if (confirm(`Approve ${app.symbol}?`)) {
      setIsLoading(true)
      await updateApplicationStatus(app.id, 'approved')
      await addListedToken({ 
        mint_address: app.mint_address, 
        symbol: app.symbol, 
        name: app.name, 
        logo_uri: app.logo_uri, 
        decimals: 9, 
        listed_by: username,
        telegram: app.telegram,
        twitter: app.twitter,
        website: app.website,
        description: app.description
      })
      await loadApplications()
      setIsLoading(false)
    }
  }
  const handleRejectApp = async (id: string) => { if (confirm('Reject?')) { setIsLoading(true); await updateApplicationStatus(id, 'rejected'); await loadApplications(); setIsLoading(false) } }
  const handleRestoreApp = async (id: string) => { if (confirm('Restore?')) { setIsLoading(true); await updateApplicationStatus(id, 'pending'); await loadApplications(); setIsLoading(false) } }

  const pendingApps = applications.filter(a => a.status === 'pending')
  const rejectedApps = applications.filter(a => a.status === 'rejected')

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm font-bold">
            <ArrowLeft className="w-4 h-4" />
            Back to DEX
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl"
        >
          <div className="p-4 sm:p-8 border-b border-[#1a1a2e] flex items-center justify-between bg-[#0d0d15]">
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Shield className="w-5 h-5 sm:w-7 sm:h-7 text-black" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-black tracking-tighter uppercase">Admin Panel</h2>
                <p className="text-[8px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest">Management</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-8">
            {!isLoggedIn ? (
              <div className="max-w-md mx-auto py-8 sm:py-12">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                    <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black uppercase">Authenticate</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Username</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Identifier" className="w-full bg-[#11111a] border border-[#1a1a2e] rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 text-sm" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Key" className="w-full bg-[#11111a] border border-[#1a1a2e] rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 text-sm" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    </div>
                  </div>
                  {loginError && <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4" />{loginError}</div>}
                  <button onClick={handleLogin} disabled={isLoggingIn || !username || !password} className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl disabled:opacity-50 uppercase">{isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'LOGIN'}</button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#11111a] p-3 rounded-xl border border-[#1a1a2e]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-black text-xs">{username.charAt(0)}</div>
                    <div>
                      <div className="text-[8px] font-black text-gray-600 uppercase">Operator</div>
                      <div className="text-xs font-black text-cyan-400 uppercase">{username}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 p-1 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e] w-full sm:w-auto overflow-x-auto">
                    <button onClick={() => setActiveAdminTab('tokens')} className={cn("px-3 py-1.5 rounded-md text-[9px] font-black uppercase whitespace-nowrap", activeAdminTab === 'tokens' ? 'bg-[#1a1a2e] text-cyan-400' : 'text-gray-500')}>Assets</button>
                    <button onClick={() => setActiveAdminTab('applications')} className={cn("px-3 py-1.5 rounded-md text-[9px] font-black uppercase whitespace-nowrap", activeAdminTab === 'applications' ? 'bg-[#1a1a2e] text-cyan-400' : 'text-gray-500')}>Apps</button>
                    <button onClick={() => setActiveAdminTab('archive')} className={cn("px-3 py-1.5 rounded-md text-[9px] font-black uppercase whitespace-nowrap", activeAdminTab === 'archive' ? 'bg-[#1a1a2e] text-cyan-400' : 'text-gray-500')}>Archive</button>
                    <div className="w-px h-4 bg-[#1a1a2e] mx-1" />
                    <button onClick={handleLogout} className="p-1.5 text-gray-500 hover:text-red-400"><LogOut className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                {activeAdminTab === 'tokens' && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-base font-black flex items-center gap-2 uppercase"><Plus className="w-5 h-5 text-cyan-500" />Index Asset</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className="text-[9px] font-black text-gray-600 uppercase">Mint Address</label><input type="text" value={mintAddress} onChange={e => setMintAddress(e.target.value)} placeholder="CA" className="w-full bg-[#11111a] border border-[#1a1a2e] rounded-xl px-4 py-3 outline-none text-xs" /></div>
                        <div><label className="text-[9px] font-black text-gray-600 uppercase">Ticker</label><input type="text" value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="SYM" className="w-full bg-[#11111a] border border-[#1a1a2e] rounded-xl px-4 py-3 outline-none text-xs uppercase" /></div>
                        <div><label className="text-[9px] font-black text-gray-600 uppercase">Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full bg-[#11111a] border border-[#1a1a2e] rounded-xl px-4 py-3 outline-none text-xs" /></div>
                        <div><label className="text-[9px] font-black text-gray-600 uppercase">Logo URI</label><input type="text" value={logoUri} onChange={e => setLogoUri(e.target.value)} placeholder="URL" className="w-full bg-[#11111a] border border-[#1a1a2e] rounded-xl px-4 py-3 outline-none text-xs" /></div>
                      </div>
                      {addError && <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4" />{addError}</div>}
                      <button onClick={handleAddToken} disabled={isAddingToken} className="w-full py-3.5 bg-white text-black font-black rounded-xl hover:bg-cyan-500 disabled:opacity-50 uppercase">{isAddingToken ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'INDEX ASSET'}</button>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between"><h3 className="text-base font-black uppercase">Registry</h3><span className="px-2 py-0.5 bg-[#11111a] border border-[#1a1a2e] rounded-full text-[8px] font-black text-gray-500 uppercase">{listedTokens.length} ASSETS</span></div>
                      {isLoading ? <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div> : (
                        <div className="space-y-2">{listedTokens.map(t => (
                          <div key={t.id} className="flex items-center justify-between p-3 bg-[#11111a] border border-[#1a1a2e] rounded-xl hover:border-cyan-500/30">
                            <div className="flex items-center gap-3">{t.logo_uri ? <img src={t.logo_uri} alt="" className="w-8 h-8 rounded-lg border border-[#1a1a2e]" /> : <div className="w-8 h-8 rounded-lg bg-[#0a0a0f] border border-[#1a1a2e] flex items-center justify-center text-[10px] font-black text-cyan-400">{t.symbol.slice(0,2)}</div>}<div><div className="font-black text-xs">{t.symbol}</div><div className="text-[8px] font-mono text-gray-600 truncate max-w-[150px]">{t.mint_address}</div></div></div>
                            <button onClick={() => handleRemoveToken(t.mint_address)} className="p-2 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-lg border border-red-500/20"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        ))}</div>
                      )}
                    </div>
                  </div>
                )}

                {activeAdminTab === 'applications' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between"><h3 className="text-base font-black flex items-center gap-2 uppercase"><FileText className="w-5 h-5 text-cyan-500" />Applications</h3><span className="px-2 py-0.5 bg-[#11111a] border border-[#1a1a2e] rounded-full text-[8px] font-black text-gray-500 uppercase">{pendingApps.length} PENDING</span></div>
                    {isLoading ? <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 animate-spin text-cyan-500" /></div> : pendingApps.length === 0 ? <div className="text-center py-24 bg-[#11111a]/50 border border-dashed border-[#1a1a2e] rounded-[24px]"><p className="text-xs font-black text-gray-700 uppercase">No pending applications</p></div> : (
                      <div className="space-y-4">{pendingApps.map(app => (
                        <div key={app.id} className="bg-[#11111a] border border-[#1a1a2e] rounded-[20px] p-4 space-y-4 hover:border-cyan-500/30">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">{app.logo_uri ? <img src={app.logo_uri} alt="" className="w-10 h-10 rounded-xl border border-[#1a1a2e]" /> : <div className="w-10 h-10 rounded-xl bg-[#0a0a0f] border border-[#1a1a2e] flex items-center justify-center text-xs font-black text-cyan-500">{app.symbol.slice(0,2)}</div>}<div><h4 className="font-black text-base">{app.name} (${app.symbol})</h4><code className="text-[8px] font-mono text-gray-500">{app.mint_address}</code></div></div>
                            {app.expedite && <div className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full flex items-center gap-1"><Zap className="w-2.5 h-2.5 text-cyan-400" /><span className="text-[8px] font-black text-cyan-400 uppercase">EXPEDITED</span></div>}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {app.website && <a href={app.website} target="_blank" className="flex items-center gap-1.5 p-1.5 bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg text-gray-400 hover:text-white text-[8px] font-black uppercase"><Globe className="w-3 h-3" />Web</a>}
                            {app.twitter && <a href={`https://twitter.com/${app.twitter.replace('@','')}`} target="_blank" className="flex items-center gap-1.5 p-1.5 bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg text-gray-400 hover:text-white text-[8px] font-black uppercase"><Twitter className="w-3 h-3" />X</a>}
                            {app.telegram && <a href={app.telegram} target="_blank" className="flex items-center gap-1.5 p-1.5 bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg text-gray-400 hover:text-white text-[8px] font-black uppercase"><MessageCircle className="w-3 h-3" />TG</a>}
                            <div className="flex items-center gap-1.5 p-1.5 bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg text-gray-400 text-[8px] font-black uppercase"><Mail className="w-3 h-3" />Email</div>
                          </div>
                          <p className="text-[10px] text-gray-500 bg-[#0a0a0f] p-3 rounded-lg border border-[#1a1a2e]">{app.description || 'No description.'}</p>
                          <div className="flex gap-2">
                            <button onClick={() => handleRejectApp(app.id)} className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg font-black text-[9px] uppercase border border-red-500/20">Reject</button>
                            <button onClick={() => handleApproveApp(app)} className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg font-black text-[9px] uppercase">Approve & List</button>
                          </div>
                        </div>
                      ))}</div>
                    )}
                  </div>
                )}

                {activeAdminTab === 'archive' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between"><h3 className="text-base font-black flex items-center gap-2 uppercase"><Archive className="w-5 h-5 text-gray-500" />Rejected</h3><span className="px-2 py-0.5 bg-[#11111a] border border-[#1a1a2e] rounded-full text-[8px] font-black text-gray-500 uppercase">{rejectedApps.length} ARCHIVED</span></div>
                    {isLoading ? <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 animate-spin text-cyan-500" /></div> : rejectedApps.length === 0 ? <div className="text-center py-24 bg-[#11111a]/50 border border-dashed border-[#1a1a2e] rounded-[24px]"><p className="text-xs font-black text-gray-700 uppercase">No rejected applications</p></div> : (
                      <div className="space-y-4">{rejectedApps.map(app => (
                        <div key={app.id} className="bg-[#11111a] border border-red-500/10 rounded-[20px] p-4 space-y-4 opacity-70 hover:opacity-100">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">{app.logo_uri ? <img src={app.logo_uri} alt="" className="w-10 h-10 rounded-xl border border-[#1a1a2e] grayscale" /> : <div className="w-10 h-10 rounded-xl bg-[#0a0a0f] border border-[#1a1a2e] flex items-center justify-center text-xs font-black text-gray-600">{app.symbol.slice(0,2)}</div>}<div><h4 className="font-black text-base text-gray-400">{app.name} (${app.symbol})</h4><code className="text-[8px] font-mono text-gray-600">{app.mint_address}</code></div></div>
                            <div className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-full flex items-center gap-1"><X className="w-2.5 h-2.5 text-red-400" /><span className="text-[8px] font-black text-red-400 uppercase">REJECTED</span></div>
                          </div>
                          <p className="text-[10px] text-gray-600 bg-[#0a0a0f] p-3 rounded-lg border border-[#1a1a2e]">{app.description || 'No description.'}</p>
                          <button onClick={() => handleRestoreApp(app.id)} className="w-full py-2.5 bg-[#1a1a2e] hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-400 rounded-lg font-black text-[9px] uppercase border border-[#2a2a3e] flex items-center justify-center gap-2"><RotateCcw className="w-3 h-3" />Restore to Pending</button>
                        </div>
                      ))}</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
