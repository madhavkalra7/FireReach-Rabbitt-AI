import { useState } from 'react'

const GENERIC_INBOX_PREFIXES = new Set([
  'info', 'contact', 'hello', 'hi', 'sales', 'support', 'team', 'office', 'admin',
  'careers', 'jobs', 'hr', 'help', 'enquiries', 'inquiries', 'marketing',
])

function getContactName(contact) {
  return contact.name || contact.person_name || 'Unknown'
}

function getContactTitle(contact) {
  return contact.title || contact.role || contact.department || '—'
}

function getContactEmail(contact) {
  return contact.email || contact.contact_email || ''
}

function getContactScore(contact) {
  if (typeof contact.score === 'number') return contact.score
  const raw = String(contact.confidence || '').toLowerCase()
  if (raw === 'high') return 90
  if (raw === 'medium') return 70
  if (raw === 'low') return 40
  if (/^\d+$/.test(raw)) return Number(raw)
  return 0
}

export default function ContactTable({ contacts = [], mode = 'manual', onSend, companyName }) {
  const [selected, setSelected] = useState([])

  const toggleSelect = (email) => {
    setSelected((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    )
  }

  const sorted = [...contacts].sort((a, b) => getContactScore(b) - getContactScore(a))
  const topTwo = sorted.slice(0, 2).map((c) => getContactName(c))

  return (
    <div className="contact-section">
      <h4 className="contact-header">👥 CONTACTS // {companyName?.toUpperCase()}</h4>
      <div className="table-wrap">
        <table className="contact-table">
          <thead>
            <tr>
              {mode === 'manual' && <th></th>}
              <th>Name</th>
              <th>Role</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Type</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c, i) => {
              const email = getContactEmail(c)
              const emailPrefix = email.split('@')[0]?.toLowerCase() || ''
              const isPersonal = emailPrefix && !GENERIC_INBOX_PREFIXES.has(emailPrefix)

              return (
              <tr key={i} className={mode === 'automatic' && i < 2 ? 'row-highlight' : ''}>
                {mode === 'manual' && (
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(email)}
                      onChange={() => toggleSelect(email)}
                      className="contact-checkbox"
                    />
                  </td>
                )}
                <td className="td-name">{getContactName(c)}</td>
                <td className="td-title">{getContactTitle(c)}</td>
                <td className="td-email mono">{email || '—'}</td>
                <td className="td-phone mono">{c.phone || '—'}</td>
                <td>
                  <span className={`type-badge ${isPersonal ? 'type-personal' : 'type-org'}`}>
                    {isPersonal ? 'Personal ✓' : 'Org ⚠'}
                  </span>
                </td>
                <td className="td-score">{getContactScore(c)}</td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {mode === 'manual' && onSend && (
        <div className="contact-actions">
          <p className="contact-rec">
            ⭐ Recommended: <strong>{topTwo.join(', ')}</strong> based on score
          </p>
          <button
            className="btn-primary"
            disabled={selected.length === 0}
            onClick={() => onSend && onSend(selected)}
          >
            Generate Emails for Selected →
          </button>
        </div>
      )}

      {mode === 'automatic' && (
        <div className="auto-banner">✓ Agent auto-selected top 2 contacts</div>
      )}
    </div>
  )
}
