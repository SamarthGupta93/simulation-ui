import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, X, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { JobProgressPanel } from '@/components/ui/JobProgressPanel'
import { useJobPolling } from '@/hooks/useJobPolling'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import { MOCK_SCENARIOS } from '@/lib/mockData'

const GEN_STEPS = [
  { step: 'Parse documents', message: 'Extracting text from uploaded files' },
  { step: 'Analyze requirements', message: 'Identifying use cases and constraints' },
  { step: 'Apply policy rules', message: 'Mapping policy config to scenario constraints' },
  { step: 'Generate scenarios', message: 'Creating scenario drafts via LLM' },
  { step: 'Deduplicate', message: 'Removing overlapping or redundant scenarios' },
  { step: 'Finalize', message: 'Preparing scenarios for review' },
]

export default function GeneratorInput() {
  const { addGenerationRun, updateGenerationRun, addScenario } = useApp()
  const navigate = useNavigate()

  const [reqFile, setReqFile] = useState<File | null>(null)
  const [policyJson, setPolicyJson] = useState('')
  const [jsonError, setJsonError] = useState('')
  const reqRef = useRef<HTMLInputElement>(null)
  const policyRef = useRef<HTMLInputElement>(null)

  const { status, progress, startMockJob } = useJobPolling(1300, {
    onComplete: () => {
      // update run status after complete
    },
  })

  const [createdRunId, setCreatedRunId] = useState<string | null>(null)

  function handleJsonChange(val: string) {
    setPolicyJson(val)
    if (!val.trim()) { setJsonError(''); return }
    try { JSON.parse(val); setJsonError('') }
    catch { setJsonError('Invalid JSON') }
  }

  async function handleGenerate() {
    const run = addGenerationRun({
      status: 'running',
      inputs: {
        documentName: reqFile?.name,
        policyConfig: policyJson.trim() || undefined,
      },
      progress: [],
      scenarioIds: [],
    })
    setCreatedRunId(run.id)

    startMockJob(GEN_STEPS)

    // Simulate completion after steps finish
    setTimeout(() => {
      // Add generated scenarios to the library
      const generatedIds: string[] = []
      const newScenarios = MOCK_SCENARIOS.filter(s => s.source === 'generated' && s.generationRunId === 'gen-1')
      newScenarios.forEach((sc) => {
        const added = addScenario({
          ...sc,
          generationRunId: run.id,
        })
        generatedIds.push(added.id)
      })

      updateGenerationRun(run.id, {
        status: 'completed',
        scenarioIds: generatedIds,
        completedAt: new Date().toISOString(),
        progress: GEN_STEPS.map((s, i) => ({
          ...s,
          percent: Math.round(((i + 1) / GEN_STEPS.length) * 100),
          timestamp: new Date().toISOString(),
        })),
      })
    }, GEN_STEPS.length * 1350)
  }

  const canGenerate = !['running'].includes(status) && (!!reqFile || policyJson.trim().length > 0) && !jsonError

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Input Documents</CardTitle>
          <CardDescription>Provide at least one input — a requirements document, a policy config, or both.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Requirements doc */}
          <div className="space-y-2">
            <Label>Requirements Document</Label>
            <FileDropZone
              file={reqFile}
              hint="PDF, Word, or Markdown"
              inputRef={reqRef}
              onFile={setReqFile}
              onClear={() => setReqFile(null)}
            />
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
                const f = e.target.files?.[0]
                if (!f) return
                const reader = new FileReader()
                reader.onload = (ev) => handleJsonChange(ev.target?.result as string)
                reader.readAsText(f)
              }} />
            <Textarea
              placeholder='{ "max_turns": 12, "language": "en", "escalation_enabled": true }'
              value={policyJson}
              onChange={(e) => handleJsonChange(e.target.value)}
              rows={6}
              className={cn('font-mono text-xs', jsonError && 'border-red-400 focus:ring-red-400')}
            />
            {jsonError && <p className="text-xs text-red-600">{jsonError}</p>}
          </div>

          <div className="flex items-center justify-between pt-1">
            <Button variant="ghost" size="sm" onClick={() => navigate('/generator/runs')}>
              <History size={13} /> View past runs
            </Button>
            <Button onClick={handleGenerate} disabled={!canGenerate} size="lg">
              Start Generation
            </Button>
          </div>
        </CardContent>
      </Card>

      <JobProgressPanel status={status} progress={progress} />

      {status === 'completed' && createdRunId && (
        <div className="flex justify-center animate-fade-in">
          <Button onClick={() => navigate(`/generator/runs/${createdRunId}`)} size="lg">
            Review Generated Scenarios →
          </Button>
        </div>
      )}
    </div>
  )
}

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
