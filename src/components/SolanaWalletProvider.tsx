'use client'

import { useMemo, ReactNode } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { RPC_ENDPOINT } from '@/lib/constants'

import '@solana/wallet-adapter-react-ui/styles.css'

interface SolanaWalletProviderProps {
  children: ReactNode
}

export function SolanaWalletProvider({ children }: SolanaWalletProviderProps) {
  const network = WalletAdapterNetwork.Mainnet
  const endpoint = useMemo(() => RPC_ENDPOINT, [])
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
