import type { Agent, Scenario, GenerationRun, SimulationRun, Experiment, User, Project, EvalDataset, DatasetVersion, DatasetBatch } from '@/types'

export const MOCK_USER: User = {
  id: 'user-1',
  email: 'demo@verizon.com',
  name: 'Demo User',
}

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'CS Bot Evaluation',
    orgSlug: 'verizon',
    lobSlug: 'customer-service',
    projectSlug: 'cs-bot-eval',
    createdAt: '2026-05-01T00:00:00Z',
  },
  {
    id: 'proj-2',
    name: 'Tech Support Bot',
    orgSlug: 'verizon',
    lobSlug: 'tech-support',
    projectSlug: 'tech-support-bot',
    createdAt: '2026-05-08T00:00:00Z',
  },
]

export const MOCK_EVAL_DATASETS: EvalDataset[] = [
  {
    id: 'ds-1',
    projectId: 'proj-1',
    name: 'Billing & Account Scenarios',
    description: 'Covers billing disputes, plan changes, and account-level issues.',
    createdAt: '2026-05-10T00:00:00Z',
  },
  {
    id: 'ds-2',
    projectId: 'proj-1',
    name: 'Device & Technical Issues',
    description: 'Scenarios for device troubleshooting and technical support flows.',
    createdAt: '2026-05-12T00:00:00Z',
  },
]

export const MOCK_DATASET_VERSIONS: DatasetVersion[] = [
  {
    id: 'dv-1',
    datasetId: 'ds-1',
    label: 'v1',
    description: 'Initial version generated from CS_Requirements_v3.pdf',
    createdAt: '2026-05-15T00:00:00Z',
  },
  {
    id: 'dv-2',
    datasetId: 'ds-1',
    label: 'v2',
    description: 'Added international and roaming scenarios',
    createdAt: '2026-05-20T00:00:00Z',
  },
]

export const MOCK_DATASET_BATCHES: DatasetBatch[] = [
  {
    id: 'db-1',
    versionId: 'dv-1',
    datasetId: 'ds-1',
    name: 'Billing Disputes',
    source: 'autopilot',
    scenarioIds: ['sc-1', 'sc-2', 'sc-5'],
    generationRunId: 'gen-1',
    createdAt: '2026-05-15T10:00:00Z',
  },
  {
    id: 'db-2',
    versionId: 'dv-1',
    datasetId: 'ds-1',
    name: 'Auth & Security',
    source: 'manual',
    scenarioIds: ['sc-3'],
    createdAt: '2026-05-16T09:00:00Z',
  },
  {
    id: 'db-3',
    versionId: 'dv-2',
    datasetId: 'ds-1',
    name: 'International Roaming',
    source: 'manual',
    scenarioIds: ['sc-4'],
    createdAt: '2026-05-20T10:00:00Z',
  },
]

export const MOCK_AGENTS: Agent[] = [
  {
    id: 'agent-1',
    name: 'CS Bot v2',
    endpoint: 'https://api.example.com/csbot/v2/chat',
    headers: { 'x-api-key': 'sk-demo-xxxxxxxxxxxx' },
    responseKey: 'message',
    createdAt: '2026-05-10T09:00:00Z',
  },
  {
    id: 'agent-2',
    name: 'Tech Support Agent',
    endpoint: 'https://api.example.com/techsupport/chat',
    headers: { Authorization: 'Bearer demo-token' },
    responseKey: 'response',
    createdAt: '2026-05-14T11:30:00Z',
  },
]

