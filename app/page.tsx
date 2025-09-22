'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const [status, setStatus] = useState('checking...')

  useEffect(() => {
    if (supabase) setStatus('✅ Connected to Supabase')
    else setStatus('❌ Connection failed')
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-3">Poker App</h1>
        <p>{status}</p>
      </div>
    </main>
  )
}
