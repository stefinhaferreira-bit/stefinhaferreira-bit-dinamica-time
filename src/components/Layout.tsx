import type { ReactNode } from 'react'
import type { StepNum } from '../types'

interface StepIndicatorProps {
  currentStep: StepNum
  onStepClick: (step: StepNum) => void
  freeNavigation?: boolean
}

const STEPS: { num: StepNum; label: string; desc: string }[] = [
  { num: 1, label: 'Coleta', desc: 'Que bom, Que pena, Que tal' },
  { num: 2, label: 'Consolidação', desc: 'Por tema' },
  { num: 3, label: 'Resumo', desc: 'Contagem + convergência' },
  { num: 4, label: 'Priorização', desc: 'Impacto × Esforço' },
  { num: 5, label: 'Plano', desc: 'Ações e responsáveis' },
]

export function StepIndicator({ currentStep, onStepClick, freeNavigation }: StepIndicatorProps) {
  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {STEPS.map((step, idx) => {
        const isActive = currentStep === step.num
        const isDone = currentStep > step.num
        const canClick = freeNavigation !== false

        return (
          <div key={step.num} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => canClick && onStepClick(step.num)}
              disabled={!canClick}
              className={`group flex items-center gap-2 rounded-xl px-2 py-2 transition sm:px-3 ${
                isActive
                  ? 'bg-brand-50 ring-1 ring-brand-200'
                  : canClick
                    ? 'hover:bg-slate-100'
                    : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : isDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isDone ? '✓' : step.num}
              </span>
              <div className="hidden text-left md:block">
                <p
                  className={`text-xs font-semibold ${
                    isActive ? 'text-brand-700' : 'text-slate-700'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-slate-500">{step.desc}</p>
              </div>
            </button>
            {idx < STEPS.length - 1 && (
              <div
                className={`hidden h-px w-4 md:block md:w-6 ${
                  currentStep > step.num ? 'bg-emerald-400' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}

interface PageHeaderProps {
  teamName: string
  date: string
  onTeamNameChange: (name: string) => void
  onDateChange: (date: string) => void
  children?: ReactNode
}

export function PageHeader({
  teamName,
  date,
  onTeamNameChange,
  onDateChange,
  children,
}: PageHeaderProps) {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Dinâmica com Time
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Colete, organize por tema e saia com um plano de ação
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Nome do time"
              value={teamName}
              onChange={(e) => onTeamNameChange(e.target.value)}
              className="input-field w-44"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="input-field w-40"
            />
            {children}
          </div>
        </div>
      </div>
    </header>
  )
}
