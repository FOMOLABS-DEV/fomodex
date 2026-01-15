'use client'

import React, { memo } from 'react'

interface TradingViewChartProps {
  address: string
  chainId?: string
}

function TradingViewChartComponent({ address, chainId = 'solana' }: TradingViewChartProps) {
  if (!address) return null

    return (
    <div className="w-full h-full relative bg-[#050508]">
      <style>{`
        #dexscreener-embed {
          position: relative;
          width: 100%;
          height: 100%;
        }
        #dexscreener-embed iframe {
          width: 100%;
          height: 100%;
          border: 0;
        }
      `}</style>
      <div id="dexscreener-embed">
        <iframe 
          src={`https://dexscreener.com/${chainId}/${address}?embed=1&theme=dark&trades=0&info=0`}
          title="DEX Chart"
          allow="clipboard-write"
          className="rounded-xl"
        />
      </div>
    </div>
  )
}

export const TradingViewChart = memo(TradingViewChartComponent)
