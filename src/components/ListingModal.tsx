'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Globe, Image as ImageIcon, Send, MessageCircle, Zap, Check, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { submitListingApplication } from '@/lib/supabase'

const DEV_WALLET_ADDRESS = 'jQW54EhGhwunKjHeBWTVzp2AuN6N5Zs555URT2ACtav'
const EXPEDITE_FEE_SOL = 1.5

interface ListingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ListingModal({ isOpen, onClose }: ListingModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    mint_address: '',
    symbol: '',
    name: '',
    logo_uri: '',
    telegram: '',
    twitter: '',
    website: '',
    description: '',
    contact_email: '',
    expedite: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
      setError('')
      if (!formData.mint_address || !formData.symbol || !formData.name || !formData.contact_email) {
        setError('Please fill in all required fields.')
        return
      }

      setIsSubmitting(true)
      const result = await submitListingApplication(formData)
      setIsSubmitting(false)

      if (result) {
        setSuccess(true)
      } else {
        setError('Failed to submit application. Please try again.')
      }
    }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[10000] p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-[24px] sm:rounded-[32px] w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl shadow-cyan-500/10 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 sm:p-6 border-b border-[#1a1a2e] flex items-center justify-between bg-[#0d0d15] flex-shrink-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Send className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black tracking-tighter uppercase">Apply Listing</h2>
                <p className="text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest">Integration Protocol</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-[#11111a] border border-[#1a1a2e] rounded-lg sm:rounded-xl text-gray-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-8 overflow-y-auto custom-scrollbar">
            {success ? (
              <div className="text-center py-8 sm:py-12 space-y-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <Check className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">APPLICATION RECEIVED</h3>
                  <p className="text-[11px] sm:text-sm text-gray-500 max-w-xs mx-auto">
                      Your listing application has been submitted successfully. Our team will review it within 24-48 hours.
                    </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 py-3 bg-cyan-500 text-black font-black rounded-xl hover:bg-cyan-400 transition-all text-sm"
                >
                  RETURN TO TERMINAL
                </button>
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-8">
                <div className="flex gap-2 mb-2 sm:mb-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-all",
                        step >= i ? "bg-cyan-500" : "bg-[#1a1a2e]"
                      )}
                    />
                  ))}
                </div>

                {step === 1 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-[9px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Mint Address *</label>
                        <input
                          type="text"
                          name="mint_address"
                          value={formData.mint_address}
                          onChange={handleInputChange}
                          placeholder="Solana Mint CA"
                          className="w-full bg-[#11111a] border border-[#1a1a2e] rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 outline-none focus:border-cyan-500/50 transition-all text-xs sm:text-sm font-medium"
                        />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-[9px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Ticker Symbol *</label>
                        <input
                          type="text"
                          name="symbol"
                          value={formData.symbol}
                          onChange={handleInputChange}
                          placeholder="e.g. BONK"
                          className="w-full bg-[#11111a] border border-[#1a1a2e] rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 outline-none focus:border-cyan-500/50 transition-all text-xs sm:text-sm font-medium uppercase"
                        />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-[9px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Project Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Full Name"
                          className="w-full bg-[#11111a] border border-[#1a1a2e] rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 outline-none focus:border-cyan-500/50 transition-all text-xs sm:text-sm font-medium"
                        />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-[9px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Contact Email *</label>
                        <input
                          type="email"
                          name="contact_email"
                          value={formData.contact_email}
                          onChange={handleInputChange}
                          placeholder="dev@project.com"
                          className="w-full bg-[#11111a] border border-[#1a1a2e] rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 outline-none focus:border-cyan-500/50 transition-all text-xs sm:text-sm font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-[9px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Project Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Tell us about your project..."
                        rows={3}
                        className="w-full bg-[#11111a] border border-[#1a1a2e] rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 outline-none focus:border-cyan-500/50 transition-all text-xs sm:text-sm font-medium resize-none"
                      />
                    </div>
                    <button
                      onClick={() => setStep(2)}
                      className="w-full py-3.5 sm:py-4 bg-white text-black font-black rounded-xl sm:rounded-2xl hover:bg-cyan-500 transition-all text-sm"
                    >
                      CONTINUE TO SOCIALS
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-[9px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <ImageIcon className="w-3 h-3" /> Logo URL
                        </label>
                        <input
                          type="text"
                          name="logo_uri"
                          value={formData.logo_uri}
                          onChange={handleInputChange}
                          placeholder="https://..."
                          className="w-full bg-[#11111a] border border-[#1a1a2e] rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 outline-none focus:border-cyan-500/50 transition-all text-xs sm:text-sm font-medium"
                        />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-[9px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <Globe className="w-3 h-3" /> Website
                        </label>
                        <input
                          type="text"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          placeholder="https://project.com"
                          className="w-full bg-[#11111a] border border-[#1a1a2e] rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 outline-none focus:border-cyan-500/50 transition-all text-xs sm:text-sm font-medium"
                        />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                          <label className="text-[9px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> X (Twitter)
                          </label>
                          <input
                            type="text"
                            name="twitter"
                            value={formData.twitter}
                            onChange={handleInputChange}
                            placeholder="@ProjectHandle"
                            className="w-full bg-[#11111a] border border-[#1a1a2e] rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 outline-none focus:border-cyan-500/50 transition-all text-xs sm:text-sm font-medium"
                          />
                        </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-[9px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <MessageCircle className="w-3 h-3" /> Telegram
                        </label>
                        <input
                          type="text"
                          name="telegram"
                          value={formData.telegram}
                          onChange={handleInputChange}
                          placeholder="t.me/ProjectChannel"
                          className="w-full bg-[#11111a] border border-[#1a1a2e] rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 outline-none focus:border-cyan-500/50 transition-all text-xs sm:text-sm font-medium"
                        />
                      </div>
                    </div>

                      <div className="bg-[#11111a] border border-[#1a1a2e] rounded-[16px] sm:rounded-[24px] p-4 sm:p-6 space-y-4 opacity-60">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gray-500/10 flex items-center justify-center">
                              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                            </div>
                            <div>
                              <h4 className="text-xs sm:text-sm font-black tracking-tight uppercase text-gray-500">Expedite Listing</h4>
                              <p className="text-[8px] sm:text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Coming Soon</p>
                            </div>
                          </div>
                          <div className="w-10 sm:w-12 h-5 sm:h-6 rounded-full bg-[#1a1a2e] cursor-not-allowed relative">
                            <div className="absolute top-1 left-1 w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-gray-600" />
                          </div>
                        </div>
                      </div>

                    {error && (
                      <div className="p-3 sm:p-4 bg-red-500/5 border border-red-500/20 rounded-xl sm:rounded-2xl text-red-400 text-[10px] sm:text-xs font-bold uppercase tracking-wide flex items-center gap-3">
                        <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {error}
                      </div>
                    )}

                    <div className="flex gap-3 sm:gap-4">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 py-3.5 sm:py-4 bg-[#11111a] border border-[#1a1a2e] text-gray-400 font-black rounded-xl sm:rounded-2xl hover:text-white transition-all text-sm"
                      >
                        BACK
                      </button>
                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className={cn(
                            "flex-[2] py-3.5 sm:py-4 bg-cyan-500 text-black font-black rounded-xl sm:rounded-2xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 text-sm",
                            isSubmitting && "opacity-70 cursor-not-allowed"
                          )}
                        >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            SUBMIT
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
