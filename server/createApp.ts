import express, { type Express } from 'express'
import type { SessionState } from '../src/types'
import {
  activeParticipants,
  defaultSessionState,
  getOrCreateRoom,
  mergeSessionState,
  pruneParticipants,
  saveRoom,
  touchParticipant,
} from '../api/lib/roomStore'
import { analyzeImageWithOpus, type BoardLayout } from '../api/lib/visionAnalyze'

export async function handleRoom(
  roomId: string,
  method: string,
  body: Record<string, unknown> = {}
) {
  const id = roomId.trim().toUpperCase()
  if (!id) throw new Error('Código da sala inválido')

  if (method === 'GET') {
    const room = pruneParticipants(await getOrCreateRoom(id))
    await saveRoom(id, room)
    return { state: room.state, participants: activeParticipants(room.participants) }
  }

  const action = String(body.action ?? '')
  let room = await getOrCreateRoom(id)

  switch (action) {
    case 'join': {
      const participantId = String(body.participantId ?? '')
      const name = String(body.name ?? '').trim()
      if (!participantId || !name) throw new Error('participantId e name são obrigatórios')
      room = touchParticipant(room, participantId, name)
      break
    }
    case 'sync': {
      const participantId = String(body.participantId ?? '')
      const name = String(body.name ?? '').trim()
      if (participantId && name) room = touchParticipant(room, participantId, name)
      room = pruneParticipants(room)
      break
    }
    case 'update': {
      const nextState = body.state as SessionState
      if (!nextState) throw new Error('state é obrigatório')
      room = await getOrCreateRoom(id)
      room = { ...room, state: mergeSessionState(room.state, nextState) }
      const participantId = String(body.participantId ?? '')
      const name = String(body.name ?? '').trim()
      if (participantId && name) room = touchParticipant(room, participantId, name)
      break
    }
    case 'reset':
      room = { ...room, state: defaultSessionState() }
      break
    default:
      throw new Error('action inválida')
  }

  await saveRoom(id, room)
  return { state: room.state, participants: activeParticipants(room.participants) }
}

export function createApp(): Express {
  const app = express()
  app.use(express.json({ limit: '15mb' }))

  app.post('/api/vision/analyze', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    try {
      const imageBase64 = String(req.body?.imageBase64 ?? '').trim()
      const mediaType = String(req.body?.mediaType ?? 'image/jpeg')
      const layout = (req.body?.layout as BoardLayout) ?? 'auto'

      if (!imageBase64) {
        return res.status(400).json({ error: 'imageBase64 é obrigatório' })
      }

      const entries = await analyzeImageWithOpus({ imageBase64, mediaType, layout })
      res.json({ entries, source: 'opus' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao analisar imagem'
      res.status(500).json({ error: message })
    }
  })

  app.all('/api/room/:roomId', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    try {
      const data = await handleRoom(req.params.roomId, req.method, req.body ?? {})
      res.json(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno'
      const status = message.includes('inválid') || message.includes('obrigat') ? 400 : 500
      res.status(status).json({ error: message })
    }
  })

  return app
}
