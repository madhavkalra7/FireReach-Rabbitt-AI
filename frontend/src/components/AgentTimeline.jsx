const AGENT_INFO = {
  agent1_discovery: { icon: 'A1', name: 'Company Discovery', desc: 'Finding best-fit companies' },
  agent2_signals: { icon: 'A2', name: 'Signal Harvesting', desc: 'Pulling 6 signal types' },
  agent3_verifier: { icon: 'A3', name: 'Signal Verification', desc: 'Cross-checking accuracy' },
  agent4_scorer: { icon: 'A4', name: 'ICP Scoring', desc: 'Scoring 0-100 for fit' },
  agent5_ranker: { icon: 'A5', name: 'Company Ranking', desc: 'Ranking top targets' },
  agent6_contacts: { icon: 'A6', name: 'Contact Finding', desc: 'Finding decision makers' },
  agent7_outreach: { icon: 'A7', name: 'Outreach Generation', desc: 'Writing personalized emails' },
}

export default function AgentTimeline({ steps = [] }) {
  return (
    <div className="card timeline-card">
      <h3 className="card-title">Agent Pipeline</h3>
      <div className="timeline">
        {steps.map((step, i) => {
          const info = AGENT_INFO[step.tool_name] || { icon: 'AX', name: step.tool_name, desc: '' }
          const isDone = step.status === 'done' || step.status === 'completed'
          const isRunning = step.status === 'running'
          const isPending = step.status === 'pending'

          return (
            <div key={i} className={`timeline-step ${isDone ? 'step-done' : isRunning ? 'step-running' : 'step-pending'}`}>
              <div className="step-indicator">
                <div className={`step-circle ${isDone ? 'circle-done' : isRunning ? 'circle-running' : ''}`}>
                  {isDone ? '✓' : i + 1}
                </div>
                {i < steps.length - 1 && <div className="step-line" />}
              </div>
              <div className="step-content">
                <div className="step-header">
                  <span className="step-icon">{info.icon}</span>
                  <span className="step-name">{info.name}</span>
                </div>
                <p className="step-desc">
                  {isDone ? (
                    <span className="text-success">Complete</span>
                  ) : isRunning ? (
                    <span className="text-running">Processing...</span>
                  ) : (
                    <span className="text-muted">{info.desc}</span>
                  )}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
