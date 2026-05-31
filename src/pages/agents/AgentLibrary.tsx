import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Server, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'
import type { Agent } from '@/types'

const EMPTY_FORM = { name: '', endpoint: '', responseKey: 'message', headers: {} as Record<string, string> }

export default function AgentLibrary() {
  const { agents, addAgent, updateAgent, deleteAgent } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [headerKey, setHeaderKey] = useState('')
  const [headerVal, setHeaderVal] = useState('')

  function openNew() {
    setForm(EMPTY_FORM)
    setHeaderKey('')
    setHeaderVal('')
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(agent: Agent) {
    setForm({ name: agent.name, endpoint: agent.endpoint, responseKey: agent.responseKey, headers: { ...agent.headers } })
    setHeaderKey('')
    setHeaderVal('')
    setEditingId(agent.id)
    setShowForm(true)
  }

  function addHeader() {
    if (!headerKey.trim()) return
    setForm((f) => ({ ...f, headers: { ...f.headers, [headerKey.trim()]: headerVal } }))
    setHeaderKey('')
    setHeaderVal('')
  }

  function removeHeader(key: string) {
    setForm((f) => { const { [key]: _, ...rest } = f.headers; return { ...f, headers: rest } })
  }

  function handleSave() {
    if (!form.name.trim() || !form.endpoint.trim()) return
    if (editingId) {
      updateAgent(editingId, form)
    } else {
      addAgent(form)
    }
    setShowForm(false)
    setEditingId(null)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-vz-gray-500">{agents.length} agent{agents.length !== 1 ? 's' : ''} configured</p>
        <Button onClick={openNew} size="sm">
          <Plus size={14} /> Add Agent
        </Button>
      </div>

      {/* Agent list */}
      {agents.length === 0 && !showForm && (
        <EmptyState onAdd={openNew} />
      )}

      <ul className="space-y-3">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <CardContent className="flex items-start gap-4 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-vz-gray-100 text-vz-red">
                <Server size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-vz-gray-900">{agent.name}</p>
                <p className="mt-0.5 truncate text-xs text-vz-gray-400">{agent.endpoint}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded bg-vz-gray-100 px-2 py-0.5 text-xs text-vz-gray-600">
                    response key: <code className="font-mono font-semibold">{agent.responseKey}</code>
                  </span>
                  {Object.keys(agent.headers).map((k) => (
                    <span key={k} className="rounded bg-vz-gray-100 px-2 py-0.5 text-xs text-vz-gray-500">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(agent)}>
                  <Pencil size={14} className="text-vz-gray-400" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteAgent(agent.id)}>
                  <Trash2 size={14} className="text-vz-gray-400 hover:text-red-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </ul>

      {/* Add/Edit form */}
      {showForm && (
        <Card className="border-vz-red animate-fade-in">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Agent' : 'New Agent'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ag-name">Agent Name</Label>
                <Input
                  id="ag-name"
                  placeholder="CS Bot v2"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ag-key">Response Key</Label>
                <Input
                  id="ag-key"
                  placeholder="message"
                  value={form.responseKey}
                  onChange={(e) => setForm((f) => ({ ...f, responseKey: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ag-ep">Endpoint URL</Label>
              <Input
                id="ag-ep"
                placeholder="https://api.example.com/agent/chat"
                value={form.endpoint}
                onChange={(e) => setForm((f) => ({ ...f, endpoint: e.target.value }))}
              />
            </div>

            {/* Headers */}
            <div className="space-y-2">
              <Label>Headers</Label>
              {Object.entries(form.headers).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-vz-gray-100 px-2 py-1 text-xs font-mono">
                    {k}: {v}
                  </code>
                  <button onClick={() => removeHeader(k)} className="text-vz-gray-300 hover:text-vz-red">
                    <X size={13} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input placeholder="Header name (e.g. x-api-key)" value={headerKey}
                  onChange={(e) => setHeaderKey(e.target.value)} className="h-8 text-xs" />
                <Input placeholder="Value" value={headerVal}
                  onChange={(e) => setHeaderVal(e.target.value)} className="h-8 text-xs" />
                <Button variant="outline" size="sm" onClick={addHeader}><Plus size={13} /></Button>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={!form.name.trim() || !form.endpoint.trim()}>
                <Check size={14} /> {editingId ? 'Save Changes' : 'Add Agent'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-16 text-center">
      <Server size={32} className="mb-3 text-vz-gray-300" />
      <p className="font-semibold text-vz-gray-700">No agents yet</p>
      <p className="mt-1 text-sm text-vz-gray-400">Add an agent to use in simulations</p>
      <Button className="mt-4" onClick={onAdd}><Plus size={14} /> Add Agent</Button>
    </div>
  )
}
