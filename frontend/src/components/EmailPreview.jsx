import { useState } from 'react'

export default function EmailPreview({ emails = [], mode = 'manual', onSendSingle }) {
  const [editingIndex, setEditingIndex] = useState(null)
  const [draftSubject, setDraftSubject] = useState('')
  const [draftBody, setDraftBody] = useState('')

  const copyText = (text) => {
    navigator.clipboard.writeText(text)
  }

  const normalizedEmails = emails.map((email) => ({
    contact_name: email.contact_name || email.recipient_name || email.name || 'Target contact',
    contact_email: email.contact_email || email.recipient || '',
    subject: email.subject || '',
    body: email.body || email.email_content || '',
    sent: Boolean(email.sent || email.status === 'sent'), 
    pdf_filename: email.pdf_filename || '',
  }))

  const startEditing = (email, index) => {
    setEditingIndex(index)
    setDraftSubject(email.subject || '')
    setDraftBody(email.body || '')
  }

  const cancelEditing = () => {
    setEditingIndex(null)
    setDraftSubject('')
    setDraftBody('')
  }

  const sendEdited = (email) => {
    if (!onSendSingle) return
    onSendSingle({
      ...email,
      subject: draftSubject,
      body: draftBody,
    })
    cancelEditing()
  }

  return (
    <div className="email-preview-section">
      <h4 className="section-label">Generated Outreach</h4>
      {normalizedEmails.map((email, i) => {
        const isSent = email.sent
        const isEditing = editingIndex === i
        return (
          <div key={i} className="email-card">
            <div className="email-meta">
              <span className="email-to">TO: {email.contact_name} ({email.contact_email || '—'})</span>
              {isSent ? (
                <span className="status-badge status-sent">SENT ✓</span>
              ) : (
                <span className="status-badge status-ready">READY</span>
              )}
            </div>
            <div className="email-subject">
              <span className="subject-label">SUBJECT:</span>
              {isEditing ? (
                <input
                  className="form-input"
                  value={draftSubject}
                  onChange={(e) => setDraftSubject(e.target.value)}
                />
              ) : (
                <span className="subject-text">{email.subject}</span>
              )}
            </div>
            <div className="email-body">
              {isEditing ? (
                <textarea
                  className="form-textarea"
                  value={draftBody}
                  onChange={(e) => setDraftBody(e.target.value)}
                  rows={8}
                />
              ) : (
                email.body
              )}
            </div>
            <div className="email-actions">
              <button className="btn-ghost btn-sm" onClick={() => copyText(email.subject)}>Copy Subject</button>
              <button className="btn-ghost btn-sm" onClick={() => copyText(email.body)}>Copy Body</button>
              <button className="btn-ghost btn-sm" onClick={() => copyText(`Subject: ${email.subject}\n\n${email.body}`)}>Copy All</button>
              {mode === 'manual' && !isSent && onSendSingle && !isEditing && (
                <>
                  <button className="btn-ghost btn-sm" onClick={() => startEditing(email, i)}>Edit</button>
                  <button className="btn-primary btn-sm" onClick={() => onSendSingle(email)}>Send Now</button>
                </>
              )}
              {mode === 'manual' && !isSent && onSendSingle && isEditing && (
                <>
                  <button className="btn-primary btn-sm" onClick={() => sendEdited(email)}>Save & Send</button>
                  <button className="btn-ghost btn-sm" onClick={cancelEditing}>Cancel</button>
                </>
              )}
            </div>
          </div>
        )
      })}
      {emails.length === 0 && (
        <div className="empty-emails">No emails generated yet.</div>
      )}
    </div>
  )
}
