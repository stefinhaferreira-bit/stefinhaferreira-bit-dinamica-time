import type { ItemCategory } from '../types'

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

