import { useEffect, useState } from 'react'

export default function CompanyRankCard({ company, rank, onSelect, selected = false, disabled = false }) {
  const companyName = company.company_name || company.company || company.name || 'Unknown Company'
  const industry = company.industry || 'Industry N/A'
  const toNumber = (value) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  const scoreValue = toNumber(company.avg_score) ?? toNumber(company.final_score) ?? toNumber(company.icp_score) ?? 0
  const reason = company.reason || company.score_reason || ''
  const logoSources = [company.company_logo, company.company_icon].filter(Boolean)
  const [logoIndex, setLogoIndex] = useState(0)

  useEffect(() => {
    setLogoIndex(0)
  }, [companyName, company.company_logo, company.company_icon])

  const activeLogo = logoSources[logoIndex] || ''
  const initials = companyName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'NA'
  const site = company.website || ''
  const canSelect = Boolean(onSelect)

  return (
    <div className={`company-rank-card ${canSelect ? 'company-rank-card-clickable' : ''} ${selected ? 'company-rank-card-selected' : ''}`}>
      <div className="rank-header">
        <div className="rank-badge">#{rank}</div>
        {activeLogo ? (
          <img
            src={activeLogo}
            alt={companyName + ' logo'}
            className="company-logo-img"
            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', marginRight: 12, background: '#fff', border: '1px solid #eee' }}
            onError={() => setLogoIndex((prev) => prev + 1)}
          />
        ) : (
          <div
            className="company-logo-fallback"
            style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 12, background: '#1f1f1f', color: '#bbb', display: 'grid', placeItems: 'center', border: '1px solid #333', fontSize: 12, fontWeight: 700 }}
            title={companyName}
          >
            {initials}
          </div>
        )}
        <div className="rank-info">
          <h4 className="rank-company">{companyName}</h4>
          <p className="rank-reason">{industry}</p>
        </div>
        {site && (
          <a
            className="rank-visit-link"
            href={site}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Visit Site
          </a>
        )}
        <div className="rank-score">
          <span className="avg-score-pill">Avg {Math.round(scoreValue)}</span>
        </div>
      </div>
      {reason && <p className="rank-summary-text">{reason}</p>}
      <div className="rank-actions-row">
        {canSelect && !selected && (
          <button
            type="button"
            className="btn-primary btn-sm"
            onClick={() => onSelect?.(company)}
            disabled={disabled}
          >
            Select This Company
          </button>
        )}
        {selected && <span className="selected-chip">Selected Company</span>}
      </div>
    </div>
  )
}
