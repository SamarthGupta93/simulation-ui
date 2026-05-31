import { Link } from 'react-router-dom'
import { Cpu, ArrowRight, BookMarked, Database, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/context/AppContext'

export default function Dashboard() {
  const { scenarios, simulationRuns, agents, evalDatasets, datasetBatches } = useApp()

  const completedSims = simulationRuns.filter((r) => r.status === 'completed')
  const allResults = completedSims.flatMap((r) => r.results)
  const passRate = allResults.length > 0
    ? Math.round((allResults.filter((r) => r.status === 'pass').length / allResults.length) * 100)
    : null

  const recentDatasets = [...evalDatasets]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4)

  const recentSims = [...simulationRuns]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4)

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-in">

      {/* Top metrics */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Scenarios in Library', value: scenarios.length },
          { label: 'Agents in Library', value: agents.length },
          { label: 'Total Simulation Runs', value: simulationRuns.length },
          { label: 'Pass Rate', value: passRate !== null ? `${passRate}%` : '—' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4">
              <p className="text-2xl font-bold text-vz-gray-900">{s.value}</p>
              <p className="mt-1 text-sm text-vz-gray-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <QuickCard
          icon={BookMarked}
          title="Guide"
          description="Learn about scenario types, the agent API contract, and how pass/fail is determined."
          to="/guide"
          cta="Read Guide"
        />
        <QuickCard
          icon={Database}
          title="Create Dataset"
          description="Organise scenarios into versioned evaluation datasets for structured simulation runs."
          to="/datasets"
          cta="Go to Datasets"
          ctaIcon={Plus}
        />
        <QuickCard
          icon={Cpu}
          title="Run Simulation"
          description="Select an evaluation dataset and an agent to run an end-to-end simulation."
          to="/simulator"
          cta="New Simulation"
        />
      </div>

      {/* Bottom: recent datasets + recent simulations */}
      <div className="grid gap-4 sm:grid-cols-2">

        {/* Recently used evaluation datasets */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Database size={14} className="text-vz-red" /> Evaluation Datasets
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/datasets">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {recentDatasets.length === 0 && (
              <p className="text-sm text-vz-gray-400">No datasets yet.</p>
            )}
            {recentDatasets.map((ds) => {
              const batchCount = datasetBatches.filter((b) => b.datasetId === ds.id).length
              return (
                <Link
                  key={ds.id}
                  to={`/datasets/${ds.id}`}
                  className="flex items-center gap-3 rounded border border-border px-3 py-2 hover:border-vz-gray-300 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-vz-gray-900 group-hover:text-vz-red transition-colors truncate">
                      {ds.name}
                    </p>
                    <p className="text-xs text-vz-gray-400">{batchCount} batch{batchCount !== 1 ? 'es' : ''}</p>
                  </div>
                  <ArrowRight size={13} className="shrink-0 text-vz-gray-300 group-hover:text-vz-red transition-colors" />
                </Link>
              )
            })}
          </CardContent>
        </Card>

        {/* Recent simulation runs */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Cpu size={14} className="text-vz-red" /> Recent Simulations
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/simulator/runs">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {recentSims.length === 0 && (
              <p className="text-sm text-vz-gray-400">No simulations yet.</p>
            )}
            {recentSims.map((run) => {
              const results = run.results
              const passed = results.filter((r) => r.status === 'pass').length
              const statusVariant =
                run.status === 'completed' ? 'success' :
                run.status === 'failed' ? 'error' : 'warning'
              return (
                <Link
                  key={run.id}
                  to={`/simulator/runs/${run.id}`}
                  className="flex items-center gap-3 rounded border border-border px-3 py-2 hover:border-vz-gray-300 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-vz-gray-900 group-hover:text-vz-red transition-colors">
                      {run.scenarioIds.length} scenario{run.scenarioIds.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-vz-gray-400">
                      {run.status === 'completed'
                        ? `${passed}/${results.length} passed`
                        : new Date(run.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={statusVariant as 'success' | 'error' | 'warning'}>{run.status}</Badge>
                </Link>
              )
            })}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

function QuickCard({ icon: Icon, title, description, to, cta, ctaIcon: CtaIcon = ArrowRight }: {
  icon: React.ElementType
  title: string
  description: string
  to: string
  cta: string
  ctaIcon?: React.ElementType
}) {
  return (
    <Card className="hover:border-vz-red transition-colors">
      <CardHeader className="pb-3">
        <div className="mb-1 flex h-8 w-8 items-center justify-center rounded bg-red-50 text-vz-red">
          <Icon size={16} />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button asChild variant="outline" size="sm">
          <Link to={to} className="flex items-center gap-1.5">
            {cta} <CtaIcon size={13} />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

