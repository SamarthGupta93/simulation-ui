import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, List, Layers, Plus, X, ArrowRight, Check,
  Sparkles, PenLine, Upload, FileText, History,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { JobProgressPanel } from '@/components/ui/JobProgressPanel'
import { useJobPolling } from '@/hooks/useJobPolling'
import { useApp } from '@/context/AppContext'
import type { ScenarioType, PersonaConfig } from '@/types'
import { cn } from '@/lib/utils'
import { MOCK_SCENARIOS } from '@/lib/mockData'

// ── Mode selection ────────────────────────────────────────────────────────────

type Mode = 'select' | 'manual' | 'ai'

const MODES = [
  {
    id: 'manual' as const,
    icon: PenLine,
    label: 'Author manually',
    description: 'Write a Persona, Script, or Hybrid scenario yourself. Full control over every field.',
    color: 'border-blue-300 bg-blue-50',
    iconColor: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'ai' as const,
    icon: Sparkles,
    label: 'Generate with AI',
    description: 'Upload a requirements document and / or policy config and let the AI produce a scenario library in seconds.',
    color: 'border-purple-300 bg-purple-50',
    iconColor: 'bg-purple-100 text-purple-600',
  },
]

export default function CreateScenario() {
  const [mode, setMode] = useState<Mode>('select')

  if (mode === 'select') return <ModeSelect onSelect={setMode} />
  if (mode === 'manual') return <ManualFlow onBack={() => setMode('select')} />
  return <AIFlow onBack={() => setMode('select')} />
}

// ── Mode selector ─────────────────────────────────────────────────────────────

