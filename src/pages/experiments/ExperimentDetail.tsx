import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { flushSync } from 'react-dom'
import {
  FlaskConical, Play, TrendingUp, TrendingDown, Minus,
  ArrowRight, ChevronUp, ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HierarchyBreadcrumb } from '@/components/ui/HierarchyBreadcrumb'
import { JobProgressPanel } from '@/components/ui/JobProgressPanel'
import { useJobPolling } from '@/hooks/useJobPolling'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import type { SimulationRun } from '@/types'

const RUN_STEPS = [
  { step: 'Validate endpoint', message: 'Checking agent is reachable' },
  { step: 'Execute scenarios', message: 'Running all test scenarios' },
  { step: 'Evaluate results', message: 'Analyzing agent responses' },
  { step: 'Finalize', message: 'Compiling run report' },
]

function passRate(run: SimulationRun): number {
  if (!run.results.length) return 0
  return Math.round((run.results.filter((r) => r.status === 'pass').length / run.results.length) * 100)
}

function TrendChart({ runs }: { runs: SimulationRun[] }) {
  const rates = runs.map(passRate)
  if (rates.length < 2) return null

  const W = 520
  const H = 72
  const PAD = 12
  const innerW = W - PAD * 2
  const innerH = H - PAD * 2

  const pts = rates.map((v, i) => [
    PAD + (i / (rates.length - 1)) * innerW,
    PAD + innerH - (v / 100) * innerH,
  ])

  const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

  // Fill area under the line
  const fill = `${d} L${pts[pts.length - 1][0].toFixed(1)},${(PAD + innerH).toFixed(1)} L${PAD},${(PAD + innerH).toFixed(1)} Z`

  return (
    <div className="rounded-lg border border-border bg-white px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-vz-gray-400 mb-3">
        Pass Rate Trend
      </p>
      <div className="relative">
        {/* Y gridlines at 0%, 50%, 100% */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ top: PAD, bottom: PAD }}>
          {[100, 50, 0].map((v) => (
            <div key={v} className="flex items-center gap-2">
              <span className="text-[9px] text-vz-gray-300 w-6 text-right">{v}%</span>
              <div className="flex-1 border-t border-vz-gray-100" />
            </div>
          ))}
        </div>
        <svg width={W} height={H} className="overflow-visible ml-8 -mt-1">
          <defs>
            <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#CD040B" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#CD040B" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={fill} fill="url(#trend-fill)" />
          <path d={d} fill="none" stroke="#CD040B" strokeWidth="2" />
          {pts.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="#CD040B" />
              <text
                x={x}
                y={y - 8}
                textAnchor="middle"
                fontSize="9"
                fill="#999"
              >
                {rates[i]}%
              </text>
            </g>
          ))}
          {/* X-axis run labels */}
          {pts.map(([x], i) => (
            <text key={i} x={x} y={H + 2} textAnchor="middle" fontSize="9" fill="#bbb">
              #{i + 1}
            </text>
          ))}
        </svg>
      </div>
    </div>
  )
}

