export default function VerificationPanel({ verificationData }) {
  if (!verificationData) return null

  const scores = verificationData.confidence_scores || {}
  const topSignal = verificationData.top_signal || ''
  const summary = verificationData.verification_summary || ''

  const signalLabels = {
    S1: { name: 'Hiring', icon: '💼' },
    S2: { name: 'Funding', icon: '💰' },
    S3: { name: 'Leadership', icon: '👤' },
    S4: { name: 'Product', icon: '🚀' },
    S5: { name: 'Tech Stack', icon: '🛠' },
    S6: { name: 'Enrichment', icon: '🏢' },
  }

  return (
    <div className="card verification-card">
      <h3 className="card-title">Signal Verification</h3>
      <p className="verification-summary">{summary}</p>
      <div className="verification-grid">
        {Object.entries(signalLabels).map(([key, info]) => {
          const score = scores[key] || 0
          const isTop = key === topSignal
          return (
            <div key={key} className={`verification-item ${isTop ? 'v-item-top' : ''}`}>
              <div className="v-header">
                <span>{info.icon} {info.name}</span>
                {isTop && <span className="v-top-badge">TOP</span>}
              </div>
              <div className="v-bar">
                <div
                  className={`v-fill ${score >= 0.8 ? 'v-high' : score >= 0.5 ? 'v-mid' : 'v-low'}`}
                  style={{ width: `${score * 100}%` }}
                />
              </div>
              <span className="v-score">{(score * 100).toFixed(0)}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
