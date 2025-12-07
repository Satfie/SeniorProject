import React, { useMemo } from "react"

export function PreviewRoundOne({
  participants,
  open,
  onClose,
}: {
  participants: number
  open: boolean
  onClose: () => void
}) {
  const seeds = useMemo(() => {
    const arr = Array.from({ length: participants }, (_, i) => `Team ${i + 1}`)
    const size = (() => {
      let p = 1
      while (p < arr.length) p <<= 1
      return p
    })()
    const byes = size - arr.length
    return [...arr, ...Array(byes).fill(null)] as Array<string | null>
  }, [participants])

  const matches = useMemo(() => {
    const m: Array<{ a: string | null; b: string | null }> = []
    for (let i = 0; i < seeds.length; i += 2) {
      m.push({ a: seeds[i], b: seeds[i + 1] ?? null })
    }
    return m
  }, [seeds])

  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded shadow-lg w-full max-w-lg p-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Round 1 Preview</div>
          <button className="text-sm" onClick={onClose}>Close</button>
        </div>
        <div className="mt-3 space-y-2">
          {matches.map((m, idx) => (
            <div key={idx} className="flex items-center justify-between border rounded p-2">
              <div>{m.a ?? "BYE"}</div>
              <div className="text-muted-foreground">vs</div>
              <div>{m.b ?? "BYE"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
