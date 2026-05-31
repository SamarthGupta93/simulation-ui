import { Link } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2, Plus, FileText, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/context/AppContext'
import type { GenerationRun } from '@/types'
import { cn } from '@/lib/utils'

export default function GeneratorRuns() {
  const { generationRuns, scenarios } = useApp()

  if (generationRuns.length === 0) {
    return (
      <div className="mx-auto max-w-2xl animate-fade-in">
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-vz-gray-400">{generationRuns.length} generation run{generationRuns.length !== 1 ? 's' : ''}</p>
        <Button asChild size="sm">
          <Link to="/generator"><Plus size={13} /> New Generation</Link>
        </Button>
      </div>

      <ul className="space-y-3">
        {generationRuns.map((run) => (
          <RunCard key={run.id} run={run} scenarioCount={scenarios.filter((s) => run.scenarioIds.includes(s.id)).length} />
        ))}
      </ul>
    </div>
  )
}

function RunCard({ run, scenarioCount }: { run: GenerationRun; scenarioCount: number }) {
  const isCompleted = run.status === 'completed'
  const isFailed = run.status === 'failed'

  return (
    <Card className={cn(isFailed && 'border-red-200 bg-red-50/30')}>
      <CardContent className="flex items-start gap-4 py-4">
        <div className="mt-0.5">
          {run.status === 'completed' && <CheckCircle2 size={20} className="text-green-500" />}
          {run.status === 'failed' && <XCircle size={20} className="text-red-500" />}
          {run.status === 'running' && <Loader2 size={20} className="animate-spin text-vz-red" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {run.inputs.documentName && (
              <span className="flex items-center gap-1 text-sm font-semibold text-vz-gray-900">
                <FileText size={13} className="text-vz-red" /> {run.inputs.documentName}
              </span>
            )}
            {run.inputs.policyConfig && !run.inputs.documentName && (
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
              <span className="text-green-600 font-medium">{scenarioCount} scenarios generated</span>
            )}
            {run.completedAt && (
              <span>
                Took {Math.round((new Date(run.completedAt).getTime() - new Date(run.createdAt).getTime()) / 1000)}s
              </span>
            )}
          </div>

          {run.error && (
            <p className="mt-1.5 text-xs text-red-600">{run.error}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Badge variant={run.status === 'completed' ? 'success' : run.status === 'failed' ? 'error' : 'warning'}>
            {run.status}
          </Badge>
          {isCompleted && (
            <Button asChild size="sm" variant="outline">
              <Link to={`/generator/runs/${run.id}`}>Review →</Link>
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
      <FileText size={32} className="mb-3 text-vz-gray-300" />
      <p className="font-semibold text-vz-gray-700">No generation runs yet</p>
      <p className="mt-1 text-sm text-vz-gray-400">Start by uploading a requirements document or policy config</p>
      <Button asChild className="mt-4"><Link to="/generator"><Plus size={13} /> New Generation</Link></Button>
    </div>
  )
}
