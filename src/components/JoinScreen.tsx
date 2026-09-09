import { useState } from 'react'
import type { JoinInfo } from '../types'
import { generateRoomCode } from '../types'
import { saveJoinInfo } from '../hooks/useSession'

interface JoinScreenProps {
  onJoin: (info: JoinInfo) => void
}

function getRoomFromUrl(): string {
  const params = new URLSearchParams(window.location.search)
  return params.get('sala')?.toUpperCase() ?? ''
}

export function JoinScreen({ onJoin }: JoinScreenProps) {
  const [name, setName] = useState('')
  const [room, setRoom] = useState(getRoomFromUrl())
  const [copied, setCopied] = useState(false)

  const canJoin = name.trim().length >= 2 && room.trim().length >= 3

  const handleCreateRoom = () => {
    setRoom(generateRoomCode())
  }

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canJoin) return

    const info: JoinInfo = {
      roomId: room.trim().toUpperCase(),
      participantId: crypto.randomUUID(),
      participantName: name.trim(),
    }
    saveJoinInfo(info)
    onJoin(info)
  }

  const handleCopyLink = async () => {
    if (!room.trim()) return
    const url = `${window.location.origin}${window.location.pathname}?sala=${room.trim().toUpperCase()}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-100 px-4">
      <div className="card w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-2xl text-white">
            👥
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Entrar na Dinâmica
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Várias pessoas podem escrever ao mesmo tempo na mesma sala
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Seu nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Maria"
              className="input-field"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Código da sala
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value.toUpperCase())}
                placeholder="Ex: ABC123"
                className="input-field flex-1 uppercase tracking-widest"
                maxLength={12}
              />
              <button
                type="button"
                onClick={handleCreateRoom}
                className="btn-secondary shrink-0 px-3 text-xs"
                title="Gerar nova sala"
              >
                Nova
              </button>
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              Crie uma sala nova ou use o código compartilhado pelo facilitador
            </p>
          </div>

          {room.trim().length >= 3 && (
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-200 bg-brand-50/50 px-4 py-2.5 text-sm text-brand-700 transition hover:bg-brand-50"
            >
              {copied ? '✓ Link copiado!' : '🔗 Copiar link para convidar o time'}
            </button>
          )}

          <button type="submit" className="btn-primary w-full" disabled={!canJoin}>
            Entrar na sala
          </button>
        </form>

        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-600">Como funciona</p>
          <ol className="mt-2 space-y-1 text-xs text-slate-500">
            <li>1. Uma pessoa cria a sala e compartilha o link</li>
            <li>2. Todos entram com seu nome</li>
            <li>3. Escrevam juntos — as mudanças aparecem em tempo real</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
