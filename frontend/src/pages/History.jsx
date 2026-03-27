import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function History() {
  const { API } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [detailLoadingId, setDetailLoadingId] = useState(null)
  const [details, setDetails] = useState({})
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    API.get('/api/history')
      .then((res) => setCampaigns(res.data.history || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [API])

  const loadDetail = async (historyId) => {
    if (details[historyId]) return details[historyId]

    setDetailLoadingId(historyId)
    try {
      const res = await API.get(`/api/history/${historyId}`)
      const history = res.data.history
      setDetails((prev) => ({ ...prev, [historyId]: history }))
      return history
    } finally {
      setDetailLoadingId(null)
    }
  }

  const handleToggle = async (historyId) => {
    const nextExpanded = expanded === historyId ? null : historyId
    setExpanded(nextExpanded)
    if (nextExpanded) {
      await loadDetail(historyId)
    }
  }

  const getModeLabel = (item) => {
    const mode = String(item.sendMode || item.mode || '').toLowerCase()
    if (mode === 'automatic') return 'Automatic'
    if (mode === 'manual') return 'Manual'
    return mode || '—'
  }

  const getCompanyCount = (item) => item.companyCount ?? item.result?.summary?.company_count ?? (item.result?.companies?.length || 0)

  const getHistoryResult = (item) => details[item.id]?.result || item.result || {}

  const filtered = campaigns.filter((c) => {
    if (filter === 'all') return true
    if (filter === 'manual') return String(c.sendMode || c.mode || '').toLowerCase() === 'manual'
    if (filter === 'automatic') return String(c.sendMode || c.mode || '').toLowerCase() === 'automatic'
    if (filter === 'week') {
      const d = new Date(c.createdAt)
      const week = new Date()
      week.setDate(week.getDate() - 7)
      return d >= week
    }
    if (filter === 'month') {
      const d = new Date(c.createdAt)
      const month = new Date()
      month.setMonth(month.getMonth() - 1)
      return d >= month
    }
    return true
  })

  return (
    <div className="history-page">
      <Navbar />
      <div className="container history-container">
        <h2 className="page-title">Campaign History</h2>

        <div className="filter-tabs">
          {['all', 'manual', 'automatic', 'week', 'month'].map((f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'week' ? 'This Week' : f === 'month' ? 'This Month' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <h3 className="empty-title">No campaigns yet</h3>
            <p className="empty-text">Launch your first one →</p>
          </div>
        ) : (
          <div className="history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>ICP</th>
                  <th>Target</th>
                  <th>Mode</th>
                  <th>Companies</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  (() => {
                    const historyResult = getHistoryResult(c)
                    return (
                  <>
                    <tr
                      key={c.id}
                      className={`history-row ${expanded === c.id ? 'expanded' : ''}`}
                      onClick={() => handleToggle(c.id)}
                    >
                      <td className="mono">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="td-icp">{c.icp?.substring(0, 50)}{c.icp?.length > 50 ? '...' : ''}</td>
                      <td>{c.targetCompany || '—'}</td>
                      <td>
                        <span className={`mode-pill ${String(c.sendMode || c.mode || '').toLowerCase()}`}>{getModeLabel(c)}</span>
                      </td>
                      <td>{getCompanyCount(c)}</td>
                      <td>
                        <span className={`status-pill-sm ${c.status || 'unknown'}`}>{c.status || 'unknown'}</span>
                      </td>
                    </tr>
                    {expanded === c.id && historyResult && (
                      <tr key={`${c.id}-exp`} className="expanded-row">
                        <td colSpan={6}>
                          <div className="expanded-content">
                            <h4>Companies:</h4>
                            <ul>
                              {(historyResult.companies || []).map((comp, i) => (
                                <li key={i}>{comp.company_name || comp.company} — Score: {Math.round(comp.final_score ?? comp.avg_score ?? comp.icp_score ?? 0)}/100</li>
                              ))}
                            </ul>
                            {((Array.isArray(historyResult.outreach) ? historyResult.outreach : historyResult.outreach ? [historyResult.outreach] : [])).length > 0 && (
                              <>
                                <h4>Emails Sent:</h4>
                                <ul>
                                  {(Array.isArray(historyResult.outreach) ? historyResult.outreach : [historyResult.outreach]).map((e, i) => (
                                    <li key={i}>{e.recipient || e.contact_email || 'Unknown'}: {e.subject} {e.status === 'sent' ? '✓' : ''}</li>
                                  ))}
                                </ul>
                              </>
                            )}
                            {detailLoadingId === c.id && <div className="loading-state"><div className="spinner" /></div>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                    )
                  })()
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
