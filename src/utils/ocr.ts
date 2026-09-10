import type { ItemCategory } from '../types'

export interface OcrEntry {
  text: string
  category: ItemCategory
}

export type BoardLayout = 'auto' | 'start-stop-continue' | 'que-bom-pena-tal'

const COLUMN_HEADERS: { pattern: RegExp; category: ItemCategory }[] = [
  { pattern: /^(in[ií]cio|iniciar|start)\b/i, category: 'que_tal' },
  { pattern: /^(parar|stop)\b/i, category: 'que_pena' },
  { pattern: /^(continuar|continue)\b/i, category: 'que_bom' },
  { pattern: /^que\s*bom\b/i, category: 'que_bom' },
  { pattern: /^que\s*pena/i, category: 'que_pena' },
  { pattern: /^que\s*tal/i, category: 'que_tal' },
]

const LAYOUT_COLUMNS: Record<Exclude<BoardLayout, 'auto'>, ItemCategory[]> = {
  'start-stop-continue': ['que_tal', 'que_pena', 'que_bom'],
  'que-bom-pena-tal': ['que_bom', 'que_pena', 'que_tal'],
}

const NOISE_PATTERNS = [
  /iniciar.*parar.*continuar/i,
  /^use o modelo/i,
  /retrospectiva/i,
  /examinar o que a equipe/i,
  /melhoria cont[ií]nua/i,
  /refletir sobre/i,
  /áreas de altera/i,
  /eficaz de refletir/i,
  /^modelo\b/i,
]

function normalizeLine(raw: string): string {
  return raw
    .trim()
    .replace(/^[|\\/\-•*·►▸]+\s*/, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/[|]/g, 'l')
    .replace(/\bl\b/g, 'i')
}

function isNoiseLine(line: string): boolean {
  if (line.length < 4) return true
  if (/^[\d\s.,:;()]+$/.test(line)) return true
  if (NOISE_PATTERNS.some((p) => p.test(line))) return true
  if (line.length > 120) return true
  if (isAuthorLine(line)) return true
  return false
}

function isAuthorLine(line: string): boolean {
  const trimmed = line.trim()
  if (!/^[A-ZÀ-Ú][a-zà-ú]+(\s+[A-ZÀ-Ú][a-zà-ú]+){1,2}$/.test(trimmed)) return false
  if (trimmed.length > 45) return false
  if (/ritual|nao|não|equipe|devops|transpar|visib|pasta|retro|prio|alinhar/i.test(trimmed)) return false
  return true
}

function detectColumnHeader(line: string): ItemCategory | null {
  for (const { pattern, category } of COLUMN_HEADERS) {
    if (pattern.test(line)) return category
  }
  return null
}

export function guessCategoryFromText(text: string): ItemCategory {
  const t = text.toLowerCase()
  if (/^nao |não |parar |deixar de /i.test(text)) return 'que_pena'
  if (/ritual|retro|priori|planejamento|começar|iniciar/i.test(t)) return 'que_tal'
  if (/visib|transpar|organiz|continuar|manter|funciona/i.test(t)) return 'que_bom'
  return 'que_tal'
}

