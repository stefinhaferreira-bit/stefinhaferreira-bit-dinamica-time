export type ItemCategory = 'que_bom' | 'que_pena' | 'que_tal'

export type Quadrant = 'quick-wins' | 'major' | 'fill-in' | 'reconsider'

export type OrgArea = 'TI' | 'RH' | 'Corporativo' | 'Geral'

export type OrgRole =
  | 'PMO'
  | 'PO'
  | 'PM'
  | 'GM'
  | 'Sponsors'
  | 'Devs'
  | 'Delivery Lead'
  | 'Tech Lead'
  | 'Comunicação Corporativa'
  | 'UX/UI'

export const ORG_AREAS: OrgArea[] = ['TI', 'RH', 'Corporativo', 'Geral']

export const ORG_ROLES: OrgRole[] = [
  'PMO',
  'PO',
  'PM',
  'GM',
  'Sponsors',
  'Devs',
  'Delivery Lead',
  'Tech Lead',
  'Comunicação Corporativa',
  'UX/UI',
]

export const QUADRANT_ORDER: Quadrant[] = [
  'quick-wins',
  'major',
  'fill-in',
  'reconsider',
]

export interface Item {
  id: string
  text: string
  category: ItemCategory
  clusterId: string | null
}

export interface Cluster {
  id: string
  title: string
  tag: string
  papel: OrgRole
  area: OrgArea
  quadrant: Quadrant | null
  responsavel: string
  suporte: string
  prazo: string
}

export const WRITING_GUIDE = {
  title: 'Como escrever cada post-it',
  format: 'O quê — complemento breve',
  hint: 'Use traço (—) para separar. Consolide só o que é a mesma frente (ex.: PM TI ≠ PM RH).',
  examples: [
    'Daily de 15min — time alinhado toda manhã',
    'Onboarding lento — 2 meses pra produzir',
    'Dashboard de indicadores — visibilidade para diretoria',
  ],
  placeholder: 'Ex: Definir papéis — como assim?',
}

export type StepNum = 1 | 2 | 3 | 4

export interface SessionState {
  teamName: string
  date: string
  items: Item[]
  clusters: Cluster[]
  currentStep: StepNum
}

export interface JoinInfo {
  roomId: string
  participantId: string
  participantName: string
}

export interface Participant {
  id: string
  name: string
}

export const CATEGORY_CONFIG: Record<
  ItemCategory,
  { label: string; question: string; description: string; color: string; icon: string }
> = {
  que_bom: {
    label: 'Que bom!',
    question: 'O que fizemos que tem funcionado bem?',
    description: 'Práticas, rituais e entregas que valem manter',
    color: 'emerald',
    icon: '✓',
  },
  que_pena: {
    label: 'Que pena...',
    question: 'O que estamos fazendo e não está legal?',
    description: 'Dores, gargalos e frustrações do dia a dia',
    color: 'rose',
    icon: '!',
  },
  que_tal: {
    label: 'Que tal...',
    question: 'O que podemos começar a fazer logo que ainda não fizemos?',
    description: 'Ideias e melhorias para testar em breve',
    color: 'sky',
    icon: '?',
  },
}

export const ORG_ROLE_CONFIG: Record<OrgRole, { label: string; description: string }> = {
  PMO: {
    label: 'PMO',
    description: 'Governança de portfólio, padronização de métodos, métricas e compliance',
  },
  PO: {
    label: 'PO',
    description: 'Priorização do backlog, valor de negócio e critérios de aceite',
  },
  PM: {
    label: 'PM',
    description: 'Planejamento de entregas, cronograma, riscos e coordenação',
  },
  GM: {
    label: 'GM',
    description: 'Gestão do time, performance, pessoas e resultado operacional',
  },
  Sponsors: {
    label: 'Sponsors',
    description: 'Patrocínio executivo, budget e desbloqueio estratégico',
  },
  Devs: {
    label: 'Devs',
    description: 'Implementação, qualidade de código e evolução técnica',
  },
  'Delivery Lead': {
    label: 'Delivery Lead',
    description: 'Fluxo de entrega ponta a ponta e remoção de impedimentos',
  },
  'Tech Lead': {
    label: 'Tech Lead',
    description: 'Arquitetura, decisões técnicas e mentoria dev',
  },
  'Comunicação Corporativa': {
    label: 'Comunicação Corp.',
    description: 'Narrativa institucional e canais oficiais',
  },
  'UX/UI': {
    label: 'UX/UI',
    description: 'Experiência do usuário, pesquisa e design',
  },
}

