import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Plus, Layers, ArrowRight, Trash2, Sparkles, PenLine, Search, CheckCircle2, Clock } from 'lucide-react'
import { HierarchyBreadcrumb } from '@/components/ui/HierarchyBreadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'

export default function VersionDetail() {
  const { datasetId, versionId } = useParams<{ datasetId: string; versionId: string }>()
  const { evalDatasets, datasetVersions, datasetBatches, generationRuns, addDatasetBatch, deleteDatasetBatch } = useApp()
  const navigate = useNavigate()

  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const dataset = evalDatasets.find((d) => d.id === datasetId)
  const version = datasetVersions.find((v) => v.id === versionId)
  const batches = datasetBatches
    .filter((b) => b.versionId === versionId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  // Generation runs that completed but whose review hasn't been saved as a batch yet
  const pendingReviews = generationRuns.filter(
    (r) =>
      r.versionId === versionId &&
      r.status === 'completed' &&
      !datasetBatches.some((b) => b.generationRunId === r.id)
  )

  if (!dataset || !version) {
    return (
      <div className="text-center py-20">
        <p className="text-vz-gray-400">Version not found.</p>
        <Button variant="ghost" onClick={() => navigate(`/datasets/${datasetId}`)} className="mt-3">
          ← Back
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <HierarchyBreadcrumb segments={[
        { label: 'Datasets', href: '/datasets' },
        {
          label: dataset.name,
          count: `${datasetVersions.filter(v => v.datasetId === datasetId).length} version${datasetVersions.filter(v => v.datasetId === datasetId).length !== 1 ? 's' : ''}`,
          href: `/datasets/${datasetId}`,
        },
        { label: version.label, count: `${batches.length} batch${batches.length !== 1 ? 'es' : ''}` },
      ]} />

      {/* Version header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-lg font-semibold text-vz-gray-900">{dataset.name}</h2>
            <span className="rounded border border-border bg-vz-gray-100 px-2 py-0.5 text-xs font-bold text-vz-gray-700">
              {version.label}
            </span>
          </div>
          {version.description && (
            <p className="text-sm text-vz-gray-500">{version.description}</p>
          )}
        </div>

        <Button onClick={() => setAddOpen(true)}>
          <Plus size={14} /> Add Scenarios
        </Button>
      </div>

      {/* Pending reviews */}
      {pendingReviews.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-amber-600 shrink-0" />
            <p className="text-sm font-semibold text-amber-900">
              {pendingReviews.length} autopilot run{pendingReviews.length !== 1 ? 's' : ''} awaiting review
            </p>
          </div>
          <p className="text-xs text-amber-700">
            These runs completed but have not been reviewed yet. A batch is only created after you save the review.
          </p>
          <div className="space-y-1.5 pt-0.5">
            {pendingReviews.map((run) => {
              const label = run.inputs.documentName
                ? run.inputs.documentName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim()
                : `Autopilot — ${new Date(run.completedAt ?? run.createdAt).toLocaleDateString()}`
              return (
                <div key={run.id} className="flex items-center justify-between rounded border border-amber-200 bg-white px-3 py-2 gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-vz-gray-900 truncate">{label}</p>
                    <p className="text-[10px] text-vz-gray-400">
                      {run.scenarioIds.length} scenario{run.scenarioIds.length !== 1 ? 's' : ''} generated
                      {run.completedAt && <> · {new Date(run.completedAt).toLocaleDateString()}</>}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 border-amber-300 text-amber-800 hover:bg-amber-50"
                    onClick={() => navigate(`/datasets/${datasetId}/versions/${versionId}/generate/review/${run.id}`)}
                  >
                    Complete Review →
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Batches */}
      {batches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-lg">
          <Layers size={24} className="text-vz-gray-300 mb-3" />
          <p className="font-semibold text-vz-gray-700">No batches yet</p>
          <p className="text-sm text-vz-gray-400 mt-1 mb-6 max-w-xs">
            Generate a batch with AI, build one manually, or import from an existing batch.
          </p>
          <Button onClick={() => setAddOpen(true)}>
            <Plus size={14} /> Add Scenarios
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-vz-gray-400">
            {batches.length} Batch{batches.length !== 1 ? 'es' : ''}
          </p>
          {batches.map((batch) => (
            <Card key={batch.id} className="hover:border-vz-gray-300 transition-colors group">
              <CardContent className="p-0">
                <div className="flex items-center gap-1 px-2 py-1">
                  <Link
                    to={`/datasets/${datasetId}/versions/${versionId}/batches/${batch.id}`}
                    className="flex items-center gap-4 flex-1 min-w-0 px-3 py-3"
                  >
                    <div className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded text-xs',
                      batch.source === 'autopilot'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-blue-100 text-blue-600'
                    )}>
                      {batch.source === 'autopilot' ? <Sparkles size={14} /> : <PenLine size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-vz-gray-900 group-hover:text-vz-red transition-colors">
                        {batch.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="default">{batch.source}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-5 shrink-0 text-xs text-vz-gray-400">
                      <span>{batch.scenarioIds.length} scenario{batch.scenarioIds.length !== 1 ? 's' : ''}</span>
                      <span>{new Date(batch.createdAt).toLocaleDateString()}</span>
                    </div>
                    <ArrowRight size={14} className="shrink-0 text-vz-gray-300 group-hover:text-vz-red transition-colors" />
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(batch.id)}
                    className="shrink-0 mr-2 text-vz-gray-300 hover:text-vz-red transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddScenariosDialog
        open={addOpen}
        datasetId={datasetId!}
        versionId={versionId!}
        existingBatchIds={new Set(batches.map((b) => b.id))}
        onClose={() => setAddOpen(false)}
        onImport={(sourceBatches) => {
          sourceBatches.forEach((b) => {
            addDatasetBatch({
              versionId: versionId!,
              datasetId: datasetId!,
              name: b.name,
              source: b.source,
              scenarioIds: b.scenarioIds,
              generationRunId: b.generationRunId,
            })
          })
          setAddOpen(false)
        }}
        onManualCreate={(name) => {
          const batch = addDatasetBatch({
            versionId: versionId!,
            datasetId: datasetId!,
            name,
            source: 'manual',
            scenarioIds: [],
          })
          setAddOpen(false)
          navigate(`/datasets/${datasetId}/versions/${versionId}/batches/${batch.id}`)
        }}
      />

      {/* Delete Batch Dialog */}
      {deleteTarget && (
        <Dialog open onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Batch?</DialogTitle>
              <DialogDescription>
                This will remove the batch. Scenarios in manual batches are not deleted from the library.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
              <Button
                variant="destructive"
                onClick={() => { deleteDatasetBatch(deleteTarget); setDeleteTarget(null) }}
              >
                <Trash2 size={13} /> Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// ── Add Scenarios Dialog ──────────────────────────────────────────────────────

type DialogMode = 'main' | 'manual-name'

function AddScenariosDialog({
  open, datasetId, versionId, existingBatchIds, onClose, onImport, onManualCreate,
}: {
  open: boolean
  datasetId: string
  versionId: string
  existingBatchIds: Set<string>
  onClose: () => void
  onImport: (batches: Array<{ name: string; source: 'manual' | 'autopilot'; scenarioIds: string[]; generationRunId?: string }>) => void
  onManualCreate: (name: string) => void
}) {
  const { datasetBatches, datasetVersions, evalDatasets } = useApp()
  const navigate = useNavigate()

  const [mode, setMode] = useState<DialogMode>('main')
  const [manualName, setManualName] = useState('')
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'autopilot' | 'manual'>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  function reset() {
    setMode('main')
    setManualName('')
    setSearch('')
    setSelectedIds(new Set())
  }

  function handleOpenChange(o: boolean) {
    if (o) reset()
    if (!o) { reset(); onClose() }
  }

  function handleAutopilot() {
    onClose()
    navigate(`/datasets/${datasetId}/versions/${versionId}/generate`)
  }

  function handleManualCreate() {
    if (!manualName.trim()) return
    onManualCreate(manualName.trim())
    reset()
  }

  function handleImport() {
    const selected = datasetBatches.filter((b) => selectedIds.has(b.id))
    onImport(selected.map((b) => ({
      name: b.name,
      source: b.source,
      scenarioIds: b.scenarioIds,
      generationRunId: b.generationRunId,
    })))
    reset()
  }

  function toggleBatch(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const availableBatches = datasetBatches
    .filter((b) => {
      if (existingBatchIds.has(b.id)) return false
      const matchSource = sourceFilter === 'all' || b.source === sourceFilter
      const matchSearch = !search || b.name.toLowerCase().includes(search.toLowerCase())
      return matchSource && matchSearch
    })
    .map((b) => ({
      ...b,
      version: datasetVersions.find((v) => v.id === b.versionId),
      dataset: evalDatasets.find((d) => d.id === b.datasetId),
    }))

  const totalScenarios = datasetBatches
    .filter((b) => selectedIds.has(b.id))
    .reduce((sum, b) => sum + b.scenarioIds.length, 0)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Scenarios</DialogTitle>
          <DialogDescription>
            {mode === 'main'
              ? 'Create a new batch or import scenarios from an existing one.'
              : 'Give your manual batch a name to get started.'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'manual-name' ? (
          /* ── Manual batch name sub-form ── */
          <div className="px-6 pb-0 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="batch-name">Batch Name *</Label>
              <Input
                id="batch-name"
                placeholder="e.g. Billing Disputes, Auth Flows…"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleManualCreate() }}
                autoFocus
              />
            </div>
          </div>
        ) : (
          /* ── Main view ── */
          <div className="px-6 pb-0 space-y-4">
            {/* Create new batch */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-vz-gray-400 mb-2">
                Create new batch
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleAutopilot}
                  className="flex-1 flex items-center gap-2.5 rounded border border-purple-200 bg-purple-50 px-3 py-2.5 text-left hover:bg-purple-100 transition-colors"
                >
                  <Sparkles size={14} className="shrink-0 text-purple-600" />
                  <div>
                    <p className="text-xs font-semibold text-purple-900">Autopilot Batch</p>
                    <p className="text-[10px] text-purple-600">Generate via AI from a document</p>
                  </div>
                </button>
                <button
                  onClick={() => setMode('manual-name')}
                  className="flex-1 flex items-center gap-2.5 rounded border border-blue-200 bg-blue-50 px-3 py-2.5 text-left hover:bg-blue-100 transition-colors"
                >
                  <PenLine size={14} className="shrink-0 text-blue-600" />
                  <div>
                    <p className="text-xs font-semibold text-blue-900">Manual Batch</p>
                    <p className="text-[10px] text-blue-600">Curate scenarios by hand</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-vz-gray-400">
                or import existing
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
        )}

        {/* Batch list (main mode only) */}
        {mode === 'main' && (
          <div className="max-h-56 overflow-y-auto px-6 py-2 space-y-1.5 scrollbar-thin">
            {availableBatches.length === 0 ? (
              <p className="py-5 text-center text-sm text-vz-gray-400">
                {datasetBatches.filter((b) => !existingBatchIds.has(b.id)).length === 0
                  ? 'No other batches exist yet.'
                  : 'No batches match your filters.'}
              </p>
            ) : (
              availableBatches.map((b) => {
                const selected = selectedIds.has(b.id)
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
                    <span className="shrink-0 text-xs text-vz-gray-400">
                      {b.scenarioIds.length} scenario{b.scenarioIds.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        )}

        <DialogFooter>
          {mode === 'manual-name' ? (
            <>
              <Button variant="secondary" onClick={() => setMode('main')}>← Back</Button>
              <Button onClick={handleManualCreate} disabled={!manualName.trim()}>
                Create &amp; Open
              </Button>
            </>
          ) : (
            <>
              <DialogClose asChild>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
              </DialogClose>
              <Button onClick={handleImport} disabled={selectedIds.size === 0}>
                Import {totalScenarios > 0 ? `${totalScenarios} ` : ''}Scenario{totalScenarios !== 1 ? 's' : ''}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
