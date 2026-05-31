import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, PlusCircle, Cpu, History, Server, BookMarked,
  Database, ChevronDown, LogOut, FolderKanban, Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/context/AppContext'
import { useState } from 'react'

interface NavItem {
  label: string
  icon: React.ElementType
  to: string
  matchPrefixes?: string[]
  exact?: boolean
}

interface NavSection {
  heading?: string
  items: NavItem[]
}

function buildNav(): NavSection[] {
  return [
    {
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, to: '/', exact: true },
      ],
    },
    {
      heading: 'Datasets',
      items: [
        { label: 'Evaluation Datasets', icon: Database, to: '/datasets', matchPrefixes: ['/datasets'] },
      ],
    },
    {
      heading: 'Scenario Builder',
      items: [
        { label: 'Scenario Library', icon: BookOpen, to: '/scenarios', matchPrefixes: ['/scenarios'] },
        { label: 'Create / Generate', icon: PlusCircle, to: '/scenarios/new' },
        { label: 'Generation Runs', icon: History, to: '/scenarios/runs' },
      ],
    },
    {
      heading: 'Simulation',
      items: [
        { label: 'New Simulation', icon: Cpu, to: '/simulator', exact: true },
        { label: 'Run History', icon: History, to: '/simulator/runs', matchPrefixes: ['/simulator/runs'] },
      ],
    },
    {
      heading: '',
      items: [
        { label: 'Agents', icon: Server, to: '/agents' },
      ],
    },
  ]
}

function isActive(item: NavItem, pathname: string): boolean {
  if (item.exact) return pathname === item.to
  if (item.to === '/scenarios') {
    return pathname === '/scenarios'
  }
  if (item.to === '/simulator') {
    return pathname === '/simulator'
  }
  if (item.matchPrefixes) {
    return item.matchPrefixes.some((p) => pathname.startsWith(p))
  }
  return pathname === item.to || pathname.startsWith(item.to + '/')
}

function pageTitle(pathname: string): string {
  if (pathname === '/guide') return 'Guide'
  if (pathname.match(/^\/datasets\/[^/]+\/versions\/[^/]+\/batches\/.+/)) return 'Batch Detail'
  if (pathname.match(/^\/datasets\/[^/]+\/versions\/[^/]+\/generate\/review\/.+/)) return 'Review Generated Scenarios'
  if (pathname.match(/^\/datasets\/[^/]+\/versions\/[^/]+\/generate$/)) return 'Generate Autopilot Batch'
  if (pathname.match(/^\/datasets\/[^/]+\/versions\/.+/)) return 'Dataset Version'
  if (pathname.match(/^\/datasets\/.+/)) return 'Evaluation Dataset'
  if (pathname.match(/^\/scenarios\/runs\/.+/)) return 'Review Generation'
  if (pathname.match(/^\/simulator\/runs\/.+/)) return 'Simulation Results'
  const all = buildNav().flatMap((s) => s.items)
  return all.find((n) => isActive(n, pathname))?.label ?? 'SimLab'
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const { activeProject, user, logout, setActiveProjectId } = useApp()
  const navigate = useNavigate()
  const [projectMenuOpen, setProjectMenuOpen] = useState(false)
  const { projects } = useApp()

  function handleSwitchProject() {
    navigate('/projects')
    setProjectMenuOpen(false)
  }

  function handleSelectProject(id: string) {
    setActiveProjectId(id)
    setProjectMenuOpen(false)
    navigate('/')
  }

  const nav = buildNav()

  return (
    <div className="flex h-screen overflow-hidden bg-vz-gray-100">
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col bg-vz-black text-white">
        {/* Logo + Project Switcher */}
        <div className="border-b border-white/10 px-3 py-3">
          <div className="flex items-center gap-2.5 px-1 mb-2.5">
            <VzLogo />
            <div className="h-4 w-px bg-white/20" />
            <span className="text-xs font-semibold uppercase tracking-widest text-white/70">SimLab</span>
          </div>

          <button
            onClick={() => setProjectMenuOpen((v) => !v)}
            className="w-full flex items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-white/10 transition-colors group"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-vz-red text-white text-[10px] font-bold">
              <FolderKanban size={12} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-semibold text-white">{activeProject?.name ?? 'No project'}</p>
              {activeProject && (
                <p className="truncate text-[10px] text-white/40">
                  {activeProject.orgSlug}/{activeProject.lobSlug}
                </p>
              )}
            </div>
            <ChevronDown size={12} className={cn('shrink-0 text-white/40 transition-transform', projectMenuOpen && 'rotate-180')} />
          </button>

          {projectMenuOpen && (
            <div className="mt-1 rounded border border-white/10 bg-vz-gray-900 py-1 shadow-lg">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectProject(p.id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-white/10 transition-colors',
                    p.id === activeProject?.id && 'text-vz-red font-semibold'
                  )}
                >
                  <Layers size={11} className="shrink-0 opacity-60" />
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
              <div className="mx-2 my-1 border-t border-white/10" />
              <button
                onClick={handleSwitchProject}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-white/50 hover:bg-white/10 hover:text-white transition-colors"
              >
                <FolderKanban size={11} className="shrink-0" />
                All projects
              </button>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
          {nav.map((section, si) => (
            <div key={si} className={cn(si > 0 && 'mt-1')}>
              {section.heading !== undefined && section.heading !== '' && (
                <p className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                  {section.heading}
                </p>
              )}
              {section.heading === '' && si > 0 && (
                <div className="mx-4 my-2 border-t border-white/10" />
              )}
              <ul className="space-y-0.5 px-2">
                {section.items.map((item) => {
                  const { label, icon: Icon, to } = item
                  const active = isActive(item, pathname)
                  return (
                    <li key={to}>
                      <Link
                        to={to}
                        className={cn(
                          'flex items-center gap-2.5 rounded px-3 py-2 text-sm font-medium transition-colors',
                          active
                            ? 'bg-vz-red text-white'
                            : 'text-white/55 hover:bg-white/10 hover:text-white'
                        )}
                      >
                        <Icon size={15} strokeWidth={1.75} />
                        {label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom: Guide + User */}
        <div className="border-t border-white/10 px-3 py-2 space-y-0.5">
          <Link
            to="/guide"
            className={cn(
              'flex items-center gap-2 rounded px-3 py-2 text-xs font-medium transition-colors',
              pathname === '/guide'
                ? 'bg-vz-red text-white'
                : 'text-white/40 hover:bg-white/10 hover:text-white'
            )}
          >
            <BookMarked size={13} />
            Guide
          </Link>

          {user && (
            <div className="flex items-center gap-2 rounded px-3 py-2">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-vz-red text-[9px] font-bold text-white uppercase">
                {user.name[0]}
              </div>
              <span className="flex-1 min-w-0 truncate text-xs text-white/50">{user.email}</span>
              <button
                onClick={logout}
                className="shrink-0 text-white/30 hover:text-vz-red transition-colors"
                title="Sign out"
              >
                <LogOut size={12} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center border-b border-border bg-white px-8">
          <h1 className="text-sm font-semibold text-vz-gray-900">{pageTitle(pathname)}</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-8 scrollbar-thin">
          {children}
        </main>
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
