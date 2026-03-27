export default function CompanyRankCard({ company, rank, onSelect, selected = false, disabled = false }) {
  const scores = company.scores || company.signal_scores || {}
  const signalLabels = { S1: 'Hiring', S2: 'Funding', S3: 'Leadership', S4: 'Product', S5: 'Tech', S6: 'Company' }
  const companyName = company.company_name || company.company || company.name || 'Unknown Company'
  const scoreValue = Number.isFinite(company.avg_score)
    ? company.avg_score
    : Number.isFinite(company.final_score)
      ? company.final_score
      : Number.isFinite(company.icp_score)
        ? company.icp_score
        : 0
  const reason = company.reason || company.score_reason || ''
  const signalSource = company.verified_signals || {}

  const normalizedScores = Object.keys(scores).length
    ? scores
    : Object.keys(signalLabels).reduce((acc, key) => {
        acc[key] = signalSource[key] ? 100 : 0
        return acc
      }, {})

  return (
    <button
      type="button"
      className={`company-rank-card ${onSelect ? 'company-rank-card-clickable' : ''} ${selected ? 'company-rank-card-selected' : ''}`}
      onClick={() => onSelect?.(company)}
      disabled={disabled || !onSelect}
    >
      <div className="rank-header">
        <div className="rank-badge">#{rank}</div>
        {/* Logo on the left */}
        {company.company_logo && (
          <img
            src={company.company_logo}
            alt={companyName + ' logo'}
            className="company-logo-img"
            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', marginRight: 12, background: '#fff', border: '1px solid #eee' }}
          />
        )}
        <div className="rank-info">
          <h4 className="rank-company">{companyName}</h4>
          <p className="rank-reason">{reason}</p>
        </div>
        <div className="rank-score">
          <div className="score-circle">
            <span className="score-value">{Math.round(scoreValue)}</span>
            <span className="score-max">/100</span>
          </div>
        </div>
      </div>
      <div className="score-bars">
        {Object.entries(signalLabels).map(([key, label]) => (
          <div key={key} className="score-bar-row">
            <span className="bar-label">{label}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${normalizedScores[key] || 0}%` }}
              />
            </div>
            <span className="bar-value">{normalizedScores[key] || 0}</span>
          </div>
        ))}
      </div>
    </button>
  )
}
