import type { ItemCategory } from '../types'
import { WRITING_GUIDE } from '../types'

const postItStyles: Record<
  ItemCategory | 'default' | 'fase2' | 'fase3',
  { bg: string; shadow: string; text: string }
> = {
  que_bom: {
    bg: 'bg-[#d9f99d]',
    shadow: 'shadow-[2px_3px_8px_rgba(0,0,0,0.12)]',
    text: 'text-slate-800',
  },
  que_pena: {
    bg: 'bg-[#fce7f3]',
    shadow: 'shadow-[2px_3px_8px_rgba(0,0,0,0.12)]',
    text: 'text-slate-800',
  },
  que_tal: {
    bg: 'bg-[#bae6fd]',
    shadow: 'shadow-[2px_3px_8px_rgba(0,0,0,0.12)]',
    text: 'text-slate-800',
  },
  fase2: {
    bg: 'bg-[#ede9fe]',
    shadow: 'shadow-[2px_3px_8px_rgba(0,0,0,0.12)]',
    text: 'text-slate-800',
  },
  fase3: {
    bg: 'bg-[#e0e7ff]',
    shadow: 'shadow-[2px_3px_8px_rgba(0,0,0,0.12)]',
    text: 'text-slate-800',
  },
  default: {
    bg: 'bg-[#fef9c3]',
    shadow: 'shadow-[2px_3px_8px_rgba(0,0,0,0.12)]',
    text: 'text-slate-800',
  },
}

const rotations = ['-rotate-1', 'rotate-1', 'rotate-0', '-rotate-2', 'rotate-2']

interface PostItProps {
  text: string
  variant?: ItemCategory | 'default' | 'fase2' | 'fase3'
  index?: number
  draggable?: boolean
  onDragStart?: () => void
  onRemove?: () => void
  badge?: string
  compact?: boolean
}

export function PostIt({
  text,
  variant = 'default',
  index = 0,
  draggable = false,
  onDragStart,
  onRemove,
  badge,
  compact = false,
}: PostItProps) {
  const style = postItStyles[variant]
  const rotation = rotations[index % rotations.length]

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      className={`group relative ${style.bg} ${style.shadow} ${rotation} transition hover:scale-[1.02] hover:shadow-md ${
        draggable ? 'cursor-grab active:cursor-grabbing' : ''
      } ${compact ? 'p-2.5 min-h-[60px]' : 'p-4 min-h-[80px]'}`}
      style={{
        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)',
      }}
    >
      <p
        className={`${style.text} ${compact ? 'text-xs leading-snug' : 'text-sm leading-snug'} font-medium pr-4`}
      >
        {text}
      </p>
      {badge && (
        <span className="mt-2 inline-block text-[10px] font-medium text-slate-500/80">
          {badge}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-1.5 top-1.5 rounded p-0.5 text-slate-400 opacity-0 transition hover:bg-black/5 hover:text-rose-600 group-hover:opacity-100"
          title="Remover"
        >
          ✕
        </button>
      )}
      <div
        className="absolute bottom-0 right-0 h-2 w-2 bg-black/5"
        style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}
      />
    </div>
  )
}

export function WritingGuide() {
  return (
    <div className="card border-amber-200/60 bg-gradient-to-r from-amber-50 to-yellow-50 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="font-display font-semibold text-amber-900">
            {WRITING_GUIDE.title}
          </h3>
          <p className="mt-1 text-sm text-amber-800/80">
            Escreva em uma frase curta, no formato:
          </p>
          <p className="mt-2 inline-block rounded-lg bg-white/70 px-3 py-1.5 font-mono text-sm font-semibold text-amber-900 ring-1 ring-amber-200/60">
            {WRITING_GUIDE.format}
          </p>
          <p className="mt-2 text-xs text-amber-700/70">{WRITING_GUIDE.hint}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:max-w-2xl">
          <div className="rounded-lg bg-emerald-100/60 p-3">
            <p className="text-xs font-bold text-emerald-800">Que bom!</p>
            <p className="mt-1 text-[11px] text-emerald-700/80">
              Daily de 15min — time alinhado toda manhã
            </p>
          </div>
          <div className="rounded-lg bg-rose-100/60 p-3">
            <p className="text-xs font-bold text-rose-800">Que pena...</p>
            <p className="mt-1 text-[11px] text-rose-700/80">
              Reuniões sem pauta — horas perdidas
            </p>
          </div>
          <div className="rounded-lg bg-sky-100/60 p-3">
            <p className="text-xs font-bold text-sky-800">Que tal...</p>
            <p className="mt-1 text-[11px] text-sky-700/80">
              Quadro de prioridades — toda segunda
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
