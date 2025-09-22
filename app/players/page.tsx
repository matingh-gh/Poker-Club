"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type Player = {
  id: string
  name: string
  created_at: string
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [newPlayer, setNewPlayer] = useState("")

  useEffect(() => {
    fetchPlayers()
  }, [])

  async function fetchPlayers() {
    const { data, error } = await supabase.from("players").select("*").order("created_at", { ascending: false })
    if (!error && data) {
      setPlayers(data)
    }
  }

  async function addPlayer() {
    if (!newPlayer) return
    const { error } = await supabase.from("players").insert([{ name: newPlayer }])
    if (!error) {
      setNewPlayer("")
      fetchPlayers()
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Players</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newPlayer}
          onChange={(e) => setNewPlayer(e.target.value)}
          placeholder="Player name"
          className="border px-2 py-1 rounded"
        />
        <button onClick={addPlayer} className="bg-blue-500 text-white px-4 py-1 rounded">
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {players.map((p) => (
          <li key={p.id} className="border-b py-1">{p.name}</li>
        ))}
      </ul>
    </main>
  )
}

