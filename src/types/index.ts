export type ScenarioType = 'persona' | 'script' | 'hybrid'
export type JobStatus = 'idle' | 'running' | 'completed' | 'failed'

export interface User {
  id: string
  email: string
  name: string
}

export interface Project {
  id: string
  name: string
  orgSlug: string
  lobSlug: string
  projectSlug: string
  createdAt: string
}

export interface EvalDataset {
  id: string
  projectId: string
  name: string
  description: string
  createdAt: string
}

export interface DatasetVersion {
  id: string
  datasetId: string
  label: string
  description?: string
  createdAt: string
}

export interface DatasetBatch {
  id: string
  versionId: string
  datasetId: string
  name: string
  source: 'manual' | 'autopilot'
  scenarioIds: string[]
  generationRunId?: string
  createdAt: string
}

export interface PersonaConfig {
  persona: string
  goal: string
  context: string
  guidelines: string
}

export interface Scenario {
  id: string
  type: ScenarioType
  title: string
  description: string
  tags: string[]
  source: 'manual' | 'generated'
  generationRunId?: string
  personaConfig?: PersonaConfig
  scriptMessages?: string[]
  createdAt: string
}

export interface Agent {
  id: string
  name: string
  endpoint: string
  headers: Record<string, string>
  responseKey: string
  createdAt: string
}

export interface ProgressEvent {
  step: string
  message: string
  percent: number
  timestamp: string
}

export interface GenerationRun {
  id: string
  status: JobStatus
  versionId?: string
  datasetId?: string
  inputs: {
    documentName?: string
    policyConfig?: string
  }
  progress: ProgressEvent[]
  scenarioIds: string[]
  reviewed?: boolean
  createdAt: string
  completedAt?: string
  error?: string
}

export interface SimulationConfig {
  maxTurns: number
  timeoutMs?: number
}

export interface TranscriptTurn {
  role: 'user' | 'agent'
  content: string
}

export interface SimulationResult {
  scenarioId: string
  status: 'pass' | 'fail' | 'error'
  turnCount: number
  durationMs: number
  transcript: TranscriptTurn[]
  failReason?: string
}

export interface Experiment {
  id: string
  name: string
  description?: string
  datasetId: string
  versionId: string
  agentId: string
  createdAt: string
}

export interface SimulationRun {
  id: string
  agentId: string
  scenarioIds: string[]
  config: SimulationConfig
  status: JobStatus
  progress: ProgressEvent[]
  results: SimulationResult[]
  createdAt: string
  completedAt?: string
  error?: string
  datasetBatchId?: string
  experimentId?: string
}