export const MOCK_SCENARIOS: Scenario[] = [
  {
    id: 'sc-1',
    type: 'persona',
    title: 'Frustrated billing dispute customer',
    description: 'Long-time customer disputing an unexpected charge, escalates if not resolved quickly.',
    tags: ['billing', 'escalation', 'retention'],
    source: 'generated',
    generationRunId: 'gen-1',
    personaConfig: {
      persona: 'A 62-year-old retiree who rarely uses technology but has been a loyal Verizon customer for 12 years.',
      goal: 'Get the $45 international data charge reversed — they never traveled abroad.',
      context: 'Called in after seeing the charge on their latest bill. Has tried the app but found it confusing.',
      guidelines: 'Be polite initially but grow frustrated if the agent does not acknowledge the error within 3 turns. Ask to speak to a supervisor if not resolved.',
    },
    createdAt: '2026-05-15T10:00:00Z',
  },
  {
    id: 'sc-2',
    type: 'persona',
    title: 'New device upgrade inquiry',
    description: 'Customer exploring upgrade options and financing plans.',
    tags: ['devices', 'upgrade', 'sales'],
    source: 'generated',
    generationRunId: 'gen-1',
    personaConfig: {
      persona: 'A 28-year-old tech-savvy professional looking to upgrade from iPhone 14 to the latest model.',
      goal: 'Understand upgrade eligibility, trade-in value, and monthly payment options.',
      context: 'On an Unlimited Plus plan. Two months left on current device payment.',
      guidelines: 'Ask specific questions about trade-in promotions. Compare at least two financing options.',
    },
    createdAt: '2026-05-15T10:01:00Z',
  },
  {
    id: 'sc-3',
    type: 'script',
    title: 'Account lockout — scripted flow',
    description: 'Fixed sequence for testing the account recovery flow end-to-end.',
    tags: ['auth', 'security', 'lockout'],
    source: 'manual',
    scriptMessages: [
      "Hi, I'm locked out of my My Verizon account.",
      "I tried resetting the password but never got the email.",
      "The email on file is jdoe@email.com.",
      "Yes, I can check that email right now.",
      "Got the code: 847291.",
      "Great, that worked. Thanks!",
    ],
    createdAt: '2026-05-16T08:30:00Z',
  },
  {
    id: 'sc-4',
    type: 'hybrid',
    title: 'International roaming setup — hybrid',
    description: 'Scripted opening followed by persona-driven exploration of plan options.',
    tags: ['roaming', 'international', 'plans'],
    source: 'manual',
    scriptMessages: [
      "I'm traveling to Germany next week and need to activate international roaming.",
      "I'm on the Unlimited Welcome plan.",
    ],
    personaConfig: {
      persona: 'A business traveler who travels internationally 4-5 times a year.',
      goal: 'Activate the best roaming option for a 10-day trip without bill shock.',
      context: 'Currently on Unlimited Welcome. Has gone over data before while abroad.',
      guidelines: 'Ask about daily rates, data caps, and TravelPass specifically. Compare at least two options.',
    },
    createdAt: '2026-05-17T14:00:00Z',
  },
  {
    id: 'sc-5',
    type: 'persona',
    title: 'Plan downgrade request',
    description: 'Budget-conscious customer wanting to reduce monthly bill.',
    tags: ['billing', 'plans', 'retention'],
    source: 'generated',
    generationRunId: 'gen-1',
    personaConfig: {
      persona: 'A college student on their parents\' family plan who recently got their own account.',
      goal: 'Find the cheapest plan that still includes hotspot and a reasonable data cap.',
      context: 'Currently on Unlimited Plus at $80/month. Budget is $50/month max.',
      guidelines: 'Be price-sensitive. Ask about student discounts. Consider switching providers if no good option.',
    },
    createdAt: '2026-05-15T10:02:00Z',
  },
]

export const MOCK_GENERATION_RUNS: GenerationRun[] = [
  {
    id: 'gen-1',
    status: 'completed',
    inputs: {
      documentName: 'CS_Requirements_v3.pdf',
      policyConfig: '{"max_turns": 12, "language": "en", "escalation_enabled": true}',
    },
    progress: [
      { step: 'Parse documents', message: 'Extracted 48 pages of requirements', percent: 17, timestamp: '2026-05-15T09:58:00Z' },
      { step: 'Analyze requirements', message: '12 use case categories identified', percent: 33, timestamp: '2026-05-15T09:58:30Z' },
      { step: 'Apply policy rules', message: 'Policy constraints mapped', percent: 50, timestamp: '2026-05-15T09:59:00Z' },
      { step: 'Generate scenarios', message: '8 candidate scenarios created', percent: 67, timestamp: '2026-05-15T09:59:45Z' },
      { step: 'Deduplicate', message: '3 duplicates removed', percent: 83, timestamp: '2026-05-15T10:00:10Z' },
      { step: 'Finalize', message: '5 scenarios ready for review', percent: 100, timestamp: '2026-05-15T10:00:30Z' },
    ],
    scenarioIds: ['sc-1', 'sc-2', 'sc-5'],
    reviewed: true,
    createdAt: '2026-05-15T09:57:00Z',
    completedAt: '2026-05-15T10:00:30Z',
  },
  {
    id: 'gen-2',
    status: 'failed',
    inputs: { documentName: 'Policy_Draft.docx' },
    progress: [
      { step: 'Parse documents', message: 'File format error: corrupted DOCX', percent: 17, timestamp: '2026-05-18T16:02:00Z' },
    ],
    scenarioIds: [],
    createdAt: '2026-05-18T16:01:00Z',
    error: 'Could not parse the uploaded document. Please check the file and try again.',
  },
]