export function parseOcrToEntries(text: string): OcrEntry[] {
  const entries: OcrEntry[] = []
  const seen = new Set<string>()
  let currentCategory: ItemCategory | null = null

  for (const raw of text.split(/\r?\n/)) {
    const line = normalizeLine(raw)
    if (isNoiseLine(line)) continue

    const header = detectColumnHeader(line)
    if (header && line.length < 25) {
      currentCategory = header
      continue
    }

    const category = currentCategory ?? guessCategoryFromText(line)
    const key = `${category}|${line.toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    entries.push({ text: line, category })
  }

  return entries
}

export function parseOcrLines(text: string): string[] {
  return parseOcrToEntries(text).map((e) => e.text)
}

function detectLayoutFromText(text: string): Exclude<BoardLayout, 'auto'> {
  const t = text.toLowerCase()
  if (/in[ií]cio|iniciar|parar|continuar/.test(t) && /parar/.test(t)) {
    return 'start-stop-continue'
  }
  if (/que\s*bom|que\s*pena|que\s*tal/.test(t)) {
    return 'que-bom-pena-tal'
  }
  return 'start-stop-continue'
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = reject
    img.src = url
  })
}

async function cropToFile(
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  name: string
): Promise<File> {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.floor(w))
  canvas.height = Math.max(1, Math.floor(h))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas não disponível')
  ctx.drawImage(img, x, y, w, h, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Falha ao recortar'))), 'image/png')
  })
  return new File([blob], name, { type: 'image/png' })
}

async function recognizeText(
  file: File,
  onProgress?: (progress: number, fileName: string) => void
): Promise<string> {
  if (!import.meta.env.DEV) return ''

  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('por', 1, {
    logger: (message) => {
      if (message.status === 'recognizing text' && onProgress) {
        onProgress(message.progress, file.name)
      }
    },
  })
  try {
    const { data: { text } } = await worker.recognize(file)
    return text
  } finally {
    await worker.terminate()
  }
}

async function ocrByColumns(
  file: File,
  layout: Exclude<BoardLayout, 'auto'>,
  onProgress?: (progress: number, fileName: string) => void
): Promise<OcrEntry[]> {
  const img = await loadImageFromFile(file)
  const categories = LAYOUT_COLUMNS[layout]
  const topSkip = Math.floor(img.height * 0.22)
  const cropH = img.height - topSkip
  const colW = img.width / 3
  const entries: OcrEntry[] = []
  const seen = new Set<string>()

  for (let i = 0; i < 3; i++) {
    const crop = await cropToFile(
      img,
      colW * i,
      topSkip,
      colW,
      cropH,
      `col-${i}-${file.name}`
    )
    const text = await recognizeText(crop, onProgress)
    const category = categories[i]

    for (const raw of text.split(/\r?\n/)) {
      const line = normalizeLine(raw)
      if (isNoiseLine(line)) continue
      if (detectColumnHeader(line) && line.length < 25) continue

      const key = `${category}|${line.toLowerCase()}`
      if (seen.has(key)) continue
      seen.add(key)
      entries.push({ text: line, category })
    }
  }

  return entries
}

async function fileToBase64(file: File): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const match = result.match(/^data:([^;]+);base64,(.+)$/)
      if (!match) {
        reject(new Error('Falha ao ler imagem'))
        return
      }
      resolve({ mediaType: match[1], base64: match[2] })
    }
    reader.onerror = () => reject(reader.error ?? new Error('Falha ao ler imagem'))
    reader.readAsDataURL(file)
  })
}

async function analyzeImageWithOpus(
  file: File,
  layout: BoardLayout,
  onProgress?: (progress: number, fileName: string) => void
): Promise<OcrEntry[]> {
  onProgress?.(0.1, file.name)
  const { base64, mediaType } = await fileToBase64(file)
  onProgress?.(0.25, file.name)

  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: base64, mediaType, layout }),
  })

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error ?? `Vision API ${response.status}`)
  }

  const data = (await response.json()) as { entries?: OcrEntry[] }
  onProgress?.(1, file.name)
  return data.entries ?? []
}

export async function extractEntriesFromImage(
  file: File,
  layout: BoardLayout = 'auto',
  onProgress?: (progress: number, fileName: string) => void
): Promise<OcrEntry[]> {
  try {
    const opusEntries = await analyzeImageWithOpus(file, layout, onProgress)
    if (opusEntries.length > 0) return opusEntries
  } catch (error) {
    console.warn('Claude Opus indisponível, usando OCR local:', error)
  }

  let previewText = ''

  if (layout === 'auto') {
    previewText = await recognizeText(file, (pct, name) => onProgress?.(pct, name))
  }

  const layoutForColumns: Exclude<BoardLayout, 'auto'> =
    layout === 'auto'
      ? detectLayoutFromText(previewText)
      : (layout as Exclude<BoardLayout, 'auto'>)

  const columnEntries = await ocrByColumns(file, layoutForColumns, onProgress)
  if (columnEntries.length >= 3) return columnEntries

  if (!previewText) previewText = await recognizeText(file, onProgress)
  const textEntries = parseOcrToEntries(previewText)
  if (textEntries.length > columnEntries.length) return textEntries

  return columnEntries.length > 0 ? columnEntries : textEntries
}

export async function extractLinesFromImage(
  file: File,
  onProgress?: (progress: number, fileName: string) => void
): Promise<string[]> {
  const entries = await extractEntriesFromImage(file, 'auto', onProgress)
  return entries.map((e) => e.text)
}
