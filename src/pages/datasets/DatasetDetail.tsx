import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Plus, Layers, ArrowRight, Trash2 } from 'lucide-react'
import { HierarchyBreadcrumb } from '@/components/ui/HierarchyBreadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { useApp } from '@/context/AppContext'

export default function DatasetDetail() {
  const { datasetId } = useParams<{ datasetId: string }>()
  const { evalDatasets, datasetVersions, datasetBatches, addDatasetVersion, deleteDatasetVersion } = useApp()
  const navigate = useNavigate()

  const [addVersionOpen, setAddVersionOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const dataset = evalDatasets.find((d) => d.id === datasetId)
  const versions = datasetVersions
    .filter((v) => v.datasetId === datasetId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  if (!dataset) {
    return (
      <div className="text-center py-20">
        <p className="text-vz-gray-400">Dataset not found.</p>
        <Button variant="ghost" onClick={() => navigate('/datasets')} className="mt-3">
          ← Back to Datasets
        </Button>
      </div>
    )
  }

  function batchCount(versionId: string) {
    return datasetBatches.filter((b) => b.versionId === versionId).length
  }

  function scenarioCount(versionId: string) {
    return new Set(
      datasetBatches.filter((b) => b.versionId === versionId).flatMap((b) => b.scenarioIds)
    ).size
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <HierarchyBreadcrumb segments={[
        { label: 'Datasets', href: '/datasets' },
        { label: dataset.name, count: `${versions.length} version${versions.length !== 1 ? 's' : ''}` },
      ]} />

      {/* Dataset header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-vz-gray-900">{dataset.name}</h2>
          <p className="text-sm text-vz-gray-500 mt-0.5">{dataset.description}</p>
        </div>
        <Button onClick={() => setAddVersionOpen(true)}>
          <Plus size={14} /> New Version
        </Button>
      </div>

      {/* Versions */}
      {versions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-lg">
          <Layers size={24} className="text-vz-gray-300 mb-3" />
          <p className="font-semibold text-vz-gray-700">No versions yet</p>
          <p className="text-sm text-vz-gray-400 mt-1 mb-5">
            Versions let you track changes to your evaluation dataset over time.
          </p>
          <Button onClick={() => setAddVersionOpen(true)}>
            <Plus size={14} /> Add Version
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-vz-gray-400">
            {versions.length} Version{versions.length !== 1 ? 's' : ''}
          </p>
          {versions.map((ver) => {
            const bc = batchCount(ver.id)
            const sc = scenarioCount(ver.id)
            return (
              <Card key={ver.id} className="hover:border-vz-gray-300 transition-colors group">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 px-5 py-4">
                    <Link
                      to={`/datasets/${datasetId}/versions/${ver.id}`}
                      className="flex items-center gap-4 flex-1 min-w-0"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-vz-gray-100 text-vz-gray-700 text-xs font-bold">
                        {ver.label}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-vz-gray-900 group-hover:text-vz-red transition-colors">
                          {ver.label}
                        </p>
                        {ver.description && (
                          <p className="text-xs text-vz-gray-400 truncate mt-0.5">{ver.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-5 shrink-0 text-xs text-vz-gray-400">
                        <span>{bc} batch{bc !== 1 ? 'es' : ''}</span>
                        <span>{sc} scenario{sc !== 1 ? 's' : ''}</span>
                        <Badge variant="default">{new Date(ver.createdAt).toLocaleDateString()}</Badge>
                      </div>
                      <ArrowRight size={14} className="shrink-0 text-vz-gray-300 group-hover:text-vz-red transition-colors" />
                    </Link>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(ver.id) }}
                      className="shrink-0 ml-1 text-vz-gray-300 hover:text-vz-red transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Version Dialog */}
      <AddVersionDialog
        open={addVersionOpen}
        datasetId={datasetId ?? ''}
        existingLabels={versions.map((v) => v.label)}
        onClose={() => setAddVersionOpen(false)}
        onSave={addDatasetVersion}
      />

      {/* Delete Version Dialog */}
      {deleteTarget && (
        <Dialog open onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Version?</DialogTitle>
              <DialogDescription>
                This will permanently delete the version and all its batches.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
              <Button
                variant="destructive"
                onClick={() => { deleteDatasetVersion(deleteTarget); setDeleteTarget(null) }}
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

function AddVersionDialog({
  open, datasetId, existingLabels, onClose, onSave,
}: {
  open: boolean
  datasetId: string
  existingLabels: string[]
  onClose: () => void
  onSave: (v: { datasetId: string; label: string; description?: string }) => void
}) {
  const nextLabel = `v${existingLabels.length + 1}`
  const [label, setLabel] = useState(nextLabel)
  const [description, setDescription] = useState('')

  const duplicate = existingLabels.includes(label.trim())

  function handleSave() {
    if (!label.trim() || duplicate) return
    onSave({ datasetId, label: label.trim(), description: description.trim() || undefined })
    setLabel('')
    setDescription('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Dataset Version</DialogTitle>
          <DialogDescription>
            Add a new version to track changes in your evaluation dataset.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-0 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ver-label">Version Label *</Label>
            <Input
              id="ver-label"
              placeholder="v1"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              autoFocus
            />
            {duplicate && <p className="text-xs text-red-600">A version with this label already exists.</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ver-desc">Description</Label>
            <Textarea
              id="ver-desc"
              placeholder="What changed in this version?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={!label.trim() || duplicate}>
            Create Version
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
