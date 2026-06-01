import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2, Plus, FileText, Calendar, Search, Lock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useApp } from '@/context/AppContext'
import type { GenerationRun } from '@/types'
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

export default function ScenarioRuns() {
  const { generationRuns, scenarios } = useApp()
  const [range, setRange] = useState<DateRange>('30d')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const cut = cutoff(range)
    return generationRuns.filter((r) => {
      const inRange = !cut || new Date(r.createdAt) >= cut
      const matchSearch = !search ||
        (r.inputs.documentName ?? '').toLowerCase().includes(search.toLowerCase()) ||
        r.status.includes(search.toLowerCase())
      return inRange && matchSearch
    })
  }, [generationRuns, range, search])

  // Metrics
  const completed = generationRuns.filter((r) => r.status === 'completed')
  const totalGenerated = completed.reduce((sum, r) => sum + r.scenarioIds.length, 0)
  const avgGenerated = completed.length > 0 ? (totalGenerated / completed.length).toFixed(1) : '—'
  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      {/* Metrics */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Runs', value: generationRuns.length },
          { label: 'Completed', value: completed.length },
          { label: 'Scenarios Generated', value: totalGenerated },
          { label: 'Avg per Run', value: avgGenerated },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="py-4">
              <p className="text-xl font-bold text-vz-gray-900">{m.value}</p>
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
            placeholder="Search by file name or status…"
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
          <Link to="/scenarios/new"><Plus size={13} /> New</Link>
        </Button>
      </div>

      <p className="text-xs text-vz-gray-400">{filtered.length} run{filtered.length !== 1 ? 's' : ''} shown</p>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-3">
          {filtered.map((run) => (
            <RunCard
              key={run.id}
              run={run}
              scenarioCount={scenarios.filter((s) => run.scenarioIds.includes(s.id)).length}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function RunCard({ run, scenarioCount }: { run: GenerationRun; scenarioCount: number }) {
  const isCompleted = run.status === 'completed'
  const isFailed = run.status === 'failed'
  const isReviewed = !!run.reviewed

  const inner = (
    <CardContent className="flex items-start gap-4 py-4">
      <div className="mt-0.5 shrink-0">
        {run.status === 'completed' && <CheckCircle2 size={20} className="text-green-500" />}
        {run.status === 'failed' && <XCircle size={20} className="text-red-500" />}
        {run.status === 'running' && <Loader2 size={20} className="animate-spin text-vz-red" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {run.inputs.documentName ? (
            <span className="flex items-center gap-1 text-sm font-semibold text-vz-gray-900">
              <FileText size={13} className="text-vz-red" /> {run.inputs.documentName}
            </span>
          ) : (
            <span className="text-sm font-semibold text-vz-gray-900">Policy JSON only</span>
          )}
          {run.inputs.policyConfig && run.inputs.documentName && (
            <Badge>+ policy config</Badge>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-vz-gray-400">
          <span className="flex items-center gap-1">
            <Calendar size={11} /> {new Date(run.createdAt).toLocaleString()}
          </span>
          {isCompleted && (
            <span className="font-medium text-green-600">{scenarioCount} scenarios generated</span>
          )}
          {run.completedAt && (
            <span>
              {Math.round((new Date(run.completedAt).getTime() - new Date(run.createdAt).getTime()) / 1000)}s
            </span>
          )}
        </div>
        {run.error && <p className="mt-1.5 text-xs text-red-600">{run.error}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Badge variant={run.status === 'completed' ? 'success' : run.status === 'failed' ? 'error' : 'warning'}>
          {run.status}
        </Badge>
        {isCompleted && !isReviewed && (
          <Button asChild size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
            <Link to={`/scenarios/runs/${run.id}`}>Review →</Link>
          </Button>
        )}
        {isReviewed && (
          <span className="flex items-center gap-1 text-xs font-medium text-green-600">
            <Lock size={11} /> Reviewed
          </span>
        )}
      </div>
    </CardContent>
  )

  if (isReviewed) {
    return (
      <Card className="hover:border-vz-gray-300 transition-colors group cursor-pointer">
        <Link to={`/scenarios/runs/${run.id}`} className="block">
          {inner}
        </Link>
      </Card>
    )
  }

  return (
    <Card className={cn(isFailed && 'border-red-200 bg-red-50/30')}>
      {inner}
    </Card>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-16 text-center">
      <FileText size={32} className="mb-3 text-vz-gray-300" />
      <p className="font-semibold text-vz-gray-700">No generation runs in this period</p>
      <p className="mt-1 text-sm text-vz-gray-400">Try a wider date range or start a new generation</p>
      <Button asChild className="mt-4">
        <Link to="/scenarios/new"><Plus size={13} /> Generate Scenarios</Link>
      </Button>
    </div>
  )
}
