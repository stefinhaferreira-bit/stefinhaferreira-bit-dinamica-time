import type { Cluster, Item, ItemCategory, OrgArea, OrgRole, Quadrant, SessionState } from '../types'

function raw(id: string, text: string, category: ItemCategory, clusterId: string): Item {
  return { id, text, category, clusterId }
}

function cluster(
  id: string,
  title: string,
  tag: string,
  papel: OrgRole,
  area: OrgArea,
  quadrant: Quadrant,
  responsavel: string,
  suporte: string,
  prazo: string,
  category: ItemCategory = 'que_tal'
): Cluster {
  return { id, title, tag, category, papel, area, quadrant, responsavel, suporte, prazo }
}

const C01 = 'c-rituais-pm-ti-1'
const C02 = 'c-rituais-pm-ti-2'
const C03 = 'c-rituais-pm-rh'
const C04 = 'c-com-ti'
const C05 = 'c-com-corp'
const C06 = 'c-dev-tl-ti-1'
const C07 = 'c-dev-tl-ti-2'
const C08 = 'c-pessoas-gm-rh-1'
const C09 = 'c-pessoas-gm-rh-2'
const C10 = 'c-pessoas-gm-ti'
const C11 = 'c-gov-pmo-1'
const C12 = 'c-gov-pmo-2'
const C13 = 'c-ind-pmo-ti'
const C14 = 'c-ind-pmo-rh'
const C15 = 'c-ritual-gm-rh'
const C16 = 'c-dev-pm-ti'

const SIM_ITEMS: Item[] = [
  raw('s01', 'Daily de 15min — time alinhado toda manhã', 'que_bom', C01),
  raw('s11', 'Reuniões sem pauta — horas perdidas toda semana', 'que_pena', C01),
  raw('s15', 'Sprint planning de 4h — sem decisão clara', 'que_pena', C02),
  raw('s21', 'Quadro visual de prioridades — toda segunda, 20min', 'que_tal', C02),
  raw('s23', 'Janela de foco sem reunião — quartas 9h–12h', 'que_tal', C03),
  raw('s25', 'Ritual de lições aprendidas — ao fim de cada entrega', 'que_tal', C15),

  raw('s02', 'Canal direto com liderança — decisões mais rápidas', 'que_bom', C05),
  raw('s06', 'Checkpoint semanal com áreas parceiras — menos surpresas', 'que_bom', C04),
  raw('s13', 'Comunicação só por e-mail — demora na resposta', 'que_pena', C05),
  raw('s14', 'Handoff entre times — informação se perde', 'que_pena', C04),
  raw('s24', 'Bot de status no Teams — update sem reunião', 'que_tal', C04),
  raw('s28', 'Sessão mensal com clientes internos — ouvir necessidades', 'que_tal', C05),

  raw('s03', 'Template padrão de entrega — qualidade consistente', 'que_bom', C06),
  raw('s05', 'Pair programming nas tarefas críticas — menos bugs', 'que_bom', C07),
  raw('s09', 'Documentação no Confluence — menos retrabalho', 'que_bom', C07),
  raw('s12', 'Falta de critério de pronto — retrabalho frequente', 'que_pena', C06),
  raw('s29', 'Banco de conhecimento por tema — self-service', 'que_tal', C16),

  raw('s07', 'Feedback quinzenal 1:1 — time mais engajado', 'que_bom', C08),
  raw('s10', 'Ritual de celebração de entregas — moral do time alto', 'que_bom', C09),
  raw('s16', 'Dependência de uma pessoa — risco operacional', 'que_pena', C08),
  raw('s17', 'Onboarding lento — 2 meses pra produzir', 'que_pena', C09),
  raw('s26', 'Rodízio de papéis no time — reduzir dependência', 'que_tal', C10),

  raw('s18', 'Escopo muda sem repriorizar — time sobrecarregado', 'que_pena', C11),
  raw('s19', 'Prioridades conflitantes — diretoria vs operação', 'que_pena', C12),
  raw('s22', 'Critérios claros de urgência — matriz impacto x esforço', 'que_tal', C11),
  raw('s27', 'Revisão trimestral de processos — operação e liderança', 'que_tal', C12),

  raw('s04', 'Automação do relatório mensal — ganho de 4h/semana', 'que_bom', C13),
  raw('s08', 'Dashboard de indicadores — visibilidade para diretoria', 'que_bom', C13),
  raw('s20', 'Indicadores desatualizados — decisão no feeling', 'que_pena', C13),
  raw('s30', 'Pesquisa rápida de saúde do time — mensal', 'que_tal', C14),
]

