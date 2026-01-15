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
  end_date: string
  author: string
  category: string
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

export async function createProposal(proposal: Omit<Proposal, 'id' | 'created_at' | 'votes_for' | 'votes_against' | 'total_votes' | 'status'>): Promise<Proposal | null> {
  const { data, error } = await supabase
    .from('proposals')
    .insert([{
      ...proposal,
      status: 'pending',
      votes_for: 0,
      votes_against: 0,
      total_votes: 0,
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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

export async function voteProposal(proposalId: string, choice: 'for' | 'against'): Promise<boolean> {
  const { data: proposal, error: fetchError } = await supabase
    .from('proposals')
    .select('votes_for, votes_against, total_votes')
    .eq('id', proposalId)
    .single()

  if (fetchError || !proposal) {
    console.error('Error fetching proposal for voting:', fetchError)
    return false
  }

  const updates = {
    votes_for: choice === 'for' ? Number(proposal.votes_for) + 1 : proposal.votes_for,
    votes_against: choice === 'against' ? Number(proposal.votes_against) + 1 : proposal.votes_against,
    total_votes: Number(proposal.total_votes) + 1
  }

  const { error: updateError } = await supabase
    .from('proposals')
    .update(updates)
    .eq('id', proposalId)

  if (updateError) {
    console.error('Error updating proposal votes:', updateError)
    return false
  }

  return true
}
