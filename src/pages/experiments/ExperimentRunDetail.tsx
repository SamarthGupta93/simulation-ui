import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, Minus, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { HierarchyBreadcrumb } from '@/components/ui/HierarchyBreadcrumb'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import type { SimulationResult } from '@/types'

const TYPE_COLORS: Record<string, string> = {
  persona: 'bg-purple-100 text-purple-700',
  script: 'bg-blue-100 text-blue-700',
  hybrid: 'bg-amber-100 text-amber-700',
}

function passRate(results: SimulationResult[]): number {
  if (!results.length) return 0
  return Math.round((results.filter((r) => r.status === 'pass').length / results.length) * 100)
}

function ScenarioRow({
  result, prevResult, scenarioTitle, scenarioType,
}: {
  result: SimulationResult
  prevResult?: SimulationResult
  scenarioTitle: string
  scenarioType: string
}) {
  const [open, setOpen] = useState(false)

  const changed = prevResult && result.status !== prevResult.status
  const isRegression = changed && result.status === 'fail'
  const isImprovement = changed && result.status === 'pass'

  return (
    <div className={cn(
      'rounded border transition-colors',
      isRegression ? 'border-red-200 bg-red-50' :
      isImprovement ? 'border-green-200 bg-green-50' :
      'border-border bg-white'
    )}>
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        {result.status === 'pass'
          ? <CheckCircle2 size={15} className="shrink-0 text-green-500" />
          : <XCircle size={15} className="shrink-0 text-red-500" />}

        <span className={cn(
          'shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase',
          TYPE_COLORS[scenarioType] ?? 'bg-vz-gray-100 text-vz-gray-500'
        )}>
          {scenarioType}
        </span>

        <span className="flex-1 text-sm font-medium text-vz-gray-900 truncate">{scenarioTitle}</span>

        {prevResult && (
          <span className={cn(
            'shrink-0 text-xs font-semibold',
            isRegression ? 'text-red-600' : isImprovement ? 'text-green-600' : 'text-vz-gray-400'
          )}>
            {isRegression && 'PASS → FAIL'}
            {isImprovement && 'FAIL → PASS'}
            {!changed && (result.status === 'pass' ? 'PASS' : 'FAIL')}
          </span>
        )}

        {open ? <ChevronUp size={13} className="shrink-0 text-vz-gray-300" /> : <ChevronDown size={13} className="shrink-0 text-vz-gray-300" />}
      </button>

      {open && (
        <div className="border-t border-border px-4 pb-3 pt-2 space-y-3 animate-fade-in">
          {result.failReason && (
            <div className="rounded bg-red-100 border border-red-200 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-red-500 mb-0.5">Fail Reason</p>
              <p className="text-xs text-red-700">{result.failReason}</p>
            </div>
          )}
          <div className="flex gap-4 text-xs text-vz-gray-400">
            <span>{result.turnCount} turns</span>
            <span>{(result.durationMs / 1000).toFixed(1)}s</span>
          </div>
          {result.transcript.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-vz-gray-400">Transcript</p>
              {result.transcript.map((turn, i) => (
                <div key={i} className={cn(
                  'rounded px-3 py-2 text-xs',
                  turn.role === 'user' ? 'bg-vz-gray-100 text-vz-gray-700' : 'bg-white border border-border text-vz-gray-700'
                )}>
                  <span className="font-semibold text-[9px] uppercase tracking-wider text-vz-gray-400 mr-2">
                    {turn.role === 'user' ? 'User' : 'Agent'}
                  </span>
                  {turn.content}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ExperimentRunDetail() {
  const { experimentId, runId } = useParams<{ experimentId: string; runId: string }>()
  const { experiments, simulationRuns, scenarios } = useApp()
  const navigate = useNavigate()

  const experiment = experiments.find((e) => e.id === experimentId)
  const allExpRuns = simulationRuns
    .filter((r) => r.experimentId === experimentId && r.status === 'completed')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const currentRun = allExpRuns.find((r) => r.id === runId)
  const runIdx = allExpRuns.findIndex((r) => r.id === runId)
  const prevRun = runIdx > 0 ? allExpRuns[runIdx - 1] : undefined
  const isBaseline = runIdx === 0

  if (!experiment || !currentRun) {
    return (
      <div className="text-center py-20">
        <p className="text-vz-gray-400">Run not found.</p>
        <Button variant="ghost" onClick={() => navigate(`/experiments/${experimentId}`)} className="mt-3">← Back</Button>
      </div>
    )
  }

  const rate = passRate(currentRun.results)
  const prevRate = prevRun ? passRate(prevRun.results) : null
  const delta = prevRate !== null ? rate - prevRate : null

  // Categorize results
  const regressions = currentRun.results.filter((r) =>
    r.status === 'fail' && prevRun?.results.find((p) => p.scenarioId === r.scenarioId)?.status === 'pass'
  )
  const improvements = currentRun.results.filter((r) =>
    r.status === 'pass' && prevRun?.results.find((p) => p.scenarioId === r.scenarioId)?.status === 'fail'
  )
  const unchangedPass = currentRun.results.filter((r) =>
    r.status === 'pass' && (!prevRun || prevRun.results.find((p) => p.scenarioId === r.scenarioId)?.status === 'pass')
  )
  const unchangedFail = currentRun.results.filter((r) =>
    r.status === 'fail' && (!prevRun || prevRun.results.find((p) => p.scenarioId === r.scenarioId)?.status === 'fail')
  )

  function getScenario(id: string) {
    return scenarios.find((s) => s.id === id)
  }

  function ResultSection({
    title, results, prevResults, accent,
  }: {
    title: string
    results: SimulationResult[]
    prevResults?: SimulationResult[]
    accent: 'red' | 'green' | 'gray'
  }) {
    if (results.length === 0) return null
    const colors = {
      red: 'text-red-600',
      green: 'text-green-600',
      gray: 'text-vz-gray-400',
    }
    return (
      <div className="space-y-1.5">
        <p className={cn('text-xs font-semibold uppercase tracking-wider', colors[accent])}>
          {title} ({results.length})
        </p>
        {results.map((r) => {
          const sc = getScenario(r.scenarioId)
          return (
            <ScenarioRow
              key={r.scenarioId}
              result={r}
              prevResult={prevResults?.find((p) => p.scenarioId === r.scenarioId)}
              scenarioTitle={sc?.title ?? r.scenarioId}
              scenarioType={sc?.type ?? 'persona'}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <HierarchyBreadcrumb segments={[
        { label: 'Experiments', href: '/experiments' },
        { label: experiment.name, href: `/experiments/${experimentId}` },
        { label: `Run #${runIdx + 1}` },
      ]} />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-lg font-semibold text-vz-gray-900">Run #{runIdx + 1}</h2>
            {isBaseline && (
              <span className="rounded-full bg-vz-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-vz-gray-500">
                Baseline
              </span>
            )}
          </div>
          <p className="text-sm text-vz-gray-500">
            {new Date(currentRun.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="text-right">
          <p className={cn(
            'text-3xl font-bold',
            rate >= 80 ? 'text-green-600' : rate >= 50 ? 'text-amber-600' : 'text-red-600'
          )}>
            {rate}%
          </p>
          <p className="text-xs text-vz-gray-400">
            {currentRun.results.filter((r) => r.status === 'pass').length}/{currentRun.results.length} passed
          </p>
        </div>
      </div>

      {/* Delta summary */}
      {!isBaseline && prevRun && (
        <Card>
          <CardContent className="px-5 py-3">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-1.5">
                {delta !== null && delta > 0 && <TrendingUp size={14} className="text-green-600" />}
                {delta !== null && delta < 0 && <TrendingDown size={14} className="text-red-600" />}
                {delta !== null && delta === 0 && <Minus size={14} className="text-vz-gray-400" />}
                <span className={cn(
                  'text-sm font-semibold',
                  (delta ?? 0) > 0 ? 'text-green-600' : (delta ?? 0) < 0 ? 'text-red-600' : 'text-vz-gray-400'
                )}>
                  {(delta ?? 0) > 0 ? '+' : ''}{delta ?? '—'}pp vs Run #{runIdx}
                </span>
              </div>
              {improvements.length > 0 && (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  ↑ {improvements.length} improved
                </Badge>
              )}
              {regressions.length > 0 && (
                <Badge className="bg-red-100 text-red-700 border-red-200">
                  ↓ {regressions.length} regressed
                </Badge>
              )}
              {improvements.length === 0 && regressions.length === 0 && (
                <span className="text-sm text-vz-gray-400">No scenario status changes</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scenario sections */}
      <div className="space-y-5">
        {regressions.length > 0 && (
          <ResultSection
            title="Regressions"
            results={regressions}
            prevResults={prevRun?.results}
            accent="red"
          />
        )}
        {improvements.length > 0 && (
          <ResultSection
            title="Improvements"
            results={improvements}
            prevResults={prevRun?.results}
            accent="green"
          />
        )}
        {(unchangedPass.length > 0 || unchangedFail.length > 0) && (
          <ResultSection
            title={isBaseline ? 'All Scenarios' : 'Unchanged'}
            results={[...unchangedPass, ...unchangedFail]}
            prevResults={prevRun?.results}
            accent="gray"
          />
        )}
      </div>
    </div>
  )
}
