export type WorkshopMode = 'online' | 'photo'

interface ModeSwitcherProps {
  mode: WorkshopMode
  onChange: (mode: WorkshopMode) => void
}

export function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200">
        <button
          type="button"
          onClick={() => onChange('online')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            mode === 'online'
              ? 'bg-white text-brand-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Online (time)
        </button>
        <button
          type="button"
          onClick={() => onChange('photo')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            mode === 'photo'
              ? 'bg-white text-brand-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          📷 Foto (plano B)
        </button>
      </div>
    </div>
  )
}
