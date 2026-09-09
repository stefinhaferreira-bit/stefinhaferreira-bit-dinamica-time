import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { SessionState } from '../../src/types.js'
import {
  activeParticipants,
  defaultSessionState,
  getOrCreateRoom,
  pruneParticipants,
  saveRoom,
  touchParticipant,
} from '../lib/roomStore.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const roomId = String(req.query.roomId ?? '').trim().toUpperCase()
  if (!roomId) {
    return res.status(400).json({ error: 'Código da sala inválido' })
  }

  try {
    if (req.method === 'GET') {
      const room = pruneParticipants(await getOrCreateRoom(roomId))
      await saveRoom(roomId, room)
      return res.status(200).json({
        state: room.state,
        participants: activeParticipants(room.participants),
      })
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' })
    }

    const body = req.body ?? {}
    const action = body.action as string
    let room = await getOrCreateRoom(roomId)

    switch (action) {
      case 'join': {
        const participantId = String(body.participantId ?? '')
        const name = String(body.name ?? '').trim()
        if (!participantId || !name) {
          return res.status(400).json({ error: 'participantId e name são obrigatórios' })
        }
        room = touchParticipant(room, participantId, name)
        break
      }
      case 'sync': {
        const participantId = String(body.participantId ?? '')
        const name = String(body.name ?? '').trim()
        if (participantId && name) {
          room = touchParticipant(room, participantId, name)
        }
        room = pruneParticipants(room)
        break
      }
      case 'update': {
        const nextState = body.state as SessionState
        if (!nextState) {
          return res.status(400).json({ error: 'state é obrigatório' })
        }
        room = { ...room, state: nextState }
        const participantId = String(body.participantId ?? '')
        const name = String(body.name ?? '').trim()
        if (participantId && name) {
          room = touchParticipant(room, participantId, name)
        }
        break
      }
      case 'reset': {
        room = { ...room, state: defaultSessionState() }
        break
      }
      default:
        return res.status(400).json({ error: 'action inválida' })
    }

    await saveRoom(roomId, room)

    return res.status(200).json({
      state: room.state,
      participants: activeParticipants(room.participants),
    })
  } catch (error) {
    console.error('room api error', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
