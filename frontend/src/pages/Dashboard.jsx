import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCredits } from '../hooks/useCredits'
import Navbar from '../components/Navbar'
import InputForm from '../components/InputForm'
import AgentTimeline from '../components/AgentTimeline'
import Pipeline3D from '../components/Pipeline3D'
import CompanyRankCard from '../components/CompanyRankCard'
import CompanySignalPanel from '../components/CompanySignalPanel'
import ContactTable from '../components/ContactTable'
import EmailPreview from '../components/EmailPreview'

const DEFAULT_STEPS = [
  { tool_name: 'agent1_discovery', status: 'pending', result: {} },
  { tool_name: 'agent2_signals', status: 'pending', result: {} },
  { tool_name: 'agent3_verifier', status: 'pending', result: {} },
  { tool_name: 'agent4_scorer', status: 'pending', result: {} },
  { tool_name: 'agent5_ranker', status: 'pending', result: {} },
  { tool_name: 'agent6_contacts', status: 'pending', result: {} },
  { tool_name: 'agent7_outreach', status: 'pending', result: {} },
]

const COMPLETED_STEPS = DEFAULT_STEPS.map((step) => ({
  ...step,
  status: 'completed',
}))

const MANUAL_READY_STEPS = DEFAULT_STEPS.map((step, index) => ({
  ...step,
  status: index < 5 ? 'completed' : 'pending',
}))

const STEP_TO_TOOL = {
  step1: 'agent1_discovery',
  step2: 'agent2_signals',
  step3: 'agent3_verifier',
  step4: 'agent4_scorer',
  step5: 'agent5_ranker',
  step6: 'agent6_contacts',
  step7: 'agent7_outreach',
}

function cloneSteps(steps = DEFAULT_STEPS) {
  return steps.map((step) => ({ ...step, result: step.result || {} }))
}

function applyStreamStep(steps, event) {
  const nextSteps = cloneSteps(steps && steps.length ? steps : DEFAULT_STEPS)
  const toolName = STEP_TO_TOOL[event?.step]
  if (!toolName) return nextSteps

  const stepIndex = nextSteps.findIndex((step) => step.tool_name === toolName)
  if (stepIndex < 0) return nextSteps

  if (event.status === 'in-progress') {
    return nextSteps.map((step, index) => {
      if (index < stepIndex && step.status === 'pending') return { ...step, status: 'completed' }
      if (index === stepIndex) return { ...step, status: 'running' }
      if (index > stepIndex && step.status !== 'failed' && step.status !== 'completed') return { ...step, status: 'pending' }
      return step
    })
  }

  if (event.status === 'completed') {
    nextSteps[stepIndex] = { ...nextSteps[stepIndex], status: 'completed' }
    return nextSteps
  }

  if (event.status === 'failed') {
    nextSteps[stepIndex] = { ...nextSteps[stepIndex], status: 'failed' }
    return nextSteps
  }

  return nextSteps
}

async function runAgentStream({ API, payload, onEvent }) {
  const token = localStorage.getItem('fr_token')
  const res = await fetch(`${API.defaults.baseURL}/run-agent?stream=true`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    let message = `Campaign failed (${res.status})`
    try {
      const body = await res.json()
      const detail = body?.detail || body?.message
      if (typeof detail === 'string' && detail.trim()) message = detail
      else if (typeof detail === 'object') message = detail.message || detail.error || message
    } catch {
      // Ignore parse errors and keep default message.
    }
    throw new Error(message)
  }

  if (!res.body) throw new Error('Streaming not supported by this browser.')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let finalResult = null

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const chunk = line.trim()
      if (!chunk) continue

      let event
      try {
        event = JSON.parse(chunk)
      } catch {
        continue
      }

      onEvent?.(event)

      if (event.type === 'result') {
        finalResult = event.data || {}
      }

      if (event.type === 'error') {
        throw new Error(event.message || 'Campaign failed')
      }
    }
  }

  const tail = buffer.trim()
  if (tail) {
    try {
      const event = JSON.parse(tail)
      onEvent?.(event)
      if (event.type === 'result') finalResult = event.data || {}
      if (event.type === 'error') throw new Error(event.message || 'Campaign failed')
    } catch {
      // Ignore malformed trailing chunks.
    }
  }

  if (!finalResult) {
    throw new Error('Agent stream ended without a final result.')
  }

  return finalResult
}

function getCompanyName(company) {
  return company.company_name || company.company || company.name || 'Unknown Company'
}

