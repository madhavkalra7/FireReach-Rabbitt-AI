import { useEffect, useState } from 'react'

const SIGNAL_LABELS = {
  S1: 'Hiring',
  S2: 'Funding',
  S3: 'Leadership',
  S4: 'Product',
  S5: 'Tech',
  S6: 'Company',
}

function getCompanyName(company) {
  return company?.company_name || company?.company || company?.name || 'Unknown Company'
}

function extractSignals(company) {
  const verified = company?.verified_signals || {}
  return Object.keys(SIGNAL_LABELS)
    .filter((key) => verified[key] && String(verified[key]?.content || '').trim())
    .map((key) => ({
      code: key,
      label: SIGNAL_LABELS[key],
      content: String(verified[key]?.content || '').trim(),
      source: String(verified[key]?.source || '').trim(),
    }))
}

export default function CompanySignalPanel({ company }) {
  const companyName = getCompanyName(company)
  const industry = company?.industry || 'Industry N/A'
  const summary = company?.account_brief || company?.reason || company?.score_reason || ''
  const website = company?.website || ''
  const signals = extractSignals(company)

  const logoSources = [company?.company_logo, company?.company_icon].filter(Boolean)
  const [logoIndex, setLogoIndex] = useState(0)

  useEffect(() => {
    setLogoIndex(0)
  }, [companyName, company?.company_logo, company?.company_icon])

  const activeLogo = logoSources[logoIndex] || ''
  const initials = companyName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'NA'

  return (
    <article className="company-signal-card">
      <div className="company-signal-header">
        <div className="company-signal-title-wrap">
          {activeLogo ? (
            <img
              src={activeLogo}
              alt={companyName + ' logo'}
              className="company-signal-logo"
              onError={() => setLogoIndex((prev) => prev + 1)}
            />
          ) : (
            <div className="company-signal-logo-fallback">{initials}</div>
          )}
          <div>
            <h4 className="company-signal-name">{companyName}</h4>
            <p className="company-signal-industry">{industry}</p>
          </div>
        </div>
        {website && (
          <a href={website} target="_blank" rel="noreferrer" className="company-signal-visit">
            Visit Site
          </a>
        )}
      </div>

      {summary && <p className="company-signal-summary">{summary}</p>}

      <div className="company-signal-chip-row">
        {signals.slice(0, 6).map((signal) => (
          <span key={signal.code} className="company-signal-chip">
            {signal.code}
          </span>
        ))}
      </div>

      <div className="company-signal-list">
        {signals.length === 0 && <p className="company-signal-empty">No verified signals available.</p>}
        {signals.map((signal) => (
          <div key={signal.code} className="company-signal-item">
            <div className="company-signal-item-head">
              <span className="company-signal-code">{signal.code}</span>
              <span className="company-signal-source-label">Source</span>
            </div>
            <p className="company-signal-content">{signal.content}</p>
            {signal.source && (
              <a href={signal.source} target="_blank" rel="noreferrer" className="company-signal-source-link">
                {signal.source}
              </a>
            )}
          </div>
        ))}
      </div>
    </article>
  )
}
