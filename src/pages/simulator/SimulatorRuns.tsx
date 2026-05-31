import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2, Plus, Calendar, Server, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useApp } from '@/context/AppContext'
import type { SimulationRun } from '@/types'
import { cn } from '@/lib/utils'

type DateRange = '1d' | '7d' | '30d' | 'all'

const DATE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '1d', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'all', label: 'All time' },
]

function cutoff(range: DateRange): Date | null {
  if (range === 'all') return null
  const d = new Date()
  if (range === '1d') d.setDate(d.getDate() - 1)
  if (range === '7d') d.setDate(d.getDate() - 7)
  if (range === '30d') d.setDate(d.getDate() - 30)
  return d
}

export default function SimulatorRuns() {
  const { simulationRuns, agents } = useApp()
  const [range, setRange] = useState<DateRange>('30d')
  const [search, setSearch] = useState('')

  const agentMap = useMemo(
    () => Object.fromEntries(agents.map((a) => [a.id, a.name])),
    [agents]
  )

  const filtered = useMemo(() => {
    const cut = cutoff(range)
    return simulationRuns.filter((r) => {
      const inRange = !cut || new Date(r.createdAt) >= cut
      const agentName = agentMap[r.agentId] ?? ''
      const matchSearch = !search ||
        agentName.toLowerCase().includes(search.toLowerCase()) ||
        r.status.includes(search.toLowerCase())
      return inRange && matchSearch
    })
  }, [simulationRuns, range, search, agentMap])

  // Metrics
  const completed = simulationRuns.filter((r) => r.status === 'completed')
  const allResults = completed.flatMap((r) => r.results)
  const passCount = allResults.filter((r) => r.status === 'pass').length
  const overallPassRate = allResults.length > 0
    ? Math.round((passCount / allResults.length) * 100)
    : null
  const totalScenariosTested = allResults.length

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      {/* Metrics */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Runs', value: simulationRuns.length },
          { label: 'Completed', value: completed.length },
          { label: 'Scenarios Tested', value: totalScenariosTested },
          {
            label: 'Overall Pass Rate',
            value: overallPassRate !== null ? `${overallPassRate}%` : '—',
            highlight: overallPassRate !== null
              ? overallPassRate >= 75 ? 'text-green-600' : 'text-red-600'
              : undefined,
          },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="py-4">
              <p className={cn('text-xl font-bold', m.highlight ?? 'text-vz-gray-900')}>{m.value}</p>
              <p className="text-xs text-vz-gray-500">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-vz-gray-300" />
          <Input
            placeholder="Search by agent name or status…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={range} onChange={(e) => setRange(e.target.value as DateRange)} className="w-40">
          {DATE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
        <Button asChild size="sm">
          <Link to="/simulator"><Plus size={13} /> New</Link>
        </Button>
      </div>

      <p className="text-xs text-vz-gray-400">{filtered.length} run{filtered.length !== 1 ? 's' : ''} shown</p>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-3">
          {filtered.map((run) => {
            const passCount = run.results.filter((r) => r.status === 'pass').length
            const total = run.results.length
            const passRate = total > 0 ? Math.round((passCount / total) * 100) : null
            return (
              <RunCard
                key={run.id}
                run={run}
                agentName={agentMap[run.agentId] ?? 'Unknown agent'}
                passRate={passRate}
              />
            )
          })}
        </ul>
      )}
    </div>
  )
}

function RunCard({ run, agentName, passRate }: {
  run: SimulationRun; agentName: string; passRate: number | null
}) {
  const isFailed = run.status === 'failed'

  return (
    <Card className={cn(isFailed && 'border-red-200 bg-red-50/30')}>
      <CardContent className="flex items-start gap-4 py-4">
        <div className="mt-0.5 shrink-0">
          {run.status === 'completed' && <CheckCircle2 size={20} className="text-green-500" />}
          {run.status === 'failed' && <XCircle size={20} className="text-red-500" />}
          {run.status === 'running' && <Loader2 size={20} className="animate-spin text-vz-red" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Server size={13} className="text-vz-red shrink-0" />
            <span className="font-semibold text-sm text-vz-gray-900 truncate">{agentName}</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-vz-gray-400">
            <span>{run.scenarioIds.length} scenario{run.scenarioIds.length !== 1 ? 's' : ''}</span>
            <span>max {run.config.maxTurns} turns</span>
            <span className="flex items-center gap-1">
              <Calendar size={11} /> {new Date(run.createdAt).toLocaleString()}
            </span>
          </div>
          {passRate !== null && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-vz-gray-100">
                <div className="h-full bg-green-500 transition-all" style={{ width: `${passRate}%` }} />
              </div>
              <span className={cn(
                'text-xs font-semibold',
                passRate >= 75 ? 'text-green-600' : 'text-red-600'
              )}>
                {passRate}% pass
              </span>
            </div>
          )}
          {run.error && <p className="mt-1 text-xs text-red-600">{run.error}</p>}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Badge variant={run.status === 'completed' ? 'success' : run.status === 'failed' ? 'error' : 'warning'}>
            {run.status}
          </Badge>
          {run.status === 'completed' && (
            <Button asChild size="sm" variant="outline">
              <Link to={`/simulator/runs/${run.id}`}>Results →</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-16 text-center">
      <Server size={32} className="mb-3 text-vz-gray-300" />
      <p className="font-semibold text-vz-gray-700">No simulation runs in this period</p>
      <p className="mt-1 text-sm text-vz-gray-400">Try a wider date range or start a new simulation</p>
      <Button asChild className="mt-4">
        <Link to="/simulator"><Plus size={13} /> New Simulation</Link>
      </Button>
    </div>
  )
}
