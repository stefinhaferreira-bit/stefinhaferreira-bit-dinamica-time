import { useState } from 'react'
import type { Cluster, Quadrant } from '../types'
import {
  getClustersByQuadrant,
  ORG_AREA_CONFIG,
  ORG_ROLE_CONFIG,
  QUADRANT_CONFIG,
  QUADRANT_ORDER,
} from '../types'

interface StepPriorizacaoProps {
  clusters: Cluster[]
  onSetQuadrant: (id: string, quadrant: Quadrant | null) => void
  onBack: () => void
  onNext: () => void
}

const quadrantLayout: { quadrant: Quadrant; gridArea: string }[] = [
  { quadrant: 'major', gridArea: '1 / 1' },
  { quadrant: 'quick-wins', gridArea: '1 / 2' },
  { quadrant: 'reconsider', gridArea: '2 / 1' },
  { quadrant: 'fill-in', gridArea: '2 / 2' },
]

const quadrantStyles: Record<Quadrant, { bg: string; border: string; header: string }> = {
  'quick-wins': { bg: 'bg-emerald-50/50', border: 'border-emerald-200', header: 'bg-emerald-500 text-white' },
  major: { bg: 'bg-blue-50/50', border: 'border-blue-200', header: 'bg-blue-500 text-white' },
  'fill-in': { bg: 'bg-slate-50/50', border: 'border-slate-200', header: 'bg-slate-500 text-white' },
  reconsider: { bg: 'bg-orange-50/50', border: 'border-orange-200', header: 'bg-orange-500 text-white' },
}

function ActionCard({
  cluster,
  draggable,
  onDragStart,
}: {
  cluster: Cluster
  draggable?: boolean
  onDragStart?: () => void
}) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      className={`rounded-xl border border-white bg-white p-3 shadow-sm ${
        draggable ? 'cursor-grab active:cursor-grabbing hover:shadow' : ''
      }`}
    >
      <p className="text-sm font-semibold text-slate-800 leading-snug">{cluster.title}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {cluster.tag && (
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] text-violet-700">
            {cluster.tag}
          </span>
        )}
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
          {ORG_ROLE_CONFIG[cluster.papel].label} · {ORG_AREA_CONFIG[cluster.area].label}
        </span>
      </div>
    </div>
  )
}

function MatrixQuadrant({
  quadrant,
  clusters,
  draggedId,
  onDrop,
  onDragStart,
}: {
  quadrant: Quadrant
  clusters: Cluster[]
  draggedId: string | null
  onDrop: (quadrant: Quadrant) => void
  onDragStart: (id: string) => void
}) {
  const [isOver, setIsOver] = useState(false)
  const config = QUADRANT_CONFIG[quadrant]
  const styles = quadrantStyles[quadrant]
  const quadrantClusters = getClustersByQuadrant(clusters, quadrant)

  return (
    <div
      className={`card flex flex-col ${styles.border} ${styles.bg} ${
        isOver && draggedId ? 'ring-2 ring-brand-400' : ''
      }`}
      style={{ gridArea: quadrantLayout.find((q) => q.quadrant === quadrant)?.gridArea }}
      onDragOver={(e) => { e.preventDefault(); setIsOver(true) }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => { e.preventDefault(); setIsOver(false); onDrop(quadrant) }}
    >
      <div className={`rounded-t-2xl px-4 py-3 ${styles.header}`}>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold">{config.label}</h4>
          <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px]">
            P{config.priority}
          </span>
        </div>
        <p className="mt-0.5 text-xs opacity-90">{config.description}</p>
      </div>
      <div className="flex-1 space-y-2 p-3" style={{ minHeight: '100px' }}>
        {quadrantClusters.map((c) => (
          <ActionCard
            key={c.id}
            cluster={c}
            draggable
            onDragStart={() => onDragStart(c.id)}
          />
        ))}
      </div>
    </div>
  )
}

export function StepPriorizacao({ clusters, onSetQuadrant, onBack, onNext }: StepPriorizacaoProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const unassigned = clusters.filter((c) => !c.quadrant)
  const positioned = clusters.filter((c) => c.quadrant)
  const canProceed = clusters.length > 0 && unassigned.length === 0

  const handleDrop = (quadrant: Quadrant) => {
    if (draggedId) {
      onSetQuadrant(draggedId, quadrant)
      setDraggedId(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
          Etapa 3 — Priorização das Ações
        </h2>
        <p className="mt-2 text-sm text-slate-500 max-w-2xl mx-auto">
          Posicione cada <strong>ação consolidada</strong> na matriz Impacto × Esforço.
          No plano, todas as categorias aparecem em <strong>ordem de prioridade</strong> —
          o time decide o que fazer e quando.
        </p>
      </div>

      {unassigned.length > 0 && (
        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-600">
            Ações para posicionar ({unassigned.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {unassigned.map((c) => (
              <ActionCard
                key={c.id}
                cluster={c}
                draggable
                onDragStart={() => setDraggedId(c.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="card overflow-hidden p-6">
        <div className="mb-2 flex justify-center">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            ← Baixo Esforço &nbsp;|&nbsp; Alto Esforço →
          </span>
        </div>
        <div className="flex gap-4">
          <div className="flex w-8 shrink-0 items-center justify-center">
            <span className="text-xs font-medium text-slate-500" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              Alto Impacto ↑
            </span>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-3" style={{ gridTemplateRows: '1fr 1fr' }}>
              {quadrantLayout.map(({ quadrant }) => (
                <MatrixQuadrant
                  key={quadrant}
                  quadrant={quadrant}
                  clusters={clusters}
                  draggedId={draggedId}
                  onDrop={handleDrop}
                  onDragStart={setDraggedId}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-center text-xs text-slate-400">Baixo Impacto ↓</div>
          </div>
        </div>
      </div>

      {positioned.length > 0 && (
        <div className="card border-brand-200 bg-brand-50/40 p-5">
          <h3 className="font-semibold text-brand-900">
            {positioned.length} ação(ões) no plano — por ordem de prioridade:
          </h3>
          <div className="mt-3 space-y-2">
            {QUADRANT_ORDER.map((q) => {
              const list = getClustersByQuadrant(clusters, q)
              if (list.length === 0) return null
              const cfg = QUADRANT_CONFIG[q]
              return (
                <div key={q}>
                  <p className="text-xs font-bold text-slate-600">
                    {cfg.priority}. {cfg.label} ({list.length})
                  </p>
                  <ul className="mt-1 space-y-0.5 pl-3">
                    {list.map((c) => (
                      <li key={c.id} className="text-sm text-slate-700">• {c.title}</li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className="btn-secondary">← Voltar</button>
        <button type="button" onClick={onNext} className="btn-primary" disabled={!canProceed}>
          Avançar para Plano de Ação →
        </button>
      </div>
    </div>
  )
}
