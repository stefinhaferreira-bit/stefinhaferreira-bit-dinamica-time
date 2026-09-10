import type { ItemCategory } from '../../src/types.js'

export type BoardLayout = 'auto' | 'start-stop-continue' | 'que-bom-pena-tal'

export interface VisionEntry {
  text: string
  category: ItemCategory
}

export interface VisionAnalyzeInput {
  imageBase64: string
  mediaType: string
  layout?: BoardLayout
}

const VALID_CATEGORIES = new Set<ItemCategory>(['que_bom', 'que_pena', 'que_tal'])

const LAYOUT_HINT: Record<BoardLayout, string> = {
  auto: 'Detecte se o quadro é Iniciar/Parar/Continuar ou Que bom/Que pena/Que tal.',
  'start-stop-continue':
    'Colunas: INÍCIO/INICIAR → que_tal, PARAR → que_pena, CONTINUAR → que_bom.',
  'que-bom-pena-tal':
    'Colunas: Que bom → que_bom, Que pena → que_pena, Que tal → que_tal.',
}

function buildPrompt(layout: BoardLayout): string {
  return `Você analisa fotos de quadros de retrospectiva/dinâmica de time com post-its em 3 colunas.

${LAYOUT_HINT[layout]}

Extraia SOMENTE o texto dos post-its (cartões), um item por post-it.
IGNORE: título do quadro, texto explicativo, nomes de autores (ex. Stefani Ferreira), ícones, UI do Miro/Teams.

Corrija levemente erros óbvios de OCR (ex.: "visibildide" → "visibilidade") mantendo o sentido original.

Responda APENAS com JSON válido, sem markdown:
{"entries":[{"text":"texto do post-it","category":"que_bom|que_pena|que_tal"}]}

Use exatamente as categorias: que_bom, que_pena, que_tal.`
}

function parseVisionResponse(raw: string): VisionEntry[] {
  const trimmed = raw.trim()
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return []

  const parsed = JSON.parse(jsonMatch[0]) as { entries?: { text?: string; category?: string }[] }
  if (!Array.isArray(parsed.entries)) return []

  const seen = new Set<string>()
  const entries: VisionEntry[] = []

  for (const item of parsed.entries) {
    const text = String(item.text ?? '').trim()
    const category = item.category as ItemCategory
    if (text.length < 3) continue
    if (!VALID_CATEGORIES.has(category)) continue
    const key = `${category}|${text.toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    entries.push({ text, category })
  }

  return entries
}

export async function analyzeImageWithOpus(input: VisionAnalyzeInput): Promise<VisionEntry[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY não configurada')
  }

  const model = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-20250514'
  const layout = input.layout ?? 'auto'
  const mediaType = input.mediaType || 'image/jpeg'

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
              source: {
                type: 'base64',
                media_type: mediaType,
                data: input.imageBase64,
              },
            },
            {
              type: 'text',
              text: buildPrompt(layout),
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Claude Opus: ${response.status} — ${err.slice(0, 200)}`)
  }

  const data = (await response.json()) as {
    content?: { type: string; text?: string }[]
  }

  const textBlock = data.content?.find((c) => c.type === 'text')
  if (!textBlock?.text) return []

  return parseVisionResponse(textBlock.text)
}
