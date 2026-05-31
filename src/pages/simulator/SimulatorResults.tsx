import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp, Server } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/context/AppContext'
import type { SimulationResult } from '@/types'
import { cn } from '@/lib/utils'


export default function SimulatorResults() {
  const { id } = useParams<{ id: string }>()
  const { simulationRuns, agents, scenarios } = useApp()

  const run = simulationRuns.find((r) => r.id === id)
  const agent = agents.find((a) => a.id === run?.agentId)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (!run) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center animate-fade-in">
        <p className="text-vz-gray-500">Run not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/simulator/runs"><ArrowLeft size={13} /> Back to runs</Link>
        </Button>
      </div>
    )
  }

  const passCount = run.results.filter((r) => r.status === 'pass').length
  const failCount = run.results.filter((r) => r.status === 'fail').length
  const errorCount = run.results.filter((r) => r.status === 'error').length
  const total = run.results.length
  const passRate = total > 0 ? Math.round((passCount / total) * 100) : 0

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/simulator/runs"><ArrowLeft size={14} /> Simulation Runs</Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Server size={14} className="text-vz-red" />
            <span className="font-semibold text-vz-gray-900">{agent?.name ?? 'Unknown agent'}</span>
          </div>
          <p className="text-xs text-vz-gray-400">{new Date(run.createdAt).toLocaleString()}</p>
        </div>
        <Badge variant={run.status === 'completed' ? 'success' : 'error'}>{run.status}</Badge>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Pass', value: passCount, color: 'text-green-600' },
          { label: 'Fail', value: failCount, color: 'text-red-600' },
          { label: 'Error', value: errorCount, color: 'text-amber-600' },
          { label: 'Pass Rate', value: `${passRate}%`, color: passRate >= 75 ? 'text-green-600' : 'text-red-600' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3">
              <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
              <p className="text-xs text-vz-gray-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pass rate bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-vz-gray-400">
          <span>{passCount} passed</span>
          <span>{failCount + errorCount} failed</span>
        </div>
        <div className="flex h-2.5 overflow-hidden rounded-full bg-vz-gray-100">
          <div className="bg-green-500 transition-all" style={{ width: `${passRate}%` }} />
          <div className="bg-red-500 transition-all" style={{ width: `${((failCount + errorCount) / total) * 100}%` }} />
        </div>
      </div>

      {/* Config summary */}
      <Card>
        <CardContent className="flex flex-wrap gap-6 py-4 text-sm">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-vz-gray-400">Endpoint</p>
            <p className="mt-0.5 font-mono text-xs text-vz-gray-700">{agent?.endpoint ?? '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-vz-gray-400">Response Key</p>
            <p className="mt-0.5 font-mono text-xs text-vz-gray-700">{agent?.responseKey ?? '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-vz-gray-400">Max Turns</p>
            <p className="mt-0.5 text-xs text-vz-gray-700">{run.config.maxTurns}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-vz-gray-400">Scenarios</p>
            <p className="mt-0.5 text-xs text-vz-gray-700">{total}</p>
          </div>
        </CardContent>
      </Card>

      {/* Results list */}
      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-vz-gray-400">Scenario Results</p>
        {run.results.map((result) => {
          const sc = scenarios.find((s) => s.id === result.scenarioId)
          return (
            <ResultCard
              key={result.scenarioId}
              result={result}
              title={sc?.title ?? result.scenarioId}
              expanded={expandedId === result.scenarioId}
              onToggle={() => setExpandedId(expandedId === result.scenarioId ? null : result.scenarioId)}
            />
          )
        })}
      </section>
    </div>
  )
}

function ResultCard({ result, title, expanded, onToggle }: {
  result: SimulationResult; title: string; expanded: boolean; onToggle: () => void
}) {
  const icon =
    result.status === 'pass' ? <CheckCircle2 size={18} className="text-green-500" /> :
    result.status === 'fail' ? <XCircle size={18} className="text-red-500" /> :
    <AlertCircle size={18} className="text-amber-500" />

  return (
    <Card>
      <div className="flex cursor-pointer items-center gap-3 p-4" onClick={onToggle}>
        {icon}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold text-vz-gray-900">{title}</p>
          <p className="text-xs text-vz-gray-400">
            {result.turnCount} turns · {(result.durationMs / 1000).toFixed(1)}s
          </p>
        </div>
        {result.failReason && (
          <span className="hidden sm:block max-w-[240px] truncate text-xs text-red-500">{result.failReason}</span>
        )}
        <Badge variant={result.status === 'pass' ? 'success' : result.status === 'fail' ? 'error' : 'warning'}>
          {result.status}
        </Badge>
        {expanded ? <ChevronUp size={14} className="text-vz-gray-300" /> : <ChevronDown size={14} className="text-vz-gray-300" />}
      </div>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 animate-fade-in space-y-3">
          {result.failReason && (
            <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
              <span className="font-semibold">Failure reason:</span> {result.failReason}
            </div>
          )}
          <p className="text-xs font-semibold uppercase tracking-wider text-vz-gray-400">Transcript</p>
          <div className="flex flex-col gap-2">
            {result.transcript.map((turn, i) => (
              <div key={i} className={cn(
                'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                turn.role === 'user'
                  ? 'self-end bg-vz-gray-100 text-vz-gray-900'
                  : 'self-start bg-red-50 text-vz-gray-900 border border-red-100'
              )}>
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-vz-gray-400">
                  {turn.role === 'user' ? 'User' : 'Agent'}
                </p>
                {turn.content}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
