import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  LayoutDashboard, FolderKanban, CheckSquare, Calendar,
  MessageSquare, Users, BarChart2, Settings, HelpCircle,
  Layers, Plus, ChevronDown, ChevronRight, Bell, LogOut,
  Mail
} from 'lucide-react'
import { logout } from '../../store/slices/authSlice'
import { toggleNotificationPanel } from '../../store/slices/uiSlice'
import UserAvatar from '../common/UserAvatar'

const EMPLOYEE_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', id: 'dashboard' },
  { icon: CheckSquare, label: 'My Tasks', path: '/tasks', id: 'tasks' },
  { icon: Calendar, label: 'Calendar', path: '/calendar', id: 'calendar' },
  { icon: MessageSquare, label: 'Messages', path: '/messages', id: 'messages', badge: 4 },
  { icon: Mail, label: 'Email Hub', path: '/email', id: 'email' },
]

const MANAGER_EXTRA_NAV = [
  { icon: FolderKanban, label: 'Projects', path: '/projects', id: 'projects' },
  { icon: Users, label: 'Team', path: '/team', id: 'team' },
  { icon: BarChart2, label: 'Analytics', path: '/analytics', id: 'analytics' },
]

const PROJECT_COLORS = {
  'proj-1': '#0052CC',
  'proj-2': '#6554C0',
  'proj-3': '#00875A',
  'proj-4': '#FF5630',
  'proj-5': '#FF991F',
}

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { projects } = useSelector(s => s.projects)
  const { unreadCount } = useSelector(s => s.notifications)
  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN'

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const navItems = isManager
    ? [...EMPLOYEE_NAV, ...MANAGER_EXTRA_NAV]
    : EMPLOYEE_NAV

  const isActive = (path) => location.pathname === path

  const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').slice(0, 4)

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Layers size={16} color="#0052CC" />
        </div>
        <div className="sidebar-logo-text">
          <div className="brand-name">ProjectFlow</div>
          <div className="brand-sub">
            {isManager ? 'Manager workspace' : 'Team workspace'}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <button className="sidebar-search-btn" id="sidebar-search-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <span>Search...</span>
          <span className="sidebar-search-shortcut">⌘K</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-section">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            const badgeCount = item.id === 'messages' ? 4 : null
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                className={`sidebar-nav-item ${active ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {badgeCount && (
                  <span className="nav-badge">{badgeCount}</span>
                )}
                {active && !badgeCount && (
                  <span className="nav-indicator" />
                )}
              </button>
            )
          })}
        </div>

        {/* Active Projects */}
        <div style={{ marginTop: 12 }}>
          <div className="sidebar-section-header">
            <ChevronDown size={12} color="rgba(255,255,255,0.4)" />
            <span className="sidebar-section-label">Active Projects</span>
            {isManager && (
              <button
                className="sidebar-section-btn"
                id="sidebar-add-project"
                onClick={() => navigate('/projects')}
                title="New Project"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          <div className="sidebar-project-list">
            {activeProjects.map((project) => (
              <button
                key={project.id}
                className="sidebar-project-item"
                onClick={() => navigate(isManager ? '/projects' : '/tasks')}
              >
                <div
                  className="project-key-badge"
                  style={{ backgroundColor: project.color }}
                >
                  {project.key[0]}
                </div>
                <span className="truncate">{project.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-links">
          <button className="sidebar-nav-item" id="nav-help">
            <HelpCircle size={16} />
            <span>Help & Support</span>
          </button>
          <button
            className="sidebar-nav-item"
            id="nav-settings"
            onClick={() => navigate('/settings')}
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
          <button
            className="sidebar-nav-item logout"
            id="nav-logout"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>

        {/* User profile */}
        <div className="sidebar-user">
          <UserAvatar
            avatar={user?.avatar}
            name={user?.name}
            avatarColor={user?.avatarColor || '#4C9AFF'}
            size="sm"
          />
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role">
              {user?.role === 'ADMIN' ? 'Admin' : user?.role === 'MANAGER' ? 'Manager' : 'Team Member'}
            </div>
          </div>
          <button
            className="notification-btn"
            id="sidebar-notification-btn"
            onClick={() => dispatch(toggleNotificationPanel())}
            title="Notifications"
          >
            <Bell size={14} />
            {unreadCount > 0 && <span className="notification-dot" />}
          </button>
        </div>
      </div>
    </aside>
  )
}
