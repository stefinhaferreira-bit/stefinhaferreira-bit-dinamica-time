import { createApp } from './createApp'
import { loadEnvFile } from './env'

loadEnvFile()

const app = createApp()
const PORT = Number(process.env.API_PORT) || 3010

app.listen(PORT, () => {
  const vision = process.env.ANTHROPIC_API_KEY ? 'Claude Opus ativo' : 'sem ANTHROPIC_API_KEY (só OCR local)'
  console.log(`API local: http://localhost:${PORT}/api/room/SALA — visão: ${vision}`)
})
