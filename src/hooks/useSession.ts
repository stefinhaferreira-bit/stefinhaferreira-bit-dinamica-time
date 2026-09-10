import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  Cluster,
  ItemCategory,
  JoinInfo,
  OrgArea,
  OrgRole,
  Participant,
  Quadrant,
  SessionState,
  StepNum,
} from '../types'
import { autoConsolidateItems, createCluster, createItem } from '../types'

const defaultState: SessionState = {
  teamName: '',
  date: new Date().toISOString().split('T')[0],
  items: [],
  clusters: [],
  currentStep: 1,
}

const JOIN_KEY = 'dinamica-join-info'
const POLL_MS = 2000

interface RoomResponse {
  state: SessionState
  participants: Participant[]
}

function roomUrl(roomId: string): string {
  return `/api/room/${encodeURIComponent(roomId)}`
}

async function roomRequest(
  roomId: string,
  body?: Record<string, unknown>
): Promise<RoomResponse> {
  let res: Response
  try {
    res = await fetch(roomUrl(roomId), {
      method: body ? 'POST' : 'GET',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error(
      'Não foi possível contactar a API. Rode npm run dev (ou npm start após build) e abra http://localhost:3000.'
    )
  }

  const raw = await res.text()
  if (raw.trim().startsWith('<!')) {
    throw new Error(
      'A API não está ativa neste endereço. Use npm run dev e abra http://localhost:3000 (não use só o Vite nem o servidor antigo da porta 3001).'
    )
  }

  let data: RoomResponse | { error?: string }
  try {
    data = JSON.parse(raw) as RoomResponse | { error?: string }
  } catch {
    throw new Error('Resposta inválida do servidor. Verifique se a API /api/room está rodando.')
  }

  if (!res.ok) {
    const err = data as { error?: string }
    throw new Error(err.error ?? 'Falha na sincronização')
  }

  return data as RoomResponse
}

export function loadJoinInfo(): JoinInfo | null {
  try {
    const params = new URLSearchParams(window.location.search)
    const roomFromUrl = params.get('sala')
    const stored = localStorage.getItem(JOIN_KEY)
    if (!stored) return null
    const info = JSON.parse(stored) as JoinInfo
    if (roomFromUrl && roomFromUrl.toUpperCase() !== info.roomId) {
      return { ...info, roomId: roomFromUrl.toUpperCase() }
    }
    return info
  } catch {
    return null
  }
}

export function saveJoinInfo(info: JoinInfo) {
  localStorage.setItem(JOIN_KEY, JSON.stringify(info))
  const url = new URL(window.location.href)
  url.searchParams.set('sala', info.roomId)
  window.history.replaceState({}, '', url.toString())
}

export function clearJoinInfo() {
  localStorage.removeItem(JOIN_KEY)
  const url = new URL(window.location.href)
  url.searchParams.delete('sala')
  window.history.replaceState({}, '', url.toString())
}

export function useSession(joinInfo: JoinInfo) {
  const [state, setState] = useState<SessionState>(defaultState)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [connected, setConnected] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const isRemoteUpdate = useRef(false)
  const isPushing = useRef(false)
  const pendingPushes = useRef(0)
  const latestPushId = useRef(0)
  const joinInfoRef = useRef(joinInfo)
  joinInfoRef.current = joinInfo

  const applyRoom = useCallback((data: RoomResponse) => {
    if (!isPushing.current) {
      isRemoteUpdate.current = true
      setState(data.state)
    }
    setParticipants(data.participants)
    setConnected(true)
    setSyncError(null)
  }, [])

  useEffect(() => {
    let active = true
    let timer: ReturnType<typeof setInterval> | null = null

    const { roomId, participantId, participantName } = joinInfoRef.current

    const bootstrap = async () => {
      try {
        const data = await roomRequest(roomId, {
          action: 'join',
          participantId,
          name: participantName,
        })
        if (active) applyRoom(data)
      } catch {
        if (active) {
          setConnected(false)
          setSyncError(
            'Sem conexão com o servidor. Todos precisam abrir o MESMO link (não use localhost em máquinas diferentes).'
          )
        }
      }
    }

    const poll = async () => {
      if (document.hidden || isPushing.current) return
      try {
        const data = await roomRequest(roomId, {
          action: 'sync',
          participantId,
          name: participantName,
        })
        if (active) applyRoom(data)
      } catch {
        if (active) {
          setConnected(false)
          setSyncError(
            'Sem conexão com o servidor. Todos precisam abrir o MESMO link (não use localhost em máquinas diferentes).'
          )
        }
      }
    }

    bootstrap()
    timer = setInterval(poll, POLL_MS)

    return () => {
      active = false
      if (timer) clearInterval(timer)
    }
  }, [joinInfo.roomId, joinInfo.participantId, joinInfo.participantName, applyRoom])

  const pushState = useCallback(
    async (next: SessionState) => {
      const { roomId, participantId, participantName } = joinInfoRef.current
      const pushId = ++latestPushId.current
      pendingPushes.current++
      isPushing.current = true
      try {
        const data = await roomRequest(roomId, {
          action: 'update',
          state: next,
          participantId,
          name: participantName,
        })
        // Ignora respostas antigas se o usuário já fez outra alteração
        if (pushId === latestPushId.current) {
          applyRoom(data)
        }
      } catch {
        setConnected(false)
        setSyncError('Falha ao salvar. Verifique se todos usam o mesmo link da sala.')
      } finally {
        pendingPushes.current = Math.max(0, pendingPushes.current - 1)
        if (pendingPushes.current === 0) {
          isPushing.current = false
        }
        isRemoteUpdate.current = false
      }
    },
    [applyRoom]
  )

  const updateState = useCallback(
    (updater: (prev: SessionState) => SessionState) => {
      setState((prev) => {
        const next = updater(prev)
        if (!isRemoteUpdate.current) {
          isPushing.current = true
          void pushState(next)
        }
        isRemoteUpdate.current = false
        return next
      })
    },
    [pushState]
  )

  const setTeamName = useCallback(
    (name: string) => updateState((s) => ({ ...s, teamName: name })),
    [updateState]
  )

  const setDate = useCallback(
    (date: string) => updateState((s) => ({ ...s, date })),
    [updateState]
  )

  const addItem = useCallback(
    (text: string, category: ItemCategory) => {
      const trimmed = text.trim()
      if (!trimmed) return
      updateState((s) => ({
        ...s,
        items: [...s.items, createItem(trimmed, category)],
      }))
    },
    [updateState]
  )

  const bulkAddItems = useCallback(
    (entries: { text: string; category: ItemCategory }[]) => {
      const newItems = entries
        .map((e) => ({ text: e.text.trim(), category: e.category }))
        .filter((e) => e.text.length >= 3)
        .map((e) => createItem(e.text, e.category))
      if (newItems.length === 0) return
      updateState((s) => ({
        ...s,
        items: [...s.items, ...newItems],
      }))
    },
    [updateState]
  )

  const removeItem = useCallback(
    (id: string) =>
      updateState((s) => ({ ...s, items: s.items.filter((i) => i.id !== id) })),
    [updateState]
  )

  const createNewCluster = useCallback(
    (title: string, tag: string, papel: OrgRole, area: OrgArea = 'Geral') =>
      updateState((s) => ({
        ...s,
        clusters: [...s.clusters, createCluster(title, tag, papel, area)],
      })),
    [updateState]
  )

  const updateCluster = useCallback(
    (id: string, field: keyof Cluster, value: string) =>
      updateState((s) => ({
        ...s,
        clusters: s.clusters.map((c) => {
          if (c.id !== id) return c
          if (field === 'papel') return { ...c, papel: value as OrgRole }
          if (field === 'area') return { ...c, area: value as OrgArea }
          if (field === 'quadrant') return { ...c, quadrant: value as Quadrant | null }
          return { ...c, [field]: value }
        }),
      })),
    [updateState]
  )

  const deleteCluster = useCallback(
    (id: string) =>
      updateState((s) => ({
        ...s,
        clusters: s.clusters.filter((c) => c.id !== id),
        items: s.items.map((i) => (i.clusterId === id ? { ...i, clusterId: null } : i)),
      })),
    [updateState]
  )

  const assignToCluster = useCallback(
    (itemId: string, clusterId: string | null) =>
      updateState((s) => ({
        ...s,
        items: s.items.map((i) => (i.id === itemId ? { ...i, clusterId } : i)),
      })),
    [updateState]
  )

  const setClusterQuadrant = useCallback(
    (id: string, quadrant: Quadrant | null) =>
      updateState((s) => ({
        ...s,
        clusters: s.clusters.map((c) => (c.id === id ? { ...c, quadrant } : c)),
      })),
    [updateState]
  )

  const setStep = useCallback(
    (step: StepNum) => updateState((s) => ({ ...s, currentStep: step })),
    [updateState]
  )

  const resetSession = useCallback(() => {
    void roomRequest(joinInfoRef.current.roomId, { action: 'reset' }).then(applyRoom)
    setState(defaultState)
  }, [applyRoom])

  const autoConsolidate = useCallback(() => {
    updateState((s) => {
      const { clusters: suggested, updatedItems } = autoConsolidateItems(s.items)
      let clusters = [...s.clusters]
      let items = updatedItems

      for (const newC of suggested) {
        const existing = clusters.find(
          (c) => c.tag === newC.tag && c.papel === newC.papel && c.area === newC.area
        )
        if (existing) {
          items = items.map((i) =>
            i.clusterId === newC.id ? { ...i, clusterId: existing.id } : i
          )
        } else {
          clusters.push(newC)
        }
      }

      return { ...s, items, clusters }
    })
  }, [updateState])

  const loadSimulation = useCallback(
    (simState: SessionState) => {
      setState(simState)
      void pushState(simState)
    },
    [pushState]
  )

  const shareUrl = `${window.location.origin}${window.location.pathname}?sala=${joinInfo.roomId}`

  return {
    state,
    participants,
    connected,
    syncError,
    shareUrl,
    roomId: joinInfo.roomId,
    setTeamName,
    setDate,
    addItem,
    bulkAddItems,
    removeItem,
    createNewCluster,
    updateCluster,
    deleteCluster,
    assignToCluster,
    setClusterQuadrant,
    setStep,
    resetSession,
    autoConsolidate,
    loadSimulation,
  }
}