export const MOCK_EXPERIMENTS: Experiment[] = [
  {
    id: 'exp-1',
    name: 'CS Bot Regression Suite',
    description: 'Tracking iterative improvements to CS Bot v2 against billing & account scenarios.',
    datasetId: 'ds-1',
    versionId: 'dv-1',
    agentId: 'agent-1',
    createdAt: '2026-05-15T09:00:00Z',
  },
]

const EXP_SCENARIO_IDS = ['sc-1', 'sc-2', 'sc-3', 'sc-4', 'sc-5']

// sc-1: always pass | sc-2: fail→pass(r2) | sc-3: fail→pass(r3)→fail(r4)→pass(r5)
// sc-4: fail→fail→pass(r3)→pass | sc-5: always fail
// Pass rates: 20% → 40% → 80% → 60% → 80%

export const MOCK_SIMULATION_RUNS: SimulationRun[] = [
  // ── Experiment runs ────────────────────────────────────────────────────────
  {
    id: 'sim-exp-1',
    experimentId: 'exp-1',
    agentId: 'agent-1',
    scenarioIds: EXP_SCENARIO_IDS,
    config: { maxTurns: 12, timeoutMs: 30000 },
    status: 'completed',
    progress: [
      { step: 'Validate endpoint', message: 'Agent responded in 210ms', percent: 20, timestamp: '2026-05-15T10:01:00Z' },
      { step: 'Run scenarios', message: 'Executed 5 scenarios', percent: 80, timestamp: '2026-05-15T10:02:30Z' },
      { step: 'Finalize', message: 'Results compiled', percent: 100, timestamp: '2026-05-15T10:02:45Z' },
    ],
    results: [
      { scenarioId: 'sc-1', status: 'pass', turnCount: 8, durationMs: 18400, transcript: [{ role: 'user', content: "I have a $45 charge I didn't authorize." }, { role: 'agent', content: "I've reviewed the charge and issued a full $45 credit. You'll see it in 1–2 billing cycles." }] },
      { scenarioId: 'sc-2', status: 'fail', turnCount: 4, durationMs: 9200, failReason: 'Agent did not provide trade-in value after 3 explicit requests', transcript: [{ role: 'user', content: "What's the trade-in value for my iPhone 14?" }, { role: 'agent', content: "We have great upgrade options available! Would you like to visit a store for a personalized assessment?" }] },
      { scenarioId: 'sc-3', status: 'fail', turnCount: 3, durationMs: 7100, failReason: 'Agent could not complete identity verification flow', transcript: [{ role: 'user', content: "I'm locked out of my account." }, { role: 'agent', content: "Please visit a store with a photo ID to regain access." }] },
      { scenarioId: 'sc-4', status: 'fail', turnCount: 4, durationMs: 8800, failReason: 'Agent did not explain roaming options or pricing', transcript: [{ role: 'user', content: "I need to activate roaming for Germany next week." }, { role: 'agent', content: "International roaming may incur additional charges. Please call 611 for details." }] },
      { scenarioId: 'sc-5', status: 'fail', turnCount: 5, durationMs: 11200, failReason: 'Agent did not offer retention discount or alternative plan', transcript: [{ role: 'user', content: "I want to downgrade to a cheaper plan." }, { role: 'agent', content: "I can process a plan change. Our basic plan is $35/month." }] },
    ],
    createdAt: '2026-05-15T10:00:00Z',
    completedAt: '2026-05-15T10:02:45Z',
  },
  {
    id: 'sim-exp-2',
    experimentId: 'exp-1',
    agentId: 'agent-1',
    scenarioIds: EXP_SCENARIO_IDS,
    config: { maxTurns: 12, timeoutMs: 30000 },
    status: 'completed',
    progress: [
      { step: 'Validate endpoint', message: 'Agent responded in 198ms', percent: 20, timestamp: '2026-05-18T14:01:00Z' },
      { step: 'Run scenarios', message: 'Executed 5 scenarios', percent: 80, timestamp: '2026-05-18T14:02:30Z' },
      { step: 'Finalize', message: 'Results compiled', percent: 100, timestamp: '2026-05-18T14:02:50Z' },
    ],
    results: [
      { scenarioId: 'sc-1', status: 'pass', turnCount: 8, durationMs: 17900, transcript: [{ role: 'user', content: "I have a $45 charge I didn't authorize." }, { role: 'agent', content: "I've verified the error and issued a $45 credit immediately." }] },
      { scenarioId: 'sc-2', status: 'pass', turnCount: 7, durationMs: 16400, transcript: [{ role: 'user', content: "What's the trade-in value for my iPhone 14?" }, { role: 'agent', content: "Your iPhone 14 is worth up to $380 in trade-in credit toward a new device. Would you like to see current upgrade promotions?" }] },
      { scenarioId: 'sc-3', status: 'fail', turnCount: 3, durationMs: 7000, failReason: 'Agent directed user to store instead of completing verification by phone', transcript: [{ role: 'user', content: "I'm locked out and need to reset my password." }, { role: 'agent', content: "For security, please visit a store with a valid ID." }] },
      { scenarioId: 'sc-4', status: 'fail', turnCount: 4, durationMs: 8600, failReason: 'Agent did not explain TravelPass pricing clearly', transcript: [{ role: 'user', content: "Can you explain the TravelPass options for Germany?" }, { role: 'agent', content: "TravelPass is available. Please check the Verizon website for current pricing." }] },
      { scenarioId: 'sc-5', status: 'fail', turnCount: 5, durationMs: 10900, failReason: 'No retention offer made; agent only listed plan prices', transcript: [{ role: 'user', content: "My budget is $50/month max. What are my options?" }, { role: 'agent', content: "Our plans start at $35/month. I can change your plan right now." }] },
    ],
    createdAt: '2026-05-18T14:00:00Z',
    completedAt: '2026-05-18T14:02:50Z',
  },
  {
    id: 'sim-exp-3',
    experimentId: 'exp-1',
    agentId: 'agent-1',
    scenarioIds: EXP_SCENARIO_IDS,
    config: { maxTurns: 12, timeoutMs: 30000 },
    status: 'completed',
    progress: [
      { step: 'Validate endpoint', message: 'Agent responded in 185ms', percent: 20, timestamp: '2026-05-21T11:01:00Z' },
      { step: 'Run scenarios', message: 'Executed 5 scenarios', percent: 80, timestamp: '2026-05-21T11:02:30Z' },
      { step: 'Finalize', message: 'Results compiled', percent: 100, timestamp: '2026-05-21T11:02:45Z' },
    ],
    results: [
      { scenarioId: 'sc-1', status: 'pass', turnCount: 8, durationMs: 17200, transcript: [{ role: 'user', content: "I have a $45 charge I didn't authorize." }, { role: 'agent', content: "Confirmed — charge reversed and $45 credit applied." }] },
      { scenarioId: 'sc-2', status: 'pass', turnCount: 7, durationMs: 15900, transcript: [{ role: 'user', content: "What's the trade-in value for my iPhone 14?" }, { role: 'agent', content: "Your iPhone 14 is worth $380 trade-in. With the current promotion you'd pay $0 down on the iPhone 16." }] },
      { scenarioId: 'sc-3', status: 'pass', turnCount: 6, durationMs: 13400, transcript: [{ role: 'user', content: "I'm locked out of my My Verizon account." }, { role: 'agent', content: "I've sent a new reset link to your email. It should arrive within 2 minutes — please check and let me know." }] },
      { scenarioId: 'sc-4', status: 'pass', turnCount: 8, durationMs: 17800, transcript: [{ role: 'user', content: "I need roaming for Germany. What's TravelPass?" }, { role: 'agent', content: "TravelPass is $10/day and gives you your domestic plan's talk, text, and data. For 10 days that's $100 total. Want me to activate it now?" }] },
      { scenarioId: 'sc-5', status: 'fail', turnCount: 5, durationMs: 11100, failReason: 'No retention offer or student discount mentioned', transcript: [{ role: 'user', content: "I'm a student. Is there a cheaper option?" }, { role: 'agent', content: "I can move you to our $35 basic plan." }] },
    ],
    createdAt: '2026-05-21T11:00:00Z',
    completedAt: '2026-05-21T11:02:45Z',
  },
  {
    id: 'sim-exp-4',
    experimentId: 'exp-1',
    agentId: 'agent-1',
    scenarioIds: EXP_SCENARIO_IDS,
    config: { maxTurns: 12, timeoutMs: 30000 },
    status: 'completed',
    progress: [
      { step: 'Validate endpoint', message: 'Agent responded in 220ms', percent: 20, timestamp: '2026-05-24T09:01:00Z' },
      { step: 'Run scenarios', message: 'Executed 5 scenarios', percent: 80, timestamp: '2026-05-24T09:02:30Z' },
      { step: 'Finalize', message: 'Results compiled', percent: 100, timestamp: '2026-05-24T09:02:50Z' },
    ],
    results: [
      { scenarioId: 'sc-1', status: 'pass', turnCount: 7, durationMs: 16800, transcript: [{ role: 'user', content: "I have a $45 charge I didn't authorize." }, { role: 'agent', content: "I see the charge — reversing it now." }] },
      { scenarioId: 'sc-2', status: 'pass', turnCount: 7, durationMs: 15400, transcript: [{ role: 'user', content: "What's my iPhone 14 trade-in value?" }, { role: 'agent', content: "Up to $380 trade-in value today." }] },
      { scenarioId: 'sc-3', status: 'fail', turnCount: 3, durationMs: 6900, failReason: 'Agent reset link flow broken — sent to wrong email without confirmation', transcript: [{ role: 'user', content: "I need a password reset." }, { role: 'agent', content: "I've sent a reset link." }, { role: 'user', content: "I didn't receive anything." }, { role: 'agent', content: "Please check your spam folder." }] },
      { scenarioId: 'sc-4', status: 'pass', turnCount: 8, durationMs: 17200, transcript: [{ role: 'user', content: "Activate TravelPass for Germany please." }, { role: 'agent', content: "Done — TravelPass activated at $10/day starting tomorrow." }] },
      { scenarioId: 'sc-5', status: 'fail', turnCount: 5, durationMs: 10800, failReason: 'No retention discount offered', transcript: [{ role: 'user', content: "I need a cheaper plan." }, { role: 'agent', content: "I can downgrade your plan. The basic plan is $35/month." }] },
    ],
    createdAt: '2026-05-24T09:00:00Z',
    completedAt: '2026-05-24T09:02:50Z',
  },
  {
    id: 'sim-exp-5',
    experimentId: 'exp-1',
    agentId: 'agent-1',
    scenarioIds: EXP_SCENARIO_IDS,
    config: { maxTurns: 12, timeoutMs: 30000 },
    status: 'completed',
    progress: [
      { step: 'Validate endpoint', message: 'Agent responded in 176ms', percent: 20, timestamp: '2026-05-28T15:01:00Z' },
      { step: 'Run scenarios', message: 'Executed 5 scenarios', percent: 80, timestamp: '2026-05-28T15:02:20Z' },
      { step: 'Finalize', message: 'Results compiled', percent: 100, timestamp: '2026-05-28T15:02:35Z' },
    ],
    results: [
      { scenarioId: 'sc-1', status: 'pass', turnCount: 7, durationMs: 16200, transcript: [{ role: 'user', content: "I have an unauthorized $45 charge." }, { role: 'agent', content: "$45 credit applied to your account." }] },
      { scenarioId: 'sc-2', status: 'pass', turnCount: 7, durationMs: 15100, transcript: [{ role: 'user', content: "Trade-in value for iPhone 14?" }, { role: 'agent', content: "$380 trade-in value with a $200 promo credit if you upgrade to iPhone 16 today." }] },
      { scenarioId: 'sc-3', status: 'pass', turnCount: 6, durationMs: 13100, transcript: [{ role: 'user', content: "I'm locked out of my account." }, { role: 'agent', content: "Reset link sent to your confirmed email. You should receive it within 2 minutes." }] },
      { scenarioId: 'sc-4', status: 'pass', turnCount: 8, durationMs: 16900, transcript: [{ role: 'user', content: "TravelPass for 10 days in Germany." }, { role: 'agent', content: "Activated — $10/day, auto-cancels after your return. Total estimate: $100." }] },
      { scenarioId: 'sc-5', status: 'fail', turnCount: 6, durationMs: 12200, failReason: 'Student discount not mentioned; agent only offered plan downgrade', transcript: [{ role: 'user', content: "I'm a student and need to cut my bill." }, { role: 'agent', content: "I can change you to the $35 basic plan which would save you $45/month." }] },
    ],
    createdAt: '2026-05-28T15:00:00Z',
    completedAt: '2026-05-28T15:02:35Z',
  },
  // ── Standalone run (no experiment) ─────────────────────────────────────────
  {
    id: 'sim-1',
    agentId: 'agent-1',
    scenarioIds: ['sc-1', 'sc-2', 'sc-3'],
    config: { maxTurns: 12, timeoutMs: 30000 },
    status: 'completed',
    progress: [
      { step: 'Validate endpoint', message: 'Agent responded in 142ms', percent: 11, timestamp: '2026-05-17T10:01:00Z' },
      { step: 'Run scenario 1/3', message: 'Billing dispute — 8 turns', percent: 44, timestamp: '2026-05-17T10:01:20Z' },
      { step: 'Run scenario 2/3', message: 'Device upgrade — 6 turns', percent: 77, timestamp: '2026-05-17T10:01:55Z' },
      { step: 'Run scenario 3/3', message: 'Account lockout — 6 turns', percent: 100, timestamp: '2026-05-17T10:02:30Z' },
    ],
    results: [
      {
        scenarioId: 'sc-1',
        status: 'pass',
        turnCount: 8,
        durationMs: 18400,
        transcript: [
          { role: 'user', content: "Hi, I noticed a $45 international data charge on my bill but I never traveled abroad this month." },
          { role: 'agent', content: "I'm sorry to hear that! Let me pull up your account and review those charges." },
          { role: 'user', content: "My account number is 4821-998-0012." },
          { role: 'agent', content: "Thank you. I can see an international data roaming charge applied on May 3rd. Do you recall if you may have accidentally enabled roaming?" },
          { role: 'user', content: "Absolutely not. I was home all month. This is outrageous after 12 years as a customer." },
          { role: 'agent', content: "I completely understand your frustration, and I sincerely apologize. I'm escalating this to our billing specialist and issuing a full $45 credit immediately. You'll see it in 1-2 billing cycles." },
          { role: 'user', content: "Thank you. I appreciate that." },
          { role: 'agent', content: "Of course! Is there anything else I can help you with today?" },
        ],
      },
      {
        scenarioId: 'sc-2',
        status: 'fail',
        turnCount: 6,
        durationMs: 14200,
        failReason: 'Agent failed to provide trade-in value information after 3 explicit requests',
        transcript: [
          { role: 'user', content: "Hi, I want to know about upgrading from my iPhone 14." },
          { role: 'agent', content: "Great choice! We have excellent upgrade options available. What's your current plan?" },
          { role: 'user', content: "I'm on Unlimited Plus. What's the trade-in value for my iPhone 14?" },
          { role: 'agent', content: "We have many great devices to choose from! Would you like to see our latest iPhone lineup?" },
          { role: 'user', content: "Yes, but first — what would I get for trading in my iPhone 14 Pro?" },
          { role: 'agent', content: "Our newest devices start at $29.99/month. Would you like to visit a store for a personalized assessment?" },
        ],
      },
      {
        scenarioId: 'sc-3',
        status: 'pass',
        turnCount: 6,
        durationMs: 11800,
        transcript: [
          { role: 'user', content: "Hi, I'm locked out of my My Verizon account." },
          { role: 'agent', content: "I can help you regain access. I'll need to verify your identity first. Can you confirm the email address on your account?" },
          { role: 'user', content: "I tried resetting the password but never got the email." },
          { role: 'agent', content: "Let me resend the reset email right now. What email should I use?" },
          { role: 'user', content: "The email on file is jdoe@email.com." },
          { role: 'agent', content: "Done! I've sent a new reset link to jdoe@email.com. It should arrive within 2 minutes." },
        ],
      },
    ],
    createdAt: '2026-05-17T10:00:00Z',
    completedAt: '2026-05-17T10:02:45Z',
  },
]
