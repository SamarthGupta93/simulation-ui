import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Agent, Scenario, GenerationRun, SimulationRun, User, Project, EvalDataset, DatasetVersion, DatasetBatch } from '@/types'
import {
  MOCK_AGENTS, MOCK_SCENARIOS, MOCK_GENERATION_RUNS, MOCK_SIMULATION_RUNS,
  MOCK_USER, MOCK_PROJECTS, MOCK_EVAL_DATASETS, MOCK_DATASET_VERSIONS, MOCK_DATASET_BATCHES,
} from '@/lib/mockData'

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

interface AppContextValue {
  // Auth
  user: User | null
  login: (email: string, name?: string) => void
  logout: () => void

  // Projects
  projects: Project[]
  activeProjectId: string | null
  activeProject: Project | null
  setActiveProjectId: (id: string) => void
  addProject: (p: Omit<Project, 'id' | 'createdAt'>) => Project

  // Agents
  agents: Agent[]
  addAgent: (a: Omit<Agent, 'id' | 'createdAt'>) => Agent
  updateAgent: (id: string, patch: Partial<Agent>) => void
  deleteAgent: (id: string) => void

  // Scenarios
  scenarios: Scenario[]
  addScenario: (s: Omit<Scenario, 'id' | 'createdAt'>) => Scenario
  updateScenario: (id: string, patch: Partial<Scenario>) => void
  deleteScenario: (id: string) => void

  // Generation Runs
  generationRuns: GenerationRun[]
  addGenerationRun: (r: Omit<GenerationRun, 'id' | 'createdAt'>) => GenerationRun
  updateGenerationRun: (id: string, patch: Partial<GenerationRun>) => void

  // Simulation Runs
  simulationRuns: SimulationRun[]
  addSimulationRun: (r: Omit<SimulationRun, 'id' | 'createdAt'>) => SimulationRun
  updateSimulationRun: (id: string, patch: Partial<SimulationRun>) => void

  // Evaluation Datasets
  evalDatasets: EvalDataset[]
  addEvalDataset: (d: Omit<EvalDataset, 'id' | 'createdAt'>) => EvalDataset
  updateEvalDataset: (id: string, patch: Partial<EvalDataset>) => void
  deleteEvalDataset: (id: string) => void

  // Dataset Versions
  datasetVersions: DatasetVersion[]
  addDatasetVersion: (v: Omit<DatasetVersion, 'id' | 'createdAt'>) => DatasetVersion
  updateDatasetVersion: (id: string, patch: Partial<DatasetVersion>) => void
  deleteDatasetVersion: (id: string) => void

  // Dataset Batches
  datasetBatches: DatasetBatch[]
  addDatasetBatch: (b: Omit<DatasetBatch, 'id' | 'createdAt'>) => DatasetBatch
  updateDatasetBatch: (id: string, patch: Partial<DatasetBatch>) => void
  deleteDatasetBatch: (id: string) => void
}

