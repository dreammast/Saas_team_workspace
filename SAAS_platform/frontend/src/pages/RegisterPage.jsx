import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Layers, Mail, Lock, User, ShieldAlert, ArrowRight, UserPlus } from 'lucide-react'
import { registerUser, loginWithGoogle } from '../store/slices/authSlice'

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const { loading, error } = useSelector(state => state.auth)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('EMPLOYEE')

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const user = await dispatch(registerUser({ name, email, password, role }))
      dispatch({
        type: 'ui/addToast',
        payload: { type: 'success', title: 'Registration Successful', message: `Welcome to ProjectFlow, ${user.name}!` }
      })
      navigate('/dashboard')
    } catch (err) {
      dispatch({
        type: 'ui/addToast',
        payload: { type: 'error', title: 'Registration Failed', message: err.message || 'Could not register user. Please try again.' }
      })
    }
  }

  return (
    <div className="auth-container" style={{ display: 'flex', width: '100vw', height: '100vh', background: '#F4F5F7' }}>
      
      {/* Left panel: Gradient Feature Panel */}
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
          <div style={{ width: 36, height: 36, borderRadius: 6, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={20} color="#0052CC" />
          </div>
          <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>ProjectFlow</span>
        </div>

        <h1 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.2, marginBottom: 24 }}>
          Join the ultimate<br />collaboration hub.
        </h1>
        
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: 40, maxWidth: 450 }}>
          Sign up today and experience the easiest way to manage design systems, plan tech backlogs, and track release cycles.
        </p>

        <div className="flex flex-col gap-6" style={{ maxWidth: 400 }}>
          <div className="flex items-start gap-4">
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ArrowRight size={14} />
            </div>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Fast Setup</h4>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Get your workspace up and running in less than a minute.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ArrowRight size={14} />
            </div>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Intuitive Design System</h4>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Clean Figma-cloned interface designed for developer focus.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel: Registration Form */}
      <div className="auth-right-panel" style={{ 
        width: 500, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '64px', 
        background: 'white' 
      }}>
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#172B4D', marginBottom: 8 }}>Create Account</h2>
          <p style={{ fontSize: 14, color: '#6B778C' }}>Get started with ProjectFlow today.</p>
        </div>

        {error && (
          <div style={{ background: '#FFEBE6', color: '#DE350B', padding: 12, borderRadius: 6, fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label required">Full Name</label>
            <div className="relative">
              <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B778C' }} />
              <input 
                type="text" 
                className="form-control" 
                style={{ paddingLeft: 40 }}
                placeholder="Alex Johnson" 
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">Email Address</label>
            <div className="relative">
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B778C' }} />
              <input 
                type="email" 
                className="form-control" 
                style={{ paddingLeft: 40 }}
                placeholder="you@company.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">Password</label>
            <div className="relative">
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

          <div className="form-group">
            <label className="form-label required">Select Workspace Role</label>
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <label 
                className="flex items-center gap-2 p-2 border" 
                style={{ 
                  flex: 1, 
                  borderRadius: 6, 
                  cursor: 'pointer', 
                  borderColor: role === 'EMPLOYEE' ? '#0052CC' : '#DFE1E6',
                  background: role === 'EMPLOYEE' ? 'rgba(0, 82, 204, 0.05)' : 'white'
                }}
              >
                <input 
                  type="radio" 
                  name="role" 
                  value="EMPLOYEE" 
                  checked={role === 'EMPLOYEE'} 
                  onChange={() => setRole('EMPLOYEE')} 
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>Employee</span>
                  <span style={{ fontSize: 9, color: '#6B778C' }}>Collaborate on tasks</span>
                </div>
              </label>

              <label 
                className="flex items-center gap-2 p-2 border" 
                style={{ 
                  flex: 1, 
                  borderRadius: 6, 
                  cursor: 'pointer', 
                  borderColor: role === 'MANAGER' ? '#0052CC' : '#DFE1E6',
                  background: role === 'MANAGER' ? 'rgba(0, 82, 204, 0.05)' : 'white'
                }}
              >
                <input 
                  type="radio" 
                  name="role" 
                  value="MANAGER" 
                  checked={role === 'MANAGER'} 
                  onChange={() => setRole('MANAGER')} 
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>Manager</span>
                  <span style={{ fontSize: 9, color: '#6B778C' }}>Manage projects & team</span>
                </div>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full justify-center py-2 text-base font-semibold"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? 'Creating Account...' : (
              <>
                <UserPlus size={18} />
                <span>Register Workspace</span>
              </>
            )}
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
          <button
            type="button"
            className="btn btn-outline w-full justify-center py-2 text-base font-semibold"
            disabled={loading}
            onClick={async () => {
              try {
                const user = await dispatch(loginWithGoogle(role))
                dispatch({
                  type: 'ui/addToast',
                  payload: { type: 'success', title: 'Google Signup Successful', message: `Welcome ${user.name}!` }
                })
                navigate('/dashboard')
              } catch (err) {
                dispatch({
                  type: 'ui/addToast',
                  payload: { type: 'error', title: 'Google Signup Failed', message: err.message || 'Could not sign up with Google.' }
                })
              }
            }}
          >
            Continue with Google
          </button>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#6B778C' }}>
          Already have an account? <a href="/login" className="font-semibold" style={{ color: '#0052CC' }}>Sign In</a>
        </div>
      </div>
    </div>
  )
}
