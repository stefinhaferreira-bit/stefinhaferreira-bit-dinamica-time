export type ItemCategory = 'que_bom' | 'que_pena' | 'que_tal'

export type StepNum = 1 | 2 | 3 | 4 | 5

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
  category?: ItemCategory
  papel: string
  area: string
  quadrant: string | null
  responsavel: string
  suporte: string
  prazo: string
}

export interface SessionState {
  teamName: string
  date: string
  items: Item[]
  clusters: Cluster[]
  currentStep: StepNum
}

export interface Participant {
  id: string
  name: string
}
