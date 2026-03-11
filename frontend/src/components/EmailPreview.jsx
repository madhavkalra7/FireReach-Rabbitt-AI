import { useState } from 'react'

export default function EmailPreview({ subject, body, sent, recipient }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(body || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="email-card">
      <div className="email-toolbar">
        <div className="email-to">
          To: <span>{recipient ? `contact@${recipient.toLowerCase().replace(/\s+/g, '')}.com` : 'recipient'}</span>
        </div>
        {sent && (
          <div className="sent-badge">
            <span>✓</span> Sent
          </div>
        )}
      </div>
      
      <div className="email-subject">
        <span className="subject-label">Subject:</span>
        <span className="subject-text">{subject || 'No subject'}</span>
      </div>
      
      <div className="email-body">
        {body || 'No email content generated.'}
      </div>
      
      <div className="email-actions">
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? '✓ Copied!' : '📋 Copy Email'}
        </button>
      </div>
    </div>
  )
}
