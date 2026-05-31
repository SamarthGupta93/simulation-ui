import { Link } from 'react-router-dom'
import { User, List, Layers, Database, Cpu, Server, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Guide() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 animate-fade-in">
      {/* Hero */}
      <div>
        <h2 className="text-2xl font-bold text-vz-gray-900">How SimLab works</h2>
        <p className="mt-2 text-sm text-vz-gray-500 leading-relaxed max-w-xl">
          SimLab evaluates your conversational AI agent by running realistic user simulations
          automatically. Instead of manual testing, you author or generate scenarios, point SimLab
          at your agent's endpoint, and get pass/fail results with full transcripts.
        </p>
      </div>

      {/* Workflow */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-vz-gray-400">The workflow</h3>
        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-[22px] top-10 h-[calc(100%-56px)] w-0.5 bg-border" />
          <ol className="space-y-4">
            {[
              {
                n: '1', icon: Database, color: 'bg-purple-100 text-purple-600',
                title: 'Create an evaluation dataset',
                body: 'Organise your scenarios into versioned evaluation datasets. Each version holds one or more batches — generated via Autopilot from a requirements document, or built manually.',
                to: '/datasets', cta: 'Create a dataset',
              },
              {
                n: '2', icon: Server, color: 'bg-blue-100 text-blue-600',
                title: 'Add your agent',
                body: 'Configure the endpoint URL, authentication headers, and the response key your agent uses. SimLab will POST each turn to this endpoint.',
                to: '/agents', cta: 'Add an agent',
              },
              {
                n: '3', icon: Cpu, color: 'bg-amber-100 text-amber-700',
                title: 'Run a simulation',
                body: 'Select an agent and a set of scenarios. Set max turns. SimLab conducts every conversation and collects the full transcript.',
                to: '/simulator', cta: 'Run simulation',
              },
              {
                n: '4', icon: CheckCircle2, color: 'bg-green-100 text-green-600',
                title: 'Review results',
                body: 'Each scenario is marked pass or fail. Drill into the transcript to understand exactly where the agent succeeded or fell short.',
                to: '/simulator/runs', cta: 'View runs',
              },
            ].map((step) => (
              <li key={step.n} className="flex gap-4">
                <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 border-white', step.color)}>
                  <step.icon size={16} />
                </div>
                <div className="flex-1 pb-2 pt-1">
                  <p className="font-semibold text-vz-gray-900">{step.title}</p>
                  <p className="mt-0.5 text-sm text-vz-gray-500 leading-relaxed">{step.body}</p>
                  <Button asChild variant="link" size="sm" className="mt-1 pl-0">
                    <Link to={step.to}>{step.cta} <ArrowRight size={12} /></Link>
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Scenario types */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-vz-gray-400">Scenario types</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: User, color: 'bg-purple-100 text-purple-600', label: 'Persona',
              desc: 'The AI user roleplays a defined persona with a goal, context, and behavioral guidelines. Conversations flow freely — best for testing nuance and edge cases.',
              when: 'Use when you want to test how your agent handles real human complexity.',
            },
            {
              icon: List, color: 'bg-blue-100 text-blue-600', label: 'Script',
              desc: 'A fixed ordered sequence of user messages. The agent has no control over what comes next — ideal for deterministic regression testing of specific known flows.',
              when: 'Use when you need a guaranteed conversation path for CI/regression.',
            },
            {
              icon: Layers, color: 'bg-amber-100 text-amber-700', label: 'Hybrid',
              desc: 'Starts with scripted messages (e.g. greetings, specific issue statement) then hands off to a persona for free-form exploration. Combines predictability with depth.',
              when: 'Use when you need a consistent opening but want to stress-test the rest.',
            },
          ].map((t) => (
            <Card key={t.label}>
              <CardHeader className="pb-2">
                <div className={cn('mb-1 flex h-8 w-8 items-center justify-center rounded', t.color)}>
                  <t.icon size={16} />
                </div>
                <CardTitle>{t.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <p className="text-xs text-vz-gray-500 leading-relaxed">{t.desc}</p>
                <p className="text-xs font-medium text-vz-gray-700 italic">{t.when}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pass / Fail */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-vz-gray-400">Pass / Fail logic</h3>
        <Card>
          <CardContent className="grid gap-4 sm:grid-cols-2 pt-5">
            <div className="flex gap-3">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-500" />
              <div>
                <p className="font-semibold text-vz-gray-900">Pass</p>
                <p className="mt-0.5 text-sm text-vz-gray-500">
                  The agent satisfied the user's goal within the configured max turns. The downstream evaluator marks the run successful.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-0.5 shrink-0 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">✕</div>
              <div>
                <p className="font-semibold text-vz-gray-900">Fail</p>
                <p className="mt-0.5 text-sm text-vz-gray-500">
                  The goal was not met, the agent gave an incorrect response, or the max-turn limit was reached before resolution.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Agent API contract */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-vz-gray-400">Agent API contract</h3>
        <Card>
          <CardContent className="pt-5 space-y-3">
            <p className="text-sm text-vz-gray-500">
              SimLab sends a <code className="rounded bg-vz-gray-100 px-1 py-0.5 text-xs font-mono">POST</code> to your agent endpoint for each turn with the following JSON body:
            </p>
            <pre className="overflow-x-auto rounded bg-vz-gray-100 p-3 text-xs font-mono text-vz-gray-700">{`{
  "session_id": "sim-abc123",
  "turn": 3,
  "message": "I want to dispute a $45 charge on my bill.",
  "history": [
    { "role": "user", "content": "Hi, I need some help." },
    { "role": "agent", "content": "Of course! How can I assist you today?" }
  ]
}`}</pre>
            <p className="text-sm text-vz-gray-500">
              The response should be a JSON object containing your agent's reply. Configure the <span className="font-semibold">response key</span> in Agent Library to tell SimLab which field to read — e.g. <code className="rounded bg-vz-gray-100 px-1 py-0.5 text-xs font-mono">"message"</code> or <code className="rounded bg-vz-gray-100 px-1 py-0.5 text-xs font-mono">"response"</code>.
            </p>
            <pre className="overflow-x-auto rounded bg-vz-gray-100 p-3 text-xs font-mono text-vz-gray-700">{`// Example response (response key = "message")
{ "message": "I'm sorry to hear that. Let me look into that charge for you." }`}</pre>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
