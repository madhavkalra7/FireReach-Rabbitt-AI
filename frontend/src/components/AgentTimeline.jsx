import { useEffect, useState } from 'react'

const STEPS = {
  tool_signal_harvester: { icon: '🔍', name: 'Signal Harvest', desc: 'Fetching live company data' },
  tool_research_analyst: { icon: '🧠', name: 'Account Analysis', desc: 'Analyzing strategic fit' },
  tool_outreach_automated_sender: { icon: '📧', name: 'Email Dispatch', desc: 'Generating and sending' }
}

export default function AgentTimeline({ steps }) {
  const [times, setTimes] = useState({})
  const [starts, setStarts] = useState({})

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const newTimes = {}

      steps.forEach((step) => {
        if (step.status === 'running') {
          if (!starts[step.tool_name]) {
            setStarts((s) => ({ ...s, [step.tool_name]: now }))
          }
          newTimes[step.tool_name] = ((now - (starts[step.tool_name] || now)) / 1000).toFixed(1)
        } else if (step.status === 'completed' && times[step.tool_name]) {
          newTimes[step.tool_name] = times[step.tool_name]
        }
      })

      setTimes((t) => ({ ...t, ...newTimes }))
    }, 100)

    return () => clearInterval(interval)
  }, [steps, starts, times])

  const displaySteps = steps.length ? steps : [
    { tool_name: 'tool_signal_harvester', status: 'pending' },
    { tool_name: 'tool_research_analyst', status: 'pending' },
    { tool_name: 'tool_outreach_automated_sender', status: 'pending' }
  ]

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">📊</div>
        <h2 className="card-title">Agent Timeline</h2>
      </div>

      <div className="timeline">
        {displaySteps.map((step) => {
          const config = STEPS[step.tool_name] || { icon: '⚙️', name: step.tool_name, desc: '' }
          
          return (
            <div key={step.tool_name} className={`timeline-step ${step.status}`}>
              <div className="step-icon">
                {step.status === 'running' ? <span className="spinner" /> : config.icon}
              </div>
              <div className="step-info">
                <div className="step-name">{config.name}</div>
                <div className="step-status">
                  {step.status === 'completed' && '✓ Complete'}
                  {step.status === 'running' && config.desc}
                  {step.status === 'pending' && 'Waiting...'}
                  {step.status === 'failed' && '✗ Failed'}
                </div>
              </div>
              {times[step.tool_name] && (
                <div className="step-time">{times[step.tool_name]}s</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
