import { Redis } from '@upstash/redis'
import type { Participant, SessionState, StepNum } from '../../src/types.js'

export interface RoomParticipant {
  id: string
  name: string
  lastSeen: number
}

export interface RoomData {
  state: SessionState
  participants: Record<string, RoomParticipant>
}

const memory = new Map<string, RoomData>()

export function defaultSessionState(): SessionState {
  return {
    teamName: '',
    date: new Date().toISOString().split('T')[0],
    items: [],
    clusters: [],
    currentStep: 1,
  }
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

function roomKey(roomId: string): string {
  return `dinamica:room:${roomId.toUpperCase()}`
}

export async function getRoom(roomId: string): Promise<RoomData | null> {
  const key = roomKey(roomId)
  const redis = getRedis()
  if (redis) {
    return (await redis.get<RoomData>(key)) ?? null
  }
  return memory.get(key) ?? null
}

export async function saveRoom(roomId: string, data: RoomData): Promise<void> {
  const key = roomKey(roomId)
  const redis = getRedis()
  if (redis) {
    await redis.set(key, data, { ex: 60 * 60 * 24 })
  } else {
    memory.set(key, data)
  }
}

export async function getOrCreateRoom(roomId: string): Promise<RoomData> {
  const existing = await getRoom(roomId)
  if (existing) return existing
  const fresh: RoomData = { state: defaultSessionState(), participants: {} }
  await saveRoom(roomId, fresh)
  return fresh
}

function mergeById<T extends { id: string }>(current: T[], incoming: T[]): T[] {
  const map = new Map(current.map((entry) => [entry.id, entry]))
  for (const entry of incoming) map.set(entry.id, entry)
  return Array.from(map.values())
}

export function mergeSessionState(current: SessionState, incoming: SessionState): SessionState {
  const items = mergeById(current.items, incoming.items)
  const clusters = mergeById(current.clusters, incoming.clusters)

  return {
    teamName: incoming.teamName.trim() ? incoming.teamName : current.teamName,
    date: incoming.date.trim() ? incoming.date : current.date,
    items,
    clusters,
    currentStep: Math.max(current.currentStep, incoming.currentStep) as StepNum,
  }
}

export function activeParticipants(
  participants: Record<string, RoomParticipant>
): Participant[] {
  const cutoff = Date.now() - 90_000
  return Object.values(participants)
    .filter((p) => p.lastSeen >= cutoff)
    .map((p) => ({ id: p.id, name: p.name }))
}

export function touchParticipant(
  room: RoomData,
  participantId: string,
  name: string
): RoomData {
  return {
    ...room,
    participants: {
      ...room.participants,
      [participantId]: { id: participantId, name, lastSeen: Date.now() },
    },
  }
}

export function pruneParticipants(room: RoomData): RoomData {
  const cutoff = Date.now() - 90_000
  const participants: Record<string, RoomParticipant> = {}
  for (const [id, p] of Object.entries(room.participants)) {
    if (p.lastSeen >= cutoff) participants[id] = p
  }
  return { ...room, participants }
}
