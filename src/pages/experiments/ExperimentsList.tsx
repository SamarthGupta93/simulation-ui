import { Link, useNavigate } from 'react-router-dom'
import { FlaskConical, Plus, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import type { SimulationRun } from '@/types'

function passRate(run: SimulationRun): number {
  if (!run.results.length) return 0
  return Math.round((run.results.filter((r) => r.status === 'pass').length / run.results.length) * 100)
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return <span className="text-xs text-vz-gray-300">—</span>
  const w = 80
  const h = 28
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * w,
    h - (v / 100) * h,
  ])
  const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  return (
    <svg width={w} height={h} className="overflow-visible">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-vz-red" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" className="fill-vz-red" />
      ))}
    </svg>
  )
}

export default function ExperimentsList() {
  const { experiments, simulationRuns, agents, evalDatasets, datasetVersions } = useApp()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-vz-gray-900">Experiments</h2>
          <p className="text-sm text-vz-gray-500 mt-0.5">
            Track regression testing across iterative agent improvements.
          </p>
        </div>
        <Button onClick={() => navigate('/experiments/new')}>
          <Plus size={14} /> New Experiment
        </Button>
      </div>

      {experiments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-lg">
          <FlaskConical size={24} className="text-vz-gray-300 mb-3" />
          <p className="font-semibold text-vz-gray-700">No experiments yet</p>
          <p className="text-sm text-vz-gray-400 mt-1 mb-6 max-w-xs">
            Create an experiment to track pass rate changes across multiple simulation runs.
          </p>
          <Button onClick={() => navigate('/experiments/new')}>
            <Plus size={14} /> New Experiment
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {experiments.map((exp) => {
            const runs = simulationRuns
              .filter((r) => r.experimentId === exp.id && r.status === 'completed')
              .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

            const agent = agents.find((a) => a.id === exp.agentId)
            const dataset = evalDatasets.find((d) => d.id === exp.datasetId)
            const version = datasetVersions.find((v) => v.id === exp.versionId)

            const rates = runs.map(passRate)
            const latest = rates.at(-1) ?? null
            const baseline = rates[0] ?? null
            const delta = latest !== null && baseline !== null ? latest - baseline : null

            return (
              <Card key={exp.id} className="hover:border-vz-gray-300 transition-colors group">
                <CardContent className="p-0">
                  <Link
                    to={`/experiments/${exp.id}`}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                      <FlaskConical size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-vz-gray-900 group-hover:text-vz-red transition-colors">
                        {exp.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-vz-gray-400">
                          {dataset?.name ?? '—'} · {version?.label ?? '—'}
                        </span>
                        {agent && (
                          <Badge variant="default">{agent.name}</Badge>
                        )}
                        <span className="text-xs text-vz-gray-300">
                          {runs.length} run{runs.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <Sparkline values={rates} />

                      {latest !== null && (
                        <div className="text-right">
                          <p className="text-lg font-bold text-vz-gray-900">{latest}%</p>
                          {delta !== null && delta !== 0 && (
                            <div className={cn(
                              'flex items-center justify-end gap-0.5 text-xs font-medium',
                              delta > 0 ? 'text-green-600' : 'text-red-600'
                            )}>
                              {delta > 0
                                ? <TrendingUp size={11} />
                                : <TrendingDown size={11} />}
                              {delta > 0 ? '+' : ''}{delta}pp
                            </div>
                          )}
                          {delta === 0 && (
                            <div className="flex items-center justify-end gap-0.5 text-xs text-vz-gray-400">
                              <Minus size={11} /> no change
                            </div>
                          )}
                          <p className="text-[10px] text-vz-gray-400 mt-0.5">vs baseline</p>
                        </div>
                      )}

                      {latest === null && (
                        <p className="text-xs text-vz-gray-400">No runs yet</p>
                      )}

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
