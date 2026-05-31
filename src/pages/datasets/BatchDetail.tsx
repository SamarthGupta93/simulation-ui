import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Plus, ChevronDown, ChevronUp, Search, CheckCircle2, X, Sparkles, PenLine, Lock } from 'lucide-react'
import { HierarchyBreadcrumb } from '@/components/ui/HierarchyBreadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { useApp } from '@/context/AppContext'
import type { Scenario, ScenarioType } from '@/types'
import { cn } from '@/lib/utils'

const TYPE_COLORS: Record<ScenarioType, string> = {
  persona: 'bg-purple-100 text-purple-700',
  script: 'bg-blue-100 text-blue-700',
  hybrid: 'bg-amber-100 text-amber-700',
}

export default function BatchDetail() {
  const { datasetId, versionId, batchId } = useParams<{
    datasetId: string; versionId: string; batchId: string
  }>()
  const { evalDatasets, datasetVersions, datasetBatches, scenarios, updateDatasetBatch } = useApp()
  const navigate = useNavigate()

  const [pickerOpen, setPickerOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const dataset = evalDatasets.find((d) => d.id === datasetId)
  const version = datasetVersions.find((v) => v.id === versionId)
  const batch = datasetBatches.find((b) => b.id === batchId)
  const versionCount = datasetVersions.filter((v) => v.datasetId === datasetId).length
  const batchCount = datasetBatches.filter((b) => b.versionId === versionId).length

  if (!dataset || !version || !batch) {
    return (
      <div className="text-center py-20">
        <p className="text-vz-gray-400">Batch not found.</p>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mt-3">← Back</Button>
      </div>
    )
  }

  const isAutopilot = batch.source === 'autopilot'
  const batchScenarios = scenarios.filter((s) => batch.scenarioIds.includes(s.id))

  function handleAddFromBatches(ids: Set<string>) {
    const merged = Array.from(new Set([...batch!.scenarioIds, ...ids]))
    updateDatasetBatch(batchId!, { scenarioIds: merged })
    setPickerOpen(false)
  }

  function handleRemoveScenario(id: string) {
    updateDatasetBatch(batchId!, { scenarioIds: batch!.scenarioIds.filter((s) => s !== id) })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <HierarchyBreadcrumb segments={[
        { label: 'Datasets', href: '/datasets' },
        { label: dataset.name, count: `${versionCount} version${versionCount !== 1 ? 's' : ''}`, href: `/datasets/${datasetId}` },
        { label: version.label, count: `${batchCount} batch${batchCount !== 1 ? 'es' : ''}`, href: `/datasets/${datasetId}/versions/${versionId}` },
        { label: batch.name, count: `${batch.scenarioIds.length} scenario${batch.scenarioIds.length !== 1 ? 's' : ''}` },
      ]} />
      {/* Batch header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-lg font-semibold text-vz-gray-900">{batch.name}</h2>
            <span className={cn(
              'inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold uppercase',
              isAutopilot ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
            )}>
              {isAutopilot ? <Sparkles size={10} /> : <PenLine size={10} />}
              {batch.source}
            </span>
          </div>
          <p className="text-sm text-vz-gray-400">
            {batch.scenarioIds.length} scenario{batch.scenarioIds.length !== 1 ? 's' : ''}
          </p>
        </div>

        {!isAutopilot && (
          <Button onClick={() => setPickerOpen(true)}>
            <Plus size={14} /> Add Scenarios
          </Button>
        )}
      </div>

      {/* Autopilot read-only notice */}
      {isAutopilot && (
        <div className="flex items-start gap-3 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3">
          <Lock size={14} className="shrink-0 mt-0.5 text-purple-500" />
          <div>
            <p className="text-sm font-medium text-purple-900">This batch is read-only</p>
            <p className="text-xs text-purple-700 mt-0.5">
              Autopilot batches are sealed to their generation run. To produce more scenarios,
              run generation again from the{' '}
              <Link
                to={`/datasets/${datasetId}/versions/${versionId}`}
                className="underline hover:text-purple-900"
              >
                version page
              </Link>
              {' '}— each run creates a new batch.
            </p>
          </div>
        </div>
      )}

      {/* Scenario list */}
      {batchScenarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-lg">
          <p className="font-semibold text-vz-gray-700">No scenarios in this batch</p>
          <p className="text-sm text-vz-gray-400 mt-1 mb-5">
            Add scenarios from existing batches or create a new batch.
          </p>
          <Button onClick={() => setPickerOpen(true)}>
            <Plus size={14} /> Add Scenarios
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {batchScenarios.map((sc) => (
            <ScenarioRow
              key={sc.id}
              scenario={sc}
              expanded={expandedId === sc.id}
              onToggle={() => setExpandedId(expandedId === sc.id ? null : sc.id)}
              onRemove={!isAutopilot ? () => handleRemoveScenario(sc.id) : undefined}
            />
          ))}
        </div>
      )}

      {!isAutopilot && (
        <BatchPicker
          open={pickerOpen}
          currentBatchId={batchId!}
          existingScenarioIds={new Set(batch.scenarioIds)}
          datasetId={datasetId!}
          versionId={versionId!}
          onClose={() => setPickerOpen(false)}
          onConfirm={handleAddFromBatches}
        />
      )}
    </div>
  )
}

