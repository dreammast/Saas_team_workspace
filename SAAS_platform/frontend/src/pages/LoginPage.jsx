import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Layers, Mail, Lock, LogIn, ShieldCheck, UserCheck, ArrowRight, Globe } from 'lucide-react'
import { loginUser, loginWithGoogle } from '../store/slices/authSlice'

const roleOptions = [
  {
    id: 'manager',
    title: 'Manager',
    description: 'Access project dashboards, team reports, and full workspace controls.',
    email: 'manager@projectflow.com',
    icon: ShieldCheck,
  },
  {
    id: 'employee',
    title: 'Employee',
    description: 'Track your tasks, collaborate in real-time, and stay aligned with the team.',
    email: 'employee@projectflow.com',
    icon: UserCheck,
  },
]

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const { loading, error } = useSelector(state => state.auth)
  const [selectedRole, setSelectedRole] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setEmail(role.email)
    setPassword('')
  }

  const handleBack = () => {
    setSelectedRole(null)
    setEmail('')
    setPassword('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const user = await dispatch(loginUser(email, password, selectedRole?.id))
      dispatch({
        type: 'ui/addToast',
        payload: { type: 'success', title: 'Welcome Back!', message: `Logged in successfully as ${user.name}.` }
      })
      navigate('/dashboard')
    } catch (err) {
      dispatch({
        type: 'ui/addToast',
        payload: { type: 'error', title: 'Login Failed', message: err.message || 'Invalid email or password.' }
      })
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const user = await dispatch(loginWithGoogle(selectedRole?.id))
      dispatch({
        type: 'ui/addToast',
        payload: { type: 'success', title: 'Welcome Back!', message: `Signed in with Google as ${user.name}.` }
      })
      navigate('/dashboard')
    } catch (err) {
      dispatch({
        type: 'ui/addToast',
        payload: { type: 'error', title: 'Google Sign-In Failed', message: err.message || 'Could not sign in with Google.' }
      })
    }
  }

  return (
    <div className="auth-container" style={{ display: 'flex', width: '100vw', height: '100vh', background: '#F4F5F7' }}>
      
      {/* Left panel: Vibrant Gradient Feature Panel */}
      <div className="auth-left-panel" style={{ 
        flex: 1, 
        background: 'linear-gradient(135deg, #0747A6 0%, #0052CC 50%, #4C9AFF 100%)', 
        color: 'white', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '64px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Circles */}
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: '-100px', left: '-100px' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', bottom: '-50px', right: '-50px' }} />

        <div className="flex items-center gap-3 mb-12">
          <div style={{ width: 36, height: 36, borderRadius: 6, background: 'white', display: 'flex', alignItems: 'center', justifyCenter: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={20} color="#0052CC" />
          </div>
          <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>ProjectFlow</span>
        </div>

        <h1 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.2, marginBottom: 24 }}>
          Streamline tasks.<br />Enhance productivity.
        </h1>
        
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: 40, maxWidth: 450 }}>
          Manage your development cycles, collaborate with multi-functional squads, and monitor sprint progression all in a single workspace.
        </p>

        <div className="flex flex-col gap-6" style={{ maxWidth: 400 }}>
          <div className="flex items-start gap-4">
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ArrowRight size={14} />
            </div>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Role-Based Dashboards</h4>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Optimized views tailored for managers and individual team contributors.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ArrowRight size={14} />
            </div>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Interactive Kanban Boards</h4>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Drag and drop cards, configure priorities, and manage blockers in real-time.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ArrowRight size={14} />
            </div>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Analytics & Reports</h4>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Visualize sprint burndown charts, workload density, and task status allocations.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel: Authentication Form */}
      <div className="auth-right-panel" style={{ 
        width: 500, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '64px', 
        background: 'white' 
      }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#172B4D', marginBottom: 8 }}>
            {selectedRole ? `Sign in as ${selectedRole.title}` : 'Choose your role'}
          </h2>
          <p style={{ fontSize: 14, color: '#6B778C' }}>
            {selectedRole
              ? 'Sign in with email/password or continue with Google.'
              : 'Select manager or employee to continue to the appropriate sign-in experience.'}
          </p>
        </div>

        {error && (
          <div style={{ background: '#FFEBE6', color: '#DE350B', padding: 12, borderRadius: 6, fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {!selectedRole ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {roleOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleRoleSelect(option)}
                  style={{
                    border: '1px solid #DFE1E6',
                    borderRadius: 18,
                    padding: 24,
                    background: 'white',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease, transform 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={22} color={option.id === 'manager' ? '#0052CC' : '#00875A'} />
                    </div>
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{option.title}</p>
                      <p style={{ fontSize: 12, color: '#6B778C', margin: 0 }}>{option.description}</p>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0052CC' }}>Continue as {option.title}</div>
                </button>
              )
            })}
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={handleBack}
              style={{
                alignSelf: 'flex-start',
                marginBottom: 24,
                color: '#0052CC',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              ← Back to role selection
            </button>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group">
                <label className="form-label required">Email Address</label>
                <div className="relative" style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B778C' }} />
                  <input 
                    type="email" 
                    className="form-control" 
                    style={{ paddingLeft: 40 }}
                    placeholder={selectedRole.email}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">Password</label>
                <div className="relative" style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B778C' }} />
                  <input 
                    type="password" 
                    className="form-control" 
                    style={{ paddingLeft: 40 }}
                    placeholder="••••••••" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-full justify-center py-2 text-base font-semibold"
                disabled={loading}
              >
                {loading ? 'Signing in...' : (
                  <>
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: '#DFE1E6' }} />
              <span style={{ fontSize: 12, color: '#7A869A', textTransform: 'uppercase', letterSpacing: 0.5 }}>or continue with</span>
              <div style={{ flex: 1, height: 1, background: '#DFE1E6' }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                marginTop: 16,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '12px 16px',
                border: '1px solid #DFE1E6',
                borderRadius: 8,
                background: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                color: '#172B4D',
                fontWeight: 600,
              }}
            >
              <Globe size={18} color="#0052CC" />
              <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
            </button>

            <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#6B778C' }}>
              Don't have an account? <a href="/register" className="font-semibold" style={{ color: '#0052CC' }}>Sign Up</a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