export const ORG_AREA_CONFIG: Record<OrgArea, { label: string; description: string }> = {
  TI: { label: 'TI', description: 'Tecnologia, desenvolvimento, infraestrutura e dados' },
  RH: { label: 'RH', description: 'Pessoas, cultura, capacitação e clima' },
  Corporativo: { label: 'Corporativo', description: 'Comunicação institucional e stakeholders' },
  Geral: { label: 'Geral', description: 'Transversal ou ainda não classificado' },
}

export const QUADRANT_CONFIG: Record<
  Quadrant,
  { label: string; description: string; priority: number; color: string }
> = {
  'quick-wins': {
    label: 'Ganhos Rápidos',
    description: 'Alto impacto, baixo esforço — faça primeiro',
    priority: 1,
    color: 'emerald',
  },
  major: {
    label: 'Projetos Estratégicos',
    description: 'Alto impacto, alto esforço — planeje em sequência',
    priority: 2,
    color: 'blue',
  },
  'fill-in': {
    label: 'Complementares',
    description: 'Baixo impacto, baixo esforço — quando houver capacidade',
    priority: 3,
    color: 'slate',
  },
  reconsider: {
    label: 'Reavaliar',
    description: 'Baixo impacto, alto esforço — decidir se vale a pena',
    priority: 4,
    color: 'orange',
  },
}

interface ConsolidationRule {
  tag: string
  titlePrefix: string
  defaultPapel: OrgRole
  patterns: RegExp
}

const CONSOLIDATION_RULES: ConsolidationRule[] = [
  {
    tag: 'Rituais',
    titlePrefix: 'Rituais e cadências',
    defaultPapel: 'PM',
    patterns: /daily|reuni|ritual|planning|retro|checkpoint|sprint plan|janela de foco|cerimônia|cadência/i,
  },
  {
    tag: 'Indicadores',
    titlePrefix: 'Indicadores e visibilidade',
    defaultPapel: 'PMO',
    patterns: /indicador|métrica|metrica|kpi|dashboard|relatório|relatorio|sla|okr|pesquisa/i,
  },
  {
    tag: 'Desenvolvimento',
    titlePrefix: 'Qualidade técnica',
    defaultPapel: 'Tech Lead',
    patterns: /código|codigo|dev|teste|deploy|ci|bug|técnico|tecnico|automação|pair prog|documentação|template|critério de pronto/i,
  },
  {
    tag: 'Pessoas',
    titlePrefix: 'Pessoas e capacitação',
    defaultPapel: 'GM',
    patterns: /onboarding|pessoa|1:1|capacita|treinamento|engajamento|papel|rodízio|moral|dependência|celebração/i,
  },
  {
    tag: 'Comunicação',
    titlePrefix: 'Comunicação e alinhamento',
    defaultPapel: 'Comunicação Corporativa',
    patterns: /comunica|e-mail|email|teams|handoff|status|canal|bot de|clientes internos/i,
  },
  {
    tag: 'Governança',
    titlePrefix: 'Governança e priorização',
    defaultPapel: 'PMO',
    patterns: /governança|governanca|pmo|prioridade|escopo|comitê|comite|portfólio|decisão|decisao|critério|conflitante|sobrecarregado/i,
  },
]

const MAX_POSTITS_PER_CLUSTER = 2

export function createItem(text: string, category: ItemCategory): Item {
  return { id: crypto.randomUUID(), text, category, clusterId: null }
}

export function createCluster(
  title: string,
  tag = '',
  papel: OrgRole = 'PM',
  area: OrgArea = 'Geral'
): Cluster {
  return {
    id: crypto.randomUUID(),
    title,
    tag,
    papel,
    area,
    quadrant: null,
    responsavel: '',
    suporte: '',
    prazo: '',
  }
}

export function inferArea(text: string): OrgArea {
  const t = text.toLowerCase()
  if (/rh|onboarding|pessoa|1:1|capacita|treinamento|engajamento|moral|celebração|clima|dependência de uma pessoa/.test(t))
    return 'RH'
  if (/dev|código|codigo|técnico|tecnico|deploy|bug|automação|teste|ci\/cd|pair prog|dashboard|bot de/.test(t))
    return 'TI'
  if (/comunica|corporativ|stakeholder|diretoria|clientes internos|institucional/.test(t))
    return 'Corporativo'
  return 'Geral'
}

