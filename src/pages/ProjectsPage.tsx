import { Link, useNavigate } from 'react-router-dom'
import { Plus, FolderKanban, ArrowRight, Database, Server, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'

export default function ProjectsPage() {
  const { projects, evalDatasets, agents, user, logout, setActiveProjectId } = useApp()
  const navigate = useNavigate()

  function handleSelect(id: string) {
    setActiveProjectId(id)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-vz-gray-100">
      {/* Top bar */}
      <header className="bg-vz-black text-white px-6 py-3 flex items-center gap-3">
        <VzLogo />
        <div className="h-4 w-px bg-white/20" />
        <span className="text-xs font-semibold uppercase tracking-widest text-white/70">SimLab</span>
        <div className="flex-1" />
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50">{user.email}</span>
            <button onClick={logout} className="text-white/40 hover:text-white transition-colors" title="Sign out">
              <LogOut size={14} />
            </button>
          </div>
        )}
      </header>

      <div className="mx-auto max-w-4xl p-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-vz-gray-900">Projects</h1>
            <p className="text-sm text-vz-gray-500 mt-1">Select a project to continue, or create a new one.</p>
          </div>
          <Button asChild>
            <Link to="/projects/new">
              <Plus size={15} /> New Project
            </Link>
          </Button>
        </div>

        {/* Project grid */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-vz-gray-100 text-vz-gray-300 mb-4">
              <FolderKanban size={28} />
            </div>
            <p className="font-semibold text-vz-gray-700">No projects yet</p>
            <p className="text-sm text-vz-gray-400 mt-1 mb-6">Create your first project to get started.</p>
            <Button asChild>
              <Link to="/projects/new"><Plus size={14} /> Create Project</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const datasetCount = evalDatasets.filter((d) => d.projectId === project.id).length
              return (
                <Card
                  key={project.id}
                  className="hover:border-vz-red transition-colors cursor-pointer group"
                  onClick={() => handleSelect(project.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-red-50 text-vz-red">
                        <FolderKanban size={18} />
                      </div>
                      <ArrowRight size={14} className="shrink-0 mt-0.5 text-vz-gray-300 group-hover:text-vz-red transition-colors" />
                    </div>

                    <p className="font-semibold text-vz-gray-900 mb-0.5">{project.name}</p>
                    <p className={cn('font-mono text-[10px] text-vz-gray-400 mb-3')}>
                      {project.orgSlug}/{project.lobSlug}/{project.projectSlug}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-vz-gray-400">
                      <span className="flex items-center gap-1">
                        <Database size={11} /> {datasetCount} dataset{datasetCount !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Server size={11} /> {agents.length} agent{agents.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function VzLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="3" fill="#CD040B" />
      <path d="M5.5 5.5h4l4 8 4-8h4L13 18.5h-2.5L5.5 5.5z" fill="white" />
    </svg>
  )
}
