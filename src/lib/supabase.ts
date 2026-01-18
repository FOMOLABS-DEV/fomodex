import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface ListedToken {
  id: string
  mint_address: string
  symbol: string
  name: string
  logo_uri: string | null
  decimals: number
  listed_by: string | null
  telegram?: string | null
  twitter?: string | null
  website?: string | null
  description?: string | null
  created_at: string
}
 
export interface ListingApplication {
  id: string
  mint_address: string
  symbol: string
  name: string
  logo_uri: string | null
  telegram: string | null
  twitter: string | null
  website: string | null
  description: string | null
  contact_email: string | null
  expedite: boolean
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface TransactionRecord {
  id: string
  wallet_address: string
  tx_signature: string
  token_symbol: string
  side: string
  amount_in: number
  amount_out: number
  created_at: string
}

export interface Proposal {
  id: string
  title: string
  description: string
  status: 'active' | 'passed' | 'rejected' | 'pending'
  votes_for: number
  votes_against: number
  total_votes: number
  start_date: string | null
  end_date: string
  author: string
  category: string
  creator_wallet: string | null
  created_at: string
}

export async function getListedTokens(): Promise<ListedToken[]> {
  const { data, error } = await supabase
    .from('listed_tokens')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching listed tokens:', error)
    return []
  }
  
  return data || []
}

export async function addListedToken(token: Omit<ListedToken, 'id' | 'created_at'>): Promise<ListedToken | null> {
  const { data, error } = await supabase
    .from('listed_tokens')
    .insert([token])
    .select()
    .single()
  
  if (error) {
    console.error('Error adding token:', error)
    return null
  }
  
  return data
}

export async function removeListedToken(mintAddress: string): Promise<boolean> {
  const { error } = await supabase
    .from('listed_tokens')
    .delete()
    .eq('mint_address', mintAddress)
  
  if (error) {
    console.error('Error removing token:', error)
    return false
  }
  
  return true
}

export async function submitListingApplication(app: Omit<ListingApplication, 'id' | 'created_at' | 'status'>): Promise<ListingApplication | null> {
  const { data, error } = await supabase
    .from('listing_applications')
    .insert([{ ...app, status: 'pending' }])
    .select()
    .single()
  
  if (error) {
    console.error('Error submitting application:', error)
    return null
  }
  
  return data
}

export async function getListingApplications(): Promise<ListingApplication[]> {
  const { data, error } = await supabase
    .from('listing_applications')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching applications:', error)
    return []
  }
  
  return data || []
}

export async function updateApplicationStatus(id: string, status: 'approved' | 'rejected' | 'pending'): Promise<boolean> {
  const { error } = await supabase
    .from('listing_applications')
    .update({ status })
    .eq('id', id)
  
  if (error) {
    console.error('Error updating status:', error)
    return false
  }
  
  return true
}

export async function addTransactionRecord(record: Omit<TransactionRecord, 'id' | 'created_at'>): Promise<boolean> {
  const { error } = await supabase
    .from('transaction_history')
    .insert([record])
  
  if (error) {
    console.error('Error adding transaction:', error)
    return false
  }
  
  return true
}

export async function getTransactionHistory(walletAddress: string, limit = 50): Promise<TransactionRecord[]> {
  const { data, error } = await supabase
    .from('transaction_history')
    .select('*')
    .eq('wallet_address', walletAddress)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching transaction history:', error)
    return []
  }
  
  return data || []
}

export async function createProposal(proposal: Omit<Proposal, 'id' | 'created_at' | 'votes_for' | 'votes_against' | 'total_votes' | 'status'> & { creator_wallet: string }): Promise<Proposal | null> {
  const { data, error } = await supabase
    .from('proposals')
    .insert([{
      ...proposal,
      status: 'active',
      votes_for: 0,
      votes_against: 0,
      total_votes: 0
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating proposal:', error)
    return null
  }

  return data
}

export async function getProposals(): Promise<Proposal[]> {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching proposals:', error)
    return []
  }
  
  return data || []
}

export interface Vote {
  id: number
  proposal_id: string
  wallet_address: string
  vote_type: 'for' | 'against'
  amount: number
  created_at: string
}

export async function checkUserVote(proposalId: string, walletAddress: string): Promise<Vote | null> {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('proposal_id', proposalId)
    .eq('wallet_address', walletAddress)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export async function getUserVotesToday(proposalId: string, walletAddress: string): Promise<number> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { data, error } = await supabase
    .from('votes')
    .select('id')
    .eq('proposal_id', proposalId)
    .eq('wallet_address', walletAddress)
    .gte('created_at', today.toISOString())
  
  if (error) {
    console.error('Error checking votes today:', error)
    return 0
  }
  
  return data?.length || 0
}

export async function getUserVotesForProposal(proposalId: string, walletAddress: string): Promise<Vote[]> {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('proposal_id', proposalId)
    .eq('wallet_address', walletAddress)
  
  if (error) {
    console.error('Error fetching user votes for proposal:', error)
    return []
  }
  
  return data || []
}

export const MAX_VOTES_PER_DAY = 5
export const BURN_AMOUNT = 10000
export const CREATOR_REWARD = 10000
export const TOTAL_VOTE_COST = BURN_AMOUNT + CREATOR_REWARD
export const BURN_ADDRESS = '1nc1nerator11111111111111111111111111111111'
export const PROPOSAL_COST = 100000
export const MAX_PROPOSAL_DAYS = 30

export async function getProposalCreator(proposalId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('proposals')
    .select('creator_wallet')
    .eq('id', proposalId)
    .single()

  if (error || !data) {
    return null
  }

  return data.creator_wallet
}

export async function voteProposal(proposalId: string, choice: 'for' | 'against', walletAddress: string, txSignature: string, creatorTxSignature: string): Promise<{ success: boolean; error?: string }> {
  const votesToday = await getUserVotesToday(proposalId, walletAddress)
  if (votesToday >= MAX_VOTES_PER_DAY) {
    return { success: false, error: `You have reached the maximum of ${MAX_VOTES_PER_DAY} votes per day on this proposal` }
  }

  const { error: voteError } = await supabase
    .from('votes')
    .insert([{
      proposal_id: proposalId,
      wallet_address: walletAddress,
      vote_type: choice,
      amount: TOTAL_VOTE_COST,
      tx_signature: txSignature,
      creator_tx_signature: creatorTxSignature
    }])

  if (voteError) {
    console.error('Error recording vote:', voteError)
    return { success: false, error: 'Failed to record vote' }
  }

  const { data: proposal, error: fetchError } = await supabase
    .from('proposals')
    .select('votes_for, votes_against, total_votes')
    .eq('id', proposalId)
    .single()

  if (fetchError || !proposal) {
    console.error('Error fetching proposal for voting:', fetchError)
    return { success: false, error: 'Proposal not found' }
  }

  const updates = {
    votes_for: choice === 'for' ? Number(proposal.votes_for) + 1 : proposal.votes_for,
    votes_against: choice === 'against' ? Number(proposal.votes_against) + 1 : proposal.votes_against,
    total_votes: Number(proposal.total_votes) + BURN_AMOUNT
  }

  const { error: updateError } = await supabase
    .from('proposals')
    .update(updates)
    .eq('id', proposalId)

  if (updateError) {
    console.error('Error updating proposal votes:', updateError)
    return { success: false, error: 'Failed to update vote count' }
  }

  return { success: true }
}

export async function getUserVotes(walletAddress: string): Promise<Vote[]> {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('wallet_address', walletAddress)

  if (error) {
    console.error('Error fetching user votes:', error)
    return []
  }

  return data || []
}
