import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, ChevronDown, ChevronUp, Check, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/context/AppContext'
import type { Scenario } from '@/types'
import { cn } from '@/lib/utils'

export default function GeneratorReview() {
  const { id } = useParams<{ id: string }>()
  const { generationRuns, scenarios, updateScenario, deleteScenario, updateGenerationRun } = useApp()

  const run = generationRuns.find((r) => r.id === id)
  const runScenarios = scenarios.filter((s) => run?.scenarioIds.includes(s.id))

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  if (!run) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center animate-fade-in">
        <p className="text-vz-gray-500">Run not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/scenarios/runs"><ArrowLeft size={13} /> Back to runs</Link>
        </Button>
      </div>
    )
  }

  const isReviewed = !!run.reviewed
  const canReview = run.status === 'completed' && !isReviewed && runScenarios.length > 0

  function handleSaveReview() {
    updateGenerationRun(run!.id, { reviewed: true })
    setEditingId(null)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/scenarios/runs"><ArrowLeft size={14} /> Generation Runs</Link>
        </Button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-vz-gray-900">
            {run.inputs.documentName ?? 'Policy JSON only'}
          </p>
          <p className="text-xs text-vz-gray-400">{new Date(run.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={run.status === 'completed' ? 'success' : 'error'}>{run.status}</Badge>
          {isReviewed && (
            <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-green-700">
              <Lock size={9} /> Reviewed
            </span>
          )}
          {canReview && (
            <Button onClick={handleSaveReview} size="sm">
              <Check size={13} /> Save Review
            </Button>
          )}
        </div>
      </div>

      {/* Reviewed notice */}
      {isReviewed && (
        <div className="flex items-center gap-2.5 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <Lock size={13} className="shrink-0 text-green-600" />
          <p className="text-sm text-green-800">
            This run has been reviewed and is locked. Scenarios are saved to the library and cannot be edited here.
          </p>
        </div>
      )}

      {/* Policy config used */}
      {run.inputs.policyConfig && (
        <Card>
          <CardHeader><CardTitle>Policy Configuration</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {([
                ['Organization', run.inputs.policyConfig.orgSlug],
                ['LOB', run.inputs.policyConfig.lobSlug],
                ['Project', run.inputs.policyConfig.projectSlug],
                ['Journey', run.inputs.policyConfig.journeySlug],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-vz-gray-400">{label}</p>
                  <p className="mt-0.5 font-mono text-sm text-vz-gray-700">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scenarios */}
      {runScenarios.length > 0 && (
        <section className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wider text-vz-gray-400">
            {runScenarios.length} Generated Scenario{runScenarios.length !== 1 ? 's' : ''}
          </p>

          <ul className="space-y-2">
            {runScenarios.map((sc) => (
              <ReviewCard
                key={sc.id}
                scenario={sc}
                isEditing={editingId === sc.id}
                isExpanded={expandedId === sc.id}
                isLocked={isReviewed}
                onToggleExpand={() => setExpandedId(expandedId === sc.id ? null : sc.id)}
                onEdit={() => setEditingId(editingId === sc.id ? null : sc.id)}
                onSave={() => setEditingId(null)}
                onDelete={() => deleteScenario(sc.id)}
                onChange={(patch) => updateScenario(sc.id, patch)}
              />
            ))}
          </ul>
        </section>
      )}

      {runScenarios.length === 0 && run.status === 'completed' && (
        <p className="text-center text-sm text-vz-gray-400 py-10">
          No scenarios were generated in this run.
        </p>
      )}

      {/* Bottom save bar */}
      {canReview && (
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <p className="text-xs text-vz-gray-400">
            {runScenarios.length} scenario{runScenarios.length !== 1 ? 's' : ''} will be locked in the library.
          </p>
          <Button onClick={handleSaveReview}>
            <Check size={13} /> Save Review
          </Button>
        </div>
      )}
    </div>
  )
}

function ReviewCard({
  scenario: sc, isEditing, isExpanded, isLocked,
  onToggleExpand, onEdit, onSave, onDelete, onChange,
}: {
  scenario: Scenario
  isEditing: boolean
  isExpanded: boolean
  isLocked: boolean
  onToggleExpand: () => void
  onEdit: () => void
  onSave: () => void
  onDelete: () => void
  onChange: (p: Partial<Scenario>) => void
}) {
  return (
    <Card className={cn(isLocked && 'opacity-80')}>
      <div className="flex cursor-pointer items-start gap-3 p-4" onClick={onToggleExpand}>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={sc.title}
              onChange={(e) => onChange({ title: e.target.value })}
              className="mb-1 h-7 text-sm font-semibold"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p className="text-sm font-semibold text-vz-gray-900">{sc.title}</p>
          )}
          <div className="mt-1 flex flex-wrap gap-1">
            {sc.tags.map((t) => <Badge key={t}>{t}</Badge>)}
            <Badge variant={sc.source === 'generated' ? 'red' : 'default'}>{sc.source}</Badge>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {!isLocked && (
            <>
              <Button variant="ghost" size="icon" onClick={isEditing ? onSave : onEdit}>
                <Pencil size={14} className={cn(isEditing ? 'text-vz-red' : 'text-vz-gray-400')} />
              </Button>
              <Button variant="ghost" size="icon" onClick={onDelete}>
                <Trash2 size={14} className="text-vz-gray-400" />
              </Button>
            </>
          )}
          {isLocked && <Lock size={12} className="text-vz-gray-300 mx-1" />}
          {isExpanded
            ? <ChevronUp size={14} className="text-vz-gray-300" />
            : <ChevronDown size={14} className="text-vz-gray-300" />}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 animate-fade-in space-y-3">
          <div className="space-y-1.5">
            <Label>Description</Label>
            {isEditing ? (
              <Textarea value={sc.description} onChange={(e) => onChange({ description: e.target.value })} rows={2} />
            ) : (
              <p className="text-sm text-vz-gray-700 leading-relaxed">{sc.description}</p>
            )}
          </div>
          {sc.personaConfig && (
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              {(['persona', 'goal', 'context', 'guidelines'] as const).map((field) => (
                <div key={field}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-vz-gray-400 mb-0.5">
                    {field}
                  </p>
                  {isEditing ? (
                    <Textarea
                      value={sc.personaConfig![field]}
                      onChange={(e) => onChange({ personaConfig: { ...sc.personaConfig!, [field]: e.target.value } })}
                      rows={2} className="text-xs"
                    />
                  ) : (
                    <p className="text-sm text-vz-gray-700 leading-relaxed">{sc.personaConfig![field]}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          {isEditing && (
            <div className="space-y-1.5">
              <Label>Tags (comma-separated)</Label>
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