function ModeSelect({ onSelect }: { onSelect: (m: Mode) => void }) {
  return (
    <div className="mx-auto max-w-xl animate-fade-in">
      <p className="mb-6 text-sm text-vz-gray-500">
        How would you like to create scenarios?
      </p>
      <div className="space-y-3">
        {MODES.map(({ id, icon: Icon, label, description, iconColor }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={cn(
              'w-full flex items-start gap-4 rounded-lg border-2 p-5 text-left transition-all hover:shadow-sm',
              'border-border bg-white hover:border-vz-gray-300'
            )}
          >
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded', iconColor)}>
              <Icon size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-vz-gray-900">{label}</p>
              <p className="mt-0.5 text-sm text-vz-gray-500">{description}</p>
            </div>
            <ArrowRight size={16} className="mt-1 shrink-0 text-vz-gray-300" />
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Manual flow ───────────────────────────────────────────────────────────────

const SCENARIO_TYPES: {
  type: ScenarioType; icon: React.ElementType; label: string; description: string
}[] = [
  {
    type: 'persona', icon: User, label: 'Persona',
    description: 'AI user plays a persona with a defined goal, context, and behavioral guidelines.',
  },
  {
    type: 'script', icon: List, label: 'Script',
    description: 'A fixed ordered sequence of user messages for deterministic regression testing.',
  },
  {
    type: 'hybrid', icon: Layers, label: 'Hybrid',
    description: 'Scripted opening messages followed by free-form persona-driven exploration.',
  },
]

const TYPE_COLORS: Record<ScenarioType, string> = {
  persona: 'bg-purple-100 text-purple-700',
  script: 'bg-blue-100 text-blue-700',
  hybrid: 'bg-amber-100 text-amber-700',
}

const EMPTY_PERSONA: PersonaConfig = { persona: '', goal: '', context: '', guidelines: '' }

function ManualFlow({ onBack }: { onBack: () => void }) {
  const { addScenario } = useApp()
  const navigate = useNavigate()

  const [step, setStep] = useState<'type' | 'form'>('type')
  const [selectedType, setSelectedType] = useState<ScenarioType | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [persona, setPersona] = useState<PersonaConfig>(EMPTY_PERSONA)
  const [messages, setMessages] = useState<string[]>([''])

  function addTag() {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags((p) => [...p, t])
    setTagInput('')
  }

  function handleSave() {
    if (!selectedType || !title.trim()) return
    addScenario({
      type: selectedType,
      title: title.trim(),
      description: description.trim(),
      tags,
      source: 'manual',
      ...(selectedType !== 'script' ? { personaConfig: persona } : {}),
      ...(selectedType !== 'persona' ? { scriptMessages: messages.filter(Boolean) } : {}),
    })
    navigate('/scenarios')
  }

  const canSave = title.trim() &&
    (selectedType === 'script'
      ? messages.filter(Boolean).length > 0
      : persona.persona.trim() && persona.goal.trim())

  // Type picker step
  if (step === 'type') {
    return (
      <div className="mx-auto max-w-xl animate-fade-in">
        <button onClick={onBack} className="mb-5 text-sm text-vz-red hover:underline">
          ← Back
        </button>
        <p className="mb-4 text-sm text-vz-gray-500">Choose the scenario type.</p>
        <div className="space-y-3">
          {SCENARIO_TYPES.map(({ type, icon: Icon, label, description }) => (
            <button
              key={type}
              onClick={() => { setSelectedType(type); setStep('form') }}
              className="w-full flex items-start gap-4 rounded-lg border-2 border-border bg-white p-5 text-left hover:border-vz-gray-300 hover:shadow-sm transition-all"
            >
              <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded', TYPE_COLORS[type])}>
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-vz-gray-900">{label}</p>
                <p className="mt-0.5 text-sm text-vz-gray-500">{description}</p>
              </div>
              <ArrowRight size={16} className="mt-1 shrink-0 text-vz-gray-300" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Form step
  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <button onClick={() => setStep('type')} className="text-sm text-vz-red hover:underline">
          ← Change type
        </button>
        <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-bold uppercase', TYPE_COLORS[selectedType!])}>
          {selectedType}
        </span>
      </div>

      {/* Common */}
      <Card>
        <CardContent className="space-y-4 pt-5">
          <div className="space-y-1.5">
            <Label htmlFor="sc-title">Title *</Label>
            <Input id="sc-title" placeholder="Describe the scenario briefly"
              value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sc-desc">Description</Label>
            <Textarea id="sc-desc" placeholder="What does this scenario test?" rows={2}
              value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-1.5 mb-1">
              {tags.map((t) => (
                <span key={t} className="flex items-center gap-1 rounded bg-vz-gray-100 px-2 py-0.5 text-xs">
                  {t}
                  <button onClick={() => setTags((p) => p.filter((x) => x !== t))} className="text-vz-gray-400 hover:text-vz-red"><X size={10} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="billing, escalation, …" value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                className="h-8 text-xs" />
              <Button variant="outline" size="sm" onClick={addTag}><Plus size={12} /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Persona fields */}
      {(selectedType === 'persona' || selectedType === 'hybrid') && (
        <Card>
          <CardContent className="space-y-4 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-vz-gray-400">Persona Configuration</p>
            <div className="space-y-1.5">
              <Label>Persona *</Label>
              <Textarea rows={2} placeholder="Who is this user? (e.g. A 62-year-old retiree who rarely uses technology…)"
                value={persona.persona} onChange={(e) => setPersona((p) => ({ ...p, persona: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Goal *</Label>
              <Input placeholder="What do they want to achieve?"
                value={persona.goal} onChange={(e) => setPersona((p) => ({ ...p, goal: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Context</Label>
              <Textarea rows={2} placeholder="Background the AI should know"
                value={persona.context} onChange={(e) => setPersona((p) => ({ ...p, context: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Behavioral Guidelines</Label>
              <Textarea rows={2} placeholder="How should the AI behave? (e.g. Stay polite but escalate after 3 turns)"
                value={persona.guidelines} onChange={(e) => setPersona((p) => ({ ...p, guidelines: e.target.value }))} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Script fields */}
      {(selectedType === 'script' || selectedType === 'hybrid') && (
        <Card>
          <CardContent className="space-y-3 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-vz-gray-400">
              {selectedType === 'hybrid' ? 'Opening Script Messages' : 'Script Messages'}
            </p>
            {selectedType === 'hybrid' && (
              <p className="text-xs text-vz-gray-400">These messages play first; the persona takes over afterward.</p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-2.5 shrink-0 font-mono text-xs text-vz-gray-300">{i + 1}.</span>
                <Input placeholder={`User message ${i + 1}`} value={msg}
                  onChange={(e) => setMessages((p) => p.map((m, idx) => idx === i ? e.target.value : m))} />
                {messages.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => setMessages((p) => p.filter((_, idx) => idx !== i))}>
                    <X size={13} className="text-vz-gray-400" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setMessages((p) => [...p, ''])}>
              <Plus size={13} /> Add Message
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={() => navigate('/scenarios')}>Cancel</Button>
        <Button onClick={handleSave} disabled={!canSave}>
          <Check size={14} /> Save to Library
        </Button>
      </div>
    </div>
  )
}

// ── AI Generation flow ────────────────────────────────────────────────────────

const GEN_STEPS = [
  { step: 'Parse documents', message: 'Extracting text from uploaded files' },
  { step: 'Analyze requirements', message: 'Identifying use cases and constraints' },
  { step: 'Apply policy rules', message: 'Mapping policy config to scenario constraints' },
  { step: 'Generate scenarios', message: 'Creating scenario drafts via LLM' },
  { step: 'Deduplicate', message: 'Removing overlapping or redundant scenarios' },
  { step: 'Finalize', message: 'Preparing scenarios for review' },
]

function AIFlow({ onBack }: { onBack: () => void }) {
  const { addGenerationRun, updateGenerationRun, addScenario } = useApp()
  const navigate = useNavigate()

  const [reqFile, setReqFile] = useState<File | null>(null)
  const [policyJson, setPolicyJson] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [createdRunId, setCreatedRunId] = useState<string | null>(null)
  const reqRef = useRef<HTMLInputElement>(null)
  const policyRef = useRef<HTMLInputElement>(null)

  const { status, progress, startMockJob } = useJobPolling(1300)

  function handleJsonChange(val: string) {
    setPolicyJson(val)
    if (!val.trim()) { setJsonError(''); return }
    try { JSON.parse(val); setJsonError('') }
    catch { setJsonError('Invalid JSON') }
  }

  function handleGenerate() {
    const run = addGenerationRun({
      status: 'running',
      inputs: { documentName: reqFile?.name, policyConfig: policyJson.trim() || undefined },
      progress: [],
      scenarioIds: [],
    })
    setCreatedRunId(run.id)
    startMockJob(GEN_STEPS)

    setTimeout(() => {
      const generatedIds: string[] = []
      const newScenarios = MOCK_SCENARIOS.filter((s) => s.source === 'generated' && s.generationRunId === 'gen-1')
      newScenarios.forEach((sc) => {
        const added = addScenario({ ...sc, generationRunId: run.id })
        generatedIds.push(added.id)
      })
      updateGenerationRun(run.id, {
        status: 'completed',
        scenarioIds: generatedIds,
        completedAt: new Date().toISOString(),
        progress: GEN_STEPS.map((s, i) => ({
          ...s, percent: Math.round(((i + 1) / GEN_STEPS.length) * 100),
          timestamp: new Date().toISOString(),
        })),
      })
    }, GEN_STEPS.length * 1350)
  }

  const canGenerate = status !== 'running' && (!!reqFile || policyJson.trim().length > 0) && !jsonError

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <button onClick={onBack} className="text-sm text-vz-red hover:underline">← Back</button>

      <Card>
        <CardContent className="space-y-6 pt-5">
          {/* Requirements doc */}
          <div className="space-y-2">
            <Label>Requirements Document</Label>
            <FileDropZone file={reqFile} hint="PDF, Word, or Markdown"
              inputRef={reqRef} onFile={setReqFile} onClear={() => setReqFile(null)} />
            <input ref={reqRef} type="file" accept=".pdf,.doc,.docx,.txt,.md" className="hidden"
              onChange={(e) => e.target.files?.[0] && setReqFile(e.target.files[0])} />
          </div>

          <Separator />

          {/* Policy JSON */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Policy Configuration (JSON)</Label>
              <Button variant="outline" size="sm" onClick={() => policyRef.current?.click()}>
                <Upload size={13} /> Upload JSON
              </Button>
            </div>
            <input ref={policyRef} type="file" accept=".json" className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]; if (!f) return
                const r = new FileReader(); r.onload = (ev) => handleJsonChange(ev.target?.result as string); r.readAsText(f)
              }} />
            <Textarea
              placeholder='{ "max_turns": 12, "language": "en", "escalation_enabled": true }'
              value={policyJson} onChange={(e) => handleJsonChange(e.target.value)}
              rows={5} className={cn('font-mono text-xs', jsonError && 'border-red-400 focus:ring-red-400')}
            />
            {jsonError && <p className="text-xs text-red-600">{jsonError}</p>}
          </div>

          <div className="flex items-center justify-between pt-1">
            <Button variant="ghost" size="sm" onClick={() => navigate('/scenarios/runs')}>
              <History size={13} /> View past runs
            </Button>
            <Button onClick={handleGenerate} disabled={!canGenerate} size="lg">
              <Sparkles size={15} /> Generate Scenarios
            </Button>
          </div>
        </CardContent>
      </Card>

      <JobProgressPanel status={status} progress={progress} />

      {status === 'completed' && createdRunId && (
        <div className="flex justify-center animate-fade-in">
          <Button onClick={() => navigate(`/scenarios/runs/${createdRunId}`)} size="lg">
            Review Generated Scenarios →
          </Button>
        </div>
      )}
    </div>
  )
}

// ── Shared file drop zone ─────────────────────────────────────────────────────

function FileDropZone({ file, hint, inputRef, onFile, onClear }: {
  file: File | null; hint: string
  inputRef: React.RefObject<HTMLInputElement | null>
  onFile: (f: File) => void; onClear: () => void
}) {
  const [dragging, setDragging] = useState(false)
  if (file) {
    return (
      <div className="flex items-center gap-3 rounded border border-border bg-vz-gray-100 px-4 py-3">
        <FileText size={16} className="shrink-0 text-vz-red" />
        <span className="flex-1 truncate text-sm font-medium text-vz-gray-900">{file.name}</span>
        <span className="text-xs text-vz-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
        <button onClick={onClear} className="text-vz-gray-300 hover:text-vz-red transition-colors"><X size={15} /></button>
      </div>
    )
  }
  return (
    <div
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed px-6 py-7 transition-colors',
        dragging ? 'border-vz-red bg-red-50' : 'border-border bg-vz-gray-100 hover:border-vz-gray-300'
      )}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f) }}
    >
      <Upload size={20} className="mb-2 text-vz-gray-300" />
      <p className="text-sm font-medium text-vz-gray-700">Drop file or <span className="text-vz-red">browse</span></p>
      <p className="mt-0.5 text-xs text-vz-gray-400">{hint}</p>
    </div>
  )
}
