import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Mail, Send, History, CheckCircle2, AlertCircle, RefreshCw, Eye, Sparkles, ShieldCheck } from 'lucide-react'

const getDynamicApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  return `http://${hostname}:8080`
}

const API_BASE_URL = getDynamicApiUrl()

export default function EmailPage() {
  const dispatch = useDispatch()
  const { token } = useSelector(state => state.auth)

  const [recipient, setRecipient] = useState('dreammasterorigin@gmail.com')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [logs, setLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null)

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  })

  const fetchLogs = async () => {
    setLoadingLogs(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/email/logs`, {
        headers: getHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setLogs(data)
      }
    } catch (err) {
      console.error('Failed to fetch email logs', err)
    } finally {
      setLoadingLogs(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const handleSendEmail = async (e) => {
    e.preventDefault()
    if (!recipient || !subject || !body) {
      dispatch({
        type: 'ui/addToast',
        payload: { type: 'error', title: 'Input Error', message: 'All composer fields are required.' }
      })
      return
    }

    setSending(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/email/test`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ recipient, subject, body })
      })

      if (response.ok) {
        dispatch({
          type: 'ui/addToast',
          payload: { 
            type: 'success', 
            title: 'Email Dispatched', 
            message: 'Your email has been placed in the queue. Redirection is active for mock targets.' 
          }
        })
        setSubject('')
        setBody('')
        // Refresh logs after brief delay for thread processing
        setTimeout(fetchLogs, 1500)
      } else {
        const errMsg = await response.text()
        throw new Error(errMsg || 'Failed to dispatch email.')
      }
    } catch (err) {
      dispatch({
        type: 'ui/addToast',
        payload: { type: 'error', title: 'SMTP Error', message: err.message || 'SMTP server connection failed.' }
      })
    } finally {
      setSending(false)
    }
  }

  const loadTemplate = (type) => {
    if (type === 'TASK') {
      setSubject('📋 Task Assigned: Complete API Refactoring')
      setBody('You have been allocated a priority sprint task. Please review the database configurations, verify check constraints, and perform code alignment reviews before checking in.')
    } else if (type === 'COMMENT') {
      setSubject('💬 John Doe commented on: UI Mockup Fix')
      setBody('The card alignment needs a minor glassmorphism border tweak. Let us coordinate to complete this change today.')
    } else if (type === 'UPDATE') {
      setSubject('🔄 Task Progress: Refactoring Project mapping [ACTIVE]')
      setBody('The backend status mapping is successfully linked. Sprints are moving to the QA Validation phase.')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* Header and Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#172B4D', margin: 0 }}>Email Notification Hub</h2>
          <p style={{ fontSize: 13, color: '#6B778C', marginTop: 4, marginBottom: 0 }}>
            Configure active SMTP servers, trigger manual mail templates, and trace automated delivery pipelines.
          </p>
        </div>
        <button 
          onClick={fetchLogs} 
          disabled={loadingLogs}
          className="btn btn-secondary flex items-center gap-1"
          style={{ padding: '8px 16px', borderRadius: 6, display: 'flex', gap: 6, alignItems: 'center', transition: 'var(--transition-fast)' }}
        >
          <RefreshCw size={14} className={loadingLogs ? 'animate-spin' : ''} />
          <span>Sync logs</span>
        </button>
      </div>

      {/* Connection Status & Metadata Banner */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(244, 245, 247, 0.8))',
        border: '1px solid var(--color-border)', 
        borderRadius: 8, 
        padding: 20,
        boxShadow: 'var(--shadow-sm)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 20
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ background: '#E3FCEF', padding: 10, borderRadius: '50%', color: '#00875A' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>SMTP Gateway</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#172B4D', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>smtp.gmail.com</span>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#00875A', display: 'inline-block', boxShadow: '0 0 8px #00875A' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ background: '#DEEBFF', padding: 10, borderRadius: '50%', color: '#0052CC' }}>
            <Mail size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>System Sender</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#172B4D', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              dreammasterorigin@gmail.com
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ background: '#EAE6FF', padding: 10, borderRadius: '50%', color: '#6554C0' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>Mock Redirection</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#6554C0' }}>
              Enabled (Forwarding Active)
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Composer & Delivery Logs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Side: Composer */}
        <div className="card" style={{ padding: 24, background: 'white', borderRadius: 8, border: '1px solid var(--color-border)' }}>
          <div style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 16, marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#172B4D', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Send size={15} color="#0052CC" />
              <span>Mail Composer</span>
            </h3>
            <p style={{ fontSize: 11, color: '#6B778C', margin: '4px 0 0 0' }}>
              Draft custom test emails or inject system templates to preview delivery.
            </p>
          </div>

          <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label required">Recipient Address</label>
              <input 
                type="email" 
                className="form-control" 
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                placeholder="recipient@gmail.com"
                required
              />
              <span style={{ fontSize: 10, color: '#6B778C', marginTop: 4, display: 'block' }}>
                Note: Non-Gmail demo targets will be automatically redirected to your dashboard test account.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label required">Subject Title</label>
              <input 
                type="text" 
                className="form-control" 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. [ProjectFlow] New Sprint Task Assigned"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Body Content</label>
              <textarea 
                className="form-control" 
                rows={4}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Write your email body..."
                style={{ resize: 'none' }}
                required
              />
            </div>

            {/* Template Loaders */}
            <div>
              <label className="form-label" style={{ marginBottom: 6 }}>Load Sandbox Template</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  onClick={() => loadTemplate('TASK')}
                  className="btn btn-secondary"
                  style={{ fontSize: 11, padding: '4px 10px', height: 'auto', background: '#F4F5F7' }}
                >
                  📋 Task Assign
                </button>
                <button 
                  type="button" 
                  onClick={() => loadTemplate('COMMENT')}
                  className="btn btn-secondary"
                  style={{ fontSize: 11, padding: '4px 10px', height: 'auto', background: '#F4F5F7' }}
                >
                  💬 Comment Alert
                </button>
                <button 
                  type="button" 
                  onClick={() => loadTemplate('UPDATE')}
                  className="btn btn-secondary"
                  style={{ fontSize: 11, padding: '4px 10px', height: 'auto', background: '#F4F5F7' }}
                >
                  🔄 Status Update
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={sending}
              style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 8 }}
            >
              {sending ? 'Dispatching...' : 'Send Live Email'}
              <Send size={14} />
            </button>
          </form>
        </div>

        {/* Right Side: Delivery Logs */}
        <div className="card" style={{ padding: 24, background: 'white', borderRadius: 8, border: '1px solid var(--color-border)', minHeight: 460 }}>
          <div style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 16, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#172B4D', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <History size={15} color="#0052CC" />
                <span>SMTP Delivery History</span>
              </h3>
              <p style={{ fontSize: 11, color: '#6B778C', margin: '4px 0 0 0' }}>
                A visual audit of all outgoing notification alerts dispatched via Spring Mail.
              </p>
            </div>
            <span style={{ fontSize: 11, background: '#DEEBFF', color: '#0052CC', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>
              {logs.length} logged
            </span>
          </div>

          {/* Logs List Container */}
          <div style={{ maxHeight: 350, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {logs.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', color: '#97A0AF', gap: 8 }}>
                <Mail size={32} style={{ opacity: 0.5 }} />
                <div style={{ fontSize: 13, fontWeight: 600 }}>No Emails Sent Yet</div>
                <div style={{ fontSize: 11, textAlign: 'center' }}>Trigger a test notification above or execute sprint allocations to generate audit logs.</div>
              </div>
            ) : (
              logs.map((log) => (
                <div 
                  key={log.id} 
                  style={{ 
                    border: '1px solid var(--color-border-subtle)', 
                    borderRadius: 6, 
                    padding: 12, 
                    background: '#F4F5F7',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ 
                        fontSize: 9, 
                        fontWeight: 700, 
                        background: log.status === 'SENT' ? '#E3FCEF' : '#FFEBE6', 
                        color: log.status === 'SENT' ? '#00875A' : '#DE350B',
                        padding: '1px 6px',
                        borderRadius: 4
                      }}>
                        {log.status}
                      </span>
                      <span style={{ fontSize: 11, color: '#6B778C', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        To: {log.recipient}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#172B4D', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {log.subject}
                    </div>
                    <div style={{ fontSize: 10, color: '#97A0AF' }}>
                      {new Date(log.sentAt).toLocaleString()} • Type: <span style={{ fontWeight: 500, color: '#172B4D' }}>{log.type}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedLog(log)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', height: 'auto', display: 'flex', gap: 4, alignItems: 'center', fontSize: 11, background: 'white' }}
                  >
                    <Eye size={12} />
                    <span>View HTML</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* HTML Email Modal */}
      {selectedLog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(9, 30, 66, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="card animate-fade-in" style={{
            background: 'white',
            borderRadius: 12,
            width: '90%',
            maxWidth: 680,
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)',
            border: 'none'
          }}>
            {/* Header */}
            <div style={{ 
              padding: '16px 24px', 
              background: '#0747A6', 
              color: 'white', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center' 
            }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Rendered Email Document</h4>
                <p style={{ margin: '2px 0 0 0', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                  Sent To: {selectedLog.recipient} • Trigger: {selectedLog.type}
                </p>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'white', 
                  fontSize: 20, 
                  cursor: 'pointer',
                  fontWeight: 300 
                }}
              >
                &times;
              </button>
            </div>

            {/* Error Message if Failed */}
            {selectedLog.status === 'FAILED' && (
              <div style={{ background: '#FFEBE6', color: '#DE350B', padding: '12px 24px', fontSize: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                <AlertCircle size={14} />
                <span><strong>SMTP Delivery Error:</strong> {selectedLog.errorMessage || 'SMTP server connection rejected.'}</span>
              </div>
            )}

            {/* Rendered HTML Container */}
            <div style={{ padding: 24, overflowY: 'auto', background: '#F4F5F7', flex: 1 }}>
              <div 
                dangerouslySetInnerHTML={{ __html: selectedLog.body }}
                style={{ background: 'transparent', borderRadius: 8, overflow: 'hidden' }}
              />
            </div>

            {/* Footer buttons */}
            <div style={{ padding: 16, borderTop: '1px solid #DFE1E6', display: 'flex', justifyContent: 'flex-end', background: '#F4F5F7' }}>
              <button 
                onClick={() => setSelectedLog(null)}
                className="btn btn-secondary"
                style={{ padding: '8px 20px', borderRadius: 6 }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
