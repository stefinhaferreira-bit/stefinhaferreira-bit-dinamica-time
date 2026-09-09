import type { Item } from '../types'
import { CATEGORY_CONFIG, type ItemCategory } from '../types'

function escapeCsvCell(value: string): string {
  if (/[;"\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function splitPostIt(text: string): { oQue: string; complemento: string } {
  const parts = text.split('—')
  if (parts.length < 2) return { oQue: text.trim(), complemento: '' }
  return {
    oQue: parts[0]?.trim() ?? '',
    complemento: parts.slice(1).join('—').trim(),
  }
}

export function downloadCsv(filename: string, rows: string[][]): void {
  const BOM = '\uFEFF'
  const body = rows.map((row) => row.map(escapeCsvCell).join(';')).join('\r\n')
  const blob = new Blob([BOM + body], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportColetaToExcel(
  items: Item[],
  meta: { teamName: string; date: string; roomId: string }
): void {
  const sorted = [...items].sort((a, b) => {
    const order: ItemCategory[] = ['que_bom', 'que_pena', 'que_tal']
    const catDiff = order.indexOf(a.category) - order.indexOf(b.category)
    if (catDiff !== 0) return catDiff
    return a.text.localeCompare(b.text, 'pt-BR')
  })

  const rows: string[][] = [
    ['Dinâmica com Time — Etapa 1 (backup)'],
    ['Time', meta.teamName || '—'],
    ['Data', meta.date || '—'],
    ['Sala', meta.roomId],
    ['Exportado em', new Date().toLocaleString('pt-BR')],
    ['Total de post-its', String(items.length)],
    [],
    ['#', 'Coluna', 'Pergunta', 'Post-it completo', 'O quê', 'Complemento'],
  ]

  sorted.forEach((item, idx) => {
    const cfg = CATEGORY_CONFIG[item.category]
    const { oQue, complemento } = splitPostIt(item.text)
    rows.push([
      String(idx + 1),
      cfg.label,
      cfg.question,
      item.text,
      oQue,
      complemento,
    ])
  })

  const safeDate = (meta.date || new Date().toISOString().split('T')[0]).replace(/-/g, '')
  const filename = `dinamica-etapa1-${meta.roomId}-${safeDate}.csv`
  downloadCsv(filename, rows)
}