const SIM_CLUSTERS: Cluster[] = [
  cluster(C01, 'Daily e reuniões com pauta — PM · TI', 'Rituais', 'PM', 'TI', 'quick-wins', 'Helena (PM)', 'Carlos (GM)', '2026-04-01'),
  cluster(C02, 'Sprint planning enxuto + quadro de prioridades — PM · TI', 'Rituais', 'PM', 'TI', 'quick-wins', 'Helena (PM)', 'Gabriel (Dev)', '2026-04-08'),
  cluster(C03, 'Janela de foco sem reunião — PM · RH', 'Rituais', 'PM', 'RH', 'fill-in', 'Beatriz (Coord.)', 'Helena (PM)', '2026-05-01'),
  cluster(C15, 'Ritual de lições aprendidas — GM · RH', 'Rituais', 'GM', 'RH', 'fill-in', 'Carlos (GM)', 'Beatriz (Coord.)', '2026-05-10'),

  cluster(C04, 'Handoff e checkpoint entre times — Comunicação · TI', 'Comunicação', 'Comunicação Corporativa', 'TI', 'quick-wins', 'Fernanda (Ops)', 'Helena (PM)', '2026-03-25'),
  cluster(C05, 'Canais com liderança e clientes internos — Comunicação · Corporativo', 'Comunicação', 'Comunicação Corporativa', 'Corporativo', 'quick-wins', 'Ana (Diretora)', 'Fernanda (Ops)', '2026-03-28'),

  cluster(C06, 'Critério de pronto e template de entrega — Tech Lead · TI', 'Desenvolvimento', 'Tech Lead', 'TI', 'major', 'Gabriel (Dev)', 'Juliana (QA)', '2026-05-15'),
  cluster(C07, 'Pair programming e documentação — Tech Lead · TI', 'Desenvolvimento', 'Tech Lead', 'TI', 'major', 'Gabriel (Dev)', 'Tech Lead', '2026-05-20'),
  cluster(C16, 'Banco de conhecimento self-service — PM · TI', 'Desenvolvimento', 'PM', 'TI', 'fill-in', 'Helena (PM)', 'Gabriel (Dev)', '2026-06-01'),

  cluster(C08, '1:1 e redução de dependência de pessoa — GM · RH', 'Pessoas', 'GM', 'RH', 'major', 'Carlos (Gerente)', 'Beatriz (Coord.)', '2026-05-01'),
  cluster(C09, 'Onboarding acelerado e celebrações — GM · RH', 'Pessoas', 'GM', 'RH', 'quick-wins', 'Beatriz (Coord.)', 'Carlos (GM)', '2026-04-15'),
  cluster(C10, 'Rodízio de papéis no time técnico — GM · TI', 'Pessoas', 'GM', 'TI', 'reconsider', 'Carlos (GM)', 'Gabriel (Dev)', '2026-06-15'),

  cluster(C11, 'Critérios de urgência e gestão de escopo — PMO · Geral', 'Governança', 'PMO', 'Geral', 'quick-wins', 'Ana (Diretora)', 'Diego (Analista)', '2026-04-05'),
  cluster(C12, 'Alinhar prioridades diretoria vs operação — PMO · Corporativo', 'Governança', 'PMO', 'Corporativo', 'major', 'Ana (Diretora)', 'Helena (PM)', '2026-05-05'),

  cluster(C13, 'Dashboard e automação de relatórios — PMO · TI', 'Indicadores', 'PMO', 'TI', 'fill-in', 'Diego (Analista)', 'Gabriel (Dev)', '2026-05-20'),
  cluster(C14, 'Pesquisa de saúde do time — PMO · RH', 'Indicadores', 'PMO', 'RH', 'quick-wins', 'Diego (Analista)', 'Beatriz (Coord.)', '2026-04-20'),
]

export function getSimulationState(startStep: 1 | 2 | 3 | 4 | 5 = 1): SessionState {
  return {
    teamName: 'Time de Produto e Operações',
    date: new Date().toISOString().split('T')[0],
    items: SIM_ITEMS.map((i) => ({ ...i })),
    clusters: SIM_CLUSTERS.map((c) => {
      const sample = SIM_ITEMS.find((i) => i.clusterId === c.id)
      return { ...c, category: sample?.category ?? c.category ?? 'que_tal' }
    }),
    currentStep: startStep,
  }
}
