import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import { createApp } from './createApp'
import { loadEnvFile } from './env'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT) || 3000

loadEnvFile()

const app = createApp()
const distPath = path.join(__dirname, '..', 'dist')

if (existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next()
    res.sendFile(path.join(distPath, 'index.html'))
  })
} else {
  console.warn('Pasta dist/ não encontrada — rode npm run build antes de npm start')
}

app.listen(PORT, () => {
  const vision = process.env.ANTHROPIC_API_KEY ? 'Claude Opus ativo' : 'sem ANTHROPIC_API_KEY'
  console.log(`Dinâmica: http://localhost:${PORT} — API + app (${vision})`)
})
