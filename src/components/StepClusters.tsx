import { useState } from 'react'
import type { Cluster, Item, ItemCategory, OrgArea, OrgRole } from '../types'
import {
  CATEGORY_CONFIG,
  getClusterCategory,
  getClusterItems,
  getUnassignedItems,
  ORG_AREA_CONFIG,
  ORG_AREAS,
  ORG_ROLE_CONFIG,
  ORG_ROLES,
} from '../types'
import { PostIt } from './PostIt'

interface StepClustersProps {
  items: Item[]
  clusters: Cluster[]
  onCreateCluster: (
    title: string,
    tag: string,
    papel: OrgRole,
    area: OrgArea,
    category: ItemCategory
  ) => void
  onUpdateCluster: (id: string, field: keyof Cluster, value: string) => void
  onDeleteCluster: (id: string) => void
  onAssignToCluster: (itemId: string, clusterId: string | null) => void
  onAutoConsolidate: () => void
  onBack: () => void
  onNext: () => void
}

const TAG_COLORS: Record<string, string> = {
  'Que bom': 'from-emerald-500 to-emerald-600',
  'Que pena': 'from-rose-500 to-rose-600',
  'Que tal': 'from-sky-500 to-sky-600',
  Rituais: 'from-violet-500 to-violet-600',
  Indicadores: 'from-blue-500 to-blue-600',
  Desenvolvimento: 'from-cyan-500 to-cyan-600',
  Pessoas: 'from-pink-500 to-pink-600',
  Comunicação: 'from-amber-500 to-amber-600',
  Governança: 'from-indigo-500 to-indigo-600',
}

const THEME_CATEGORIES: ItemCategory[] = ['que_bom', 'que_pena', 'que_tal']

const DEFAULT_TAG_COLOR = 'from-brand-500 to-brand-600'

function RolesReference() {
  return (
    <details className="card bg-slate-50 p-5">
      <summary className="cursor-pointer text-sm font-semibold text-slate-600 select-none">
        Referência de papéis (responsabilidades de mercado)
      </summary>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {ORG_ROLES.map((role) => (
          <div key={role} className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">
            <p className="text-xs font-bold text-slate-800">{ORG_ROLE_CONFIG[role].label}</p>
            <p className="text-[10px] leading-snug text-slate-500">{ORG_ROLE_CONFIG[role].description}</p>
          </div>
        ))}
      </div>
    </details>
  )
}

