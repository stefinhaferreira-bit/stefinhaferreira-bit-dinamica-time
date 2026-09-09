import { WORKSHOP_AGENDA } from '../types'

export function WorkshopAgenda({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="rounded-full bg-brand-100 px-3 py-1 font-bold text-brand-800">
          {WORKSHOP_AGENDA.total}
        </span>
        {WORKSHOP_AGENDA.steps.map((step) => (
          <span
            key={step.label}
            className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600"
          >
            {step.minutes}′ {step.label}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200/80">
      <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
        Agenda da dinâmica
      </p>
      <p className="mt-1 text-center text-2xl font-bold text-brand-700">{WORKSHOP_AGENDA.total}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {WORKSHOP_AGENDA.steps.map((step) => (
          <div key={step.label} className="rounded-lg bg-white px-3 py-2 text-center ring-1 ring-slate-100">
            <p className="text-lg font-bold text-slate-800">{step.minutes}′</p>
            <p className="text-[11px] font-medium text-slate-500">{step.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
