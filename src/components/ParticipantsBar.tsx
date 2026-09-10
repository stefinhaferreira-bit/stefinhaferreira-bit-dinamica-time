import { useState } from 'react'
import type { Participant } from '../types'

const AVATAR_COLORS = [
  'bg-emerald-500',
  'bg-blue-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-indigo-500',
]

function getColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

interface ParticipantsBarProps {
  participants: Participant[]
  connected: boolean
  roomId: string
  shareUrl: string
  currentName: string
}

export function ParticipantsBar({
  participants,
  connected,
  roomId,
  shareUrl,
  currentName,
}: ParticipantsBarProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border-b border-slate-200/80 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-brand-100 px-2.5 py-1 font-mono text-sm font-bold tracking-wider text-brand-700">
            {roomId}
          </span>
          <span
            className={`flex items-center gap-1.5 text-xs font-medium ${
              connected ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            {connected ? 'Conectado' : 'Reconectando...'}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-700"
          >
            {copied ? '✓ Copiado' : 'Convidar'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {participants.length} online
            {participants.length < 2 && connected && (
              <span className="ml-1 text-amber-600">· convide com o mesmo link</span>
            )}
          </span>
          <div className="flex -space-x-2">
            {participants.map((p) => (
              <div
                key={p.id}
                title={p.name}
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white ${getColor(p.name)} ${
                  p.name === currentName ? 'ring-2 ring-brand-400 ring-offset-1' : ''
                }`}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