// ── Scenario Row ─────────────────────────────────────────────────────────────

function ScenarioRow({ scenario: sc, expanded, onToggle, onRemove }: {
  scenario: Scenario
  expanded: boolean
  onToggle: () => void
  onRemove?: () => void
}) {
  return (
    <Card>
      <div
        className="flex cursor-pointer items-center gap-3 px-4 py-3"
        onClick={onToggle}
      >
        <span className={cn(
          'shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase',
          TYPE_COLORS[sc.type]
        )}>
          {sc.type}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-vz-gray-900 truncate">{sc.title}</p>
          {sc.tags.length > 0 && (
            <div className="mt-0.5 flex gap-1 flex-wrap">
              {sc.tags.slice(0, 3).map((t) => <Badge key={t}>{t}</Badge>)}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {onRemove && (
            <button onClick={onRemove} className="text-vz-gray-300 hover:text-vz-red transition-colors p-1">
              <X size={13} />
            </button>
          )}
          {expanded ? <ChevronUp size={14} className="text-vz-gray-300" /> : <ChevronDown size={14} className="text-vz-gray-300" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 animate-fade-in space-y-3">
          {sc.description && (
            <p className="text-sm text-vz-gray-600 leading-relaxed">{sc.description}</p>
          )}
          {sc.personaConfig && (
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              {(['persona', 'goal', 'context', 'guidelines'] as const).map((field) => (
                sc.personaConfig![field] ? (
                  <div key={field}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-vz-gray-400 mb-0.5">{field}</p>
                    <p className="text-sm text-vz-gray-700 leading-relaxed">{sc.personaConfig![field]}</p>
                  </div>
                ) : null
              ))}
            </div>
          )}
          {sc.scriptMessages && sc.scriptMessages.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-vz-gray-400">Script Messages</p>
              <ol className="space-y-1.5">
                {sc.scriptMessages.map((msg, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="shrink-0 font-mono text-xs text-vz-gray-300 pt-0.5">{i + 1}.</span>
                    <span className="text-vz-gray-700">{msg}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

// ── Batch Picker ──────────────────────────────────────────────────────────────

function BatchPicker({
  open, currentBatchId, existingScenarioIds, datasetId, versionId, onClose, onConfirm,
}: {
  open: boolean
  currentBatchId: string
  existingScenarioIds: Set<string>
  datasetId: string
  versionId: string
  onClose: () => void
  onConfirm: (ids: Set<string>) => void
}) {
  const { datasetBatches, datasetVersions, evalDatasets } = useApp()
  const navigate = useNavigate()
  const [selectedBatchIds, setSelectedBatchIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'autopilot' | 'manual'>('all')

  function handleOpenChange(o: boolean) {
    if (o) { setSelectedBatchIds(new Set()); setSearch('') }
    if (!o) onClose()
  }

  const availableBatches = datasetBatches
    .filter((b) => {
      if (b.id === currentBatchId) return false
      if (b.scenarioIds.every((id) => existingScenarioIds.has(id))) return false
      const matchSource = sourceFilter === 'all' || b.source === sourceFilter
      const matchSearch = !search || b.name.toLowerCase().includes(search.toLowerCase())
      return matchSource && matchSearch
    })
    .map((b) => ({
      ...b,
      version: datasetVersions.find((v) => v.id === b.versionId),
      dataset: evalDatasets.find((d) => d.id === b.datasetId),
      newCount: b.scenarioIds.filter((id) => !existingScenarioIds.has(id)).length,
    }))

  function toggleBatch(id: string) {
    setSelectedBatchIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleConfirm() {
    const ids = new Set<string>()
    datasetBatches
      .filter((b) => selectedBatchIds.has(b.id))
      .forEach((b) => b.scenarioIds.forEach((id) => ids.add(id)))
    onConfirm(ids)
    setSelectedBatchIds(new Set())
  }

  const totalNewScenarios = datasetBatches
    .filter((b) => selectedBatchIds.has(b.id))
    .reduce((acc, b) => {
      b.scenarioIds.forEach((id) => { if (!existingScenarioIds.has(id)) acc.add(id) })
      return acc
    }, new Set<string>()).size

  function navigateTo(path: string) {
    onClose()
    navigate(path)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Scenarios</DialogTitle>
          <DialogDescription>
            Import scenarios from an existing batch, or create a new one.
          </DialogDescription>
        </DialogHeader>

        {/* Create new batch shortcuts */}
        <div className="px-6 pb-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-vz-gray-400 mb-2">
            Create new batch
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => navigateTo(`/datasets/${datasetId}/versions/${versionId}/generate`)}
              className="flex-1 flex items-center gap-2 rounded border border-purple-200 bg-purple-50 px-3 py-2.5 text-left hover:bg-purple-100 transition-colors"
            >
              <Sparkles size={14} className="shrink-0 text-purple-600" />
              <div>
                <p className="text-xs font-semibold text-purple-900">Autopilot Batch</p>
                <p className="text-[10px] text-purple-600">Generate via AI from a document</p>
              </div>
            </button>
            <button
              onClick={() => navigateTo(`/datasets/${datasetId}/versions/${versionId}`)}
              className="flex-1 flex items-center gap-2 rounded border border-blue-200 bg-blue-50 px-3 py-2.5 text-left hover:bg-blue-100 transition-colors"
            >
              <PenLine size={14} className="shrink-0 text-blue-600" />
              <div>
                <p className="text-xs font-semibold text-blue-900">Manual Batch</p>
                <p className="text-[10px] text-blue-600">Curate scenarios by hand</p>
              </div>
            </button>
          </div>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-vz-gray-400">
              or import from existing
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Search + filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-vz-gray-300" />
              <Input
                placeholder="Search batches…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            <div className="flex gap-1.5">
              {(['all', 'autopilot', 'manual'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSourceFilter(s)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors',
                    sourceFilter === s ? 'bg-vz-black text-white' : 'bg-vz-gray-100 text-vz-gray-500 hover:bg-vz-gray-200'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Batch list */}
        <div className="max-h-60 overflow-y-auto px-6 py-2 space-y-1.5 scrollbar-thin">
          {availableBatches.length === 0 && (
            <p className="py-6 text-center text-sm text-vz-gray-400">
              No batches available to import from.
            </p>
          )}
          {availableBatches.map((b) => {
            const selected = selectedBatchIds.has(b.id)
            return (
              <button
                key={b.id}
                onClick={() => toggleBatch(b.id)}
                className={cn(
                  'w-full flex items-center gap-3 rounded border px-3 py-2.5 text-left transition-colors',
                  selected ? 'border-vz-red bg-red-50' : 'border-border hover:border-vz-gray-300'
                )}
              >
                <span className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
                  selected ? 'border-vz-red bg-vz-red' : 'border-vz-gray-300'
                )}>
                  {selected && <CheckCircle2 size={11} className="text-white" strokeWidth={3} />}
                </span>
                <div className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded',
                  b.source === 'autopilot' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                )}>
                  {b.source === 'autopilot' ? <Sparkles size={12} /> : <PenLine size={12} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-vz-gray-900">{b.name}</p>
                  <p className="text-[10px] text-vz-gray-400 mt-0.5 truncate">
                    {b.dataset?.name ?? '—'} · {b.version?.label ?? '—'}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-medium text-vz-gray-700">{b.newCount} new</p>
                  <p className="text-[10px] text-vz-gray-400">{b.scenarioIds.length} total</p>
                </div>
              </button>
            )
          })}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleConfirm} disabled={selectedBatchIds.size === 0}>
            Add {totalNewScenarios > 0 ? totalNewScenarios : ''} Scenario{totalNewScenarios !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
