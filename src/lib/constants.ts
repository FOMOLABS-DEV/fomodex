export const SOL_MINT = 'So11111111111111111111111111111111111111112'
export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
export const JUPITER_TOKEN_LIST = 'https://lite-api.jup.ag/tokens/v2/tag?query=verified'

export const DEFAULT_TOKENS = [
  { mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', symbol: 'JUP', name: 'Jupiter' },
  { mint: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL', symbol: 'JTO', name: 'Jito' },
  { mint: 'pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn', symbol: 'PUMP', name: 'Pump.fun' },
  { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC', name: 'USD Coin' },
  { mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', symbol: 'BONK', name: 'Bonk' },
]

export const SLIPPAGE_PRESETS = [0.1, 0.5, 1, 3, 5]

export const ADMIN_CREDENTIALS = [
  { username: 'lfg_brothers', password: 'lfgbrothers2026dev' },
  { username: 'admin1', password: 'admin1' },
]


export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://solana-rpc.publicnode.com'

export const DEX_NAME = 'FOMODEX'
export const DEX_CA = 'FOMODEX...placeholder'

export const BURN_NOTICE = 'We will burn 100k tokens in every listing'
export const METEORA_LAUNCH = 'CA: DSEUEGxgDizLLLrVXmCqyAwD9GScpBsoH7HLmMYqfomo'