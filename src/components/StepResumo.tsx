import type { Cluster, Item, ItemCategory } from '../types'
import {
  CATEGORY_CONFIG,
  getClusterCategory,
  getClusterItems,
} from '../types'
import { PostIt } from './PostIt'

interface StepResumoProps {
  items: Item[]
  clusters: Cluster[]
  onBack: () => void
  onNext: () => void
}

const CATEGORIES: ItemCategory[] = ['que_bom', 'que_pena', 'que_tal']
const CONVERGENCE_CATEGORIES: ItemCategory[] = ['que_pena', 'que_tal']

const sectionStyles: Record<ItemCategory, string> = {
  que_bom: 'border-emerald-200 bg-emerald-50/40',
  que_pena: 'border-rose-200 bg-rose-50/40',
  que_tal: 'border-sky-200 bg-sky-50/40',
}

function CategorySummary({
  category,
  items,
  clusters,
}: {
  category: ItemCategory
  items: Item[]
  clusters: Cluster[]
}) {
  const config = CATEGORY_CONFIG[category]
  const categoryItems = items.filter((i) => i.category === category)
  const categoryClusters = clusters.filter(
    (c) => getClusterCategory(c, items) === category
  )

  return (
    <div className={`card border-2 ${sectionStyles[category]} p-5`}>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-bold shadow-sm">
          {config.icon}
        </span>
        <div>
          <h3 className="font-display font-semibold text-slate-900">{config.label}</h3>
          <p className="text-xs text-slate-600">{config.question}</p>
        </div>
        <span className="ml-auto rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
          {categoryItems.length} post-it{categoryItems.length !== 1 ? 's' : ''}
        </span>
      </div>

      {categoryClusters.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Ações consolidadas ({categoryClusters.length})
          </p>
          <ul className="space-y-1.5">
            {categoryClusters.map((cluster) => (
              <li
                key={cluster.id}
                className="rounded-lg bg-white/70 px-3 py-2 text-sm text-slate-800 ring-1 ring-black/5"
              >
                {cluster.title}
                <span className="ml-2 text-xs text-slate-400">
                  ({getClusterItems(cluster.id, items).length} post-it
                  {getClusterItems(cluster.id, items).length !== 1 ? 's' : ''})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        {categoryItems.map((item, idx) => (
          <PostIt
            key={item.id}
            text={item.text}
            variant={category}
            index={idx}
            compact
          />
        ))}
      </div>
    </div>
  )
}

export function StepResumo({ items, clusters, onBack, onNext }: StepResumoProps) {
  const convergenceItems = items.filter((i) =>
    CONVERGENCE_CATEGORIES.includes(i.category)
  )
  const convergenceClusters = clusters.filter((c) =>
    CONVERGENCE_CATEGORIES.includes(getClusterCategory(c, items))
  )

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
          Etapa 3 — Resumo do que contamos
        </h2>
        <p className="mt-2 max-w-3xl mx-auto text-sm text-slate-500">
          Revise o que o time levantou em cada tema antes de priorizar. Use este momento
          para alinhar o entendimento do grupo.
        </p>
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Por tema
        </h3>
        <div className="grid gap-6 lg:grid-cols-3">
          {CATEGORIES.map((category) => (
            <CategorySummary
              key={category}
              category={category}
              items={items}
              clusters={clusters}
            />
          ))}
        </div>
      </div>

      <div className="card border-2 border-violet-200 bg-violet-50/30 p-6">
        <h3 className="font-display text-lg font-bold text-violet-900">
          Convergência — Que pena + Que tal
        </h3>
        <p className="mt-2 text-sm text-violet-800/80 max-w-3xl">
          Foque no que precisa <strong>melhorar</strong> e no que vamos{' '}
          <strong>experimentar</strong>. Estes pontos seguem para a matriz de priorização.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {CONVERGENCE_CATEGORIES.map((category) => {
            const config = CATEGORY_CONFIG[category]
            const catItems = items.filter((i) => i.category === category)
            const catClusters = clusters.filter(
              (c) => getClusterCategory(c, items) === category
            )
            return (
              <div
                key={category}
                className={`rounded-xl border p-4 ${sectionStyles[category]}`}
              >
                <p className="mb-3 text-sm font-bold text-slate-800">
                  {config.icon} {config.label}
                  <span className="ml-2 font-normal text-slate-500">
                    {catItems.length} post-it · {catClusters.length} ação
                    {catClusters.length !== 1 ? 'ões' : ''}
                  </span>
                </p>
                {catClusters.length > 0 ? (
                  <ul className="space-y-1 text-sm text-slate-700">
                    {catClusters.map((c) => (
                      <li key={c.id}>• {c.title}</li>
                    ))}
                  </ul>
                ) : (
                  <ul className="space-y-1 text-sm text-slate-600">
                    {catItems.slice(0, 8).map((i) => (
                      <li key={i.id}>• {i.text}</li>
                    ))}
                    {catItems.length > 8 && (
                      <li className="text-slate-400">+{catItems.length - 8} mais</li>
                    )}
                  </ul>
                )}
              </div>
            )
          })}
        </div>

        <p className="mt-4 text-center text-sm font-medium text-violet-700">
          Total para priorizar: {convergenceClusters.length} ações · {convergenceItems.length}{' '}
          post-its (Que pena + Que tal)
        </p>
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className="btn-secondary">
          ← Voltar à Consolidação
        </button>
        <button
          type="button"
          onClick={onNext}
          className="btn-primary"
          disabled={clusters.length === 0}
        >
          Avançar para Priorização →
        </button>
      </div>
    </div>
  )
}
