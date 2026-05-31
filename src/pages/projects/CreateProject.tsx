import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, FolderKanban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export default function CreateProject() {
  const { addProject, setActiveProjectId } = useApp()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [orgSlug, setOrgSlug] = useState('verizon')
  const [lobSlug, setLobSlug] = useState('')
  const [projectSlug, setProjectSlug] = useState('')

  function handleNameChange(v: string) {
    setName(v)
    setProjectSlug(toSlug(v))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !orgSlug.trim() || !lobSlug.trim() || !projectSlug.trim()) return
    const project = addProject({
      name: name.trim(),
      orgSlug: orgSlug.trim(),
      lobSlug: lobSlug.trim(),
      projectSlug: projectSlug.trim(),
    })
    setActiveProjectId(project.id)
    navigate('/')
  }

  const canSubmit = name.trim() && orgSlug.trim() && lobSlug.trim() && projectSlug.trim()

  return (
    <div className="min-h-screen bg-vz-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-vz-gray-500 hover:text-vz-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to projects
        </Link>

        <Card>
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded bg-red-50 text-vz-red mb-2">
              <FolderKanban size={20} />
            </div>
            <CardTitle>Create Project</CardTitle>
            <CardDescription>
              Projects scope your agents, datasets, and simulation runs.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="proj-name">Project Name *</Label>
                <Input
                  id="proj-name"
                  placeholder="CS Bot Evaluation"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="org-slug">Org Slug *</Label>
                  <Input
                    id="org-slug"
                    placeholder="verizon"
                    value={orgSlug}
                    onChange={(e) => setOrgSlug(toSlug(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lob-slug">LOB Slug *</Label>
                  <Input
                    id="lob-slug"
                    placeholder="cs"
                    value={lobSlug}
                    onChange={(e) => setLobSlug(toSlug(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="proj-slug">Project Slug *</Label>
                  <Input
                    id="proj-slug"
                    placeholder="cs-bot"
                    value={projectSlug}
                    onChange={(e) => setProjectSlug(toSlug(e.target.value))}
                  />
                </div>
              </div>

              {(orgSlug || lobSlug || projectSlug) && (
                <div className="rounded bg-vz-gray-100 px-3 py-2">
                  <p className="text-xs text-vz-gray-400 mb-0.5">Full path</p>
                  <p className="font-mono text-xs text-vz-gray-700">
                    {orgSlug || '…'}/{lobSlug || '…'}/{projectSlug || '…'}
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="secondary" onClick={() => navigate('/projects')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!canSubmit}>
                  Create Project
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
