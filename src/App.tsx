import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import { useApp } from '@/context/AppContext'
import { AppShell } from '@/components/layout/AppShell'
import Dashboard from '@/pages/Dashboard'
import Guide from '@/pages/Guide'
import AgentLibrary from '@/pages/agents/AgentLibrary'
import ScenarioLibrary from '@/pages/scenarios/ScenarioLibrary'
import CreateScenario from '@/pages/scenarios/CreateScenario'
import ScenarioRuns from '@/pages/scenarios/ScenarioRuns'
import GeneratorReview from '@/pages/generator/GeneratorReview'
import SimulatorInput from '@/pages/simulator/SimulatorInput'
import SimulatorRuns from '@/pages/simulator/SimulatorRuns'
import SimulatorResults from '@/pages/simulator/SimulatorResults'
import LoginPage from '@/pages/LoginPage'
import ProjectsPage from '@/pages/ProjectsPage'
import CreateProject from '@/pages/projects/CreateProject'
import DatasetsPage from '@/pages/datasets/DatasetsPage'
import DatasetDetail from '@/pages/datasets/DatasetDetail'
import VersionDetail from '@/pages/datasets/VersionDetail'
import BatchDetail from '@/pages/datasets/BatchDetail'
import GenerateAutopilotBatch from '@/pages/datasets/GenerateAutopilotBatch'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useApp()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function ProjectGuard({ children }: { children: React.ReactNode }) {
  const { user, activeProjectId } = useApp()
  if (!user) return <Navigate to="/login" replace />
  if (!activeProjectId) return <Navigate to="/projects" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* Project selection (requires auth, no project needed) */}
      <Route path="/projects" element={<AuthGuard><ProjectsPage /></AuthGuard>} />
      <Route path="/projects/new" element={<AuthGuard><CreateProject /></AuthGuard>} />

      {/* Project-scoped routes (require auth + active project) */}
      <Route path="/*" element={
        <ProjectGuard>
          <AppShell>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/guide" element={<Guide />} />

              {/* Agents */}
              <Route path="/agents" element={<AgentLibrary />} />

              {/* Evaluation Datasets */}
              <Route path="/datasets" element={<DatasetsPage />} />
              <Route path="/datasets/:datasetId" element={<DatasetDetail />} />
              <Route path="/datasets/:datasetId/versions/:versionId" element={<VersionDetail />} />
              <Route path="/datasets/:datasetId/versions/:versionId/batches/:batchId" element={<BatchDetail />} />
              <Route path="/datasets/:datasetId/versions/:versionId/generate" element={<GenerateAutopilotBatch />} />

              {/* Scenario Builder */}
              <Route path="/scenarios" element={<ScenarioLibrary />} />
              <Route path="/scenarios/new" element={<CreateScenario />} />
              <Route path="/scenarios/runs" element={<ScenarioRuns />} />
              <Route path="/scenarios/runs/:id" element={<GeneratorReview />} />

              {/* Simulator */}
              <Route path="/simulator" element={<SimulatorInput />} />
              <Route path="/simulator/runs" element={<SimulatorRuns />} />
              <Route path="/simulator/runs/:id" element={<SimulatorResults />} />
            </Routes>
          </AppShell>
        </ProjectGuard>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}