const AppContext = createContext<AppContextValue | null>(null)

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadStorage('simlab_user', null))
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(() => loadStorage('simlab_project', null))

  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS)
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS)
  const [scenarios, setScenarios] = useState<Scenario[]>(MOCK_SCENARIOS)
  const [generationRuns, setGenerationRuns] = useState<GenerationRun[]>(MOCK_GENERATION_RUNS)
  const [simulationRuns, setSimulationRuns] = useState<SimulationRun[]>(MOCK_SIMULATION_RUNS)
  const [evalDatasets, setEvalDatasets] = useState<EvalDataset[]>(MOCK_EVAL_DATASETS)
  const [datasetVersions, setDatasetVersions] = useState<DatasetVersion[]>(MOCK_DATASET_VERSIONS)
  const [datasetBatches, setDatasetBatches] = useState<DatasetBatch[]>(MOCK_DATASET_BATCHES)

  useEffect(() => {
    localStorage.setItem('simlab_user', JSON.stringify(user))
  }, [user])

  useEffect(() => {
    localStorage.setItem('simlab_project', JSON.stringify(activeProjectId))
  }, [activeProjectId])

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null

  const login = (email: string, name?: string) => {
    const u: User = MOCK_USER.email === email
      ? MOCK_USER
      : { id: `user-${uid()}`, email, name: name ?? email.split('@')[0] }
    setUser(u)
  }

  const logout = () => {
    setUser(null)
    setActiveProjectIdState(null)
  }

  const setActiveProjectId = (id: string) => setActiveProjectIdState(id)

  const addProject = (p: Omit<Project, 'id' | 'createdAt'>): Project => {
    const proj: Project = { ...p, id: `proj-${uid()}`, createdAt: new Date().toISOString() }
    setProjects((prev) => [...prev, proj])
    return proj
  }

  // Agents
  const addAgent = (a: Omit<Agent, 'id' | 'createdAt'>): Agent => {
    const agent: Agent = { ...a, id: `agent-${uid()}`, createdAt: new Date().toISOString() }
    setAgents((prev) => [...prev, agent])
    return agent
  }
  const updateAgent = (id: string, patch: Partial<Agent>) =>
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  const deleteAgent = (id: string) => setAgents((prev) => prev.filter((a) => a.id !== id))

  // Scenarios
  const addScenario = (s: Omit<Scenario, 'id' | 'createdAt'>): Scenario => {
    const sc: Scenario = { ...s, id: `sc-${uid()}`, createdAt: new Date().toISOString() }
    setScenarios((prev) => [...prev, sc])
    return sc
  }
  const updateScenario = (id: string, patch: Partial<Scenario>) =>
    setScenarios((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  const deleteScenario = (id: string) => setScenarios((prev) => prev.filter((s) => s.id !== id))

  // Generation runs
  const addGenerationRun = (r: Omit<GenerationRun, 'id' | 'createdAt'>): GenerationRun => {
    const run: GenerationRun = { ...r, id: `gen-${uid()}`, createdAt: new Date().toISOString() }
    setGenerationRuns((prev) => [run, ...prev])
    return run
  }
  const updateGenerationRun = (id: string, patch: Partial<GenerationRun>) =>
    setGenerationRuns((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))

  // Simulation runs
  const addSimulationRun = (r: Omit<SimulationRun, 'id' | 'createdAt'>): SimulationRun => {
    const run: SimulationRun = { ...r, id: `sim-${uid()}`, createdAt: new Date().toISOString() }
    setSimulationRuns((prev) => [run, ...prev])
    return run
  }
  const updateSimulationRun = (id: string, patch: Partial<SimulationRun>) =>
    setSimulationRuns((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))

  // Eval datasets
  const addEvalDataset = (d: Omit<EvalDataset, 'id' | 'createdAt'>): EvalDataset => {
    const ds: EvalDataset = { ...d, id: `ds-${uid()}`, createdAt: new Date().toISOString() }
    setEvalDatasets((prev) => [...prev, ds])
    return ds
  }
  const updateEvalDataset = (id: string, patch: Partial<EvalDataset>) =>
    setEvalDatasets((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  const deleteEvalDataset = (id: string) => setEvalDatasets((prev) => prev.filter((d) => d.id !== id))

  // Dataset versions
  const addDatasetVersion = (v: Omit<DatasetVersion, 'id' | 'createdAt'>): DatasetVersion => {
    const ver: DatasetVersion = { ...v, id: `dv-${uid()}`, createdAt: new Date().toISOString() }
    setDatasetVersions((prev) => [...prev, ver])
    return ver
  }
  const updateDatasetVersion = (id: string, patch: Partial<DatasetVersion>) =>
    setDatasetVersions((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)))
  const deleteDatasetVersion = (id: string) => setDatasetVersions((prev) => prev.filter((v) => v.id !== id))

  // Dataset batches
  const addDatasetBatch = (b: Omit<DatasetBatch, 'id' | 'createdAt'>): DatasetBatch => {
    const batch: DatasetBatch = { ...b, id: `db-${uid()}`, createdAt: new Date().toISOString() }
    setDatasetBatches((prev) => [...prev, batch])
    return batch
  }
  const updateDatasetBatch = (id: string, patch: Partial<DatasetBatch>) =>
    setDatasetBatches((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  const deleteDatasetBatch = (id: string) => setDatasetBatches((prev) => prev.filter((b) => b.id !== id))

  return (
    <AppContext.Provider value={{
      user, login, logout,
      projects, activeProjectId, activeProject, setActiveProjectId, addProject,
      agents, addAgent, updateAgent, deleteAgent,
      scenarios, addScenario, updateScenario, deleteScenario,
      generationRuns, addGenerationRun, updateGenerationRun,
      simulationRuns, addSimulationRun, updateSimulationRun,
      evalDatasets, addEvalDataset, updateEvalDataset, deleteEvalDataset,
      datasetVersions, addDatasetVersion, updateDatasetVersion, deleteDatasetVersion,
      datasetBatches, addDatasetBatch, updateDatasetBatch, deleteDatasetBatch,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
