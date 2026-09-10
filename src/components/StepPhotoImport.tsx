import { useRef, useState } from 'react'
import type { ItemCategory } from '../types'
import { CATEGORY_CONFIG } from '../types'
import {
  extractEntriesFromImage,
  extractLinesFromImage,
  type BoardLayout,
} from '../utils/ocr'

type UploadMode = 'panel' | 'columns'

const LAYOUT_OPTIONS: { id: BoardLayout; label: string; hint: string }[] = [
  {
    id: 'auto',
    label: 'Detectar automático',
    hint: 'Miro, Teams, quadro físico',
  },
  {
    id: 'start-stop-continue',
    label: 'Iniciar · Parar · Continuar',
    hint: 'Coluna esq. → Que tal · meio → Que pena · dir. → Que bom',
  },
  {
    id: 'que-bom-pena-tal',
    label: 'Que bom · Que pena · Que tal',
    hint: 'Ordem clássica da dinâmica',
  },
]

export interface PhotoImportEntry {
  text: string
  category: ItemCategory
}

interface StepPhotoImportProps {
  onImport: (entries: PhotoImportEntry[]) => void
}

const CATEGORIES: ItemCategory[] = ['que_bom', 'que_pena', 'que_tal']

const COLUMN_STYLES: Record<ItemCategory, string> = {
  que_bom: 'border-emerald-200 bg-emerald-50/40',
  que_pena: 'border-rose-200 bg-rose-50/40',
  que_tal: 'border-sky-200 bg-sky-50/40',
}

interface SlotState {
  files: File[]
  previews: string[]
}

