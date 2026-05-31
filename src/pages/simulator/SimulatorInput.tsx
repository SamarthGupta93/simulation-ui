import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Play, Plus, X, Search, CheckCircle2, Server, SlidersHorizontal,
  Database, PenLine, Sparkles, List, ChevronDown, ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { JobProgressPanel } from '@/components/ui/JobProgressPanel'
import { useJobPolling } from '@/hooks/useJobPolling'
import { useApp } from '@/context/AppContext'
import type { ScenarioType, PersonaConfig } from '@/types'
import { cn } from '@/lib/utils'

const TYPE_COLORS: Record<ScenarioType, string> = {
  persona: 'bg-purple-100 text-purple-700',
  script: 'bg-blue-100 text-blue-700',
  hybrid: 'bg-amber-100 text-amber-700',
}

type ScenarioSource = 'dataset' | 'adhoc'

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SimulatorInput() {
  const {
    agents, scenarios, evalDatasets, datasetVersions, datasetBatches,
    activeProjectId, addSimulationRun, updateSimulationRun, addScenario,
  } = useApp()
  const navigate = useNavigate()

  const [agentId, setAgentId] = useState('')
  const [scenarioSource, setScenarioSource] = useState<ScenarioSource>('dataset')

  // Dataset selection — Dataset → Version only (all batches in version are included)
  const [selectedDatasetId, setSelectedDatasetId] = useState('')
  const [selectedVersionId, setSelectedVersionId] = useState('')

  // Ad-hoc selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pickerOpen, setPickerOpen] = useState(false)
  const [builderOpen, setBuilderOpen] = useState(false)

  const [maxTurns, setMaxTurns] = useState(12)
  const [createdRunId, setCreatedRunId] = useState<string | null>(null)

  const selectedAgent = agents.find((a) => a.id === agentId)
  const projectDatasets = evalDatasets.filter((d) => d.projectId === activeProjectId)
  const versionsForDataset = datasetVersions.filter((v) => v.datasetId === selectedDatasetId)
  const batchesForVersion = datasetBatches.filter((b) => b.versionId === selectedVersionId)

  // All unique scenario IDs across every batch in the selected version
  const versionScenarioIds = Array.from(
    new Set(batchesForVersion.flatMap((b) => b.scenarioIds))
  )

  const effectiveScenarioIds = scenarioSource === 'dataset' ? versionScenarioIds : [...selectedIds]
  const effectiveScenarios = scenarios.filter((s) => effectiveScenarioIds.includes(s.id))

  const { status, progress, startMockJob } = useJobPolling(900)

  function buildSteps() {
    const base = [
      { step: 'Validate endpoint', message: `Connecting to ${selectedAgent?.endpoint ?? 'agent'}` },
      { step: 'Load scenarios', message: `${effectiveScenarioIds.length} scenario(s) loaded` },
      { step: 'Initialize runner', message: 'Setting up simulation threads' },
    ]
    effectiveScenarios.forEach((sc, i) => {
      base.push({ step: `Run scenario ${i + 1}/${effectiveScenarios.length}`, message: sc.title })
    })
    base.push(
      { step: 'Collect transcripts', message: 'Aggregating conversation logs' },
      { step: 'Finalize results', message: 'Computing summary statistics' },
    )
    return base
  }

  async function handleRun() {
    if (!agentId || effectiveScenarioIds.length === 0) return
    const run = addSimulationRun({
      agentId,
      scenarioIds: effectiveScenarioIds,
      config: { maxTurns, timeoutMs: 30000 },
      status: 'running',
      progress: [],
      results: [],
    })
    setCreatedRunId(run.id)
    const steps = buildSteps()
    startMockJob(steps)
    setTimeout(() => {
      const mockResults = effectiveScenarios.map((sc, i) => ({
        scenarioId: sc.id,
        status: i % 3 === 1 ? 'fail' as const : 'pass' as const,
        turnCount: 4 + i * 2,
        durationMs: 8000 + i * 3000,
        transcript: [
          { role: 'user' as const, content: sc.type === 'script' && sc.scriptMessages?.[0] ? sc.scriptMessages[0] : `Hello, I need help with ${sc.title.toLowerCase()}.` },
          { role: 'agent' as const, content: "Thank you for reaching out. I'd be happy to help you with that." },
        ],
        ...(i % 3 === 1 ? { failReason: 'Agent failed to address the core user request after 3 attempts.' } : {}),
      }))
      updateSimulationRun(run.id, {
        status: 'completed',
        results: mockResults,
        completedAt: new Date().toISOString(),
        progress: steps.map((s, i) => ({
          ...s,
          percent: Math.round(((i + 1) / steps.length) * 100),
          timestamp: new Date().toISOString(),
        })),
      })
    }, steps.length * 950)
  }

  function handleScenarioBuilt(id: string) {
    setSelectedIds((prev) => new Set([...prev, id]))
    setBuilderOpen(false)
  }

  const canRun = status !== 'running' && !!agentId && effectiveScenarioIds.length > 0

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">

      {/* Agent */}
      <Card>
        <CardHeader>
          <CardTitle>Agent</CardTitle>
          <CardDescription>Select the agent to test from your library</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {agents.length === 0 ? (
            <div className="rounded border border-dashed border-border p-4 text-center text-sm text-vz-gray-400">
              No agents configured yet.{' '}
              <Link to="/agents" className="text-vz-red hover:underline">Add an agent →</Link>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="agent-select">Agent</Label>
              <div className="flex gap-2">
                <Select id="agent-select" value={agentId} onChange={(e) => setAgentId(e.target.value)} className="flex-1">
                  <option value="">— Select an agent —</option>
                  {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </Select>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/agents"><Plus size={13} /> Add</Link>
                </Button>
              </div>
              {selectedAgent && (
                <div className="rounded bg-vz-gray-100 px-3 py-2 text-xs text-vz-gray-500 flex items-center gap-2">
                  <Server size={12} className="text-vz-red" />
                  <span className="truncate">{selectedAgent.endpoint}</span>
                  <span className="shrink-0">· key: <code>{selectedAgent.responseKey}</code></span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scenario Details */}
      <Card>
        <CardHeader>
          <CardTitle>Scenario Details</CardTitle>
          <CardDescription>Run against a versioned dataset or build scenarios ad-hoc</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Source toggle */}
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: 'dataset', icon: Database, label: 'Evaluation Dataset', desc: 'All batches in a version are run' },
              { value: 'adhoc', icon: PenLine, label: 'Ad-hoc', desc: 'Select or build scenarios manually' },
            ] as const).map(({ value, icon: Icon, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setScenarioSource(value)}
                className={cn(
                  'flex flex-col items-start gap-1 rounded border-2 px-3 py-3 text-left transition-colors',
                  scenarioSource === value ? 'border-vz-red bg-red-50' : 'border-border hover:border-vz-gray-300'
                )}
              >
                <Icon size={14} className={scenarioSource === value ? 'text-vz-red' : 'text-vz-gray-400'} />
                <p className={cn('text-xs font-semibold', scenarioSource === value ? 'text-vz-red' : 'text-vz-gray-700')}>{label}</p>
                <p className="text-[10px] text-vz-gray-400 leading-snug">{desc}</p>
              </button>
            ))}
          </div>

          {/* ── Dataset cascade ── */}
          {scenarioSource === 'dataset' && (
            <div className="space-y-3">
              {projectDatasets.length === 0 ? (
                <div className="rounded border border-dashed border-border p-4 text-center text-sm text-vz-gray-400">
                  No evaluation datasets.{' '}
                  <Link to="/datasets" className="text-vz-red hover:underline">Create a dataset →</Link>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label>Dataset</Label>
                    <Select
                      value={selectedDatasetId}
                      onChange={(e) => { setSelectedDatasetId(e.target.value); setSelectedVersionId('') }}
                    >
                      <option value="">— Select dataset —</option>
                      {projectDatasets.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </Select>
                  </div>

                  {selectedDatasetId && (
                    <div className="space-y-1.5">
                      <Label>Version</Label>
                      <Select
                        value={selectedVersionId}
                        onChange={(e) => setSelectedVersionId(e.target.value)}
                        disabled={versionsForDataset.length === 0}
                      >
                        <option value="">— Select version —</option>
                        {versionsForDataset.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.label}{v.description ? ` — ${v.description}` : ''}
                          </option>
                        ))}
                      </Select>
                      {versionsForDataset.length === 0 && (
                        <p className="text-xs text-vz-gray-400">No versions in this dataset.</p>
                      )}
                    </div>
                  )}

                  {selectedVersionId && (
                    batchesForVersion.length === 0 ? (
                      <p className="text-xs text-vz-gray-400">No batches in this version.</p>
                    ) : (
                      <div className="rounded bg-vz-gray-100 px-3 py-2.5 text-xs text-vz-gray-600 space-y-0.5">
                        <p className="font-medium text-vz-gray-800">
                          {versionScenarioIds.length} scenario{versionScenarioIds.length !== 1 ? 's' : ''} across {batchesForVersion.length} batch{batchesForVersion.length !== 1 ? 'es' : ''} will run
                        </p>
                        <p className="text-vz-gray-400">
                          {batchesForVersion.map((b) => b.name).join(', ')}
                        </p>
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Ad-hoc ── */}
          {scenarioSource === 'adhoc' && (
            <div className="space-y-3">
              {/* Action buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                  <List size={13} /> Select from Library
                </Button>
                <Button variant="outline" size="sm" onClick={() => setBuilderOpen(true)}>
                  <Plus size={13} /> Build Scenario
                </Button>
              </div>

              {/* Selected list */}
              {effectiveScenarios.length > 0 ? (
                <ul className="space-y-1.5">
                  {effectiveScenarios.map((sc) => (
                    <li key={sc.id} className="flex items-center gap-2.5 rounded border border-border px-3 py-2 bg-white">
                      <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase', TYPE_COLORS[sc.type])}>
                        {sc.type}
                      </span>
                      <span className="flex-1 truncate text-sm text-vz-gray-900">{sc.title}</span>
                      <button
                        onClick={() => setSelectedIds((prev) => { const n = new Set(prev); n.delete(sc.id); return n })}
                        className="shrink-0 text-vz-gray-300 hover:text-vz-red transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-vz-gray-400">No scenarios added yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simulation config */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-vz-red" /> Simulation Config
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5 max-w-xs">
            <Label htmlFor="max-turns">Max Turns per Scenario</Label>
            <Input
              id="max-turns"
              type="number"
              min={1}
              max={50}
              value={maxTurns}
              onChange={(e) => setMaxTurns(Number(e.target.value))}
            />
            <p className="text-xs text-vz-gray-400">Simulation ends if this many turns are reached without resolution.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" disabled={!canRun} onClick={handleRun}>
          <Play size={15} /> Run Simulation
        </Button>
      </div>

      <JobProgressPanel status={status} progress={progress} />

      {status === 'completed' && createdRunId && (
        <div className="flex justify-center animate-fade-in">
          <Button onClick={() => navigate(`/simulator/runs/${createdRunId}`)} size="lg">
            View Results →
          </Button>
        </div>
      )}

      {/* Scenario Picker */}
      <ScenarioPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedIds={selectedIds}
        onConfirm={(ids) => { setSelectedIds(ids); setPickerOpen(false) }}
      />

      {/* Inline Scenario Builder */}
      <ScenarioBuilderDialog
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        onAdd={(scenario) => {
          const saved = addScenario({ ...scenario, source: 'manual' })
          handleScenarioBuilt(saved.id)
        }}
      />
    </div>
  )
}

// ── Scenario Picker Modal ─────────────────────────────────────────────────────

function ScenarioPicker({ open, onClose, selectedIds, onConfirm }: {
  open: boolean
  onClose: () => void
  selectedIds: Set<string>
  onConfirm: (ids: Set<string>) => void
}) {
  const { scenarios } = useApp()
  const [draft, setDraft] = useState<Set<string>>(new Set(selectedIds))
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | ScenarioType>('all')

  function handleOpenChange(o: boolean) {
    if (o) setDraft(new Set(selectedIds))
    if (!o) onClose()
  }

  const filtered = scenarios.filter((sc) => {
    const matchType = typeFilter === 'all' || sc.type === typeFilter
    const matchSearch = !search ||
      sc.title.toLowerCase().includes(search.toLowerCase()) ||
      sc.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    return matchType && matchSearch
  })

  function toggle(id: string) {
    setDraft((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Select Scenarios</DialogTitle>
          <DialogDescription>Choose scenarios from your library to include in this run.</DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-0 space-y-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-vz-gray-300" />
            <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(['all', 'persona', 'script', 'hybrid'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors',
                  typeFilter === t ? 'bg-vz-black text-white' : 'bg-vz-gray-100 text-vz-gray-500 hover:bg-vz-gray-200'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto px-6 py-2 space-y-1.5 scrollbar-thin">
          {filtered.length === 0 && (
            <p className="py-6 text-center text-sm text-vz-gray-400">No scenarios match your filters.</p>
          )}
          {filtered.map((sc) => {
            const selected = draft.has(sc.id)
            return (
              <button
                key={sc.id}
                onClick={() => toggle(sc.id)}
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
                <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase', TYPE_COLORS[sc.type])}>
                  {sc.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-vz-gray-900">{sc.title}</p>
                  <div className="mt-0.5 flex gap-1 flex-wrap">
                    {sc.tags.slice(0, 3).map((t) => <Badge key={t}>{t}</Badge>)}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button onClick={() => onConfirm(draft)} disabled={draft.size === 0}>
            Add {draft.size > 0 ? draft.size : ''} Scenario{draft.size !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Inline Scenario Builder Dialog ────────────────────────────────────────────

const BLANK_PERSONA: PersonaConfig = { persona: '', goal: '', context: '', guidelines: '' }

function ScenarioBuilderDialog({ open, onClose, onAdd }: {
  open: boolean
  onClose: () => void
  onAdd: (scenario: { type: ScenarioType; title: string; description: string; tags: string[]; personaConfig?: PersonaConfig; scriptMessages?: string[] }) => void
}) {
  const [type, setType] = useState<ScenarioType>('persona')
  const [title, setTitle] = useState('')
  const [personaConfig, setPersonaConfig] = useState<PersonaConfig>(BLANK_PERSONA)
  const [messages, setMessages] = useState<string[]>([''])
  const [expandedSection, setExpandedSection] = useState<'persona' | 'script' | null>('persona')

  function reset() {
    setType('persona')
    setTitle('')
    setPersonaConfig(BLANK_PERSONA)
    setMessages([''])
    setExpandedSection('persona')
  }

  function handleOpenChange(o: boolean) {
    if (!o) { reset(); onClose() }
  }

  function handleAdd() {
    if (!title.trim()) return
    onAdd({
      type,
      title: title.trim(),
      description: '',
      tags: [],
      ...(type !== 'script' ? { personaConfig } : {}),
      ...(type !== 'persona' ? { scriptMessages: messages.filter(Boolean) } : {}),
    })
    reset()
  }

  function updateMessage(i: number, val: string) {
    setMessages((prev) => prev.map((m, idx) => idx === i ? val : m))
  }
  function addMessage() { setMessages((prev) => [...prev, '']) }
  function removeMessage(i: number) { setMessages((prev) => prev.filter((_, idx) => idx !== i)) }

  const hasPersona = type !== 'script'
  const hasScript = type !== 'persona'
  const canAdd = title.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Build Scenario</DialogTitle>
          <DialogDescription>Define a new scenario to run in this simulation.</DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-0 space-y-5">
          {/* Type picker */}
          <div className="space-y-2">
            <Label>Scenario Type</Label>
            <div className="flex gap-2">
              {([
                { value: 'persona', icon: Sparkles, label: 'Persona', color: 'border-purple-300 bg-purple-50 text-purple-700' },
                { value: 'script', icon: List, label: 'Script', color: 'border-blue-300 bg-blue-50 text-blue-700' },
                { value: 'hybrid', icon: PenLine, label: 'Hybrid', color: 'border-amber-300 bg-amber-50 text-amber-700' },
              ] as const).map(({ value, icon: Icon, label, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setType(value)
                    setExpandedSection(value === 'script' ? 'script' : 'persona')
                  }}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded border-2 px-3 py-2 text-xs font-semibold transition-colors',
                    type === value ? color : 'border-border text-vz-gray-500 hover:border-vz-gray-300'
                  )}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="sc-title">Title *</Label>
            <Input
              id="sc-title"
              placeholder="e.g. Frustrated billing customer, account lockout…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Persona section */}
          {hasPersona && (
            <div className="rounded border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedSection(expandedSection === 'persona' ? null : 'persona')}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-vz-gray-100 text-xs font-semibold text-vz-gray-700 hover:bg-vz-gray-200 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles size={12} className="text-purple-500" /> Persona Config
                </span>
                {expandedSection === 'persona' ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
              {expandedSection === 'persona' && (
                <div className="px-4 py-3 space-y-3">
                  {([
                    { field: 'persona', label: 'Persona', placeholder: 'Who is this user? Age, background, relationship with the company…' },
                    { field: 'goal', label: 'Goal', placeholder: 'What does the user want to achieve?' },
                    { field: 'context', label: 'Context', placeholder: 'What situation led to this interaction?' },
                    { field: 'guidelines', label: 'Guidelines', placeholder: 'How should the user behave throughout the conversation?' },
                  ] as const).map(({ field, label, placeholder }) => (
                    <div key={field} className="space-y-1">
                      <Label className="text-xs">{label}</Label>
                      <Textarea
                        placeholder={placeholder}
                        value={personaConfig[field]}
                        onChange={(e) => setPersonaConfig((p) => ({ ...p, [field]: e.target.value }))}
                        rows={2}
                        className="text-xs resize-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Script section */}
          {hasScript && (
            <>
              {hasPersona && <Separator />}
              <div className="rounded border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === 'script' ? null : 'script')}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-vz-gray-100 text-xs font-semibold text-vz-gray-700 hover:bg-vz-gray-200 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <List size={12} className="text-blue-500" /> Script Messages
                  </span>
                  {expandedSection === 'script' ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
                {expandedSection === 'script' && (
                  <div className="px-4 py-3 space-y-2">
                    {messages.map((msg, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <span className="mt-2 shrink-0 text-[10px] font-mono text-vz-gray-400 w-4 text-right">{i + 1}.</span>
                        <Input
                          value={msg}
                          onChange={(e) => updateMessage(i, e.target.value)}
                          placeholder={`Message ${i + 1}…`}
                          className="text-sm"
                        />
                        {messages.length > 1 && (
                          <button onClick={() => removeMessage(i)} className="mt-2 shrink-0 text-vz-gray-300 hover:text-vz-red transition-colors">
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" onClick={addMessage} className="text-xs">
                      <Plus size={12} /> Add message
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleAdd} disabled={!canAdd}>
            Add to Run
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
