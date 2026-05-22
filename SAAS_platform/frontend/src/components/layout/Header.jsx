import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  Search, Bell, User, Settings, LogOut, Plus, 
  Menu, HelpCircle, CheckSquare, FolderKanban, ShieldAlert
} from 'lucide-react'
import { logout } from '../../store/slices/authSlice'
import { 
  toggleSidebar, 
  toggleNotificationPanel, 
  toggleUserMenu, 
  closeUserMenu,
  openModal
} from '../../store/slices/uiSlice'
import UserAvatar from '../common/UserAvatar'

export default function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  
  const { user } = useSelector(state => state.auth)
  const { unreadCount } = useSelector(state => state.notifications)
  const { userMenuOpen } = useSelector(state => state.ui)
  
  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN'
  const dropdownRef = useRef(null)
  
  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        dispatch(closeUserMenu())
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen, dispatch])

  // Get current page name from path
  const getPageTitle = () => {
    const path = location.pathname.substring(1)
    if (!path) return 'Dashboard'
    
    // Capitalize first letter
    const title = path.charAt(0).toUpperCase() + path.slice(1)
    if (title === 'Tasks') return 'My Tasks'
    return title
  }

  const handleLogout = () => {
    dispatch(logout())
    dispatch(closeUserMenu())
    navigate('/login')
  }

  const handleCreateTask = () => {
    dispatch(openModal({ type: 'CREATE_TASK', data: null }))
  }

  const handleCreateProject = () => {
    dispatch(openModal({ type: 'CREATE_PROJECT', data: null }))
  }

  return (
    <header className="header">
      {/* Left side: Menu toggle + Search */}
      <div className="header-left">
        <button 
          className="header-icon-btn menu-toggle" 
          onClick={() => dispatch(toggleSidebar())}
          title="Toggle Sidebar"
        >
          <Menu size={18} />
        </button>
        
        <h1 className="header-page-title">{getPageTitle()}</h1>

        {/* Global Search Bar */}
        <div className="header-search-bar">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search tasks, projects, comments..." 
            className="search-input"
            onClick={() => dispatch(openModal({ type: 'GLOBAL_SEARCH' }))}
            readOnly
          />
          <div className="search-hotkey">/</div>
        </div>
      </div>

      {/* Right side: Quick actions + Notifications + Profile */}
      <div className="header-right">
        {/* Quick Action Button */}
        {isManager ? (
          <div className="header-actions">
            <button 
              className="btn btn-primary btn-sm flex items-center gap-1"
              onClick={handleCreateTask}
              id="header-create-task"
            >
              <Plus size={14} />
              <span>Create Task</span>
            </button>
            <button 
              className="btn btn-secondary btn-sm flex items-center gap-1"
              style={{ color: '#0052CC', borderColor: 'rgba(0, 82, 204, 0.2)', backgroundColor: 'rgba(0, 82, 204, 0.05)' }}
              onClick={handleCreateProject}
              id="header-create-project"
            >
              <Plus size={14} />
              <span>New Project</span>
            </button>
          </div>
        ) : (
          <button 
            className="btn btn-primary btn-sm flex items-center gap-1"
            onClick={handleCreateTask}
            id="header-create-task"
          >
            <Plus size={14} />
            <span>Create Task</span>
          </button>
        )}

        {/* Divider */}
        <div className="header-divider" />

        {/* Notification Bell */}
        <button 
          className="header-icon-btn notification-bell-btn relative"
          onClick={() => dispatch(toggleNotificationPanel())}
          title="Notifications"
          id="header-notification-btn"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="bell-badge">{unreadCount}</span>
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="header-user-dropdown" ref={dropdownRef}>
          <button 
            className="header-avatar-btn"
            onClick={() => dispatch(toggleUserMenu())}
            aria-expanded={userMenuOpen}
            title="User Settings"
          >
            <UserAvatar
              avatar={user?.avatar}
              name={user?.name}
              avatarColor={user?.avatarColor || '#0052CC'}
              size="sm"
            />
          </button>

          {userMenuOpen && (
            <div className="user-dropdown-menu">
              <div className="dropdown-user-header">
                <UserAvatar
                  avatar={user?.avatar}
                  name={user?.name}
                  avatarColor={user?.avatarColor || '#0052CC'}
                  size="lg"
                />
                <div className="dropdown-user-info">
                  <div className="dropdown-user-name">{user?.name}</div>
                  <div className="dropdown-user-email">{user?.email}</div>
                  <span className={`badge badge-${user?.role === 'MANAGER' || user?.role === 'ADMIN' ? 'primary' : 'success'} mt-1`}>
                    {user?.role === 'ADMIN' ? 'Admin' : user?.role === 'MANAGER' ? 'Manager' : 'Team Member'}
                  </span>
                </div>
              </div>
              
              <div className="dropdown-divider" />
              
              <button 
                className="dropdown-item" 
                onClick={() => { navigate('/settings'); dispatch(closeUserMenu()) }}
              >
                <Settings size={14} />
                <span>Account Settings</span>
              </button>
              
              <button 
                className="dropdown-item" 
                onClick={() => { navigate('/tasks'); dispatch(closeUserMenu()) }}
              >
                <CheckSquare size={14} />
                <span>My Tasks</span>
              </button>

              {isManager && (
                <button 
                  className="dropdown-item" 
                  onClick={() => { navigate('/projects'); dispatch(closeUserMenu()) }}
                >
                  <FolderKanban size={14} />
                  <span>Manage Projects</span>
                </button>
              )}

              <button 
                className="dropdown-item" 
                onClick={() => { navigate('/settings?tab=help'); dispatch(closeUserMenu()) }}
              >
                <HelpCircle size={14} />
                <span>Help & Support</span>
              </button>

              <div className="dropdown-divider" />

              <button 
                className="dropdown-item text-danger" 
                onClick={handleLogout}
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
