import type { VercelRequest, VercelResponse } from '@vercel/node'
import { analyzeImageWithOpus, type BoardLayout } from '../lib/visionAnalyze.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const body = req.body ?? {}
    const imageBase64 = String(body.imageBase64 ?? '').trim()
    const mediaType = String(body.mediaType ?? 'image/jpeg')
    const layout = (body.layout as BoardLayout) ?? 'auto'

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 é obrigatório' })
    }

    const entries = await analyzeImageWithOpus({ imageBase64, mediaType, layout })

    return res.status(200).json({ entries, source: 'opus' })
  } catch (error) {
    console.error('vision analyze error', error)
    const message = error instanceof Error ? error.message : 'Erro ao analisar imagem'
    return res.status(500).json({ error: message })
  }
}