export function StepPhotoImport({ onImport }: StepPhotoImportProps) {
  const [uploadMode, setUploadMode] = useState<UploadMode>('panel')
  const [boardLayout, setBoardLayout] = useState<BoardLayout>('auto')
  const [panelSlot, setPanelSlot] = useState<SlotState>({ files: [], previews: [] })
  const [slots, setSlots] = useState<Record<ItemCategory, SlotState>>({
    que_bom: { files: [], previews: [] },
    que_pena: { files: [], previews: [] },
    que_tal: { files: [], previews: [] },
  })
  const [phase, setPhase] = useState<'upload' | 'processing' | 'review'>('upload')
  const [progress, setProgress] = useState('')
  const [drafts, setDrafts] = useState<PhotoImportEntry[]>([])
  const inputRefs = useRef<Partial<Record<ItemCategory, HTMLInputElement | null>>>({})
  const panelInputRef = useRef<HTMLInputElement | null>(null)

  const columnFileCount = CATEGORIES.reduce((n, cat) => n + slots[cat].files.length, 0)
  const totalFiles = uploadMode === 'panel' ? panelSlot.files.length : columnFileCount

  const addFiles = (category: ItemCategory, fileList: FileList | null) => {
    if (!fileList?.length) return
    const newFiles = Array.from(fileList).filter((f) => f.type.startsWith('image/'))
    if (!newFiles.length) return

    setSlots((prev) => {
      const current = prev[category]
      const previews = newFiles.map((f) => URL.createObjectURL(f))
      return {
        ...prev,
        [category]: {
          files: [...current.files, ...newFiles],
          previews: [...current.previews, ...previews],
        },
      }
    })
  }

  const addPanelFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return
    const newFiles = Array.from(fileList).filter((f) => f.type.startsWith('image/'))
    if (!newFiles.length) return
    const previews = newFiles.map((f) => URL.createObjectURL(f))
    setPanelSlot((prev) => ({
      files: [...prev.files, ...newFiles],
      previews: [...prev.previews, ...previews],
    }))
  }

  const removePanelFile = (index: number) => {
    setPanelSlot((prev) => {
      URL.revokeObjectURL(prev.previews[index])
      return {
        files: prev.files.filter((_, i) => i !== index),
        previews: prev.previews.filter((_, i) => i !== index),
      }
    })
  }

  const removeFile = (category: ItemCategory, index: number) => {
    setSlots((prev) => {
      const current = prev[category]
      URL.revokeObjectURL(current.previews[index])
      return {
        ...prev,
        [category]: {
          files: current.files.filter((_, i) => i !== index),
          previews: current.previews.filter((_, i) => i !== index),
        },
      }
    })
  }

  const processImages = async () => {
    if (totalFiles === 0) return
    setPhase('processing')
    const entries: PhotoImportEntry[] = []

    try {
      if (uploadMode === 'panel') {
        for (const file of panelSlot.files) {
          setProgress(`Claude Opus — ${file.name}`)
          const parsed = await extractEntriesFromImage(file, boardLayout, (pct, name) => {
            if (pct >= 1) {
              setProgress(`Pronto — ${name}`)
            } else if (pct < 0.5) {
              setProgress(`Claude Opus lendo ${name}…`)
            } else {
              setProgress(`Claude Opus analisando ${name}…`)
            }
          })
          entries.push(...parsed)
        }
      } else {
        for (const category of CATEGORIES) {
          for (const file of slots[category].files) {
            setProgress(`Claude Opus — ${CATEGORY_CONFIG[category].label} — ${file.name}`)
            const lines = await extractLinesFromImage(file, (pct, name) => {
              if (pct >= 1) setProgress(`Pronto — ${name}`)
              else if (pct < 0.5) setProgress(`Claude Opus lendo ${name}…`)
              else setProgress(`Claude Opus analisando ${name}…`)
            })
            for (const line of lines) {
              entries.push({ text: line, category })
            }
          }
        }
      }

      if (entries.length === 0) {
        alert(
          'Não foi possível ler texto nas imagens. Tente fotos mais nítidas, com boa luz e post-its legíveis.'
        )
        setPhase('upload')
        return
      }

      setDrafts(entries)
      setPhase('review')
    } catch {
      alert('Erro ao processar imagem. Tente novamente com outra foto.')
      setPhase('upload')
    } finally {
      setProgress('')
    }
  }

  const updateDraft = (index: number, patch: Partial<PhotoImportEntry>) => {
    setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)))
  }

  const removeDraft = (index: number) => {
    setDrafts((prev) => prev.filter((_, i) => i !== index))
  }

  const addManualDraft = (category: ItemCategory) => {
    setDrafts((prev) => [...prev, { text: '', category }])
  }

  const handleImport = () => {
    const valid = drafts.map((d) => ({ ...d, text: d.text.trim() })).filter((d) => d.text.length >= 3)
    if (valid.length === 0) {
      alert('Adicione pelo menos um post-it com texto.')
      return
    }
    onImport(valid)
  }

  if (phase === 'processing') {
    return (
      <div className="card py-20 text-center">
        <p className="text-4xl mb-4">📷</p>
        <p className="font-semibold text-slate-800">Lendo post-its da foto…</p>
        <p className="mt-2 text-sm text-slate-500">
          {progress || 'Enviando para Claude Opus (sem chave API, usa OCR local)'}
        </p>
        <div className="mx-auto mt-6 h-2 w-48 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-brand-500" />
        </div>
      </div>
    )
  }

  if (phase === 'review') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="font-display text-xl font-bold text-slate-900">Revisar post-its lidos</h2>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl mx-auto">
            Confira o texto e a <strong>coluna</strong> de cada post-it antes de consolidar.
            No painel único, a coluna é sugerida — ajuste o que precisar.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => addManualDraft(cat)}
              className="btn-secondary text-xs"
            >
              + {CATEGORY_CONFIG[cat].label}
            </button>
          ))}
        </div>

        <div className="card overflow-hidden">
          <div className="max-h-[420px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-3 w-32">Coluna</th>
                  <th className="px-4 py-3">Texto do post-it</th>
                  <th className="px-4 py-3 w-12" />
                </tr>
              </thead>
              <tbody>
                {drafts.map((draft, idx) => (
                  <tr key={idx} className="border-t border-slate-100">
                    <td className="px-4 py-2 align-top">
                      <select
                        value={draft.category}
                        onChange={(e) => updateDraft(idx, { category: e.target.value as ItemCategory })}
                        className="input-field py-1.5 text-xs w-full"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{CATEGORY_CONFIG[cat].label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={draft.text}
                        onChange={(e) => updateDraft(idx, { text: e.target.value })}
                        className="input-field py-1.5 text-sm w-full"
                        placeholder="Texto do post-it"
                      />
                    </td>
                    <td className="px-4 py-2 align-top">
                      <button
                        type="button"
                        onClick={() => removeDraft(idx)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-3">
          <button type="button" onClick={() => setPhase('upload')} className="btn-secondary">
            ← Voltar às fotos
          </button>
          <button type="button" onClick={handleImport} className="btn-primary">
            Importar e ir para Consolidação →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
          Plano B — Importar fotos dos post-its
        </h2>
        <p className="mt-2 text-sm text-slate-500 max-w-2xl mx-auto">
          Fotografe o quadro físico e o app lê os post-its para você seguir na consolidação.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200">
          <button
            type="button"
            onClick={() => setUploadMode('panel')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              uploadMode === 'panel'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            🖼️ Painel único
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('columns')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              uploadMode === 'columns'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            📷 Uma foto por coluna
          </button>
        </div>
      </div>

      {uploadMode === 'panel' && (
        <div className="card border-2 border-dashed border-brand-200 bg-brand-50/30 p-6">
          <h3 className="font-semibold text-slate-800">Foto do painel completo</h3>
          <p className="mt-1 text-xs text-slate-500">
            Uma foto do quadro com 3 colunas (Miro, Teams, flipchart). O app lê cada coluna
            separadamente — funciona com <strong>Iniciar/Parar/Continuar</strong> ou{' '}
            <strong>Que bom/Que pena/Que tal</strong>.
          </p>

          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-slate-600">Tipo de quadro</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {LAYOUT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setBoardLayout(opt.id)}
                  className={`rounded-lg border px-3 py-2 text-left transition ${
                    boardLayout === opt.id
                      ? 'border-brand-400 bg-brand-50 ring-1 ring-brand-200'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs font-semibold text-slate-800">{opt.label}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">{opt.hint}</p>
                </button>
              ))}
            </div>
          </div>

          <input
            ref={panelInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={(e) => {
              addPanelFiles(e.target.files)
              e.target.value = ''
            }}
          />

          <button
            type="button"
            onClick={() => panelInputRef.current?.click()}
            className="mt-4 flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-300 bg-white py-12 text-center transition hover:border-brand-500"
          >
            <span className="text-3xl">🖼️</span>
            <span className="mt-2 text-sm font-medium text-slate-700">
              Enviar ou tirar foto do painel inteiro
            </span>
            <span className="mt-1 text-xs text-slate-400">JPG, PNG — pode enviar mais de uma se precisar</span>
          </button>

          {panelSlot.previews.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {panelSlot.previews.map((src, idx) => (
                <div key={src} className="relative overflow-hidden rounded-xl ring-1 ring-slate-200">
                  <img src={src} alt="" className="max-h-64 w-full object-contain bg-slate-100" />
                  <button
                    type="button"
                    onClick={() => removePanelFile(idx)}
                    className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs text-rose-500 shadow"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {uploadMode === 'columns' && (
      <div className="grid gap-4 lg:grid-cols-3">
        {CATEGORIES.map((category) => {
          const config = CATEGORY_CONFIG[category]
          const slot = slots[category]
          return (
            <div key={category} className={`card border-2 border-dashed p-4 ${COLUMN_STYLES[category]}`}>
              <h3 className="font-semibold text-slate-800">{config.label}</h3>
              <p className="mt-1 text-xs text-slate-500">{config.question}</p>

              <input
                ref={(el) => { inputRefs.current[category] = el }}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                className="hidden"
                onChange={(e) => {
                  addFiles(category, e.target.files)
                  e.target.value = ''
                }}
              />

              <button
                type="button"
                onClick={() => inputRefs.current[category]?.click()}
                className="mt-4 flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white/60 py-8 text-center transition hover:border-brand-400 hover:bg-white"
              >
                <span className="text-2xl">📷</span>
                <span className="mt-2 text-xs font-medium text-slate-600">
                  Enviar ou tirar foto
                </span>
              </button>

              {slot.previews.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {slot.previews.map((src, idx) => (
                    <div key={src} className="relative overflow-hidden rounded-lg ring-1 ring-slate-200">
                      <img src={src} alt="" className="h-24 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(category, idx)}
                        className="absolute right-1 top-1 rounded-full bg-white/90 px-1.5 text-[10px] text-rose-500 shadow"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      )}

      <div className="card bg-amber-50/50 border-amber-200 p-4 text-xs text-amber-900">
        <strong>Dicas:</strong> enquadre as 3 colunas inteiras, foto de frente, boa luz.
        {uploadMode === 'panel'
          ? ' Lê com Claude Opus (melhor) ou OCR local se não houver chave API. Revise na etapa seguinte.'
          : ' Lê com Claude Opus ou OCR local. Na revisão você corrige erros de leitura.'}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={processImages}
          className="btn-primary"
          disabled={totalFiles === 0}
        >
          Ler {totalFiles} foto{totalFiles !== 1 ? 's' : ''} →
        </button>
      </div>
    </div>
  )
}
