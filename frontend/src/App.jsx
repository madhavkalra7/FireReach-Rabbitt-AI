import { useState } from 'react'
import InputForm from './components/InputForm'
import AgentTimeline from './components/AgentTimeline'
import SignalCard from './components/SignalCard'
import ResearchBrief from './components/ResearchBrief'
import EmailPreview from './components/EmailPreview'

export default function App() {
  const [state, setState] = useState({
    step: 'idle',
    steps: [],
    result: null,
    error: null
  })

  const handleSubmit = async (formData) => {
    setState({
      step: 'running',
      steps: [
        { tool_name: 'tool_signal_harvester', status: 'running', result: {} },
        { tool_name: 'tool_research_analyst', status: 'pending', result: {} },
        { tool_name: 'tool_outreach_automated_sender', status: 'pending', result: {} }
      ],
      result: null,
      error: null
    })

    try {
      const apiUrl = import.meta.env.VITE_API_URL || ''
      const response = await fetch(`${apiUrl}/api/outreach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Request failed')
      }

      const result = await response.json()
      setState({
        step: 'done',
        steps: result.steps || [],
        result,
        error: null
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        step: 'idle',
        error: error.message
      }))
    }
  }

  const handleReset = () => {
    setState({ step: 'idle', steps: [], result: null, error: null })
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">🔥</div>
            <span className="logo-text">FireReach</span>
          </div>
          <div className="status-pill">
            <span className="status-dot" />
            <span>System Online</span>
          </div>
        </div>
      </header>

      <main className="main">
        <aside className="sidebar">
          <InputForm
            onSubmit={handleSubmit}
            isRunning={state.step === 'running'}
            onReset={handleReset}
            showReset={state.step === 'done'}
          />
          
          {state.error && (
            <div className="error-box">⚠️ {state.error}</div>
          )}
          
          {(state.step === 'running' || state.step === 'done') && (
            <AgentTimeline steps={state.steps} />
          )}
        </aside>

        <section className="content">
          {state.step === 'idle' && !state.error && (
            <div className="empty-state">
              <div className="diamond-container">
                <video
                  className="diamond-video"
                  src="/diamond.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
                <div className="diamond-glow" />
              </div>
              <h2 className="empty-title">Ready to Launch</h2>
              <p className="empty-text">
                Enter your ICP and target company to start the autonomous outreach engine
              </p>
            </div>
          )}

          {state.step === 'running' && (
            <div className="loading-state">
              <div className="diamond-container diamond-spinning">
                <video
                  className="diamond-video"
                  src="/diamond.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
                <div className="diamond-glow active" />
              </div>
              <h2 className="loading-title">Agent Working</h2>
              <p className="loading-text">Harvesting signals and crafting your email...</p>
            </div>
          )}

          {state.step === 'done' && state.result && (
            <div className="results">
              <div className="section-label">Harvested Signals</div>
              <div className="signals-grid">
                <SignalCard
                  icon="💰"
                  title="Funding"
                  content={state.result.signals?.funding}
                />
                <SignalCard
                  icon="👥"
                  title="Hiring Activity"
                  content={state.result.signals?.hiring}
                />
                <SignalCard
                  icon="📰"
                  title="Recent News"
                  items={state.result.signals?.news}
                />
              </div>

              <div className="section-label">Account Brief</div>
              <ResearchBrief
                company={state.result.signals?.company}
                brief={state.result.account_brief}
              />

              <div className="section-label">Generated Email</div>
              <EmailPreview
                subject={state.result.email_subject}
                body={state.result.email_body}
                sent={state.result.sent}
                recipient={state.result.signals?.company}
              />
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
