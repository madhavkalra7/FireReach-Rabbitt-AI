import { useState } from 'react'

export default function InputForm({ onSubmit, isRunning, onReset, showReset, credits = 50 }) {
  const [icp, setIcp] = useState('')
  const [targetCompany, setTargetCompany] = useState('')
  const [mode, setMode] = useState('manual')
  const [testRecipientEmail, setTestRecipientEmail] = useState('')

  const cost = mode === 'manual' ? 5 : 10
  const canLaunch = icp.trim() && credits >= cost && !isRunning

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canLaunch) return
    onSubmit({ icp, target_company: targetCompany || null, mode, test_recipient_email: testRecipientEmail })
  }

  return (
    <div className="card input-card">
      <h3 className="card-title">Launch Campaign</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Your ICP *</label>
          <textarea
            id="icp-input"
            className="form-textarea"
            placeholder="e.g. We sell DevOps automation to Series B SaaS companies with 50-200 engineers"
            rows={4}
            value={icp}
            onChange={(e) => setIcp(e.target.value)}
            disabled={isRunning}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Target Company</label>
          <input
            id="target-company-input"
            className="form-input"
            placeholder="Leave empty — AI will discover best companies"
            value={targetCompany}
            onChange={(e) => setTargetCompany(e.target.value)}
            disabled={isRunning}
          />
          <span className="form-helper">Optional. If provided, skips company discovery.</span>
        </div>

        <div className="form-group">
          <label className="form-label">Test Recipient Email (Optional)</label>
          <input
            id="test-recipient-email-input"
            className="form-input"
            placeholder="yourname@gmail.com"
            value={testRecipientEmail}
            onChange={(e) => setTestRecipientEmail(e.target.value)}
            disabled={isRunning}
          />
          <span className="form-helper">Testing only: in auto mode, final send is forced to this email when provided.</span>
        </div>

        <div className="form-group">
          <label className="form-label">Mode</label>
          <div className="mode-toggle">
            <button
              type="button"
              className={`mode-btn ${mode === 'manual' ? 'active' : ''}`}
              onClick={() => setMode('manual')}
              disabled={isRunning}
            >
              <span className="mode-name">MANUAL</span>
              <span className="mode-cost">5 credits</span>
              <span className="mode-desc">You review and select contacts</span>
            </button>
            <button
              type="button"
              className={`mode-btn ${mode === 'automatic' ? 'active' : ''}`}
              onClick={() => setMode('automatic')}
              disabled={isRunning}
            >
              <span className="mode-name">AUTOMATIC</span>
              <span className="mode-cost">10 credits</span>
              <span className="mode-desc">AI selects and sends autonomously</span>
            </button>
          </div>
        </div>

        <div className="credit-preview">
          <span>This campaign will use <strong>{cost}</strong> credits</span>
          <span>You have <strong>{credits}</strong> credits remaining</span>
        </div>

        {credits < cost && (
          <div className="error-banner">Insufficient credits. Upgrade your plan to continue.</div>
        )}

        <button
          id="launch-button"
          type="submit"
          className="btn-primary btn-lg btn-full"
          disabled={!canLaunch}
        >
          {isRunning ? (
            <><span className="spinner-sm" /> Agents running...</>
          ) : (
            'Launch 7 Agents →'
          )}
        </button>
      </form>

      {showReset && (
        <button className="btn-ghost btn-full mt-3" onClick={onReset}>
          New Campaign
        </button>
      )}
    </div>
  )
}
