import React, { useEffect, useState } from "react"

type Preset = {
  formatType: string
  rosterSize: number
  teams: number
  maxParticipants?: number
}

export function CommonSetups({
  game,
  applyPreset,
}: {
  game?: string
  applyPreset: (p: Preset) => void
}) {
  const [presets, setPresets] = useState<Record<string, Preset[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetch("/api/tournaments/presets")
      .then((r) => r.json())
      .then((json) => {
        if (!active) return
        setPresets(json || {})
        setError(null)
      })
      .catch((e) => {
        if (!active) return
        setError(String(e?.message || "Failed to load presets"))
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const gameKey = (game || "").toLowerCase()
  const list = presets[gameKey] || []

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Common Setups</div>
      {loading && <div className="text-xs text-muted-foreground">Loading presets…</div>}
      {error && <div className="text-xs text-red-600">{error}</div>}
      {!loading && !error && !list.length && (
        <div className="text-xs text-muted-foreground">No presets for this game.</div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {list.map((p, idx) => (
          <button
            key={idx}
            className="border rounded p-2 text-left hover:border-blue-400"
            onClick={() => applyPreset(p)}
          >
            <div className="text-sm">{p.formatType.replace(/-/g, " ")}</div>
            <div className="text-xs text-muted-foreground">Teams: {p.teams} • Roster: {p.rosterSize}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
