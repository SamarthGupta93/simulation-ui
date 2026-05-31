import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Check, Pencil, ChevronDown, ChevronUp, CheckCheck, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { HierarchyBreadcrumb } from '@/components/ui/HierarchyBreadcrumb'
import { useApp } from '@/context/AppContext'
import type { Scenario } from '@/types'
import { cn } from '@/lib/utils'

const TYPE_COLORS: Record<string, string> = {
  persona: 'bg-purple-100 text-purple-700',
  script: 'bg-blue-100 text-blue-700',
  hybrid: 'bg-amber-100 text-amber-700',
}

function deriveBatchName(docName?: string): string {
  if (docName) return docName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim()
  return `Autopilot — ${new Date().toLocaleDateString()}`
}

export default function AutopilotReview() {
  const { datasetId, versionId, runId } = useParams<{
    datasetId: string; versionId: string; runId: string
  }>()
  const {
    evalDatasets, datasetVersions, datasetBatches,
    generationRuns, scenarios,
    updateScenario, deleteScenario, addDatasetBatch,
  } = useApp()
  const navigate = useNavigate()

  const dataset = evalDatasets.find((d) => d.id === datasetId)
  const version = datasetVersions.find((v) => v.id === versionId)
  const run = generationRuns.find((r) => r.id === runId)
  const runScenarios = scenarios.filter((s) => run?.scenarioIds.includes(s.id))

  const versionCount = datasetVersions.filter((v) => v.datasetId === datasetId).length
  const batchCount = datasetBatches.filter((b) => b.versionId === versionId).length

  // All selected by default
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(runScenarios.map((sc) => sc.id))
  )
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  if (!dataset || !version || !run) {
    return (
      <div className="text-center py-20">
        <p className="text-vz-gray-400">Generation run not found.</p>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mt-3">← Back</Button>
      </div>
    )
  }

  const allSelected = selected.size === runScenarios.length
  const noneSelected = selected.size === 0

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelected(new Set(runScenarios.map((sc) => sc.id)))
  }

  function deselectAll() {
    setSelected(new Set())
  }

  function handleSave() {
    // Delete scenarios that were not selected
    runScenarios
      .filter((sc) => !selected.has(sc.id))
      .forEach((sc) => deleteScenario(sc.id))

    const batch = addDatasetBatch({
      versionId: versionId!,
      datasetId: datasetId!,
      name: deriveBatchName(run!.inputs.documentName),
      source: 'autopilot',
      scenarioIds: [...selected],
      generationRunId: runId,
    })

    navigate(`/datasets/${datasetId}/versions/${versionId}/batches/${batch.id}`)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <HierarchyBreadcrumb segments={[
        { label: 'Datasets', href: '/datasets' },
        { label: dataset.name, count: `${versionCount} version${versionCount !== 1 ? 's' : ''}`, href: `/datasets/${datasetId}` },
        { label: version.label, count: `${batchCount} batch${batchCount !== 1 ? 'es' : ''}`, href: `/datasets/${datasetId}/versions/${versionId}` },
        { label: 'Review Generated Scenarios', count: `${runScenarios.length} scenarios` },
      ]} />

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-vz-gray-900">Review Generated Scenarios</h2>
          <p className="text-sm text-vz-gray-500 mt-0.5">
            Batch: <span className="font-medium text-vz-gray-700">"{deriveBatchName(run.inputs.documentName)}"</span>
            {run.inputs.documentName && (
              <> · <span className="text-vz-gray-400">{run.inputs.documentName}</span></>
            )}
          </p>
        </div>
        <Button onClick={handleSave} disabled={noneSelected} size="lg">
          <Check size={14} />
          Save {selected.size > 0 ? `${selected.size} ` : ''}Scenario{selected.size !== 1 ? 's' : ''}
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-2.5">
        <p className="text-sm text-vz-gray-500">
          <span className="font-semibold text-vz-gray-900">{selected.size}</span> of {runScenarios.length} selected
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={selectAll} disabled={allSelected}>
            <CheckCheck size={13} /> Select All
          </Button>
          <Button variant="ghost" size="sm" onClick={deselectAll} disabled={noneSelected}>
            <Square size={13} /> Deselect All
          </Button>
        </div>
      </div>

      {/* Scenario list */}
      {runScenarios.length === 0 ? (
        <p className="text-center text-sm text-vz-gray-400 py-10">
          No scenarios were generated in this run.
        </p>
      ) : (
        <div className="space-y-2">
          {runScenarios.map((sc) => (
            <ReviewCard
              key={sc.id}
              scenario={sc}
              isSelected={selected.has(sc.id)}
              expanded={expandedId === sc.id}
              editing={editingId === sc.id}
              onToggleSelect={() => toggle(sc.id)}
              onToggleExpand={() => setExpandedId(expandedId === sc.id ? null : sc.id)}
              onEdit={() => { setEditingId(sc.id); setExpandedId(sc.id) }}
              onSave={() => setEditingId(null)}
              onChange={(patch) => updateScenario(sc.id, patch)}
            />
          ))}
        </div>
      )}

      {/* Bottom save bar */}
      {runScenarios.length > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <p className="text-xs text-vz-gray-400">
            {runScenarios.length - selected.size > 0
              ? `${runScenarios.length - selected.size} unselected scenario${runScenarios.length - selected.size !== 1 ? 's' : ''} will be discarded.`
              : 'All scenarios will be saved to the batch.'}
          </p>
          <Button onClick={handleSave} disabled={noneSelected}>
            <Check size={14} />
            Save {selected.size > 0 ? `${selected.size} ` : ''}Scenario{selected.size !== 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  )
}

// ── Review Card ───────────────────────────────────────────────────────────────

function ReviewCard({
  scenario: sc, isSelected, expanded, editing,
  onToggleSelect, onToggleExpand, onEdit, onSave, onChange,
}: {
  scenario: Scenario
  isSelected: boolean
  expanded: boolean
  editing: boolean
  onToggleSelect: () => void
  onToggleExpand: () => void
  onEdit: () => void
  onSave: () => void
  onChange: (p: Partial<Scenario>) => void
}) {
  return (
    <Card className={cn(
      'transition-all',
      isSelected ? 'border-vz-gray-300' : 'opacity-50 border-border',
    )}>
      <div
        className="flex cursor-pointer items-center gap-3 px-4 py-3"
        onClick={onToggleExpand}
      >
        {/* Checkbox */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSelect() }}
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
            isSelected
              ? 'border-vz-red bg-vz-red'
              : 'border-vz-gray-300 hover:border-vz-gray-400'
          )}
        >
          {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
        </button>

        <span className={cn(
          'shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase',
          TYPE_COLORS[sc.type]
        )}>
          {sc.type}
        </span>

        <div className="flex-1 min-w-0">
          {editing ? (
            <Input
              value={sc.title}
              onChange={(e) => onChange({ title: e.target.value })}
              className="h-7 text-sm font-semibold"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p className={cn(
              'text-sm font-semibold truncate',
              isSelected ? 'text-vz-gray-900' : 'text-vz-gray-400 line-through'
            )}>
              {sc.title}
            </p>
          )}
          {sc.tags.length > 0 && !editing && (
            <div className="mt-0.5 flex gap-1 flex-wrap">
              {sc.tags.slice(0, 4).map((t) => <Badge key={t}>{t}</Badge>)}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={editing ? onSave : onEdit} title={editing ? 'Save' : 'Edit'}>
            <Pencil size={13} className={editing ? 'text-vz-red' : 'text-vz-gray-400'} />
          </Button>
          {expanded
            ? <ChevronUp size={14} className="text-vz-gray-300" />
            : <ChevronDown size={14} className="text-vz-gray-300" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 animate-fade-in space-y-3">
          {sc.description && !editing && (
            <p className="text-sm text-vz-gray-600 leading-relaxed">{sc.description}</p>
          )}
          {sc.personaConfig && (
            <div className="grid gap-3 sm:grid-cols-2">
              {(['persona', 'goal', 'context', 'guidelines'] as const).map((field) => (
                sc.personaConfig![field] || editing ? (
                  <div key={field}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-vz-gray-400 mb-0.5">
                      {field}
                    </p>
                    {editing ? (
                      <Textarea
                        value={sc.personaConfig![field]}
                        onChange={(e) => onChange({ personaConfig: { ...sc.personaConfig!, [field]: e.target.value } })}
                        rows={2}
                        className="text-xs resize-none"
                      />
                    ) : (
                      <p className="text-sm text-vz-gray-700 leading-relaxed">{sc.personaConfig![field]}</p>
                    )}
                  </div>
                ) : null
              ))}
            </div>
          )}
          {sc.scriptMessages && sc.scriptMessages.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-vz-gray-400">
                Script Messages
              </p>
              <ol className="space-y-1.5">
                {sc.scriptMessages.map((msg, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="shrink-0 font-mono text-xs text-vz-gray-300 pt-0.5">{i + 1}.</span>
                    {editing ? (
                      <Input
                        value={msg}
                        onChange={(e) => {
                          const updated = [...sc.scriptMessages!]
                          updated[i] = e.target.value
                          onChange({ scriptMessages: updated })
                        }}
                        className="text-sm"
                      />
                    ) : (
                      <span className="text-sm text-vz-gray-700">{msg}</span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {editing && (
            <div className="space-y-1.5">
              <Label className="text-xs">Tags (comma-separated)</Label>
              <Input
                value={sc.tags.join(', ')}
                onChange={(e) => onChange({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
                placeholder="billing, escalation, …"
                className="text-sm"
              />
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
