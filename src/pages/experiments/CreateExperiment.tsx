import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { HierarchyBreadcrumb } from '@/components/ui/HierarchyBreadcrumb'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'

export default function CreateExperiment() {
  const { agents, evalDatasets, datasetVersions, addExperiment } = useApp()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [datasetId, setDatasetId] = useState('')
  const [versionId, setVersionId] = useState('')
  const [agentId, setAgentId] = useState('')

  const versionsForDataset = datasetVersions.filter((v) => v.datasetId === datasetId)

  function handleDatasetChange(id: string) {
    setDatasetId(id)
    setVersionId('')
  }

  function handleSubmit() {
    if (!name.trim() || !datasetId || !versionId || !agentId) return
    const exp = addExperiment({
      name: name.trim(),
      description: description.trim() || undefined,
      datasetId,
      versionId,
      agentId,
    })
    navigate(`/experiments/${exp.id}`)
  }

  const valid = name.trim() && datasetId && versionId && agentId

  return (
    <div className="mx-auto max-w-xl space-y-6 animate-fade-in">
      <HierarchyBreadcrumb segments={[
        { label: 'Experiments', href: '/experiments' },
        { label: 'New Experiment' },
      ]} />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FlaskConical size={16} className="text-purple-600" />
            <CardTitle>New Experiment</CardTitle>
          </div>
          <CardDescription>
            An experiment locks a dataset version and agent so you can compare pass rates across runs over time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="e.g. CS Bot Regression Suite"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              placeholder="What are you tracking with this experiment?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Evaluation Dataset *</Label>
            <div className="grid gap-2">
              {evalDatasets.map((ds) => (
                <button
                  key={ds.id}
                  onClick={() => handleDatasetChange(ds.id)}
                  className={cn(
                    'w-full text-left rounded border px-3 py-2.5 transition-colors',
                    datasetId === ds.id
                      ? 'border-vz-red bg-red-50'
                      : 'border-border hover:border-vz-gray-300'
                  )}
                >
                  <p className="text-sm font-medium text-vz-gray-900">{ds.name}</p>
                  <p className="text-xs text-vz-gray-400 mt-0.5">{ds.description}</p>
                </button>
              ))}
            </div>
          </div>

          {datasetId && (
            <div className="space-y-1.5">
              <Label>Dataset Version *</Label>
              <div className="flex gap-2 flex-wrap">
                {versionsForDataset.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVersionId(v.id)}
                    className={cn(
                      'rounded border px-3 py-1.5 text-sm font-medium transition-colors',
                      versionId === v.id
                        ? 'border-vz-red bg-red-50 text-vz-red'
                        : 'border-border hover:border-vz-gray-300 text-vz-gray-700'
                    )}
                  >
                    {v.label}
                  </button>
                ))}
                {versionsForDataset.length === 0 && (
                  <p className="text-sm text-vz-gray-400">No versions for this dataset yet.</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Agent *</Label>
            <div className="grid gap-2">
              {agents.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAgentId(a.id)}
                  className={cn(
                    'w-full text-left rounded border px-3 py-2.5 transition-colors',
                    agentId === a.id
                      ? 'border-vz-red bg-red-50'
                      : 'border-border hover:border-vz-gray-300'
                  )}
                >
                  <p className="text-sm font-medium text-vz-gray-900">{a.name}</p>
                  <p className="text-xs text-vz-gray-400 font-mono mt-0.5 truncate">{a.endpoint}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button onClick={handleSubmit} disabled={!valid} size="lg">
              <FlaskConical size={14} /> Create Experiment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