function getCompanyRank(company, index = 0) {
  return Number(company.rank || index + 1)
}

function getCompanyOrder(companies = [], rankings = []) {
  const normalizeName = (value) => String(value || '').trim().toLowerCase()

  const rankingMap = new Map(
    rankings.map((row, index) => [
      normalizeName(row.company_name || row.company || row.name),
      {
        rank: Number(row.rank || index + 1),
        signal_score: row.signal_score,
        icp_score: row.icp_score,
        final_score: row.final_score,
        avg_score: row.avg_score ?? row.final_score,
        score_reason: row.score_reason,
      },
    ])
  )

  return [...companies]
    .map((company, index) => {
      const key = normalizeName(getCompanyName(company))
      const ranking = rankingMap.get(key) || {}
      return {
        ...company,
        ...ranking,
        rank: Number(ranking.rank || company.rank || index + 1),
      }
    })
    .sort((a, b) => Number(a.rank || 999) - Number(b.rank || 999))
}

function normalizeOutreach(result, selectedCompany = null) {
  const outreach = result?.outreach || result?.selected_company?.outreach || selectedCompany?.outreach || {}

  if (Array.isArray(outreach)) {
    return outreach.map((item) => ({
      contact_name: item.contact_name || item.recipient_name || item.name || 'Target contact',
      contact_email: item.contact_email || item.recipient || '',
      subject: item.subject || '',
      body: item.body || item.email_content || '',
      sent: Boolean(item.sent || item.status === 'sent'),
      pdf_filename: item.pdf_filename || '',
    }))
  }

  if (!outreach || Object.keys(outreach).length === 0) return []

  return [{
    contact_name:
      result?.suggested_contact?.person_name ||
      result?.selected_contact?.person_name ||
      result?.selected_company?.suggested_contact?.person_name ||
      result?.selected_company?.selected_contact?.person_name ||
      (outreach.recipient ? outreach.recipient.split('@')[0] : 'Target contact'),
    contact_email: outreach.recipient || result?.suggested_contact?.email || result?.selected_contact?.email || '',
    subject: outreach.subject || '',
    body: outreach.email_content || outreach.body || '',
    sent: outreach.status === 'sent',
    pdf_filename: outreach.pdf_filename || '',
  }]
}

function buildHistoryResult(workflow) {
  const selectedCompanyName = workflow.selected_company_name || workflow.selected_company?.company_name || ''
  const selectedCompany = workflow.selected_company || (workflow.companies || []).find((company) => getCompanyName(company) === selectedCompanyName) || null

  return {
    ...workflow,
    companies: workflow.companies || [],
    rankings: workflow.rankings || [],
    summary: workflow.summary || {},
    selected_company_name: selectedCompanyName,
    selected_company: workflow.selected_company || selectedCompany || null,
    suggested_contact: workflow.suggested_contact || selectedCompany?.suggested_contact || null,
    selected_contact: workflow.selected_contact || selectedCompany?.selected_contact || null,
    contacts: workflow.contacts || selectedCompany?.contacts || [],
    outreach: workflow.outreach || selectedCompany?.outreach || {},
  }
}