function ClusterDetailModal({
  cluster,
  items,
  onClose,
  onUpdateCluster,
  onDeleteCluster,
  onAssignToCluster,
}: {
  cluster: Cluster
  items: Item[]
  onClose: () => void
  onUpdateCluster: (id: string, field: keyof Cluster, value: string) => void
  onDeleteCluster: (id: string) => void
  onAssignToCluster: (itemId: string, clusterId: string | null) => void
}) {
  const clusterItems = getClusterItems(cluster.id, items)
  const headerColor = TAG_COLORS[cluster.tag] ?? DEFAULT_TAG_COLOR

  const handleDelete = () => {
    if (window.confirm('Excluir esta ação consolidada? Os post-its voltam para a fila.')) {
      onDeleteCluster(cluster.id)
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
      <div
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`bg-gradient-to-r ${headerColor} px-6 py-5 text-white`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                Ação consolidada
              </p>
              <input
                type="text"
                value={cluster.title}
                onChange={(e) => onUpdateCluster(cluster.id, 'title', e.target.value)}
                className="mt-1 w-full border-0 bg-transparent text-xl font-bold text-white placeholder-white/60 focus:outline-none focus:ring-0"
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-white/20 px-3 py-1.5 text-sm font-medium hover:bg-white/30"
            >
              ✕
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              type="text"
              value={cluster.tag}
              onChange={(e) => onUpdateCluster(cluster.id, 'tag', e.target.value)}
              placeholder="Tag"
              className="rounded-lg bg-white/20 px-2.5 py-1 text-xs text-white placeholder-white/60 border-0 focus:outline-none focus:ring-1 focus:ring-white/40 w-28"
            />
            <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium">
              {clusterItems.length} post-it{clusterItems.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Papel</label>
              <select
                value={cluster.papel}
                onChange={(e) => onUpdateCluster(cluster.id, 'papel', e.target.value)}
                className="input-field py-2 text-sm w-full"
              >
                {ORG_ROLES.map((r) => (
                  <option key={r} value={r}>{ORG_ROLE_CONFIG[r].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Área</label>
              <select
                value={cluster.area}
                onChange={(e) => onUpdateCluster(cluster.id, 'area', e.target.value)}
                className="input-field py-2 text-sm w-full"
              >
                {ORG_AREAS.map((a) => (
                  <option key={a} value={a}>{ORG_AREA_CONFIG[a].label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-700">
              Post-its consolidados ({clusterItems.length})
            </h4>
            {clusterItems.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
                Nenhum post-it — arraste da fila de espera
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {clusterItems.map((item, idx) => (
                  <div key={item.id} className="relative">
                    <PostIt
                      text={item.text}
                      variant={item.category}
                      index={idx}
                      badge={CATEGORY_CONFIG[item.category].label}
                      compact
                    />
                    <button
                      type="button"
                      onClick={() => onAssignToCluster(item.id, null)}
                      className="absolute -right-1 -top-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-rose-500 shadow ring-1 ring-rose-200 hover:bg-rose-50"
                    >
                      remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 flex justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="text-sm text-rose-500 hover:text-rose-700"
          >
            Excluir ação
          </button>
          <button type="button" onClick={onClose} className="btn-primary text-sm">
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

function ClusterBoardCard({
  cluster,
  items,
  draggedItemId,
  isSelected,
  onClick,
  onDrop,
}: {
  cluster: Cluster
  items: Item[]
  draggedItemId: string | null
  isSelected: boolean
  onClick: () => void
  onDrop: (clusterId: string) => void
}) {
  const clusterItems = getClusterItems(cluster.id, items)
  const headerColor = TAG_COLORS[cluster.tag] ?? DEFAULT_TAG_COLOR
  const preview = clusterItems.slice(0, 2)

  return (
    <button
      type="button"
      onClick={onClick}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onDrop(cluster.id)
      }}
      className={`group relative flex flex-col overflow-hidden rounded-xl border-2 bg-white text-left shadow-md transition hover:shadow-lg hover:-translate-y-0.5 ${
        isSelected ? 'border-brand-500 ring-2 ring-brand-200' : 'border-slate-200 hover:border-brand-300'
      } ${draggedItemId ? 'ring-2 ring-dashed ring-brand-300' : ''}`}
      style={{ minHeight: '160px' }}
    >
      <div className={`bg-gradient-to-r ${headerColor} px-3 py-2`}>
        <div className="flex items-center justify-between gap-1">
          <span className="truncate text-[10px] font-bold uppercase tracking-wide text-white/90">
            {cluster.tag || 'Ação'}
          </span>
          <span className="shrink-0 rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {clusterItems.length}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="line-clamp-3 text-sm font-bold leading-snug text-slate-800">
          {cluster.title}
        </p>

        <div className="mt-2 flex flex-wrap gap-1">
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
            {ORG_ROLE_CONFIG[cluster.papel].label}
          </span>
          <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">
            {ORG_AREA_CONFIG[cluster.area].label}
          </span>
        </div>

        {preview.length > 0 && (
          <div className="mt-3 space-y-1 border-t border-slate-100 pt-2">
            {preview.map((item) => (
              <p key={item.id} className="truncate text-[10px] text-slate-400">
                • {item.text.split('—')[0]?.trim() || item.text}
              </p>
            ))}
            {clusterItems.length > 2 && (
              <p className="text-[10px] font-medium text-brand-500">
                +{clusterItems.length - 2} mais — clique para ver
              </p>
            )}
          </div>
        )}

        {clusterItems.length === 0 && (
          <p className="mt-auto pt-2 text-[10px] italic text-slate-400">
            Vazio — solte post-its aqui
          </p>
        )}
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-3 py-1.5 text-center text-[10px] font-medium text-slate-400 group-hover:text-brand-600">
        Clique para detalhes
      </div>
    </button>
  )
}

export function StepClusters({
  items,
  clusters,
  onCreateCluster,
  onUpdateCluster,
  onDeleteCluster,
  onAssignToCluster,
  onAutoConsolidate,
  onBack,
  onNext,
}: StepClustersProps) {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newTag, setNewTag] = useState('')
  const [newPapel, setNewPapel] = useState<OrgRole>('PM')
  const [newArea, setNewArea] = useState<OrgArea>('Geral')
  const [newCategory, setNewCategory] = useState<ItemCategory>('que_tal')
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null)

  const unassigned = getUnassignedItems(items)
  const assignedCount = items.length - unassigned.length
  const canProceed = unassigned.length === 0 && clusters.length > 0
  const selectedCluster = clusters.find((c) => c.id === selectedClusterId)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    const tag = newTag.trim() || CATEGORY_CONFIG[newCategory].label
    onCreateCluster(newTitle.trim(), tag, newPapel, newArea, newCategory)
    setNewTitle('')
    setNewTag('')
  }

  const handleDropOnCluster = (clusterId: string) => {
    if (draggedItemId) {
      onAssignToCluster(draggedItemId, clusterId)
      setDraggedItemId(null)
    }
  }

  const ratio = items.length > 0 ? Math.round((assignedCount / items.length) * 100) : 0

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
          Etapa 2 — Consolidação em Ações
        </h2>
        <p className="mt-2 text-sm text-slate-500 max-w-3xl mx-auto">
          Agrupe post-its por <strong>tema</strong> (Que bom · Que pena · Que tal).
          Cada quadro é uma ação — clique para ver os post-its e editar.
        </p>
      </div>

      {items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card p-6 text-center">
            <p className="text-5xl font-bold tabular-nums text-slate-900">{items.length}</p>
            <p className="mt-1 text-sm font-medium text-slate-600">post-its coletados</p>
          </div>
          <div className="card border-brand-200 bg-brand-50/30 p-6 text-center">
            <p className="text-5xl font-bold tabular-nums text-brand-600">{clusters.length}</p>
            <p className="mt-1 text-sm font-medium text-brand-800">ações consolidadas</p>
          </div>
          <div className="card p-6 text-center">
            <p className="text-5xl font-bold tabular-nums text-emerald-600">
              {assignedCount}<span className="text-2xl text-slate-400">/{items.length}</span>
            </p>
            <p className="mt-1 text-sm font-medium text-slate-600">
              post-its clusterizados ({ratio}%)
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={onAutoConsolidate} className="btn-secondary text-sm">
          Consolidar automaticamente por tema (máx. 2 post-its por ação)
        </button>
      </div>

      <form onSubmit={handleCreate} className="card p-5">
        <p className="mb-3 text-sm font-semibold text-slate-700">Criar ação consolidada manualmente</p>
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Ex: Padronizar daily — PM TI"
            className="input-field flex-1 min-w-[200px]"
          />
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Tag: Rituais"
            className="input-field w-full sm:w-36"
          />
          <select
            value={newPapel}
            onChange={(e) => setNewPapel(e.target.value as OrgRole)}
            className="input-field w-full sm:w-40"
          >
            {ORG_ROLES.map((r) => (
              <option key={r} value={r}>{ORG_ROLE_CONFIG[r].label}</option>
            ))}
          </select>
          <select
            value={newArea}
            onChange={(e) => setNewArea(e.target.value as OrgArea)}
            className="input-field w-full sm:w-32"
          >
            {ORG_AREAS.map((a) => (
              <option key={a} value={a}>{ORG_AREA_CONFIG[a].label}</option>
            ))}
          </select>
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as ItemCategory)}
            className="input-field w-full sm:w-36"
          >
            {THEME_CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_CONFIG[c].label}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary shrink-0" disabled={!newTitle.trim()}>
            + Criar ação
          </button>
        </div>
      </form>

      {unassigned.length > 0 && (
        <div className="card border-amber-200 bg-amber-50/30 p-5">
          <h3 className="mb-3 text-sm font-semibold text-amber-900">
            Post-its aguardando consolidação ({unassigned.length})
          </h3>
          <p className="mb-3 text-xs text-amber-800/70">
            Arraste para um quadro abaixo ou use a consolidação automática
          </p>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {unassigned.map((item, idx) => (
              <PostIt
                key={item.id}
                text={item.text}
                variant={item.category}
                index={idx}
                draggable
                onDragStart={() => setDraggedItemId(item.id)}
                badge={CATEGORY_CONFIG[item.category].label}
                compact
              />
            ))}
          </div>
        </div>
      )}

      {clusters.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="text-4xl mb-2">📋</p>
          <p className="text-sm text-slate-500">Nenhuma ação consolidada ainda</p>
          <p className="mt-1 text-xs text-slate-400">Use a consolidação automática ou crie manualmente</p>
        </div>
      ) : (
        <div className="space-y-8">
          {THEME_CATEGORIES.map((category) => {
            const themeClusters = clusters.filter(
              (c) => getClusterCategory(c, items) === category
            )
            if (themeClusters.length === 0) return null
            const config = CATEGORY_CONFIG[category]
            return (
              <div key={category}>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span>{config.icon}</span>
                  {config.label}
                  <span className="text-slate-400">({themeClusters.length})</span>
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {themeClusters.map((cluster) => (
                    <ClusterBoardCard
                      key={cluster.id}
                      cluster={cluster}
                      items={items}
                      draggedItemId={draggedItemId}
                      isSelected={selectedClusterId === cluster.id}
                      onClick={() => setSelectedClusterId(cluster.id)}
                      onDrop={handleDropOnCluster}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedCluster && (
        <ClusterDetailModal
          cluster={selectedCluster}
          items={items}
          onClose={() => setSelectedClusterId(null)}
          onUpdateCluster={onUpdateCluster}
          onDeleteCluster={onDeleteCluster}
          onAssignToCluster={onAssignToCluster}
        />
      )}

      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className="btn-secondary">← Voltar</button>
        <button type="button" onClick={onNext} className="btn-primary" disabled={!canProceed}>
          Avançar para Resumo →
        </button>
      </div>

      <RolesReference />
    </div>
  )
}
