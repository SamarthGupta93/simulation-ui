import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/context/AppContext'
import type { Scenario } from '@/types'

export default function GeneratorReview() {
  const { id } = useParams<{ id: string }>()
  const { generationRuns, scenarios, updateScenario, deleteScenario } = useApp()

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
        <Badge variant={run.status === 'completed' ? 'success' : 'error'}>{run.status}</Badge>
      </div>

      {/* Policy config used */}
      {run.inputs.policyConfig && (
        <Card>
          <CardHeader><CardTitle>Policy Config Used</CardTitle></CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded bg-vz-gray-100 p-3 text-xs font-mono text-vz-gray-700">
              {(() => { try { return JSON.stringify(JSON.parse(run.inputs.policyConfig!), null, 2) } catch { return run.inputs.policyConfig } })()}
            </pre>
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
    </div>
  )
}

function ReviewCard({ scenario: sc, isEditing, isExpanded, onToggleExpand, onEdit, onSave, onDelete, onChange }: {
  scenario: Scenario
  isEditing: boolean
  isExpanded: boolean
  onToggleExpand: () => void
  onEdit: () => void
  onSave: () => void
  onDelete: () => void
  onChange: (p: Partial<Scenario>) => void
}) {
  return (
    <Card>
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
          <Button variant="ghost" size="icon" onClick={isEditing ? onSave : onEdit}>
            <Pencil size={14} className="text-vz-gray-400" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 size={14} className="text-vz-gray-400" />
          </Button>
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

