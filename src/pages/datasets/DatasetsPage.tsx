import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Database, ArrowRight, Layers, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { useApp } from '@/context/AppContext'

export default function DatasetsPage() {
  const {
    activeProject, activeProjectId, evalDatasets, datasetVersions, datasetBatches,
    addEvalDataset, deleteEvalDataset,
  } = useApp()

  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const projectDatasets = evalDatasets.filter((d) => d.projectId === activeProjectId)

  function versionCount(datasetId: string) {
    return datasetVersions.filter((v) => v.datasetId === datasetId).length
  }

  function scenarioCount(datasetId: string) {
    const batchIds = datasetBatches
      .filter((b) => b.datasetId === datasetId)
      .flatMap((b) => b.scenarioIds)
    return new Set(batchIds).size
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-vz-gray-400">{activeProject?.name}</p>
          <h2 className="text-base font-semibold text-vz-gray-900">Evaluation Datasets</h2>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={14} /> New Dataset
        </Button>
      </div>

      {/* Dataset list */}
      {projectDatasets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-lg">
          <Database size={28} className="text-vz-gray-300 mb-3" />
          <p className="font-semibold text-vz-gray-700">No evaluation datasets</p>
          <p className="text-sm text-vz-gray-400 mt-1 mb-5">
            Datasets organize your scenario batches into versioned collections.
          </p>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={14} /> Create Dataset
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {projectDatasets.map((ds) => {
            const vCount = versionCount(ds.id)
            const sCount = scenarioCount(ds.id)
            return (
              <Card key={ds.id} className="hover:border-vz-gray-300 transition-colors group">
                <CardContent className="p-0">
                  <Link
                    to={`/datasets/${ds.id}`}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-red-50 text-vz-red">
                      <Database size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-vz-gray-900 group-hover:text-vz-red transition-colors">
                        {ds.name}
                      </p>
                      <p className="text-xs text-vz-gray-400 truncate mt-0.5">{ds.description}</p>
                    </div>
                    <div className="flex items-center gap-6 shrink-0 text-xs text-vz-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Layers size={12} />
                        {vCount} version{vCount !== 1 ? 's' : ''}
                      </span>
                      <span>{sCount} scenario{sCount !== 1 ? 's' : ''}</span>
                    </div>
                    <ArrowRight size={14} className="shrink-0 text-vz-gray-300 group-hover:text-vz-red transition-colors" />
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Dataset Dialog */}
      <CreateDatasetDialog
        open={createOpen}
        projectId={activeProjectId ?? ''}
        onClose={() => setCreateOpen(false)}
        onSave={addEvalDataset}
      />

      {/* Delete Dialog */}
      {deleteTarget && (
        <Dialog open onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Dataset?</DialogTitle>
              <DialogDescription>
                This will permanently delete the dataset and all its versions and batches.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={() => { deleteEvalDataset(deleteTarget); setDeleteTarget(null) }}
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

function CreateDatasetDialog({
  open, projectId, onClose, onSave,
}: {
  open: boolean
  projectId: string
  onClose: () => void
  onSave: (d: { projectId: string; name: string; description: string }) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  function handleSave() {
    if (!name.trim()) return
    onSave({ projectId, name: name.trim(), description: description.trim() })
    setName('')
    setDescription('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Evaluation Dataset</DialogTitle>
          <DialogDescription>
            Give your dataset a name and description. You'll add versions and batches after creation.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-0 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ds-name">Name *</Label>
            <Input
              id="ds-name"
              placeholder="Billing & Account Scenarios"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ds-desc">Description</Label>
            <Textarea
              id="ds-desc"
              placeholder="What scenarios does this dataset cover?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Create Dataset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
