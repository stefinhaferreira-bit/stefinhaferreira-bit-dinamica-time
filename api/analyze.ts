import type { VercelRequest, VercelResponse } from '@vercel/node'

type ItemCategory = 'que_bom' | 'que_pena' | 'que_tal'
type BoardLayout = 'auto' | 'start-stop-continue' | 'que-bom-pena-tal'

const VALID = new Set<ItemCategory>(['que_bom', 'que_pena', 'que_tal'])

const HINTS: Record<BoardLayout, string> = {
  auto: 'Detecte se o quadro é Iniciar/Parar/Continuar ou Que bom/Que pena/Que tal.',
  'start-stop-continue': 'INÍCIO→que_tal, PARAR→que_pena, CONTINUAR→que_bom.',
  'que-bom-pena-tal': 'Que bom→que_bom, Que pena→que_pena, Que tal→que_tal.',
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada na Vercel' })
  }

  try {
    const imageBase64 = String(req.body?.imageBase64 ?? '').trim()
    const mediaType = String(req.body?.mediaType ?? 'image/jpeg')
    const layout = (req.body?.layout as BoardLayout) ?? 'auto'

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 é obrigatório' })
    }

    const model = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-20250514'
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: imageBase64 },
              },
              {
                type: 'text',
                text: `Extraia post-its de quadro retrospectiva. ${HINTS[layout]} Responda só JSON: {"entries":[{"text":"...","category":"que_bom|que_pena|que_tal"}]}`,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return res.status(500).json({ error: `Claude: ${response.status} ${err.slice(0, 120)}` })
    }

    const data = (await response.json()) as { content?: { type: string; text?: string }[] }
    const text = data.content?.find((c) => c.type === 'text')?.text ?? ''
    const match = text.match(/\{[\s\S]*\}/)
    const entries: { text: string; category: ItemCategory }[] = []

    if (match) {
      const parsed = JSON.parse(match[0]) as { entries?: { text?: string; category?: string }[] }
      for (const item of parsed.entries ?? []) {
        const t = String(item.text ?? '').trim()
        const cat = item.category as ItemCategory
        if (t.length >= 3 && VALID.has(cat)) entries.push({ text: t, category: cat })
      }
    }

    return res.status(200).json({ entries, source: 'opus' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao analisar imagem'
    return res.status(500).json({ error: message })
  }
}
