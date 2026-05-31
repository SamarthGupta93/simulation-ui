import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Sparkles, PenLine, ArrowRight, Layers } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'

export default function ScenarioLibrary() {
  const { datasetBatches, datasetVersions, evalDatasets } = useApp()
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'autopilot' | 'manual'>('all')

  const enriched = datasetBatches
    .filter((b) => {
      const matchSearch = !search || b.name.toLowerCase().includes(search.toLowerCase())
      const matchSource = sourceFilter === 'all' || b.source === sourceFilter
      return matchSearch && matchSource
    })
    .map((b) => ({
      ...b,
      version: datasetVersions.find((v) => v.id === b.versionId),
      dataset: evalDatasets.find((d) => d.id === b.datasetId),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div className="mx-auto max-w-4xl space-y-5 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-vz-gray-300" />
          <Input
            placeholder="Search batches…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex rounded border border-border bg-white text-sm overflow-hidden">
          {(['all', 'autopilot', 'manual'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSourceFilter(s)}
              className={cn(
                'px-3 py-2 font-medium transition-colors capitalize',
                sourceFilter === s ? 'bg-vz-black text-white' : 'text-vz-gray-500 hover:bg-vz-gray-100'
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <Button asChild size="sm" variant="outline">
          <Link to="/datasets"><Layers size={14} /> Go to Datasets</Link>
        </Button>
      </div>

      <p className="text-xs text-vz-gray-400">
        {enriched.length} batch{enriched.length !== 1 ? 'es' : ''}
      </p>

      {enriched.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-16 text-center">
          <Layers size={24} className="text-vz-gray-300 mb-3" />
          <p className="font-semibold text-vz-gray-700">No batches found</p>
          <p className="text-sm text-vz-gray-400 mt-1 mb-4">
            Batches are created from a dataset version — via autopilot generation or manually.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link to="/datasets"><Layers size={14} /> Go to Datasets</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {enriched.map((batch) => (
            <Card key={batch.id} className="hover:border-vz-gray-300 transition-colors group">
              <CardContent className="p-0">
                <Link
                  to={`/datasets/${batch.datasetId}/versions/${batch.versionId}/batches/${batch.id}`}
                  className="flex items-center gap-4 px-4 py-3"
                >
                  <div className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded',
                    batch.source === 'autopilot'
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-blue-100 text-blue-600'
                  )}>
                    {batch.source === 'autopilot' ? <Sparkles size={15} /> : <PenLine size={15} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-vz-gray-900 group-hover:text-vz-red transition-colors truncate">
                      {batch.name}
                    </p>
                    <p className="text-xs text-vz-gray-400 mt-0.5 truncate">
                      {batch.dataset?.name ?? '—'} · {batch.version?.label ?? '—'}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-4 text-xs text-vz-gray-400">
                    <Badge variant="default">{batch.source}</Badge>
                    <span>{batch.scenarioIds.length} scenario{batch.scenarioIds.length !== 1 ? 's' : ''}</span>
                    <span>{new Date(batch.createdAt).toLocaleDateString()}</span>
                  </div>

                  <ArrowRight size={14} className="shrink-0 text-vz-gray-300 group-hover:text-vz-red transition-colors" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
