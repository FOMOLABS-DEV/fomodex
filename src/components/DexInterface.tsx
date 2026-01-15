'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, TrendingUp, TrendingDown, Flame, Rocket, History,
  ChevronDown, X, Check, AlertCircle, ExternalLink, Shield, Gift,
  Sun, Moon, LayoutGrid, Loader2, Copy, Zap, Wallet, BarChart3,
  ArrowUpDown, Filter, Settings, Bell, Info, Send, Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SOL_MINT, DEFAULT_TOKENS, SLIPPAGE_PRESETS, DEX_NAME, BURN_NOTICE, REWARDS_MESSAGE, METEORA_LAUNCH, DEX_CA } from '@/lib/constants'
import { getListedTokens, ListedToken } from '@/lib/supabase'
import { TradingViewChart } from './TradingViewChart'
import { ListingModal } from './ListingModal'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

interface TokenData {
  address: string
  name: string
  symbol: string
  price: number
  priceChange24h: number
  volume24h: number
  liquidity: number
  decimals: number
  logoURI: string | null
  pairAddress?: string
  description?: string | null
  twitter?: string | null
  telegram?: string | null
  website?: string | null
  fdv?: number
  totalSupply?: string
}

function SwapModal({ isOpen, onClose, title, message, type = 'success', txid }: {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type: 'success' | 'error'
  txid?: string
}) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[10000]"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-[#11111a] border border-[#222233] rounded-2xl p-8 max-w-md w-[90%] text-center shadow-2xl shadow-cyan-500/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6">
            {type === 'success' ? (
              <div className="w-20 h-20 mx-auto rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                <Check className="w-10 h-10 text-cyan-400" />
              </div>
            ) : (
              <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <X className="w-10 h-10 text-red-400" />
              </div>
            )}
          </div>
          <h3 className={cn(
            "text-2xl font-bold mb-3",
            type === 'success' ? 'text-cyan-400' : 'text-red-400'
          )}>{title}</h3>
          <p className="text-gray-400 mb-6 text-sm leading-relaxed whitespace-pre-line">{message}</p>
          
          {type === 'success' && txid && (
            <a
              href={`https://solscan.io/tx/${txid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 mb-4 bg-[#1a1a2e] border border-[#222233] rounded-xl text-sm font-medium hover:bg-[#22223a] transition-all group"
            >
              <ExternalLink className="w-4 h-4 text-cyan-400" />
              <span>View Transaction</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
            </a>
          )}
          
          <button
            onClick={onClose}
            className={cn(
              "w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98]",
              type === 'success' 
                ? 'bg-cyan-500 hover:bg-cyan-400 text-black' 
                : 'bg-red-500 hover:bg-red-400 text-white'
            )}
          >
            Done
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function TradingPanel({ selectedToken, solPrice, isWalletConnected, onConnectWallet, solBalance }: {
  selectedToken: TokenData | null
  solPrice: number
  isWalletConnected: boolean
  onConnectWallet: () => void
  solBalance: number
}) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [inputAmount, setInputAmount] = useState('')
  const [outputAmount, setOutputAmount] = useState('')
  const [slippage, setSlippage] = useState(1)
  const [isFetchingQuote, setIsFetchingQuote] = useState(false)
  const [showError, setShowError] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const balance = isWalletConnected ? solBalance : 0
  const tokenBalance = isWalletConnected ? 0 : 0

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (!selectedToken || !inputAmount || !solPrice) {
      setOutputAmount('')
      setIsFetchingQuote(false)
      return
    }
    timeoutRef.current = setTimeout(async () => {
      setIsFetchingQuote(true)
      const tokenPriceInSol = selectedToken.price / solPrice
      
      if (side === 'buy') {
        // Selling SOL for Token
        const output = parseFloat(inputAmount) / tokenPriceInSol
        setOutputAmount(output.toFixed(2))
      } else {
        // Selling Token for SOL
        const output = parseFloat(inputAmount) * tokenPriceInSol
        setOutputAmount(output.toFixed(6))
      }
      setIsFetchingQuote(false)
    }, 400)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [inputAmount, side, selectedToken, solPrice])

  if (!selectedToken) return null

  const inputBalance = side === 'buy' ? balance : tokenBalance
  const maxInput = inputBalance * 0.99
  const handleMax = () => setInputAmount(maxInput.toFixed(side === 'buy' ? 6 : 2))

  const handleSwap = () => {
    if (!isWalletConnected) {
      onConnectWallet()
      return
    }
    setModalMessage('Transaction failed: Insufficient liquidity for this pair on mock network. Please try again with a smaller amount.')
    setShowError(true)
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl overflow-hidden shadow-xl shadow-cyan-500/5 min-h-[500px] lg:min-h-0">
      <SwapModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Transaction Error"
        message={modalMessage}
        type="error"
      />
      
      <div className="flex p-1 bg-[#11111a] m-3 sm:m-4 rounded-xl border border-[#1a1a2e]">
        <button
          onClick={() => { setSide('buy'); setInputAmount('') }}
          className={cn(
            "flex-1 py-2 sm:py-3 rounded-lg font-bold text-[11px] sm:text-sm transition-all",
            side === 'buy' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
          )}
        >
          BUY
        </button>
        <button
          onClick={() => { setSide('sell'); setInputAmount('') }}
          className={cn(
            "flex-1 py-2 sm:py-3 rounded-lg font-bold text-[11px] sm:text-sm transition-all",
            side === 'sell' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
          )}
        >
          SELL
        </button>
      </div>

      <div className="flex-1 p-3 sm:p-4 space-y-4 sm:space-y-6 overflow-y-auto no-scrollbar">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-[9px] sm:text-xs font-semibold text-gray-500 tracking-wider uppercase">Selling</span>
            <span className="text-[9px] sm:text-xs text-gray-400">
              Balance: <span className="text-cyan-400 font-mono">{inputBalance.toLocaleString()}</span>
            </span>
          </div>
          <div className="bg-[#11111a] border border-[#1a1a2e] rounded-xl p-3 sm:p-4 transition-all focus-within:border-cyan-500/50 group">
            <div className="flex items-center gap-2 sm:gap-3">
              <input
                type="number"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                placeholder="0.00"
                className="bg-transparent text-xl sm:text-2xl font-bold w-full outline-none placeholder:text-gray-700 font-mono"
              />
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 bg-[#1a1a2e] rounded-lg border border-[#222233] flex-shrink-0">
                <span className="font-bold text-[11px] sm:text-sm">{side === 'buy' ? 'SOL' : selectedToken.symbol}</span>
              </div>
            </div>
            <div className="flex gap-1.5 sm:gap-2 mt-3">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setInputAmount(((inputBalance * pct) / 100).toFixed(side === 'buy' ? 6 : 2))}
                  className="flex-1 py-1 text-[9px] sm:text-[10px] font-bold text-gray-500 bg-[#1a1a2e] border border-[#222233] rounded-md hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center -my-2 sm:-my-3 relative z-10">
          <button 
            onClick={() => setSide(side === 'buy' ? 'sell' : 'buy')}
            className="w-8 h-8 sm:w-10 sm:h-10 bg-[#11111a] border border-[#1a1a2e] rounded-xl flex items-center justify-center text-cyan-500 hover:text-cyan-400 hover:scale-110 active:scale-95 transition-all shadow-lg shadow-black"
          >
            <ArrowUpDown className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-[9px] sm:text-xs font-semibold text-gray-500 tracking-wider uppercase">Buying</span>
            {isFetchingQuote && (
              <span className="flex items-center gap-1 text-[9px] sm:text-[10px] text-cyan-400 animate-pulse">
                <Loader2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-spin" />
                Updating...
              </span>
            )}
          </div>
          <div className="bg-[#11111a] border border-[#1a1a2e] rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-xl sm:text-2xl font-bold w-full truncate text-gray-300 font-mono">
                {outputAmount || '0.00'}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 bg-[#1a1a2e] rounded-lg border border-[#222233] flex-shrink-0">
                {side === 'buy' && selectedToken.logoURI && (
                  <img src={selectedToken.logoURI} alt="" className="w-4 h-4 sm:w-5 sm:h-5 rounded-full" />
                )}
                {side === 'sell' && (
                  <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="" className="w-4 h-4 sm:w-5 sm:h-5 rounded-full" />
                )}
                <span className="font-bold text-[11px] sm:text-sm">{side === 'buy' ? selectedToken.symbol : 'SOL'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#11111a]/50 rounded-xl p-2 sm:p-3 border border-[#1a1a2e] space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs">
          <div className="flex justify-between text-gray-500">
            <span>Price Impact</span>
            <span className="text-green-400 font-mono">{'< 0.01%'}</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-gray-500 whitespace-nowrap">Slippage</span>
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="flex bg-[#1a1a2e] rounded-lg p-0.5 border border-[#222233] overflow-x-auto no-scrollbar">
                {SLIPPAGE_PRESETS.slice(0, 3).map((p) => (
                  <button
                    key={p}
                    onClick={() => setSlippage(p)}
                    className={cn(
                      "px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md transition-all font-mono whitespace-nowrap",
                      slippage === p ? 'bg-cyan-500 text-black' : 'text-gray-500 hover:text-gray-300'
                    )}
                  >
                    {p}%
                  </button>
                ))}
              </div>
              <input 
                type="number" 
                value={slippage}
                onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.1)}
                className="w-10 sm:w-12 bg-[#1a1a2e] border border-[#222233] rounded-lg px-1.5 py-0.5 sm:py-1 text-center outline-none focus:border-cyan-500 font-mono flex-shrink-0"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 bg-[#0d0d15] border-t border-[#1a1a2e]">
        <button
          onClick={handleSwap}
          disabled={!inputAmount || isFetchingQuote}
          className={cn(
            "w-full py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg",
            side === 'buy' 
              ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/10' 
              : 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/10'
          )}
        >
          {!isWalletConnected ? (
            <>
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
              Connect Wallet
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="truncate">{side === 'buy' ? `Buy ${selectedToken.symbol}` : `Sell ${selectedToken.symbol}`}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export function DexInterface({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [trendingTokens, setTrendingTokens] = useState<TokenData[]>([])
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null)
  const [solPrice, setSolPrice] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [customTokens, setCustomTokens] = useState<ListedToken[]>([])
  const [activeTab, setActiveTab] = useState<'spot' | 'listing'>('spot')
  const [isListingModalOpen, setIsListingModalOpen] = useState(false)
  const [solBalance, setSolBalance] = useState(0)
  const [tokenTab, setTokenTab] = useState<'price' | 'info'>('price')
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  const { publicKey, connected, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const { connection } = useConnection()

  const isWalletConnected = connected && !!publicKey
  const walletAddress = publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : ''

  useEffect(() => {
    const fetchBalance = async () => {
      if (publicKey && connection) {
        try {
          const balance = await connection.getBalance(publicKey)
          setSolBalance(balance / LAMPORTS_PER_SOL)
        } catch (e) {
          console.error('Error fetching balance:', e)
        }
      } else {
        setSolBalance(0)
      }
    }
    fetchBalance()
    const interval = setInterval(fetchBalance, 10000)
    return () => clearInterval(interval)
  }, [publicKey, connection])

  const handleConnectWallet = () => {
    if (connected) {
      disconnect()
    } else {
      setVisible(true)
    }
  }

  useEffect(() => {
    const loadCustomTokens = async () => {
      const listed = await getListedTokens()
      setCustomTokens(listed)
    }
    loadCustomTokens()
    const interval = setInterval(loadCustomTokens, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${SOL_MINT}`)
        const data = await response.json()
        if (data.pairs && data.pairs.length > 0) {
          setSolPrice(parseFloat(data.pairs[0].priceUsd))
        }
      } catch (e) {
        console.error('Error fetching SOL price:', e)
        setSolPrice(150) // Fallback
      }
    }
    fetchSolPrice()
    const interval = setInterval(fetchSolPrice, 60000)
    return () => clearInterval(interval)
  }, [])

    useEffect(() => {
    const loadTokens = async () => {
      try {
        setLoading(true)
        const allMints = [
          ...DEFAULT_TOKENS.map(t => t.mint),
          ...customTokens.map(t => t.mint_address)
        ]
        
        // Use bulk API (supports up to 30 addresses)
        const chunks = []
        for (let i = 0; i < allMints.length; i += 30) {
          chunks.push(allMints.slice(i, i + 30))
        }

        const allTokens: TokenData[] = []
        
        for (const chunk of chunks) {
          try {
            const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${chunk.join(',')}`)
            const data = await response.json()
            
            if (data.pairs) {
              // Group pairs by token address
              const tokenPairs: Record<string, any[]> = {}
              data.pairs.forEach((pair: any) => {
                const mint = pair.baseToken.address
                if (!tokenPairs[mint]) tokenPairs[mint] = []
                tokenPairs[mint].push(pair)
              })

              for (const mint of chunk) {
                const pairs = tokenPairs[mint] || []
                if (pairs.length > 0) {
                  const preferredPair = pairs.find((p: any) =>
                    (p.quoteToken.address === SOL_MINT) &&
                    p.chainId === 'solana' &&
                    p.priceUsd &&
                    parseFloat(String(p.volume?.h24 || 0)) > 0
                  ) || pairs.find((p: any) => p.chainId === 'solana' && p.priceUsd) || pairs[0]

                    if (preferredPair) {
                      const customInfo = customTokens.find(ct => ct.mint_address === preferredPair.baseToken.address)
                      
                      allTokens.push({
                        address: preferredPair.baseToken.address,
                        name: preferredPair.baseToken.name,
                        symbol: preferredPair.baseToken.symbol,
                        price: parseFloat(preferredPair.priceUsd),
                        priceChange24h: parseFloat(preferredPair.priceChange?.h24 || 0),
                        volume24h: parseFloat(preferredPair.volume?.h24 || 0),
                        liquidity: parseFloat(preferredPair.liquidity?.usd || 0),
                        decimals: 9,
                        logoURI: preferredPair.info?.imageUrl || customInfo?.logo_uri || null,
                        pairAddress: preferredPair.pairAddress,
                        description: customInfo?.description || null,
                        twitter: customInfo?.twitter || preferredPair.info?.socials?.find((s: any) => s.type === 'twitter')?.url || null,
                        telegram: customInfo?.telegram || preferredPair.info?.socials?.find((s: any) => s.type === 'telegram')?.url || null,
                        website: customInfo?.website || preferredPair.info?.websites?.[0]?.url || null,
                        fdv: preferredPair.fdv,
                      } as TokenData)
                    }
                }
              }
            }
          } catch (e) {
            console.error('Error fetching chunk:', e)
          }
        }
        
        const uniqueTokens = allTokens
          .filter((t, i, self) => self.findIndex(x => x.address === t.address) === i)
          .sort((a, b) => b.volume24h - a.volume24h)
        
        setTokens(uniqueTokens)
        
        const topGainers = [...uniqueTokens]
          .sort((a, b) => b.priceChange24h - a.priceChange24h)
          .slice(0, 8)
        setTrendingTokens(topGainers)
        
        if (!selectedToken || !uniqueTokens.some(t => t.address === selectedToken.address)) {
          setSelectedToken(uniqueTokens[0] || null)
        }
      } catch (error) {
        console.error('Error loading tokens:', error)
      } finally {
        setLoading(false)
      }
    }
    loadTokens()
    const interval = setInterval(loadTokens, 30000)
    return () => clearInterval(interval)
  }, [customTokens])

  const formatPrice = (price: number) => {
    if (!solPrice) return `$${price.toFixed(6)}`
    const solValue = price / solPrice
    if (solValue < 0.000001) return `${solValue.toFixed(9)} SOL`
    return `${solValue.toFixed(6)} SOL`
  }
  
  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  const filteredTokens = tokens.filter(t =>
    t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={cn("min-h-screen bg-[#050508] text-white selection:bg-cyan-500/30", isDarkMode ? 'dark' : '')}>
      <ListingModal isOpen={isListingModalOpen} onClose={() => setIsListingModalOpen(false)} />
      
      <header className="sticky top-0 z-50">
        <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-[#1a1a2e] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[9px] sm:text-[10px] font-bold text-cyan-400 uppercase tracking-widest animate-pulse flex-shrink-0">
              <Rocket className="w-3 h-3" />
              <span className="whitespace-nowrap">{METEORA_LAUNCH}</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold text-red-400 uppercase tracking-widest flex-shrink-0">
              <Flame className="w-3 h-3" />
              <span className="whitespace-nowrap">{BURN_NOTICE}</span>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4 text-[9px] sm:text-[10px] text-gray-500">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Mainnet-Beta: {solPrice ? `$${solPrice.toFixed(2)}` : 'Syncing...'}
            </div>
            <div className="hidden md:flex items-center gap-1.5 whitespace-nowrap">
              <Info className="w-3 h-3" />
              {REWARDS_MESSAGE}
            </div>
          </div>
        </div>

        <nav className="bg-[#0a0a0f] border-b border-[#1a1a2e] px-4 lg:px-6 py-3 sm:py-4">
          <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-3 lg:gap-10">
              <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer flex-shrink-0" onClick={() => window.location.reload()}>
                <div className="w-10 h-8 sm:w-10 sm:h-10 sm:rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                  <img src="logo.png" alt="FOMODEX Logo"/>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg sm:text-xl font-black tracking-tighter leading-none group-hover:text-cyan-400 transition-colors">DEX</span>
                  {/* <span className="text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest">Protocol</span> */}
                </div>
              </div>

              <div className="flex items-center gap-1 p-0.5 sm:p-1 bg-[#11111a] border border-[#1a1a2e] rounded-lg sm:rounded-xl">
                <button 
                  onClick={() => setActiveTab('spot')}
                  className={cn(
                    "px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[11px] sm:text-sm font-bold transition-all",
                    activeTab === 'spot' ? 'bg-[#1a1a2e] text-cyan-400 shadow-inner' : 'text-gray-500 hover:text-gray-300'
                  )}
                >
                  Spot
                </button>
                <button 
                  onClick={() => setIsListingModalOpen(true)}
                  className={cn(
                    "px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[11px] sm:text-sm font-bold transition-all text-gray-500 hover:text-gray-300"
                  )}
                >
                  Listing
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 lg:gap-4">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#11111a] border border-[#1a1a2e] rounded-xl">
                <Search className="w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Quick Search..."
                  className="bg-transparent text-sm outline-none w-32 xl:w-48 placeholder:text-gray-600"
                />
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <button onClick={onOpenAdmin} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-[#11111a] border border-[#1a1a2e] rounded-lg sm:rounded-xl text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button className="hidden xs:flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center bg-[#11111a] border border-[#1a1a2e] rounded-lg sm:rounded-xl text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all">
                  <History className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className="h-5 sm:h-6 w-px bg-[#1a1a2e] mx-0.5 sm:mx-1" />
                <button
                  onClick={handleConnectWallet}
                  className="flex items-center gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg sm:rounded-xl transition-all active:scale-95 shadow-lg shadow-cyan-500/10 whitespace-nowrap text-[11px] sm:text-sm"
                >
                  <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">{isWalletConnected ? walletAddress : 'Connect'}</span>
                  <span className="xs:hidden">{isWalletConnected ? 'Wallet' : 'Connect'}</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="bg-[#050508] border-b border-[#1a1a2e] px-4 py-2 flex items-center gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex-shrink-0">
            <Bell className="w-3 h-3" />
            Trending:
          </div>
          {trendingTokens.map((token) => (
            <div
              key={token.address}
              onClick={() => setSelectedToken(token)}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-lg transition-colors cursor-pointer flex-shrink-0 group"
            >
              {token.logoURI && <img src={token.logoURI} alt="" className="w-4 h-4 rounded-full" />}
              <span className="text-xs font-bold text-gray-400 group-hover:text-white">${token.symbol}</span>
              <span className={cn(
                "text-xs font-mono",
                token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
              )}>
                {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </header>

      <main className="max-w-[1920px] mx-auto p-2 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_340px] gap-3 sm:gap-6 lg:h-[calc(100vh-220px)] overflow-hidden">
            <aside className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl flex flex-col overflow-hidden shadow-2xl h-[300px] sm:h-[400px] lg:h-full order-2 lg:order-1">
              <div className="p-3 sm:p-4 border-b border-[#1a1a2e] space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[10px] sm:text-xs tracking-wide text-gray-400 uppercase">Registry</h3>
                  <Filter className="w-3 h-3 text-gray-600 cursor-pointer hover:text-cyan-400" />
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 h-4 text-gray-600" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#11111a] border border-[#1a1a2e] rounded-lg sm:rounded-xl pl-9 sm:pl-10 pr-4 py-1.5 sm:py-2 text-xs sm:text-sm outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-700"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-1.5 sm:p-2 space-y-1">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-10 sm:py-20 gap-4">
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-cyan-500" />
                    <span className="text-[9px] sm:text-[10px] font-black text-gray-700 tracking-widest uppercase">Indexing...</span>
                  </div>
                ) : (
                  filteredTokens.map((token) => (
                    <motion.div
                      key={token.address}
                      whileHover={{ scale: 1.01, x: 2 }}
                      onClick={() => setSelectedToken(token)}
                      className={cn(
                        "flex items-center justify-between p-2 sm:p-3 rounded-lg sm:rounded-xl cursor-pointer transition-all border border-transparent",
                        selectedToken?.address === token.address 
                          ? "bg-cyan-500/5 border-cyan-500/20 shadow-lg shadow-cyan-500/5" 
                          : "hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="relative flex-shrink-0">
                          {token.logoURI ? (
                            <img src={token.logoURI} alt={token.symbol} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#1a1a2e]" />
                          ) : (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#11111a] flex items-center justify-center text-[9px] sm:text-[10px] font-black text-cyan-500 border border-cyan-500/20">
                              {token.symbol.slice(0, 2)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-[11px] sm:text-xs tracking-tight truncate">{token.symbol}</div>
                          <div className="text-[8px] sm:text-[10px] text-gray-600 font-bold uppercase tracking-tighter truncate">{token.name}</div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-mono text-[9px] sm:text-[10px] font-bold text-gray-300">{(token.price / (solPrice || 1)).toFixed(6)}</div>
                        <div className={cn(
                          "text-[9px] sm:text-[10px] font-bold",
                          token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                        )}>
                          {token.priceChange24h >= 0 ? '▲' : '▼'}{Math.abs(token.priceChange24h).toFixed(1)}%
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </aside>

            <section className="flex flex-col gap-3 sm:gap-6 order-1 lg:order-2 overflow-y-auto lg:overflow-visible no-scrollbar">
              <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-2 sm:p-4 lg:p-6 shadow-2xl">
                {selectedToken ? (
                  <div className="flex flex-col gap-3 sm:gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
                      <div className="flex items-center gap-2 sm:gap-4">
                        {selectedToken.logoURI && (
                          <img src={selectedToken.logoURI} alt="" className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-lg sm:rounded-2xl border-2 border-cyan-500/20 shadow-lg shadow-cyan-500/10" />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tighter truncate">{selectedToken.symbol}</h2>
                            <span className="text-[9px] sm:text-xs lg:text-sm font-bold text-gray-500 flex-shrink-0">/ SOL</span>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(selectedToken.address)
                            }}
                            className="text-[8px] sm:text-[10px] lg:text-xs text-gray-600 hover:text-cyan-400 flex items-center gap-1 transition-colors font-mono truncate"
                          >
                            <span className="truncate">{selectedToken.address.slice(0, 4)}...{selectedToken.address.slice(-4)}</span>
                            <Copy className="w-2 h-2 sm:w-3 sm:h-3 flex-shrink-0" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-4 lg:gap-8 bg-[#11111a] border border-[#1a1a2e] rounded-xl sm:rounded-2xl p-2 sm:p-4 lg:px-8 lg:py-4">
                        <div className="min-w-0">
                          <div className="text-[7px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest mb-0.5 sm:mb-1">Price (SOL)</div>
                          <div className="text-sm sm:text-lg lg:text-2xl font-black font-mono text-cyan-400 tracking-tighter truncate">{(selectedToken.price / (solPrice || 1)).toFixed(6)}</div>
                        </div>
                        <div className="hidden sm:block w-px h-8 sm:h-10 bg-[#1a1a2e]" />
                        <div className="min-w-0">
                          <div className="text-[7px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest mb-0.5 sm:mb-1">24H Change</div>
                          <div className={cn(
                            "text-sm sm:text-lg lg:text-2xl font-black font-mono tracking-tighter truncate",
                            selectedToken.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                          )}>
                            {selectedToken.priceChange24h >= 0 ? '+' : ''}{selectedToken.priceChange24h.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>

                        <div className="flex items-center gap-1 p-0.5 bg-[#050508] border border-[#1a1a2e] rounded-lg self-start">
                          <button 
                            onClick={() => setTokenTab('price')}
                            className={cn(
                              "px-3 py-1 rounded-md text-[8px] sm:text-[10px] font-black uppercase transition-all",
                              tokenTab === 'price' ? 'bg-[#11111a] text-cyan-400 shadow-inner' : 'text-gray-500 hover:text-gray-300'
                            )}
                          >
                            Price
                          </button>
                          <button 
                            onClick={() => setTokenTab('info')}
                            className={cn(
                              "px-3 py-1 rounded-md text-[8px] sm:text-[10px] font-black uppercase transition-all",
                              tokenTab === 'info' ? 'bg-[#11111a] text-cyan-400 shadow-inner' : 'text-gray-500 hover:text-gray-300'
                            )}
                          >
                            Info
                          </button>
                        </div>

                        <div className="h-[550px] sm:h-[500px] lg:h-[600px] w-full bg-[#050508] border border-[#1a1a2e] rounded-xl overflow-hidden relative">
                          {tokenTab === 'price' ? (
                            <TradingViewChart address={selectedToken.pairAddress || selectedToken.address} />
                          ) : (
                            <div className="p-6 h-full overflow-y-auto custom-scrollbar space-y-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">About {selectedToken.name}</h3>
                                  <p className="text-sm text-gray-400 leading-relaxed">
                                    {selectedToken.description || `${selectedToken.name} ($${selectedToken.symbol}) is a high-performance digital asset on the Solana network. Track real-time price, liquidity, and trading volume on FOMODEX.`}
                                  </p>
                                </div>
                                <div className="space-y-4">
                                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Market Information</h3>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#11111a] p-4 rounded-xl border border-[#1a1a2e]">
                                      <div className="text-[9px] font-black text-gray-600 uppercase mb-1">Fully Diluted Val.</div>
                                      <div className="text-sm font-black text-cyan-400 font-mono">
                                        {selectedToken.fdv ? formatNumber(selectedToken.fdv) : 'Syncing...'}
                                      </div>
                                    </div>
                                    <div className="bg-[#11111a] p-4 rounded-xl border border-[#1a1a2e]">
                                      <div className="text-[9px] font-black text-gray-600 uppercase mb-1">24H Volume</div>
                                      <div className="text-sm font-black text-white font-mono">
                                        {formatNumber(selectedToken.volume24h)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Token Details</h3>
                                <div className="bg-[#11111a] border border-[#1a1a2e] rounded-xl overflow-hidden divide-y divide-[#1a1a2e]">
                                  <div className="flex items-center justify-between p-4">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Mint Address</span>
                                    <div className="flex items-center gap-2">
                                      <code className="text-[10px] font-mono text-cyan-400">{selectedToken.address}</code>
                                      <button onClick={() => navigator.clipboard.writeText(selectedToken.address)} className="text-gray-600 hover:text-cyan-400"><Copy className="w-3 h-3" /></button>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between p-4">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Decimals</span>
                                    <span className="text-xs font-black text-white">{selectedToken.decimals}</span>
                                  </div>
                                  <div className="flex items-center justify-between p-4">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Network</span>
                                    <span className="text-xs font-black text-white">Solana Mainnet</span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Links & Socials</h3>
                                  <div className="flex flex-wrap gap-3">
                                    {selectedToken.website && (
                                      <a href={selectedToken.website} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-[#11111a] border border-[#1a1a2e] rounded-xl text-gray-400 hover:text-white hover:border-cyan-500/50 transition-all text-[10px] font-black uppercase">
                                        <Globe className="w-3.5 h-3.5" /> Website
                                      </a>
                                    )}
                                    {selectedToken.twitter && (
                                      <a href={selectedToken.twitter.startsWith('http') ? selectedToken.twitter : `https://twitter.com/${selectedToken.twitter.replace('@','')}`} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-[#11111a] border border-[#1a1a2e] rounded-xl text-gray-400 hover:text-white hover:border-cyan-500/50 transition-all text-[10px] font-black uppercase">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> X
                                      </a>
                                    )}
                                    <a href={`https://solscan.io/token/${selectedToken.address}`} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-[#11111a] border border-[#1a1a2e] rounded-xl text-gray-400 hover:text-white hover:border-cyan-500/50 transition-all text-[10px] font-black uppercase">
                                      <ExternalLink className="w-3.5 h-3.5" /> Solscan
                                    </a>
                                  </div>
                                </div>
                            </div>
                          )}
                        </div>
                  </div>
                ) : (
                  <div className="h-[550px] sm:h-[500px] lg:h-[600px] flex flex-col items-center justify-center gap-4 sm:gap-6 py-10 sm:py-20">
                    <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-800" />
                    <p className="text-[10px] sm:text-sm font-black text-gray-700 uppercase tracking-widest">Select Asset to view Chart</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                {[
                  { label: 'Network Health', value: 'OPTIMAL', color: 'text-green-400', icon: Zap },
                  { label: 'Pool Liquidity', value: formatNumber(selectedToken?.liquidity || 0), color: 'text-cyan-400', icon: ArrowUpDown },
                  { label: 'Market Cap', value: formatNumber((selectedToken?.price || 0) * 1000000000), color: 'text-blue-400', icon: History }
                ].map((stat, i) => (
                  <div key={i} className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#11111a] flex items-center justify-center border border-[#1a1a2e] flex-shrink-0">
                      <stat.icon className={cn("w-4 h-4 sm:w-5 sm:h-5", stat.color)} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[8px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest mb-0.5">{stat.label}</div>
                      <div className={cn("text-base sm:text-lg font-black tracking-tight truncate", stat.color)}>{stat.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          <aside className="flex flex-col gap-6 order-3">
              <TradingPanel
                selectedToken={selectedToken}
                solPrice={solPrice}
                isWalletConnected={isWalletConnected}
                onConnectWallet={handleConnectWallet}
                solBalance={solBalance}
              />
            
            <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Security Protocol</h3>
                <Shield className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500 font-bold uppercase">Contract Status</span>
                  <span className="text-green-400 font-black">VERIFIED</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500 font-bold uppercase">Liquidity Lock</span>
                  <span className="text-cyan-400 font-black">100% BURNED</span>
                </div>
              </div>
              <div className="pt-2">
                <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-3 flex items-start gap-3">
                  <Info className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[9px] text-cyan-400/80 leading-relaxed font-bold uppercase tracking-wide">
                    {REWARDS_MESSAGE}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="mt-12 border-t border-[#1a1a2e] bg-[#0a0a0f] px-6 lg:px-10 py-12">
          <div className="max-w-[1920px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-cyan-500" />
                <span className="text-2xl font-black tracking-tighter italic">FOMODEX</span>
              </div>
              <p className="text-xs text-gray-600 font-bold uppercase tracking-widest leading-loose">
                High-powered decentralized trading terminal for the Solana ecosystem.
              </p>
              <div className="flex gap-4">
                <svg className="w-5 h-5 text-gray-500 hover:text-cyan-400 cursor-pointer transition-all" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                <Globe className="w-5 h-5 text-gray-500 hover:text-cyan-400 cursor-pointer transition-all" />
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Ecosystem</h4>
              <ul className="space-y-3 text-[10px] text-gray-600 font-black uppercase tracking-widest">
                <li><a href="https://fomodex.gitbook.io/whitepaper" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 cursor-pointer transition-colors">Whitepaper</a></li>
                <li onClick={() => setIsListingModalOpen(true)} className="hover:text-cyan-400 cursor-pointer transition-colors">Apply Listing</li>
                <li><a href="https://snapshot.org/#/fomodex.eth" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 cursor-pointer transition-colors">Governance</a></li>
              </ul>
            </div>
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Developers</h4>
                <ul className="space-y-3 text-[10px] text-gray-600 font-black uppercase tracking-widest">
                  <li className="hover:text-cyan-400 cursor-pointer transition-colors">Tokenomics: 1B Supply</li>
                  <li><a href="https://github.com/FOMOLABS-DEV/fomodex" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 cursor-pointer transition-colors">GitHub</a></li>
                </ul>
              </div>
            <div className="bg-[#11111a] border border-[#1a1a2e] rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-2">Protocol Stats</h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-loose">
                  Indexing {tokens.length} assets with real-time liquidity tracking.
                </p>
              </div>
              <button 
                onClick={() => setIsListingModalOpen(true)}
                className="mt-6 w-full py-3 bg-white text-black font-black rounded-xl hover:bg-cyan-500 transition-all text-xs uppercase tracking-[0.1em]"
              >
                Integrate Asset
              </button>
            </div>
          </div>
          <div className="max-w-[1920px] mx-auto mt-12 pt-8 border-t border-[#1a1a2e] flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-gray-700 uppercase tracking-widest">
            <div>© 2026 FOMODEX | TERMINAL v1.4.2</div>
            <div className="flex gap-8">
              <span onClick={() => setShowPrivacyModal(true)} className="hover:text-white cursor-pointer transition-colors">Privacy Protocol</span>
              <span onClick={() => setShowTermsModal(true)} className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </footer>

        <AnimatePresence>
          {showTermsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[10000] p-4"
              onClick={() => setShowTermsModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-[#1a1a2e] flex items-center justify-between">
                  <h2 className="text-xl font-black uppercase">Terms of Service</h2>
                  <button onClick={() => setShowTermsModal(false)} className="w-10 h-10 flex items-center justify-center bg-[#11111a] border border-[#1a1a2e] rounded-xl text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4 text-sm text-gray-400">
                  <p className="font-bold text-white">Last Updated: January 2026</p>
                  <p>By accessing and using FOMODEX, you agree to be bound by these Terms of Service.</p>
                  <h3 className="font-bold text-white mt-4">1. Acceptance of Terms</h3>
                  <p>By using our decentralized exchange platform, you acknowledge that you have read, understood, and agree to be bound by these terms.</p>
                  <h3 className="font-bold text-white mt-4">2. Eligibility</h3>
                  <p>You must be at least 18 years old and legally able to enter into contracts in your jurisdiction to use FOMODEX.</p>
                  <h3 className="font-bold text-white mt-4">3. Risk Disclosure</h3>
                  <p>Trading digital assets involves substantial risk. You acknowledge that you are solely responsible for your trading decisions and any losses incurred.</p>
                  <h3 className="font-bold text-white mt-4">4. No Financial Advice</h3>
                  <p>FOMODEX does not provide financial, investment, or trading advice. All information is for informational purposes only.</p>
                  <h3 className="font-bold text-white mt-4">5. Platform Usage</h3>
                  <p>You agree not to use the platform for any illegal activities, market manipulation, or any actions that may harm other users or the platform.</p>
                  <h3 className="font-bold text-white mt-4">6. Limitation of Liability</h3>
                  <p>FOMODEX and its affiliates shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPrivacyModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[10000] p-4"
              onClick={() => setShowPrivacyModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-[#1a1a2e] flex items-center justify-between">
                  <h2 className="text-xl font-black uppercase">Privacy Protocol</h2>
                  <button onClick={() => setShowPrivacyModal(false)} className="w-10 h-10 flex items-center justify-center bg-[#11111a] border border-[#1a1a2e] rounded-xl text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4 text-sm text-gray-400">
                  <p className="font-bold text-white">Last Updated: January 2026</p>
                  <p>FOMODEX is committed to protecting your privacy. This Privacy Protocol explains how we handle your information.</p>
                  <h3 className="font-bold text-white mt-4">1. Information Collection</h3>
                  <p>As a decentralized platform, we collect minimal data. We may collect wallet addresses and transaction data that is publicly available on the Solana blockchain.</p>
                  <h3 className="font-bold text-white mt-4">2. Data Usage</h3>
                  <p>Any data collected is used solely to provide and improve our services, ensure platform security, and comply with legal obligations.</p>
                  <h3 className="font-bold text-white mt-4">3. Data Storage</h3>
                  <p>We do not store personal identification information. Blockchain transactions are immutable and publicly visible on the Solana network.</p>
                  <h3 className="font-bold text-white mt-4">4. Third-Party Services</h3>
                  <p>We may integrate third-party services for analytics and functionality. These services have their own privacy policies.</p>
                  <h3 className="font-bold text-white mt-4">5. Security</h3>
                  <p>We implement industry-standard security measures to protect the platform. However, no system is completely secure.</p>
                  <h3 className="font-bold text-white mt-4">6. Your Rights</h3>
                  <p>You have the right to access, correct, or delete any personal data we may have. Contact us for any privacy-related requests.</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
}
