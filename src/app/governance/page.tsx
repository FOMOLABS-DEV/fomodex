'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Zap, Shield, Check, X, Loader2, AlertCircle, Wallet, Plus, Flame } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { PublicKey, Transaction } from '@solana/web3.js'
import { createTransferInstruction, getAssociatedTokenAddress, getAccount, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'

import { getProposals, voteProposal, getUserVotes, getUserVotesToday, createProposal, getProposalCreator, Proposal, Vote, MAX_VOTES_PER_DAY, BURN_AMOUNT, BURN_ADDRESS, PROPOSAL_COST, CREATOR_REWARD, TOTAL_VOTE_COST, MAX_PROPOSAL_DAYS } from '@/lib/supabase'

const FOMO_MINT = 'DSEUEGxgDizLLLrVXmCqyAwD9GScpBsoH7HLmMYqfomo'
const FOMO_DECIMALS = 9
const REQUIRED_FOMO = 100000

export default function GovernancePage() {
  const { publicKey, connected, disconnect, signTransaction } = useWallet()
  const { setVisible } = useWalletModal()
  const { connection } = useConnection()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [userVotes, setUserVotes] = useState<Vote[]>([])
  const [userVotesTodayMap, setUserVotesTodayMap] = useState<Record<string, number>>({})
  const [fomoBalance, setFomoBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newProposal, setNewProposal] = useState({ 
    title: '', 
    description: '', 
    category: 'Listing',
    startDate: '',
    endDate: ''
  })
  const [totalBurned, setTotalBurned] = useState<number>(0)

  const isWalletConnected = connected && !!publicKey
  const walletAddress = publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : ''

  useEffect(() => {
    loadProposals()
  }, [])

  useEffect(() => {
    if (connected && publicKey && connection && proposals.length > 0) {
      loadUserData()
    } else if (!connected || !publicKey) {
      setUserVotes([])
      setFomoBalance(0)
      setUserVotesTodayMap({})
    }
  }, [connected, publicKey, connection, proposals])

  async function loadProposals() {
    setLoading(true)
    const data = await getProposals()
    setProposals(data)
    const total = data.reduce((sum, p) => sum + (p.total_votes || 0), 0)
    setTotalBurned(total)
    setLoading(false)
  }

  async function loadUserData() {
    if (!publicKey || !connection) return
    
    const votes = await getUserVotes(publicKey.toBase58())
    setUserVotes(votes)
    
    const votesTodayPromises = proposals.map(async (p) => {
      const count = await getUserVotesToday(p.id, publicKey.toBase58())
      return { id: p.id, count }
    })
    const votesTodayResults = await Promise.all(votesTodayPromises)
    const votesMap: Record<string, number> = {}
    votesTodayResults.forEach(r => { votesMap[r.id] = r.count })
    setUserVotesTodayMap(votesMap)
    
    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        mint: new PublicKey(FOMO_MINT)
      })
      
      if (tokenAccounts.value.length > 0) {
        const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount
        setFomoBalance(balance || 0)
      } else {
        setFomoBalance(0)
      }
    } catch (err) {
      console.error('Error fetching FOMO balance:', err)
      setFomoBalance(0)
    }
  }

  const handleConnectWallet = () => {
    if (connected) {
      disconnect()
    } else {
      setVisible(true)
    }
  }

  async function sendTokenToBurn(amount: number): Promise<string | null> {
    if (!publicKey || !signTransaction || !connection) return null

    try {
      const mintPubkey = new PublicKey(FOMO_MINT)
      const burnPubkey = new PublicKey(BURN_ADDRESS)
      
      const fromAta = await getAssociatedTokenAddress(mintPubkey, publicKey)
      const toAta = await getAssociatedTokenAddress(mintPubkey, burnPubkey, true)
      
      const transaction = new Transaction()
      
      try {
        await getAccount(connection, toAta)
      } catch {
        const [ataAddress] = PublicKey.findProgramAddressSync(
          [burnPubkey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mintPubkey.toBuffer()],
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            ataAddress,
            burnPubkey,
            mintPubkey
          )
        )
      }
      
      transaction.add(
        createTransferInstruction(
          fromAta,
          toAta,
          publicKey,
          BigInt(amount * Math.pow(10, FOMO_DECIMALS))
        )
      )
      
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey
      
      const signedTx = await signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signedTx.serialize())
      await connection.confirmTransaction(signature, 'confirmed')
      
      return signature
    } catch (err) {
      console.error('Token transfer error:', err)
      return null
    }
  }

  async function sendTokenToCreator(creatorWallet: string, amount: number): Promise<string | null> {
    if (!publicKey || !signTransaction || !connection) return null

    try {
      const mintPubkey = new PublicKey(FOMO_MINT)
      const creatorPubkey = new PublicKey(creatorWallet)
      
      const fromAta = await getAssociatedTokenAddress(mintPubkey, publicKey)
      const toAta = await getAssociatedTokenAddress(mintPubkey, creatorPubkey)
      
      const transaction = new Transaction()
      
      try {
        await getAccount(connection, toAta)
      } catch {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            toAta,
            creatorPubkey,
            mintPubkey
          )
        )
      }
      
      transaction.add(
        createTransferInstruction(
          fromAta,
          toAta,
          publicKey,
          BigInt(amount * Math.pow(10, FOMO_DECIMALS))
        )
      )
      
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey
      
      const signedTx = await signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signedTx.serialize())
      await connection.confirmTransaction(signature, 'confirmed')
      
      return signature
    } catch (err) {
      console.error('Token transfer to creator error:', err)
      return null
    }
  }

  async function handleVote(proposalId: string, choice: 'for' | 'against') {
    if (!connected || !publicKey) {
      setError('Please connect your wallet to vote')
      return
    }

    if (fomoBalance < TOTAL_VOTE_COST) {
      setError(`You need at least ${TOTAL_VOTE_COST.toLocaleString()} FOMO tokens to vote`)
      return
    }

    const votesToday = userVotesTodayMap[proposalId] || 0
    if (votesToday >= MAX_VOTES_PER_DAY) {
      setError(`You have reached the maximum of ${MAX_VOTES_PER_DAY} votes per day on this proposal`)
      return
    }

    setVoting(proposalId)
    setError(null)

    const creatorWallet = await getProposalCreator(proposalId)
    if (!creatorWallet) {
      setError('Failed to get proposal creator')
      setVoting(null)
      return
    }

    const burnTxSignature = await sendTokenToBurn(BURN_AMOUNT)
    if (!burnTxSignature) {
      setError('Failed to burn FOMO tokens. Transaction cancelled.')
      setVoting(null)
      return
    }

    const creatorTxSignature = await sendTokenToCreator(creatorWallet, CREATOR_REWARD)
    if (!creatorTxSignature) {
      setError('Failed to send reward to creator. Transaction cancelled.')
      setVoting(null)
      return
    }

    const result = await voteProposal(proposalId, choice, publicKey.toBase58(), burnTxSignature, creatorTxSignature)
    
    if (result.success) {
      await loadProposals()
      await loadUserData()
    } else {
      setError(result.error || 'Failed to vote')
    }

    setVoting(null)
  }

  async function handleCreateProposal() {
    if (!connected || !publicKey) {
      setError('Please connect your wallet to create a proposal')
      return
    }

    if (fomoBalance < PROPOSAL_COST) {
      setError(`You need at least ${PROPOSAL_COST.toLocaleString()} FOMO tokens to create a proposal`)
      return
    }

    if (!newProposal.title.trim() || !newProposal.description.trim()) {
      setError('Please fill in all fields')
      return
    }

    if (!newProposal.startDate || !newProposal.endDate) {
      setError('Please select start and end dates')
      return
    }

    const startDate = new Date(newProposal.startDate)
    const endDate = new Date(newProposal.endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (startDate < today) {
      setError('Start date cannot be in the past')
      return
    }

    if (endDate <= startDate) {
      setError('End date must be after start date')
      return
    }

    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff > MAX_PROPOSAL_DAYS) {
      setError(`Voting period cannot exceed ${MAX_PROPOSAL_DAYS} days`)
      return
    }

    setCreating(true)
    setError(null)

    const txSignature = await sendTokenToBurn(PROPOSAL_COST)
    if (!txSignature) {
      setError('Failed to burn FOMO tokens. Transaction cancelled.')
      setCreating(false)
      return
    }

    const nextId = `PIP-${String(proposals.length + 1).padStart(3, '0')}`
    const result = await createProposal({
      id: nextId,
      title: newProposal.title,
      description: newProposal.description,
      category: newProposal.category,
      author: `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`,
      start_date: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      end_date: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      creator_wallet: publicKey.toBase58()
    })

    if (result) {
      setShowCreateModal(false)
      setNewProposal({ title: '', description: '', category: 'Listing', startDate: '', endDate: '' })
      await loadProposals()
      await loadUserData()
    } else {
      setError('Failed to create proposal')
    }

    setCreating(false)
  }

  function getVotesForProposal(proposalId: string): Vote[] {
    return userVotes.filter(v => v.proposal_id === proposalId)
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/10 border-green-500/30'
      case 'passed': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
      case 'rejected': return 'text-red-400 bg-red-500/10 border-red-500/30'
      default: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
    }
  }

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

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleConnectWallet}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all text-[10px] sm:text-sm whitespace-nowrap active:scale-95"
            >
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{isWalletConnected ? walletAddress : 'Connect'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 sm:space-y-8"
        >
          <div className="text-center space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight">
              <span className="text-cyan-400 italic">Governance</span> Portal
            </h1>
<p className="text-gray-400 text-xs sm:text-sm max-w-2xl mx-auto px-2">
                Shape the future of FOMODEX. Vote on proposals with your FOMO tokens. Each vote costs {TOTAL_VOTE_COST.toLocaleString()} FOMO ({BURN_AMOUNT.toLocaleString()} burned + {CREATOR_REWARD.toLocaleString()} to creator). Max {MAX_VOTES_PER_DAY}/day per proposal.
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-orange-400 font-bold text-sm">{totalBurned.toLocaleString()} FOMO Total Burned</span>
              </div>
          </div>

          {connected && (
            <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Your FOMO Balance</p>
                  <p className="text-xl sm:text-2xl font-black text-cyan-400">{fomoBalance.toLocaleString()} FOMO</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <div className={`px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center ${fomoBalance >= REQUIRED_FOMO ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                    {fomoBalance >= REQUIRED_FOMO ? 'Eligible to Vote' : `Need ${REQUIRED_FOMO.toLocaleString()} FOMO`}
                  </div>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    Create Proposal
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No proposals yet. Be the first to create one!
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => {
                const userProposalVotes = getVotesForProposal(proposal.id)
                const votesToday = userVotesTodayMap[proposal.id] || 0
                const forPercent = proposal.total_votes > 0 ? (proposal.votes_for / proposal.total_votes) * 100 : 50
                const againstPercent = proposal.total_votes > 0 ? (proposal.votes_against / proposal.total_votes) * 100 : 50
                const canVote = votesToday < MAX_VOTES_PER_DAY && proposal.status === 'active'

                return (
                  <motion.div
                    key={proposal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-4 sm:p-6 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                          <span className="text-[10px] sm:text-xs font-mono text-gray-600">{proposal.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(proposal.status)}`}>
                            {proposal.status}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase text-gray-500 bg-gray-500/10 border border-gray-500/20">
                            {proposal.category}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-xl font-black text-white mb-2">{proposal.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-400">{proposal.description}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] sm:text-xs gap-1 sm:gap-0">
                        <span className="text-green-400 font-bold">For: {proposal.votes_for.toLocaleString()}</span>
                        <span className="text-gray-500 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500" />
                          {proposal.total_votes.toLocaleString()} FOMO burned
                        </span>
                        <span className="text-red-400 font-bold">Against: {proposal.votes_against.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-[#1a1a2e] rounded-full overflow-hidden flex">
                        <div 
                          className="h-full bg-green-500 transition-all duration-500"
                          style={{ width: `${forPercent}%` }}
                        />
                        <div 
                          className="h-full bg-red-500 transition-all duration-500"
                          style={{ width: `${againstPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 border-t border-[#1a1a2e] gap-3 sm:gap-0">
                      <div className="text-[10px] sm:text-xs text-gray-600">
                        <span>by {proposal.author}</span>
                        <span className="mx-2">•</span>
                        {proposal.status === 'pending' && proposal.start_date ? (
                          <span>Starts {proposal.start_date}</span>
                        ) : (
                          <span>Ends {proposal.end_date}</span>
                        )}
                      </div>

                      {proposal.status === 'active' ? (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                          {connected && (
                            <span className="text-[10px] sm:text-xs text-gray-500 text-center sm:text-left">
                              {votesToday}/{MAX_VOTES_PER_DAY} votes today
                            </span>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVote(proposal.id, 'for')}
                              disabled={voting === proposal.id || !connected || fomoBalance < TOTAL_VOTE_COST || !canVote}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl text-[10px] sm:text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {voting === proposal.id ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <Check className="w-3 h-3 sm:w-4 sm:h-4" />}
                              For
                            </button>
                            <button
                              onClick={() => handleVote(proposal.id, 'against')}
                              disabled={voting === proposal.id || !connected || fomoBalance < TOTAL_VOTE_COST || !canVote}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-[10px] sm:text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {voting === proposal.id ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <X className="w-3 h-3 sm:w-4 sm:h-4" />}
                              Against
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] sm:text-xs text-gray-600">
                          {proposal.status === 'pending' ? 'Voting not started' : 'Voting closed'}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {!connected && (
            <div className="bg-[#0a0a0f] border border-cyan-500/30 rounded-2xl p-6 sm:p-8 text-center">
              <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-black mb-2">Connect Wallet to Vote</h3>
              <p className="text-xs sm:text-sm text-gray-400 mb-4">
                You need at least {REQUIRED_FOMO.toLocaleString()} FOMO tokens to participate in governance.
              </p>
              <button
                onClick={handleConnectWallet}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all active:scale-95 text-sm"
              >
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                Connect Wallet
              </button>
            </div>
          )}
        </motion.div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-4 sm:p-6 w-full max-w-lg space-y-4 sm:space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">Create Proposal</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-center gap-3">
              <Flame className="w-5 h-5 text-orange-400 flex-shrink-0" />
              <p className="text-orange-400 text-sm">Creating a proposal costs {PROPOSAL_COST.toLocaleString()} FOMO (burned)</p>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
              <p className="text-cyan-400 text-sm">
                <span className="font-bold">Creator Benefit:</span> You'll receive {CREATOR_REWARD.toLocaleString()} FOMO from each vote ({BURN_AMOUNT.toLocaleString()} burned + {CREATOR_REWARD.toLocaleString()} to you)
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={newProposal.category}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-[#11111a] border border-[#1a1a2e] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                >
                  <option value="Listing">Listing</option>
                  <option value="Tokenomics">Tokenomics</option>
                  <option value="Protocol">Protocol</option>
                  <option value="Community">Community</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Title</label>
                <input
                  type="text"
                  value={newProposal.title}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter proposal title..."
                  className="w-full bg-[#11111a] border border-[#1a1a2e] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={newProposal.description}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your proposal..."
                  rows={4}
                  className="w-full bg-[#11111a] border border-[#1a1a2e] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder:text-gray-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newProposal.startDate}
                    onChange={(e) => setNewProposal(prev => ({ ...prev, startDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-[#11111a] border border-[#1a1a2e] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">End Date</label>
                  <input
                    type="date"
                    value={newProposal.endDate}
                    onChange={(e) => setNewProposal(prev => ({ ...prev, endDate: e.target.value }))}
                    min={newProposal.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full bg-[#11111a] border border-[#1a1a2e] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 [color-scheme:dark]"
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-600">Maximum voting period: {MAX_PROPOSAL_DAYS} days</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 bg-[#1a1a2e] text-gray-400 rounded-xl font-bold hover:bg-[#252535] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProposal}
                disabled={creating || fomoBalance < PROPOSAL_COST}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create ({PROPOSAL_COST.toLocaleString()} FOMO)
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <footer className="mt-12 sm:mt-20 border-t border-[#1a1a2e] bg-[#0a0a0f] px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
          <div className="flex items-center gap-3 opacity-50">
            <Zap className="w-5 h-5 text-cyan-500" />
            <span className="text-xl font-black tracking-tighter">FOMODEX</span>
          </div>
          <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.3em]">
            &copy; 2026 FOMODEX | Governance
          </p>
          <div className="flex gap-6">
            <a href="https://x.com/fomo_dex" target="_blank" rel="noopener noreferrer">
              <svg className="w-4 h-4 text-gray-700 cursor-pointer hover:text-cyan-400" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <Shield className="w-4 h-4 text-gray-700 cursor-pointer hover:text-cyan-400" />
          </div>
        </div>
      </footer>
    </div>
  )
}
