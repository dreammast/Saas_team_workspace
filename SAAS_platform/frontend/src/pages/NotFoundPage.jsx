import { useNavigate } from 'react-router-dom'
import { AlertCircle, Home } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center" style={{ width: '100vw', height: '100vh', background: '#F4F5F7', padding: 24, textAlign: 'center' }}>
      <div className="card" style={{ maxWidth: 450, padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ background: '#FFEBE6', color: '#DE350B', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AlertCircle size={32} />
        </div>
        
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#172B4D', marginBottom: 8 }}>Page Not Found</h2>
          <p style={{ fontSize: 13, color: '#6B778C', lineHeight: 1.5 }}>The page you are looking for does not exist, has been archived, or you do not have permission to view it.</p>
        </div>

        <button 
          className="btn btn-primary flex items-center gap-2 mt-2" 
          onClick={() => navigate('/dashboard')}
        >
          <Home size={16} />
          <span>Back to Dashboard</span>
        </button>
      </div>
    </div>
  )
}
