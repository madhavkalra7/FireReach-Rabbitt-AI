import { useState } from 'react'

export default function InputForm({ onSubmit, isRunning, onReset, showReset }) {
  const [form, setForm] = useState({
    icp: '',
    company: '',
    recipient_email: ''
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (form.icp && form.company && form.recipient_email) {
      onSubmit(form)
    }
  }

  const canSubmit = form.icp && form.company && form.recipient_email

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">⚡</div>
        <h2 className="card-title">Mission Parameters</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Your ICP</label>
          <textarea
            name="icp"
            className="form-textarea"
            placeholder="e.g. We sell cybersecurity training to Series B startups with 50-200 employees"
            value={form.icp}
            onChange={handleChange}
            disabled={isRunning}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Target Company</label>
          <input
            type="text"
            name="company"
            className="form-input"
            placeholder="e.g. Vercel, Stripe, Notion"
            value={form.company}
            onChange={handleChange}
            disabled={isRunning}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Recipient Email</label>
          <input
            type="email"
            name="recipient_email"
            className="form-input"
            placeholder="e.g. founder@company.com"
            value={form.recipient_email}
            onChange={handleChange}
            disabled={isRunning}
          />
        </div>

        {showReset ? (
          <button type="button" className="btn btn-primary" onClick={onReset}>
            ↻ New Outreach
          </button>
        ) : (
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!canSubmit || isRunning}
          >
            {isRunning ? (
              <>
                <span className="spinner" />
                Processing...
              </>
            ) : (
              <>Launch Agent →</>
            )}
          </button>
        )}
      </form>
    </div>
  )
}
