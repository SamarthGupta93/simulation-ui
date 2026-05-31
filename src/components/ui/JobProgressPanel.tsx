import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { Progress } from './progress'
import { cn } from '@/lib/utils'
import type { JobStatus, ProgressEvent } from '@/types'

interface JobProgressPanelProps {
  status: JobStatus
  progress: ProgressEvent[]
  className?: string
}

export function JobProgressPanel({ status, progress, className }: JobProgressPanelProps) {
  if (status === 'idle') return null

  const latest = progress[progress.length - 1]
  const percent = latest?.percent ?? 0

  return (
    <div className={cn('rounded-lg border border-border bg-white p-5', className)}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-vz-gray-900">
          {status === 'running' && 'Processing…'}
          {status === 'completed' && 'Completed'}
          {status === 'failed' && 'Failed'}
        </span>
        {status === 'running' && (
          <Loader2 size={16} className="animate-spin text-vz-red" />
        )}
        {status === 'completed' && (
          <CheckCircle2 size={16} className="text-green-600" />
        )}
        {status === 'failed' && (
          <XCircle size={16} className="text-red-600" />
        )}
      </div>

      {/* Progress bar */}
      <Progress value={status === 'completed' ? 100 : percent} className="mb-4" />

      {/* Step log */}
      <ul className="max-h-48 space-y-2 overflow-y-auto scrollbar-thin">
        {progress.map((ev, i) => (
          <li key={i} className="flex items-start gap-2 text-xs">
            <CheckCircle2
              size={13}
              className="mt-0.5 shrink-0 text-green-500"
            />
            <div>
              <span className="font-medium text-vz-gray-900">{ev.step}</span>
              <span className="ml-1 text-vz-gray-500">{ev.message}</span>
            </div>
          </li>
        ))}
        {status === 'running' && (
          <li className="flex items-center gap-2 text-xs text-vz-gray-400">
            <Loader2 size={13} className="shrink-0 animate-spin" />
            Working…
          </li>
        )}
      </ul>
    </div>
  )
}
