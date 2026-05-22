import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { User, Bell, Settings, HelpCircle, Save } from 'lucide-react'
import { updateUser } from '../store/slices/authSlice'
import UserAvatar from '../components/common/UserAvatar'

export default function SettingsPage() {
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const activeTabParam = searchParams.get('tab')

  const { user } = useSelector(state => state.auth)

  const [activeTab, setActiveTab] = useState('profile')
  const [profileData, setProfileData] = useState({
    name: '',
    title: '',
    department: '',
    phone: '',
    bio: '',
    avatarColor: '',
  })

  // Set active tab based on query param
  useEffect(() => {
    if (activeTabParam === 'help') {
      setActiveTab('help')
    }
  }, [activeTabParam])

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        title: user.title || '',
        department: user.department || '',
        phone: user.phone || '',
        bio: user.bio || '',
        avatarColor: user.avatarColor || '#0052CC',
      })
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    
    // Generate new initials for avatar if name changed
    const initials = profileData.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    dispatch(updateUser({
      ...profileData,
      avatar: initials
    }))

    dispatch({
      type: 'ui/addToast',
      payload: { type: 'success', title: 'Profile Updated', message: 'Your settings have been saved successfully.' }
    })
  }

  return (
    <div className="card" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', minHeight: 480, background: 'white' }}>
      
      {/* Settings Navigation */}
      <div style={{ borderRight: '1px solid var(--color-border-subtle)', background: '#F4F5F7', padding: '16px 8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2"
            style={{ 
              width: '100%', 
              padding: '8px 12px', 
              borderRadius: 4, 
              fontSize: 13, 
              fontWeight: activeTab === 'profile' ? 600 : 500,
              color: activeTab === 'profile' ? '#0052CC' : '#6B778C',
              background: activeTab === 'profile' ? 'rgba(0, 82, 204, 0.08)' : 'none',
              textAlign: 'left'
            }}
          >
            <User size={14} />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className="flex items-center gap-2"
            style={{ 
              width: '100%', 
              padding: '8px 12px', 
              borderRadius: 4, 
              fontSize: 13, 
              fontWeight: activeTab === 'notifications' ? 600 : 500,
              color: activeTab === 'notifications' ? '#0052CC' : '#6B778C',
              background: activeTab === 'notifications' ? 'rgba(0, 82, 204, 0.08)' : 'none',
              textAlign: 'left'
            }}
          >
            <Bell size={14} />
            <span>Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab('workspace')}
            className="flex items-center gap-2"
            style={{ 
              width: '100%', 
              padding: '8px 12px', 
              borderRadius: 4, 
              fontSize: 13, 
              fontWeight: activeTab === 'workspace' ? 600 : 500,
              color: activeTab === 'workspace' ? '#0052CC' : '#6B778C',
              background: activeTab === 'workspace' ? 'rgba(0, 82, 204, 0.08)' : 'none',
              textAlign: 'left'
            }}
          >
            <Settings size={14} />
            <span>Workspace</span>
          </button>

          <button
            onClick={() => setActiveTab('help')}
            className="flex items-center gap-2"
            style={{ 
              width: '100%', 
              padding: '8px 12px', 
              borderRadius: 4, 
              fontSize: 13, 
              fontWeight: activeTab === 'help' ? 600 : 500,
              color: activeTab === 'help' ? '#0052CC' : '#6B778C',
              background: activeTab === 'help' ? 'rgba(0, 82, 204, 0.08)' : 'none',
              textAlign: 'left'
            }}
          >
            <HelpCircle size={14} />
            <span>Help & Support</span>
          </button>
        </div>
      </div>

      {/* Settings Form Pane */}
      <div style={{ padding: 24 }}>
        
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#172B4D', marginBottom: 4 }}>Account Details</h3>
              <p style={{ fontSize: 12, color: '#6B778C' }}>Update your engineering bio and workplace contact information.</p>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 8 }}>
                <UserAvatar
                avatar={user?.avatar}
                name={user?.name}
                avatarColor={profileData.avatarColor || '#0052CC'}
                size="lg"
              />
              <div className="flex flex-col gap-1">
                <span className="font-semibold" style={{ fontSize: 13, color: '#172B4D' }}>Choose Profile Theme</span>
                <div className="flex gap-2">
                  {['#0052CC', '#6554C0', '#00875A', '#FF5630', '#FF991F'].map(color => (
                    <button
                      key={color}
                      type="button"
                      style={{ width: 20, height: 20, borderRadius: '50%', background: color, border: profileData.avatarColor === color ? '2px solid black' : 'none', cursor: 'pointer' }}
                      onClick={() => setProfileData(prev => ({ ...prev, avatarColor: color }))}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label required">Display Name</label>
              <input 
                type="text" 
                name="name" 
                value={profileData.name} 
                onChange={handleInputChange} 
                className="form-control" 
                required
              />
            </div>

            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={profileData.title} 
                  onChange={handleInputChange} 
                  className="form-control" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <input 
                  type="text" 
                  name="department" 
                  value={profileData.department} 
                  onChange={handleInputChange} 
                  className="form-control" 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="text" 
                name="phone" 
                value={profileData.phone} 
                onChange={handleInputChange} 
                className="form-control" 
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Biography</label>
              <textarea 
                name="bio" 
                value={profileData.bio} 
                onChange={handleInputChange} 
                className="form-control" 
                rows={3}
                placeholder="Share a short bio..."
              />
            </div>

            <button type="submit" className="btn btn-primary flex items-center gap-1" style={{ width: 'fit-content', marginTop: 8 }}>
              <Save size={14} />
              <span>Save Profile</span>
            </button>
          </form>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#172B4D', marginBottom: 4 }}>Notification Center</h3>
              <p style={{ fontSize: 12, color: '#6B778C' }}>Control how and when you receive task or project reminders.</p>
            </div>
            
            <div className="flex flex-col gap-4">
              <label className="flex items-start gap-3" style={{ cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ marginTop: 4 }} />
                <div>
                  <div className="font-semibold" style={{ fontSize: 13, color: '#172B4D' }}>Task Assignments</div>
                  <div style={{ fontSize: 11, color: '#6B778C' }}>Send push notification when a sprint card is assigned to me.</div>
                </div>
              </label>

              <label className="flex items-start gap-3" style={{ cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ marginTop: 4 }} />
                <div>
                  <div className="font-semibold" style={{ fontSize: 13, color: '#172B4D' }}>Mentions & Comments</div>
                  <div style={{ fontSize: 11, color: '#6B778C' }}>Trigger in-app notification when I am mentioned in a comment.</div>
                </div>
              </label>

              <label className="flex items-start gap-3" style={{ cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked={user?.role === 'MANAGER'} style={{ marginTop: 4 }} />
                <div>
                  <div className="font-semibold" style={{ fontSize: 13, color: '#172B4D' }}>Project Progress Updates</div>
                  <div style={{ fontSize: 11, color: '#6B778C' }}>Email me summary digests when project tasks move to testing or done.</div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* WORKSPACE TAB */}
        {activeTab === 'workspace' && (
          <div style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#172B4D', marginBottom: 4 }}>Workspace Settings</h3>
              <p style={{ fontSize: 12, color: '#6B778C' }}>Manage global organization parameters and system configurations.</p>
            </div>

            <div className="form-group">
              <label className="form-label">Workspace Name</label>
              <input type="text" className="form-control" defaultValue="Engineering Department" disabled={user?.role !== 'MANAGER'} />
            </div>

            <div className="form-group">
              <label className="form-label">Company Domain</label>
              <input type="text" className="form-control" defaultValue="projectflow.com" disabled />
            </div>

            {user?.role !== 'MANAGER' && (
              <div style={{ fontSize: 11, color: '#DE350B', background: '#FFEBE6', padding: 8, borderRadius: 4 }}>
                Only engineering managers have permission to edit workspace configurations.
              </div>
            )}
          </div>
        )}

        {/* HELP TAB */}
        {activeTab === 'help' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#172B4D', marginBottom: 4 }}>Help & Knowledge Center</h3>
              <p style={{ fontSize: 12, color: '#6B778C' }}>Learn how to manage sprints, cards, and team allocations.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="card" style={{ padding: 16, border: '1px solid var(--color-border-subtle)' }}>
                <h4 className="font-semibold mb-1" style={{ fontSize: 13, color: '#172B4D' }}>Kanban Basics</h4>
                <p style={{ fontSize: 11, color: '#6B778C', lineHeight: 1.4 }}>Discover how to drag cards, set story points, and request qa testing reviews.</p>
              </div>

              <div className="card" style={{ padding: 16, border: '1px solid var(--color-border-subtle)' }}>
                <h4 className="font-semibold mb-1" style={{ fontSize: 13, color: '#172B4D' }}>Creating Dashboards</h4>
                <p style={{ fontSize: 11, color: '#6B778C', lineHeight: 1.4 }}>Managers can discover how to customize visual burndowns, budgeting gauges, and developer workloads.</p>
              </div>
            </div>

            <div style={{ background: 'var(--color-primary-subtle)', padding: 16, borderRadius: 6 }}>
              <h4 className="font-semibold" style={{ fontSize: 13, color: '#0747A6', marginBottom: 4 }}>Need urgent system help?</h4>
              <p style={{ fontSize: 11, color: '#172B4D', opacity: 0.85, lineHeight: 1.4 }}>Contact our Platform support desk at <span style={{ fontWeight: 600 }}>support@projectflow.com</span> or raise a ticket in the #help-desk chat channel.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
