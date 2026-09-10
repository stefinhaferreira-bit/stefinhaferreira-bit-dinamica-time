import type { Cluster, Item, Quadrant } from '../types'
import {
  getClusterItems,
  getClustersByQuadrant,
  ORG_AREA_CONFIG,
  ORG_AREAS,
  ORG_ROLE_CONFIG,
  ORG_ROLES,
  QUADRANT_CONFIG,
  QUADRANT_ORDER,
} from '../types'

interface StepPlanoProps {
  items: Item[]
  clusters: Cluster[]
  onUpdateCluster: (id: string, field: keyof Cluster, value: string) => void
  onBack: () => void
}

const quadrantHeaderStyles: Record<Quadrant, string> = {
  'quick-wins': 'bg-emerald-500 text-white',
  major: 'bg-blue-500 text-white',
  'fill-in': 'bg-slate-500 text-white',
  reconsider: 'bg-orange-500 text-white',
}

function ActionRow({
  cluster,
  items,
  index,
  onUpdateCluster,
}: {
  cluster: Cluster
  items: Item[]
  index: number
  onUpdateCluster: (id: string, field: keyof Cluster, value: string) => void
}) {
  const sources = getClusterItems(cluster.id, items)

  return (
    <tr className="border-b border-slate-50 align-top hover:bg-slate-50/50">
      <td className="px-4 py-4 text-slate-400">{index}</td>
      <td className="px-4 py-4">
        <p className="font-semibold text-slate-800">{cluster.title}</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {cluster.tag && (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] text-violet-700">
              {cluster.tag}
            </span>
          )}
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
            {ORG_ROLE_CONFIG[cluster.papel].label} · {ORG_AREA_CONFIG[cluster.area].label}
          </span>
        </div>
        {sources.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer text-[11px] text-slate-400 hover:text-slate-600">
              {sources.length} post-it(s) consolidado(s)
            </summary>
            <ul className="mt-1 space-y-0.5 pl-2 text-[11px] text-slate-500">
              {sources.map((s) => (
                <li key={s.id}>• {s.text}</li>
              ))}
            </ul>
          </details>
        )}
      </td>
      <td className="px-4 py-4">
        <select
          value={cluster.papel}
          onChange={(e) => onUpdateCluster(cluster.id, 'papel', e.target.value)}
          className="input-field py-1.5 text-xs"
        >
          {ORG_ROLES.map((r) => (
            <option key={r} value={r}>{ORG_ROLE_CONFIG[r].label}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-4">
        <select
          value={cluster.area}
          onChange={(e) => onUpdateCluster(cluster.id, 'area', e.target.value)}
          className="input-field py-1.5 text-xs"
        >
          {ORG_AREAS.map((a) => (
            <option key={a} value={a}>{ORG_AREA_CONFIG[a].label}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-4">
        <input
          type="text"
          value={cluster.responsavel}
          onChange={(e) => onUpdateCluster(cluster.id, 'responsavel', e.target.value)}
          placeholder="Nome"
          className="input-field py-1.5 text-xs"
        />
      </td>
      <td className="px-4 py-4">
        <input
          type="text"
          value={cluster.suporte}
          onChange={(e) => onUpdateCluster(cluster.id, 'suporte', e.target.value)}
          placeholder="Nome"
          className="input-field py-1.5 text-xs"
        />
      </td>
      <td className="px-4 py-4">
        <input
          type="date"
          value={cluster.prazo}
          onChange={(e) => onUpdateCluster(cluster.id, 'prazo', e.target.value)}
          className="input-field py-1.5 text-xs"
        />
      </td>
    </tr>
  )
}

export function StepPlano({ items, clusters, onUpdateCluster, onBack }: StepPlanoProps) {
  const positioned = clusters.filter((c) => c.quadrant)
  const sections = QUADRANT_ORDER
    .map((q) => ({ quadrant: q, clusters: getClustersByQuadrant(clusters, q) }))
    .filter((s) => s.clusters.length > 0)

  const totalWithResponsavel = positioned.filter((c) => c.responsavel).length
  const totalWithPrazo = positioned.filter((c) => c.prazo).length

  const exportPlano = () => {
    const lines = [
      '# Plano de Ação — por prioridade da matriz',
      '',
      `Time: dinâmica · Data: ${new Date().toLocaleDateString('pt-BR')}`,
      '',
    ]

    let globalIdx = 1
    for (const { quadrant, clusters: sectionClusters } of sections) {
      const cfg = QUADRANT_CONFIG[quadrant]
      lines.push(`## ${cfg.priority}. ${cfg.label}`)
      lines.push(`_${cfg.description}_`)
      lines.push('')
      lines.push('| # | Ação | Papel | Área | Responsável | Suporte | Prazo |')
      lines.push('|---|------|-------|------|-------------|---------|-------|')
      for (const c of sectionClusters) {
        lines.push(
          `| ${globalIdx} | ${c.title} | ${c.papel} | ${c.area} | ${c.responsavel || '—'} | ${c.suporte || '—'} | ${c.prazo || '—'} |`
        )
        globalIdx++
      }
      lines.push('')
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plano-de-acao-priorizado.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (positioned.length === 0) {
    return (
      <div className="space-y-6 text-center">
        <h2 className="font-display text-xl font-bold text-slate-900">Etapa 5 — Plano de Ação</h2>
        <p className="text-sm text-slate-500">
          Nenhuma ação posicionada na matriz. Volte à priorização e classifique todas as ações
          consolidadas nos quadrantes.
        </p>
        <button type="button" onClick={onBack} className="btn-secondary">← Voltar</button>
      </div>
    )
  }

  let rowCounter = 0

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
          Etapa 5 — Plano de Ação
        </h2>
        <p className="mt-2 text-sm text-slate-500 max-w-2xl mx-auto">
          Todas as categorias da matriz aparecem aqui em <strong>ordem de prioridade</strong>.
          O time decide o que executar e em qual sequência — começando pelos Ganhos Rápidos.
        </p>
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={exportPlano} className="btn-secondary text-sm">
          Exportar plano
        </button>
      </div>

      <div className="space-y-8">
        {sections.map(({ quadrant, clusters: sectionClusters }) => {
          const cfg = QUADRANT_CONFIG[quadrant]
          return (
            <div key={quadrant} className="card overflow-hidden">
              <div className={`px-5 py-4 ${quadrantHeaderStyles[quadrant]}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider opacity-80">
                      Prioridade {cfg.priority}
                    </p>
                    <h3 className="text-lg font-bold">{cfg.label}</h3>
                    <p className="mt-0.5 text-sm opacity-90">{cfg.description}</p>
                  </div>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
                    {sectionClusters.length} ação{sectionClusters.length !== 1 ? 'ões' : ''}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-600">
                      <th className="px-4 py-3 w-8">#</th>
                      <th className="px-4 py-3">Ação consolidada</th>
                      <th className="px-4 py-3 w-32">Papel</th>
                      <th className="px-4 py-3 w-28">Área</th>
                      <th className="px-4 py-3 w-32">Responsável</th>
                      <th className="px-4 py-3 w-32">Suporte</th>
                      <th className="px-4 py-3 w-32">Prazo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectionClusters.map((cluster) => {
                      rowCounter++
                      return (
                        <ActionRow
                          key={cluster.id}
                          cluster={cluster}
                          items={items}
                          index={rowCounter}
                          onUpdateCluster={onUpdateCluster}
                        />
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>

      <div className="card border-brand-200 bg-brand-50/40 p-5">
        <p className="text-sm text-brand-900">
          <strong>{positioned.length}</strong> ações no plano ·{' '}
          <strong>{totalWithResponsavel}</strong> com responsável ·{' '}
          <strong>{totalWithPrazo}</strong> com prazo definido
        </p>
        <p className="mt-1 text-xs text-brand-700/80">
          Avalie juntos se todas serão executadas — a ordem acima sugere por onde começar.
        </p>
      </div>

      <div className="flex justify-start">
        <button type="button" onClick={onBack} className="btn-secondary">← Voltar</button>
      </div>
    </div>
  )
}