export default function ExperimentDetail() {
  const { experimentId } = useParams<{ experimentId: string }>()
  const { experiments, simulationRuns, agents, evalDatasets, datasetVersions, datasetBatches, scenarios, addSimulationRun, updateSimulationRun } = useApp()
  const navigate = useNavigate()

  const [runModalOpen, setRunModalOpen] = useState(false)
  const { status, progress, startMockJob } = useJobPolling(1200)

  const experiment = experiments.find((e) => e.id === experimentId)
  const runs = simulationRuns
    .filter((r) => r.experimentId === experimentId && r.status === 'completed')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  if (!experiment) {
    return (
      <div className="text-center py-20">
        <p className="text-vz-gray-400">Experiment not found.</p>
        <Button variant="ghost" onClick={() => navigate('/experiments')} className="mt-3">← Back</Button>
      </div>
    )
  }

  const agent = agents.find((a) => a.id === experiment.agentId)
  const dataset = evalDatasets.find((d) => d.id === experiment.datasetId)
  const version = datasetVersions.find((v) => v.id === experiment.versionId)

  // All unique scenario IDs across batches in this version
  const versionScenarioIds = Array.from(new Set(
    datasetBatches
      .filter((b) => b.versionId === experiment.versionId)
      .flatMap((b) => b.scenarioIds)
  ))

  const baseline = runs[0]
  const latest = runs.at(-1)

  const baselineRate = baseline ? passRate(baseline) : null
  const latestRate = latest ? passRate(latest) : null
  const deltaFromBaseline = latestRate !== null && baselineRate !== null ? latestRate - baselineRate : null

  function handleRunAgain() {
    const run = addSimulationRun({
      experimentId: experiment!.id,
      agentId: experiment!.agentId,
      scenarioIds: versionScenarioIds,
      config: { maxTurns: 12, timeoutMs: 30000 },
      status: 'running',
      progress: [],
      results: [],
    })

    startMockJob(RUN_STEPS)

    setTimeout(() => {
      // Mock results: all pass (to show improvement trend)
      const mockResults = scenarios
        .filter((s) => versionScenarioIds.includes(s.id))
        .map((s) => ({
          scenarioId: s.id,
          status: 'pass' as const,
          turnCount: Math.floor(Math.random() * 4) + 5,
          durationMs: Math.floor(Math.random() * 5000) + 12000,
          transcript: [
            { role: 'user' as const, content: 'Test message.' },
            { role: 'agent' as const, content: 'Resolved successfully.' },
          ],
        }))

      flushSync(() => {
        updateSimulationRun(run.id, {
          status: 'completed',
          results: mockResults,
          completedAt: new Date().toISOString(),
          progress: RUN_STEPS.map((s, i) => ({
            ...s,
            percent: Math.round(((i + 1) / RUN_STEPS.length) * 100),
            timestamp: new Date().toISOString(),
          })),
        })
      })

      navigate(`/experiments/${experiment!.id}/runs/${run.id}`)
    }, RUN_STEPS.length * 1300)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <HierarchyBreadcrumb segments={[
        { label: 'Experiments', href: '/experiments' },
        { label: experiment.name, count: `${runs.length} run${runs.length !== 1 ? 's' : ''}` },
      ]} />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
            <FlaskConical size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-vz-gray-900">{experiment.name}</h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-sm text-vz-gray-500">
                {dataset?.name ?? '—'} · {version?.label ?? '—'}
              </span>
              {agent && <Badge variant="default">{agent.name}</Badge>}
              <span className="text-xs text-vz-gray-300">
                {versionScenarioIds.length} scenario{versionScenarioIds.length !== 1 ? 's' : ''}
              </span>
            </div>
            {experiment.description && (
              <p className="text-sm text-vz-gray-500 mt-1">{experiment.description}</p>
            )}
          </div>
        </div>

        {status === 'idle' && (
          <Button onClick={() => { setRunModalOpen(true); handleRunAgain() }} size="lg" disabled={versionScenarioIds.length === 0}>
            <Play size={14} /> Run Again
          </Button>
        )}
      </div>

      {/* Summary stats */}
      {runs.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-white px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-vz-gray-400">Latest Pass Rate</p>
            <p className="text-2xl font-bold text-vz-gray-900 mt-0.5">{latestRate}%</p>
          </div>
          <div className="rounded-lg border border-border bg-white px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-vz-gray-400">vs Baseline</p>
            <div className={cn(
              'flex items-center gap-1 mt-0.5',
              (deltaFromBaseline ?? 0) > 0 ? 'text-green-600' : (deltaFromBaseline ?? 0) < 0 ? 'text-red-600' : 'text-vz-gray-400'
            )}>
              {(deltaFromBaseline ?? 0) > 0 && <TrendingUp size={16} />}
              {(deltaFromBaseline ?? 0) < 0 && <TrendingDown size={16} />}
              {deltaFromBaseline === 0 && <Minus size={16} />}
              <span className="text-2xl font-bold">
                {(deltaFromBaseline ?? 0) > 0 ? '+' : ''}{deltaFromBaseline ?? '—'}pp
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-white px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-vz-gray-400">Total Runs</p>
            <p className="text-2xl font-bold text-vz-gray-900 mt-0.5">{runs.length}</p>
          </div>
        </div>
      )}

      {/* Progress panel when running */}
      {(status === 'running' || runModalOpen) && (
        <div className="space-y-3">
          <JobProgressPanel status={status} progress={progress} />
          {status === 'running' && (
            <p className="text-center text-xs text-vz-gray-400">
              Running {versionScenarioIds.length} scenarios — you'll be taken to the results when done.
            </p>
          )}
        </div>
      )}

      {/* Trend chart */}
      {runs.length >= 2 && <TrendChart runs={runs} />}

      {/* Runs list */}
      {runs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-lg">
          <Play size={20} className="text-vz-gray-300 mb-3" />
          <p className="font-semibold text-vz-gray-700">No runs yet</p>
          <p className="text-sm text-vz-gray-400 mt-1 mb-4">Click "Run Again" to kick off the first simulation.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-vz-gray-400">
            {runs.length} Run{runs.length !== 1 ? 's' : ''}
          </p>
          {[...runs].reverse().map((run, revIdx) => {
            const idx = runs.length - 1 - revIdx
            const rate = passRate(run)
            const prevRun = runs[idx - 1]
            const prevRate = prevRun ? passRate(prevRun) : null
            const delta = prevRate !== null ? rate - prevRate : null
            const isBaseline = idx === 0

            const improved = prevRun
              ? run.results.filter((r) => r.status === 'pass' && prevRun.results.find((p) => p.scenarioId === r.scenarioId)?.status === 'fail').length
              : 0
            const regressed = prevRun
              ? run.results.filter((r) => r.status === 'fail' && prevRun.results.find((p) => p.scenarioId === r.scenarioId)?.status === 'pass').length
              : 0

            return (
              <Card key={run.id} className="hover:border-vz-gray-300 transition-colors group">
                <CardContent className="p-0">
                  <Link
                    to={`/experiments/${experimentId}/runs/${run.id}`}
                    className="flex items-center gap-4 px-5 py-3.5"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-vz-gray-100 text-xs font-bold text-vz-gray-500">
                      #{idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-vz-gray-900">
                          {new Date(run.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {isBaseline && (
                          <span className="rounded-full bg-vz-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-vz-gray-500">
                            Baseline
                          </span>
                        )}
                      </div>
                      {!isBaseline && (
                        <div className="flex items-center gap-3 mt-0.5">
                          {improved > 0 && (
                            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                              <ChevronUp size={11} strokeWidth={2.5} />
                              {improved} improved
                            </span>
                          )}
                          {regressed > 0 && (
                            <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                              <ChevronDown size={11} strokeWidth={2.5} />
                              {regressed} regressed
                            </span>
                          )}
                          {improved === 0 && regressed === 0 && (
                            <span className="text-xs text-vz-gray-400">No changes</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      {delta !== null && (
                        <div className={cn(
                          'flex items-center gap-1 text-xs font-medium',
                          delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-600' : 'text-vz-gray-400'
                        )}>
                          {delta > 0 && <TrendingUp size={12} />}
                          {delta < 0 && <TrendingDown size={12} />}
                          {delta === 0 && <Minus size={12} />}
                          {delta > 0 ? '+' : ''}{delta}pp
                        </div>
                      )}

                      <div className="text-right min-w-[3rem]">
                        <span className={cn(
                          'text-base font-bold',
                          rate >= 80 ? 'text-green-600' : rate >= 50 ? 'text-amber-600' : 'text-red-600'
                        )}>
                          {rate}%
                        </span>
                        <p className="text-[10px] text-vz-gray-400">
                          {run.results.filter((r) => r.status === 'pass').length}/{run.results.length} passed
                        </p>
                      </div>

                      <ArrowRight size={14} className="text-vz-gray-300 group-hover:text-vz-red transition-colors" />
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
