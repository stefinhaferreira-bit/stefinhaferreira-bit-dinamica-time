interface SimulationBannerProps {
  onDismiss?: () => void
}

export function SimulationBanner({ onDismiss }: SimulationBannerProps) {
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <p className="text-sm text-amber-900">
          <span className="font-semibold">🎬 Simulação</span>
          {' — '}
          30 post-its → 6 ações consolidadas → 3 ganhos rápidos no plano.
          Navegue pelas 4 etapas.
        </p>
        {onDismiss && (
          <button type="button" onClick={onDismiss} className="shrink-0 text-xs font-medium text-amber-700">
            Entendi
          </button>
        )}
      </div>
    </div>
  )
}
