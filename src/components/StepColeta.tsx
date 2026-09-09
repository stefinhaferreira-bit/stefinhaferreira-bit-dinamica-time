import { useState } from 'react'
import type { Item, ItemCategory } from '../types'
import { CATEGORY_CONFIG, WRITING_GUIDE } from '../types'
import { PostIt, WritingGuide } from './PostIt'

interface StepColetaProps {
  items: Item[]
  onAdd: (text: string, category: ItemCategory) => void
  onRemove: (id: string) => void
  onNext: () => void
}

const CATEGORIES: ItemCategory[] = ['que_bom', 'que_pena', 'que_tal']

const colorMap: Record<string, { border: string; bg: string; badge: string; dot: string }> = {
  emerald: {
    border: 'border-emerald-200/60',
    bg: 'bg-emerald-50/30',
    badge: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  rose: {
    border: 'border-rose-200/60',
    bg: 'bg-rose-50/30',
    badge: 'bg-rose-100 text-rose-700',
    dot: 'bg-rose-500',
  },
  sky: {
    border: 'border-sky-200/60',
    bg: 'bg-sky-50/30',
    badge: 'bg-sky-100 text-sky-700',
    dot: 'bg-sky-500',
  },
}

function CategoryColumn({
  category,
  items,
  onAdd,
  onRemove,
}: {
  category: ItemCategory
  items: Item[]
  onAdd: (text: string, category: ItemCategory) => void
  onRemove: (id: string) => void
}) {
  const [input, setInput] = useState('')
  const config = CATEGORY_CONFIG[category]
  const colors = colorMap[config.color]
  const categoryItems = items.filter((i) => i.category === category)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    onAdd(input, category)
    setInput('')
  }

  return (
    <div className={`card flex flex-col ${colors.border} ${colors.bg}`}>
      <div className="border-b border-inherit p-5">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white ${colors.dot}`}
          >
            {config.icon}
          </span>
          <div>
            <h3 className="font-display font-semibold text-slate-900">{config.label}</h3>
            <p className="mt-0.5 text-xs font-medium text-slate-600">{config.question}</p>
          </div>
        </div>
        <span className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.badge}`}>
          {categoryItems.length} {categoryItems.length === 1 ? 'post-it' : 'post-its'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="border-b border-inherit p-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={WRITING_GUIDE.placeholder}
          className="input-field w-full text-sm"
        />
        <button
          type="submit"
          className="btn-primary mt-2 w-full text-sm"
          disabled={!input.trim()}
        >
          Adicionar post-it
        </button>
      </form>

      <div
        className="flex-1 overflow-y-auto p-4"
        style={{ minHeight: '220px', maxHeight: '400px' }}
      >
        {categoryItems.length === 0 ? (
          <div className="flex h-full items-center justify-center py-8 text-center text-sm text-slate-400">
            Nenhum post-it ainda
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {categoryItems.map((item, idx) => (
              <PostIt
                key={item.id}
                text={item.text}
                variant={category}
                index={idx}
                onRemove={() => onRemove(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function StepColeta({ items, onAdd, onRemove, onNext }: StepColetaProps) {
  const canProceed = items.length > 0

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
          Etapa 1 — Que bom, Que pena, Que tal
        </h2>
        <p className="mt-2 text-sm text-slate-500 max-w-2xl mx-auto">
          Cada pessoa adiciona post-its nas três colunas. Um post-it = uma ideia, escrita de forma clara e breve.
        </p>
      </div>

      <WritingGuide />

      <div className="grid gap-6 lg:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <CategoryColumn
            key={cat}
            category={cat}
            items={items}
            onAdd={onAdd}
            onRemove={onRemove}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={onNext} className="btn-primary" disabled={!canProceed}>
          Avançar para Fases →
        </button>
      </div>
    </div>
  )
}
