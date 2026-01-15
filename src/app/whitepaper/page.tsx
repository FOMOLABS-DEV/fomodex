'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Zap, Shield, Rocket, BarChart3, Users, Globe } from 'lucide-react'
import Link from 'next/link'

export default function WhitepaperPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-[#1a1a2e] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-500" />
                <span className="text-lg sm:text-xl font-black tracking-tighter">FOMODEX</span>
              </div>
            </Link>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Whitepaper v1.0</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
              FOMODEX <span className="text-cyan-400">Whitepaper</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A high-powered decentralized trading terminal for the Solana ecosystem
            </p>
            <p className="text-xs text-gray-600 uppercase tracking-widest">January 2026</p>
          </div>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center">
                <Rocket className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-black uppercase">Abstract</h2>
            </div>
            <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6 space-y-4 text-gray-400">
              <p>
                FOMODEX is a next-generation decentralized exchange (DEX) built on the Solana blockchain, designed to provide traders with institutional-grade tools while maintaining the ethos of decentralization. Our platform combines lightning-fast execution, deep liquidity aggregation, and advanced trading features to deliver an unparalleled trading experience.
              </p>
              <p>
                This whitepaper outlines the technical architecture, tokenomics, governance model, and roadmap for the FOMODEX protocol.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-black uppercase">Introduction</h2>
            </div>
            <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6 space-y-4 text-gray-400">
              <p>
                The decentralized finance (DeFi) ecosystem has grown exponentially, yet many existing platforms fail to meet the demands of sophisticated traders. FOMODEX addresses these shortcomings by offering:
              </p>
              <ul className="space-y-3 ml-4">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <span><strong className="text-white">Sub-second execution</strong> - Leveraging Solana&apos;s high throughput for instant trades</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <span><strong className="text-white">Deep liquidity</strong> - Aggregating liquidity from multiple sources for optimal pricing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <span><strong className="text-white">Advanced charting</strong> - Professional-grade tools powered by TradingView</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <span><strong className="text-white">Non-custodial</strong> - Users maintain full control of their assets</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-black uppercase">Tokenomics</h2>
            </div>
            <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#11111a] border border-[#1a1a2e] rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-cyan-400">1B</p>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Total Supply</p>
                  </div>
                  <div className="bg-[#11111a] border border-[#1a1a2e] rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-green-400">100%</p>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">LP Burned</p>
                  </div>
                </div>
                <div className="text-gray-400 space-y-4">
                  <p>
                    The $FOMO token is designed with a fair launch model, ensuring equal opportunity for all participants:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-3">
                      <Shield className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                      <span>No mint function - supply is fixed</span>
                    </li>
                  </ul>
                </div>
              </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-black uppercase">Security</h2>
            </div>
            <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6 space-y-4 text-gray-400">
              <p>
                Security is paramount at FOMODEX. Our smart contracts have been rigorously audited and follow best practices:
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-[#11111a] border border-[#1a1a2e] rounded-xl p-4">
                  <h4 className="font-bold text-white mb-2">Smart Contract Security</h4>
                  <ul className="text-sm space-y-1">
                    <li>- Third-party audits completed</li>
                    <li>- Reentrancy protection</li>
                    <li>- Overflow/underflow guards</li>
                    <li>- Access control mechanisms</li>
                  </ul>
                </div>
                <div className="bg-[#11111a] border border-[#1a1a2e] rounded-xl p-4">
                  <h4 className="font-bold text-white mb-2">Platform Security</h4>
                  <ul className="text-sm space-y-1">
                    <li>- Non-custodial architecture</li>
                    <li>- Real-time monitoring</li>
                    <li>- DDoS protection</li>
                    <li>- Secure API endpoints</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-black uppercase">Governance</h2>
            </div>
            <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6 space-y-4 text-gray-400">
              <p>
                FOMODEX is committed to progressive decentralization. Token holders can participate in governance decisions including:
              </p>
              <ul className="space-y-3 ml-4">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <span>Protocol fee adjustments</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <span>New feature proposals</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <span>Token listing criteria</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <span>Treasury allocation</span>
                </li>
              </ul>
              <p className="mt-4">
                Governance is facilitated through Snapshot, ensuring gas-free voting for all token holders.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center">
                <Rocket className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-black uppercase">Roadmap</h2>
            </div>
            <div className="space-y-4">
                <div className="bg-[#0a0a0f] border border-cyan-500/30 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-bold rounded-full uppercase">Phase 1</span>
                    <span className="text-green-400 text-xs font-bold uppercase">Completed</span>
                  </div>
                  <ul className="text-gray-400 space-y-2">
                    <li>- Platform launch on Solana mainnet</li>
                    <li>- Token fair launch via Meteora</li>
                    <li>- Basic swap functionality</li>
                    <li>- TradingView integration</li>
                  </ul>
                </div>
                <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-bold rounded-full uppercase">Phase 2</span>
                    <span className="text-yellow-400 text-xs font-bold uppercase">In Progress</span>
                  </div>
                  <ul className="text-gray-400 space-y-2">
                    <li>- Limit orders</li>
                    <li>- Portfolio tracking</li>
                    <li>- Mobile app (iOS/Android)</li>
                    <li>- Advanced analytics dashboard</li>
                  </ul>
                </div>
                <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-orange-500/10 text-orange-400 text-xs font-bold rounded-full uppercase">Phase 3-4</span>
                    <span className="text-gray-500 text-xs font-bold uppercase">Planned</span>
                  </div>
                  <ul className="text-gray-400 space-y-2">
                    <li>- Perpetual futures trading</li>
                    <li>- Cross-chain bridge integration</li>
                    <li>- DAO governance launch</li>
                    <li>- API for institutional traders</li>
                  </ul>
                </div>

            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase">Conclusion</h2>
            <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-[#1a1a2e] rounded-2xl p-6 text-gray-400">
              <p>
                FOMODEX represents the next evolution in decentralized trading. By combining cutting-edge technology with a fair tokenomics model and community-driven governance, we aim to become the premier trading destination on Solana.
              </p>
              <p className="mt-4 text-cyan-400 font-bold">
                Join us in building the future of decentralized finance.
              </p>
            </div>
          </section>

          <div className="text-center pt-8">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Trading
            </Link>
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-[#1a1a2e] bg-[#0a0a0f] px-6 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-gray-600 uppercase tracking-widest">
            &copy; 2026 FOMODEX | All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  )
}