export default function Dashboard() {
  const { API, refreshCredits } = useAuth()
  const { credits } = useCredits()
  const [state, setState] = useState({
    phase: 'idle', // idle | running | select_company | done
    steps: [],
    workflow: null,
    error: null,
    mode: 'manual',
    selectionLoading: false,
    sendingLoading: false,
    liveMessage: '',
  })

  const saveHistory = async (workflow) => {
    try {
      await API.post('/api/history', {
        icp: workflow.icp || '',
        send_mode: workflow.send_mode || state.mode || 'manual',
        target_company: workflow.target_company || null,
        test_recipient_email: workflow.test_recipient_email || null,
        result: buildHistoryResult(workflow),
      })
    } catch (error) {
      console.error('History save failed', error)
    }
  }

  const setDoneState = (workflow, stepsOverride = COMPLETED_STEPS) => {
    setState({
      phase: 'done',
      steps: cloneSteps(stepsOverride),
      workflow,
      error: null,
      mode: workflow.send_mode || 'manual',
      selectionLoading: false,
      sendingLoading: false,
      liveMessage: '',
    })
  }

  const handleLaunch = async (formData) => {
    const sendMode = formData.mode === 'automatic' ? 'auto' : 'manual'
    const creditCost = sendMode === 'auto' ? 10 : 5
    const payload = {
      icp: formData.icp,
      send_mode: sendMode,
      target_company: formData.target_company || '',
      test_recipient_email: formData.test_recipient_email || '',
    }

    setState({
      phase: 'running',
      steps: DEFAULT_STEPS.map((s, i) => ({ ...s, status: i === 0 ? 'running' : 'pending' })),
      workflow: null,
      error: null,
      mode: sendMode,
      selectionLoading: false,
      sendingLoading: false,
      liveMessage: 'Booting agent graph...',
    })

    try {
      // Deduct credits before running agent
      await API.post('/api/credits/consume', { amount: creditCost })
      await refreshCredits()

      const result = await runAgentStream({
        API,
        payload,
        onEvent: (event) => {
          if (event.type !== 'step') return
          setState((prev) => ({
            ...prev,
            steps: applyStreamStep(prev.steps, event),
            liveMessage: event.message || prev.liveMessage,
          }))
        },
      })

      const workflow = {
        ...result,
        ...payload,
        companies: result.companies || [],
        rankings: result.rankings || [],
        selected_company_name: result.selected_company_name || '',
        summary: result.summary || {},
        steps: COMPLETED_STEPS,
      }

      if (sendMode === 'manual' && result.status === 'awaiting_company_selection') {
        setState({
          phase: 'select_company',
          steps: cloneSteps(MANUAL_READY_STEPS),
          workflow,
          error: null,
          mode: sendMode,
          selectionLoading: false,
          sendingLoading: false,
          liveMessage: '',
        })
        return
      }

      setDoneState(workflow)
      refreshCredits()
      await saveHistory(workflow)
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.response?.data?.message
      const msg = err?.message || (typeof detail === 'object' ? detail.message || detail.error : detail) || 'Campaign failed'
      setState((prev) => ({ ...prev, phase: 'idle', error: msg }))
    }
  }

  const handleSelectCompany = async (company) => {
    if (!state.workflow) return

    setState((prev) => ({ ...prev, selectionLoading: true, error: null }))

    try {
      const res = await API.post('/select-company', {
        icp: state.workflow.icp,
        send_mode: 'manual',
        selected_company: company,
      })

      const detail = res.data || {}
      const mergedWorkflow = {
        ...state.workflow,
        ...detail,
        selected_company: detail.selected_company || company,
        selected_company_name: detail.selected_company?.company_name || company.company_name || getCompanyName(company),
        companies: state.workflow.companies || [],
        rankings: state.workflow.rankings || [],
        summary: state.workflow.summary || {},
        steps: COMPLETED_STEPS,
        status: detail.status || 'manual_ready',
      }

      setDoneState(mergedWorkflow)
      refreshCredits()
      await saveHistory(mergedWorkflow)
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.message
      const msg = typeof detail === 'object' ? detail.message || detail.error : detail || 'Company selection failed'
      setState((prev) => ({ ...prev, selectionLoading: false, error: msg }))
    }
  }

  const handleSendSingle = async (email) => {
    const workflow = state.workflow
    if (!workflow) return

    setState((prev) => ({ ...prev, sendingLoading: true, error: null }))

    try {
      const res = await API.post('/send-email', {
        recipient: email.contact_email || email.recipient || '',
        subject: email.subject || '',
        email_content: email.body || email.email_content || '',
        pdf_filename: email.pdf_filename || workflow.outreach?.pdf_filename || workflow.selected_company?.outreach?.pdf_filename || '',
      })

      const updatedWorkflow = {
        ...workflow,
        outreach: {
          ...(workflow.outreach || {}),
          status: res.data?.status || workflow.outreach?.status || 'sent',
          recipient: res.data?.recipient || email.contact_email || email.recipient || '',
          subject: res.data?.subject || email.subject || '',
          email_content: res.data?.email_content || email.body || email.email_content || '',
          pdf_filename: res.data?.pdf_filename || email.pdf_filename || '',
        },
      }

      setState((prev) => ({
        ...prev,
        sendingLoading: false,
        workflow: updatedWorkflow,
      }))
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.message
      const msg = typeof detail === 'object' ? detail.message || detail.error : detail || 'Email send failed'
      setState((prev) => ({ ...prev, sendingLoading: false, error: msg }))
    }
  }

  const handleReset = () => {
    setState({
      phase: 'idle',
      steps: [],
      workflow: null,
      error: null,
      mode: 'manual',
      selectionLoading: false,
      sendingLoading: false,
      liveMessage: '',
    })
  }

  const workflow = state.workflow || {}
  const companies = workflow.companies || []
  const rankings = workflow.rankings || []
  const orderedCompanies = getCompanyOrder(companies, rankings)
  const selectedCompanyName = workflow.selected_company_name || workflow.selected_company?.company_name || ''
  const selectedCompany = workflow.selected_company || orderedCompanies.find((company) => getCompanyName(company) === selectedCompanyName) || null
  const selectedContacts = workflow.contacts || selectedCompany?.contacts || []
  const outreach = normalizeOutreach(workflow, selectedCompany)
  const canSelectCompany = state.phase === 'select_company'
  const showResults = (state.phase === 'done' || state.phase === 'select_company') && workflow

  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-main">
        {/* Left Panel */}
        <aside className="dashboard-sidebar">
          <InputForm
            onSubmit={handleLaunch}
            isRunning={state.phase === 'running'}
            onReset={handleReset}
            showReset={state.phase === 'done' || state.phase === 'select_company'}
            credits={credits}
          />

          {state.error && <div className="error-box">⚠️ {state.error}</div>}

          {(state.phase === 'done' || state.phase === 'select_company') && (
            <AgentTimeline steps={state.steps} />
          )}
        </aside>

        {/* Right Panel */}
        <section className="dashboard-content">
          {state.phase === 'idle' && !state.error && (
            <div className="empty-state">
              <div className="diamond-container">
                <video className="diamond-video" src="/diamond.mp4" autoPlay loop muted playsInline />
                <div className="diamond-glow" />
              </div>
              <h2 className="empty-title">🚀 Configure and launch your campaign</h2>
              <p className="empty-text">Results will appear here in real time</p>
            </div>
          )}

          {state.phase === 'running' && (
            <div className="loading-state">
              <Pipeline3D steps={state.steps} message={state.liveMessage} />
              <div className="diamond-container">
                <video className="diamond-video" src="/diamond.mp4" autoPlay loop muted playsInline />
                <div className="diamond-glow active" />
              </div>
              <h2 className="loading-title">Agents Working</h2>
              <p className="loading-text">{state.liveMessage || 'Running 7-agent pipeline on your ICP...'}</p>
            </div>
          )}

          {showResults && (
            <div className="results">
              {state.phase === 'select_company' && (
                <div className="selection-banner">
                  <h3 className="section-label">Select a Company to Generate Contacts</h3>
                  <p className="selection-copy">Click one ranked company below. The backend will generate the contact set and draft outreach for that company.</p>
                </div>
              )}

              {/* Companies */}
              {orderedCompanies.length > 0 && (
                <>
                  <h3 className="section-label">Top Companies for Your ICP</h3>
                  <div className="company-grid">
                    {orderedCompanies.map((company, i) => (
                      <CompanyRankCard
                        key={getCompanyName(company) || i}
                        company={company}
                        rank={getCompanyRank(company, i)}
                        onSelect={canSelectCompany ? handleSelectCompany : undefined}
                        selected={selectedCompanyName === getCompanyName(company)}
                        disabled={state.selectionLoading}
                      />
                    ))}
                  </div>
                </>
              )}

              {orderedCompanies.length > 0 && (
                <>
                  <h3 className="section-label">Company Intelligence</h3>
                  <div className="company-signal-grid">
                    {orderedCompanies.map((company, index) => (
                      <CompanySignalPanel
                        key={`signal-${getCompanyName(company)}-${index}`}
                        company={company}
                      />
                    ))}
                  </div>
                </>
              )}

              {selectedCompany && selectedContacts.length > 0 && (
                <ContactTable
                  contacts={selectedContacts}
                  companyName={getCompanyName(selectedCompany)}
                  mode={state.mode}
                />
              )}

              {outreach.length > 0 && (
                <EmailPreview
                  emails={outreach}
                  mode={state.mode}
                  onSendSingle={state.mode === 'manual' ? handleSendSingle : undefined}
                />
              )}

              {state.selectionLoading && (
                <div className="loading-state" style={{ minHeight: '160px' }}>
                  <div className="spinner" />
                </div>
              )}

              {!state.selectionLoading && orderedCompanies.length === 0 && selectedContacts.length === 0 && outreach.length === 0 && (
                <div className="empty-results">
                  <h4>No results generated yet.</h4>
                  <p>Try a broader ICP or run again after checking API keys and credits.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
