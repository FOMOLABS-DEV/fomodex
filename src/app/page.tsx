'use client'

import { useState } from 'react'
import { DexInterface } from '@/components/DexInterface'
import { AdminPanel } from '@/components/AdminPanel'

export default function Home() {
  const [showAdmin, setShowAdmin] = useState(false)


  return (
    <>
      <DexInterface onOpenAdmin={() => setShowAdmin(true)} />
      <AdminPanel isOpen={showAdmin} onClose={() => setShowAdmin(false)} />
    </>
  )
}
