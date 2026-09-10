/** @deprecated Use `npm run dev` ou `npm start` (server/serve.ts). Este servidor Socket.io não tem /api/room. */
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { SessionState } from '../src/types.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT) || 3001

interface Participant {
  id: string
  name: string
}

interface Room {
  state: SessionState
  participants: Map<string, Participant>
}

const defaultState = (): SessionState => ({
  teamName: '',
  date: new Date().toISOString().split('T')[0],
  items: [],
  clusters: [],
  currentStep: 1,
})

const rooms = new Map<string, Room>()

function getOrCreateRoom(roomId: string): Room {
  const id = roomId.toUpperCase()
  if (!rooms.has(id)) {
    rooms.set(id, { state: defaultState(), participants: new Map() })
  }
  return rooms.get(id)!
}

function broadcastParticipants(io: Server, roomId: string) {
  const room = rooms.get(roomId)
  if (!room) return
  io.to(roomId).emit('participants', Array.from(room.participants.values()))
}

const app = express()
app.use(cors())

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*' },
})

io.on('connection', (socket) => {
  socket.on('join', ({ room, name, participantId }: {
    room: string
    name: string
    participantId?: string
  }) => {
    if (!room?.trim() || !name?.trim()) return

    const roomId = room.trim().toUpperCase()
    const roomData = getOrCreateRoom(roomId)
    const pid = participantId || socket.id

    roomData.participants.set(pid, { id: pid, name: name.trim() })
    socket.join(roomId)
    socket.data.participantId = pid
    socket.data.roomId = roomId

    broadcastParticipants(io, roomId)
    socket.emit('sync', roomData.state)
  })

  socket.on('update', (state: SessionState) => {
    const rid = socket.data.roomId as string | undefined
    if (!rid) return
    const roomData = rooms.get(rid)
    if (!roomData) return
    roomData.state = state
    socket.to(rid).emit('sync', state)
  })

  socket.on('reset', () => {
    const rid = socket.data.roomId as string | undefined
    if (!rid) return
    const roomData = rooms.get(rid)
    if (!roomData) return
    roomData.state = defaultState()
    io.to(rid).emit('sync', roomData.state)
  })

  socket.on('disconnect', () => {
    const rid = socket.data.roomId as string | undefined
    const pid = socket.data.participantId as string | undefined
    if (!rid || !pid) return
    const roomData = rooms.get(rid)
    if (!roomData) return
    roomData.participants.delete(pid)
    broadcastParticipants(io, rid)
  })
})

const distPath = path.join(__dirname, '..', 'dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

httpServer.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})
