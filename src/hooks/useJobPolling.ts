import { useState, useRef, useCallback } from 'react'
import type { JobStatus, ProgressEvent } from '@/types'

interface UseJobPollingOptions {
  onComplete?: () => void
  onError?: (error: string) => void
}

interface JobState {
  status: JobStatus
  progress: ProgressEvent[]
  jobId: string | null
}

/**
 * Polls a job endpoint (/api/jobs/:id) every `intervalMs` ms until the job
 * reaches a terminal state. Replace the mock in startMockJob() with a real
 * fetch when the backend is ready.
 */
export function useJobPolling(_intervalMs = 1500, opts?: UseJobPollingOptions) {
  const [state, setState] = useState<JobState>({
    status: 'idle',
    progress: [],
    jobId: null,
  })
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // ------------------------------------------------------------------
  // Real polling (uncomment and replace mock below when backend exists)
  // ------------------------------------------------------------------
  // const poll = useCallback(async (jobId: string) => {
  //   try {
  //     const res = await fetch(`/api/jobs/${jobId}`)
  //     const data = await res.json()
  //     setState(s => ({ ...s, status: data.status, progress: data.progress }))
  //     if (data.status === 'completed' || data.status === 'failed') {
  //       stop()
  //       if (data.status === 'completed') opts?.onComplete?.()
  //       else opts?.onError?.(data.error ?? 'Unknown error')
  //     }
  //   } catch {
  //     stop()
  //     opts?.onError?.('Network error while polling job status')
  //   }
  // }, [stop, opts])

  // Mock — simulates incremental progress events
  const startMockJob = useCallback(
    (steps: { step: string; message: string }[], delayPerStep = 1400) => {
      const jobId = `job-${Date.now()}`
      let stepIndex = 0

      setState({ status: 'running', progress: [], jobId })

      timerRef.current = setInterval(() => {
        if (stepIndex >= steps.length) {
          stop()
          setState((s) => ({ ...s, status: 'completed' }))
          opts?.onComplete?.()
          return
        }
        const event: ProgressEvent = {
          ...steps[stepIndex],
          percent: Math.round(((stepIndex + 1) / steps.length) * 100),
          timestamp: new Date().toISOString(),
        }
        setState((s) => ({ ...s, progress: [...s.progress, event] }))
        stepIndex++
      }, delayPerStep)

      return jobId
    },
    [stop, opts]
  )

  return { ...state, startMockJob, stop }
}
