import { useState } from 'react'
import { PageHeader, StepIndicator } from './components/Layout'
import { JoinScreen } from './components/JoinScreen'
import { ParticipantsBar } from './components/ParticipantsBar'
import { SimulationBanner } from './components/SimulationBanner'
import { StepClusters } from './components/StepClusters'
import { StepColeta } from './components/StepColeta'
import { StepPlano } from './components/StepPlano'
import { ModeSwitcher, type WorkshopMode } from './components/ModeSwitcher'
import { StepPhotoImport } from './components/StepPhotoImport'
import { StepPriorizacao } from './components/StepPriorizacao'
import { getSimulationState } from './data/simulation'
import { clearJoinInfo, loadJoinInfo, useSession } from './hooks/useSession'
import type { JoinInfo } from './types'
import type { PhotoImportEntry } from './components/StepPhotoImport'

export default function App() {
  const [joinInfo, setJoinInfo] = useState<JoinInfo | null>(loadJoinInfo)

  if (!joinInfo) return <JoinScreen onJoin={setJoinInfo} />

  return (
    <CollaborativeApp
      joinInfo={joinInfo}
      onLeave={() => {
        clearJoinInfo()
        setJoinInfo(null)
      }}
    />
  )
}

function CollaborativeApp({
  joinInfo,
  onLeave,
}: {
  joinInfo: JoinInfo
  onLeave: () => void
}) {
  const session = useSession(joinInfo)
  const { state } = session
  const [isSimulation, setIsSimulation] = useState(false)
  const [showSimBanner, setShowSimBanner] = useState(false)
  const [workshopMode, setWorkshopMode] = useState<WorkshopMode>('online')
  const [photoReady, setPhotoReady] = useState(false)

  const handlePhotoImport = (entries: PhotoImportEntry[]) => {
    session.bulkAddItems(entries)
    session.autoConsolidate()
    session.setStep(2)
    setPhotoReady(true)
  }

  const handleReset = () => {
    if (window.confirm('Reiniciar a sessão? Todos os dados serão apagados.')) {
      session.resetSession()
      setIsSimulation(false)
      setShowSimBanner(false)
      setPhotoReady(false)
      setWorkshopMode('online')
    }
  }

  const handleLoadSimulation = () => {
    if (
      !window.confirm(
        'Carregar simulação?\n\n30 post-its consolidados em ~16 ações (PM TI, PM RH, GM TI, GM RH…), com priorização e plano por categoria da matriz.'
      )
    ) return
    session.loadSimulation(getSimulationState(1))
    setIsSimulation(true)
    setShowSimBanner(true)
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        teamName={state.teamName}
        date={state.date}
        onTeamNameChange={session.setTeamName}
        onDateChange={session.setDate}
      >
        <button
          type="button"
          onClick={handleLoadSimulation}
          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 shadow-sm hover:bg-amber-100"
        >
          🎬 Simulação
        </button>
        <button type="button" onClick={handleReset} className="btn-secondary text-sm">Reiniciar</button>
        <button type="button" onClick={() => window.confirm('Sair?') && onLeave()} className="btn-secondary text-sm">Sair</button>
      </PageHeader>

      {isSimulation && showSimBanner && <SimulationBanner onDismiss={() => setShowSimBanner(false)} />}

      {session.syncError && (
        <div className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm text-rose-800">
          ⚠️ {session.syncError}
        </div>
      )}

      {workshopMode === 'online' && (
        <ParticipantsBar
          participants={session.participants}
          connected={session.connected}
          roomId={session.roomId}
          shareUrl={session.shareUrl}
          currentName={joinInfo.participantName}
        />
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 space-y-6">
          <ModeSwitcher mode={workshopMode} onChange={setWorkshopMode} />
          {(workshopMode === 'online' || photoReady) && (
            <StepIndicator
              currentStep={state.currentStep}
              onStepClick={session.setStep}
              freeNavigation={isSimulation || photoReady}
            />
          )}
        </div>

        {workshopMode === 'photo' && !photoReady && (
          <StepPhotoImport onImport={handlePhotoImport} />
        )}

        {workshopMode === 'online' && state.currentStep === 1 && (
          <StepColeta
            items={state.items}
            teamName={state.teamName}
            date={state.date}
            roomId={session.roomId}
            onAdd={session.addItem}
            onRemove={session.removeItem}
            onNext={() => session.setStep(2)}
          />
        )}

        {((workshopMode === 'online' && state.currentStep === 2) ||
          (workshopMode === 'photo' && photoReady && state.currentStep === 2)) && (
          <StepClusters
            items={state.items}
            clusters={state.clusters}
            onCreateCluster={session.createNewCluster}
            onUpdateCluster={session.updateCluster}
            onDeleteCluster={session.deleteCluster}
            onAssignToCluster={session.assignToCluster}
            onAutoConsolidate={session.autoConsolidate}
            onBack={() => {
              if (workshopMode === 'photo') setPhotoReady(false)
              else session.setStep(1)
            }}
            onNext={() => session.setStep(3)}
          />
        )}

        {state.currentStep === 3 && (workshopMode === 'online' || photoReady) && (
          <StepPriorizacao
            clusters={state.clusters}
            onSetQuadrant={session.setClusterQuadrant}
            onBack={() => session.setStep(2)}
            onNext={() => session.setStep(4)}
          />
        )}

        {state.currentStep === 4 && (workshopMode === 'online' || photoReady) && (
          <StepPlano
            items={state.items}
            clusters={state.clusters}
            onUpdateCluster={session.updateCluster}
            onBack={() => session.setStep(3)}
          />
        )}
      </div>

      <footer className="border-t border-slate-200/80 py-6 text-center text-xs text-slate-400">
        Dinâmica com Time · Sala {session.roomId}{isSimulation && ' · Simulação'}
      </footer>
    </div>
  )
}
