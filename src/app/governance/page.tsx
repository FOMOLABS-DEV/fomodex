'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Zap, Clock, Shield, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function GovernancePage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-[#1a1a2e] px-4 py-4">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                <div className="flex items-center gap-2 group cursor-pointer flex-shrink-0">
                  <div className="h-4 sm:h-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <img src="logo.png" alt="FOMODEX Logo" className="h-full w-auto object-contain" />
                  </div>
                <div className="flex flex-col">
                  <span className="text-lg sm:text-xl font-black tracking-tighter leading-none group-hover:text-cyan-400 transition-colors">DEX</span>
                </div>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 p-1 bg-[#11111a] border border-[#1a1a2e] rounded-xl">
              <Link href="/" className="px-6 py-2 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300">Spot</Link>
              <Link href="/whitepaper" className="px-6 py-2 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300">Docs</Link>
              <button className="px-6 py-2 bg-[#1a1a2e] text-cyan-400 rounded-lg text-sm font-bold shadow-inner">Governance</button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-black text-yellow-400 uppercase tracking-widest">Coming Soon</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight">
              <span className="text-cyan-400 italic">Governance</span> Portal
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
              Shape the future of FOMODEX protocol through decentralized decision making.
            </p>
          </div>

          <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
            
            <div className="relative z-10 text-center space-y-8">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                <Shield className="w-10 h-10 text-cyan-400" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-black uppercase tracking-tight">Governance Module In Development</h2>
                <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
                  Our team is building a fully decentralized governance system that will allow $FOMO holders to propose and vote on protocol upgrades, fee structures, and treasury allocations.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 pt-8">
                <div className="bg-[#11111a] border border-[#1a1a2e] rounded-2xl p-6 text-center">
                  <div className="text-3xl font-black text-cyan-400 mb-2">01</div>
                  <div className="text-xs font-black text-white uppercase tracking-widest mb-2">Propose</div>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider">Submit improvement proposals</p>
                </div>
                <div className="bg-[#11111a] border border-[#1a1a2e] rounded-2xl p-6 text-center">
                  <div className="text-3xl font-black text-cyan-400 mb-2">02</div>
                  <div className="text-xs font-black text-white uppercase tracking-widest mb-2">Vote</div>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider">Cast votes with $FOMO tokens</p>
                </div>
                <div className="bg-[#11111a] border border-[#1a1a2e] rounded-2xl p-6 text-center">
                  <div className="text-3xl font-black text-cyan-400 mb-2">03</div>
                  <div className="text-xs font-black text-white uppercase tracking-widest mb-2">Execute</div>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider">Implement winning proposals</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-8">
            <Link 
              href="/"
              className="inline-flex items-center gap-3 px-10 py-5 bg-[#11111a] border border-[#1a1a2e] hover:border-cyan-500/50 text-white font-black uppercase tracking-widest rounded-2xl transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Return to Terminal
            </Link>
          </div>
        </motion.div>
      </main>

        <footer className="mt-20 border-t border-[#1a1a2e] bg-[#0a0a0f] px-6 py-12">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3 opacity-50">
              <Zap className="w-5 h-5 text-cyan-500" />
              <span className="text-xl font-black tracking-tighter">FOMODEX</span>
            </div>
          <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.3em]">
            &copy; 2026 FOMODEX | Governance Coming Soon
          </p>
          <div className="flex gap-6">
             <ExternalLink className="w-4 h-4 text-gray-700 cursor-pointer hover:text-cyan-400" />
             <Shield className="w-4 h-4 text-gray-700 cursor-pointer hover:text-cyan-400" />
          </div>
        </div>
      </footer>
    </div>
  )
}
