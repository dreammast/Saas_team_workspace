import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  Users, Mail, Award, CheckSquare, Clock, Shield, Briefcase, Plus, X 
} from 'lucide-react'
import UserAvatar from '../components/common/UserAvatar'
import { createTeamMember } from '../store/slices/projectSlice'
import { addToast } from '../store/slices/uiSlice'

export default function TeamPage() {
  const teamMembers = useSelector(state => state.projects.teamMembers)
  const tasks = useSelector(state => state.tasks.tasks)
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN'

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [memberRole, setMemberRole] = useState('EMPLOYEE')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return

    setSubmitting(true)
    try {
      await dispatch(createTeamMember({
        name: name.trim(),
        email: email.trim(),
        password: password.trim() || 'Employee@123',
        role: memberRole
      }))
      dispatch(addToast({ type: 'success', title: 'Success', message: 'Team member added successfully!' }))
      setIsModalOpen(false)
      setName('')
      setEmail('')
      setPassword('')
      setMemberRole('EMPLOYEE')
    } catch (err) {
      dispatch(addToast({ type: 'error', title: 'Error', message: err.message || 'Failed to add team member' }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6" style={{ position: 'relative' }}>
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#172B4D' }}>Team Management</h2>
          <p style={{ fontSize: 13, color: '#6B778C' }}>Monitor employee workloads, view active sprint capacities, and manage roles.</p>
        </div>
        {isManager && (
          <button 
            className="btn btn-primary flex items-center gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            <span>Add Team Member</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Engineering Squad</span>
            <div className="stat-icon" style={{ background: 'rgba(0, 82, 204, 0.1)', color: '#0052CC' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="stat-value">{teamMembers.length}</div>
          <div style={{ fontSize: 11, color: '#6B778C' }}>Full-time contributors</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Avg Workload per Developer</span>
            <div className="stat-icon" style={{ background: 'rgba(101, 84, 192, 0.1)', color: '#6554C0' }}>
              <Briefcase size={18} />
            </div>
          </div>
          <div className="stat-value">
            {teamMembers.length > 0 ? (tasks.filter(t => t.status !== 'COMPLETED').length / teamMembers.length).toFixed(1) : 0}
          </div>
          <div style={{ fontSize: 11, color: '#6B778C' }}>Pending sprint tickets</div>
        </div>
      </div>

      {/* Team Member Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {teamMembers.map(member => {
          // Calculate tasks for this member
          const memberTasks = tasks.filter(t => String(t.assignedTo) === String(member.id))
          const completedCount = memberTasks.filter(t => t.status === 'COMPLETED').length
          const activeCount = memberTasks.filter(t => t.status !== 'COMPLETED').length
          const totalPoints = memberTasks
            .filter(t => t.status !== 'COMPLETED')
            .reduce((sum, t) => sum + (t.storyPoints || 0), 0)

          // Performance Score
          const completionRate = memberTasks.length > 0 
            ? Math.round((completedCount / memberTasks.length) * 100)
            : 100

          return (
            <div key={member.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="card-body" style={{ padding: 20 }}>
                {/* Member Profile Row */}
                <div className="flex gap-3 items-start" style={{ marginBottom: 16 }}>
                  <UserAvatar
                    avatar={member.avatar}
                    name={member.name}
                    avatarColor={member.avatarColor || '#6554C0'}
                    size="lg"
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 className="font-semibold truncate" style={{ fontSize: 15, color: '#172B4D', margin: 0 }}>{member.name}</h3>
                    <p style={{ fontSize: 11, color: '#6B778C', fontWeight: 500, margin: '2px 0' }}>{member.title || 'Engineer'}</p>
                    <span className="badge badge-sm badge-success">{member.role}</span>
                  </div>
                </div>

                {/* Email details */}
                <div className="flex items-center gap-2" style={{ fontSize: 11, color: '#6B778C', marginBottom: 16 }}>
                  <Mail size={12} />
                  <span className="truncate">{member.email}</span>
                </div>

                {/* Workload Breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: 10, background: 'var(--color-bg)', borderRadius: 6, marginBottom: 16, textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0052CC' }}>{activeCount}</div>
                    <div style={{ fontSize: 9, color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>Active Tasks</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#00875A' }}>{completedCount}</div>
                    <div style={{ fontSize: 9, color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>Completed</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#6554C0' }}>{totalPoints}</div>
                    <div style={{ fontSize: 9, color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>Story Pts</div>
                  </div>
                </div>

                {/* Task Load Level Indicator */}
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1" style={{ fontSize: 10, fontWeight: 600, color: '#172B4D' }}>
                    <span>Capacity (Tasks Completion Rate)</span>
                    <span>{completionRate}%</span>
                  </div>
                  <div style={{ height: 6, width: '100%', background: 'var(--color-border-subtle)', borderRadius: 3 }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${completionRate}%`, 
                        background: completionRate > 75 ? '#00875A' : completionRate > 40 ? '#0052CC' : '#DE350B',
                        borderRadius: 3 
                      }} 
                    />
                  </div>
                </div>

                {/* Subtext info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#6B778C' }}>
                  <Award size={10} color="#FF991F" />
                  <span>Active team contributor</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modern Add Member Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(9, 30, 66, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="card animate-fade-in" style={{ width: 420, maxWidth: '90%', background: 'white', borderRadius: 8, boxShadow: '0 8px 24px -4px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)' }}>
            <div className="flex justify-between items-center" style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-subtle)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#172B4D', margin: 0 }}>Add New Team Member</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C', display: 'flex', alignItems: 'center', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="card-body" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 12, color: '#172B4D' }}>Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. John Doe" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 12, color: '#172B4D' }}>Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="e.g. john.doe@company.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 12, color: '#172B4D' }}>Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="Leave empty for default (Employee@123)" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 12, color: '#172B4D' }}>Role</label>
                  <select 
                    className="form-control" 
                    value={memberRole} 
                    onChange={(e) => setMemberRole(e.target.value)}
                    style={{ width: '100%', height: 40, border: '2px solid var(--color-border)', borderRadius: 4, padding: '0 8px' }}
                  >
                    <option value="EMPLOYEE">Employee (ROLE_EMPLOYEE)</option>
                    <option value="MANAGER">Manager (ROLE_MANAGER)</option>
                  </select>
                </div>
              </div>

              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