export function inferPapel(
  text: string,
  rule: ConsolidationRule,
  category: ItemCategory
): OrgRole {
  const t = text.toLowerCase()
  if (/gestão|liderança|sobrecarregado|dependência|1:1|engajamento|moral|onboarding|pessoas/.test(t))
    return 'GM'
  if (/código|dev|deploy|técnico|bug|automação|teste|pair prog|tech/.test(t))
    return 'Tech Lead'
  if (/indicador|métrica|kpi|pmo|governança|portfólio|escopo/.test(t))
    return 'PMO'
  if (/comunica|stakeholder|clientes internos/.test(t))
    return 'Comunicação Corporativa'
  if (category === 'que_tal' && rule.tag === 'Rituais') return 'PM'
  if (category === 'que_pena' && rule.tag === 'Pessoas') return 'GM'
  return rule.defaultPapel
}

export function suggestConsolidationRule(text: string): ConsolidationRule {
  for (const rule of CONSOLIDATION_RULES) {
    if (rule.patterns.test(text)) return rule
  }
  return CONSOLIDATION_RULES[0]
}

function extractShortTitle(text: string): string {
  const part = text.split('—')[0]?.trim() || text.trim()
  return part.length > 60 ? `${part.slice(0, 57)}...` : part
}

function bucketKey(tag: string, papel: OrgRole, area: OrgArea): string {
  return `${tag}|${papel}|${area}`
}

export function autoConsolidateItems(items: Item[]): {
  clusters: Cluster[]
  updatedItems: Item[]
} {
  const unassigned = items.filter((i) => !i.clusterId)
  const buckets = new Map<
    string,
    { rule: ConsolidationRule; papel: OrgRole; area: OrgArea; itemIds: string[] }
  >()

  for (const item of unassigned) {
    const rule = suggestConsolidationRule(item.text)
    const area = inferArea(item.text)
    const papel = inferPapel(item.text, rule, item.category)
    const key = bucketKey(rule.tag, papel, area)
    if (!buckets.has(key)) {
      buckets.set(key, { rule, papel, area, itemIds: [] })
    }
    buckets.get(key)!.itemIds.push(item.id)
  }

  const newClusters: Cluster[] = []
  const itemClusterMap = new Map<string, string>()

  for (const [, { rule, papel, area, itemIds }] of buckets) {
    for (let i = 0; i < itemIds.length; i += MAX_POSTITS_PER_CLUSTER) {
      const chunkIds = itemIds.slice(i, i + MAX_POSTITS_PER_CLUSTER)
      const chunkItems = chunkIds.map((id) => items.find((x) => x.id === id)!)
      const partLabel = itemIds.length > MAX_POSTITS_PER_CLUSTER
        ? ` #${Math.floor(i / MAX_POSTITS_PER_CLUSTER) + 1}`
        : ''

      let title: string
      if (chunkItems.length === 1) {
        title = `${extractShortTitle(chunkItems[0].text)} (${papel} · ${area})`
      } else {
        title = `${rule.titlePrefix} — ${papel} · ${area}${partLabel}`
      }

      const cluster = createCluster(title, rule.tag, papel, area)
      newClusters.push(cluster)
      for (const id of chunkIds) itemClusterMap.set(id, cluster.id)
    }
  }

  const updatedItems = items.map((i) =>
    itemClusterMap.has(i.id) ? { ...i, clusterId: itemClusterMap.get(i.id)! } : i
  )

  return { clusters: newClusters, updatedItems }
}

export function clusterGroupKey(cluster: Cluster): string {
  return `${cluster.papel}|${cluster.area}`
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function getClusterItems(clusterId: string, items: Item[]): Item[] {
  return items.filter((i) => i.clusterId === clusterId)
}

export function getUnassignedItems(items: Item[]): Item[] {
  return items.filter((i) => !i.clusterId)
}

export function getClustersByQuadrant(clusters: Cluster[], quadrant: Quadrant): Cluster[] {
  return clusters.filter((c) => c.quadrant === quadrant)
}

export function getPrioritizedClusters(clusters: Cluster[]): Cluster[] {
  return clusters
    .filter((c) => c.quadrant)
    .sort((a, b) => {
      const pA = QUADRANT_CONFIG[a.quadrant!].priority
      const pB = QUADRANT_CONFIG[b.quadrant!].priority
      if (pA !== pB) return pA - pB
      return `${a.papel}${a.area}`.localeCompare(`${b.papel}${b.area}`)
    })
}
