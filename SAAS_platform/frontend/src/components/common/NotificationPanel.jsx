import { useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  X, CheckSquare, MessageSquare, AlertTriangle, 
  FolderSync, ShieldAlert, CheckCircle, Trash2, MailOpen
} from 'lucide-react'
import { markNotificationAsReadApi, markAllNotificationsAsReadApi, deleteNotification } from '../../store/slices/notificationSlice'
import { closeNotificationPanel } from '../../store/slices/uiSlice'

export default function NotificationPanel() {
  const dispatch = useDispatch()
  const panelRef = useRef(null)
  
  const { notifications, unreadCount } = useSelector(state => state.notifications)
  const { notificationPanelOpen } = useSelector(state => state.ui)

  // Close panel on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      // Check if clicked button was the header toggle button to avoid double-toggling
      const wasHeaderBell = event.target.closest('#header-notification-btn') || event.target.closest('#sidebar-notification-btn')
      if (panelRef.current && !panelRef.current.contains(event.target) && !wasHeaderBell) {
        dispatch(closeNotificationPanel())
      }
    }
    if (notificationPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [notificationPanelOpen, dispatch])

  if (!notificationPanelOpen) return null

  const getNotifIcon = (type) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return <CheckSquare size={16} color="#0052CC" />
      case 'COMMENT_ADDED':
        return <MessageSquare size={16} color="#6554C0" />
      case 'DEADLINE_APPROACHING':
        return <AlertTriangle size={16} color="#FF991F" />
      case 'PROJECT_UPDATED':
        return <FolderSync size={16} color="#00875A" />
      case 'MENTION':
      default:
        return <ShieldAlert size={16} color="#FF5630" />
    }
  }

  const formatTimeAgo = (dateString) => {
    try {
      const diffMs = new Date() - new Date(dateString)
      const diffMins = Math.floor(diffMs / 60000)
      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      const diffHours = Math.floor(diffMins / 60)
      if (diffHours < 24) return `${diffHours}h ago`
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays}d ago`
    } catch (e) {
      return ''
    }
  }

  return (
    <div className="notification-panel" ref={panelRef}>
      <div className="notification-panel-header">
        <div className="flex items-center gap-2">
          <span className="panel-title">Notifications</span>
          {unreadCount > 0 && (
            <span className="badge badge-primary text-xs">{unreadCount} new</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button 
              className="icon-btn" 
              onClick={() => dispatch(markAllNotificationsAsReadApi())}
              title="Mark all as read"
            >
              <MailOpen size={16} />
            </button>
          )}
          <button 
            className="icon-btn" 
            onClick={() => dispatch(closeNotificationPanel())}
            title="Close Panel"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <CheckCircle size={32} color="#00875A" style={{ marginBottom: 12, opacity: 0.6 }} />
            <div className="empty-title">All caught up!</div>
            <p className="empty-desc">No new notifications here.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
              onClick={() => {
                if (!notif.isRead) {
                  dispatch(markNotificationAsReadApi(notif.id))
                }
              }}
            >
              <div className="notification-item-icon">
                {getNotifIcon(notif.type)}
              </div>
              <div className="notification-item-content">
                <div className="notification-item-title-row">
                  <span className="notification-item-title">{notif.title}</span>
                  <span className="notification-item-time">{formatTimeAgo(notif.createdAt)}</span>
                </div>
                <p className="notification-item-message">{notif.message}</p>
                <div className="notification-item-actions">
                  {!notif.isRead && (
                    <button 
                      className="btn-link"
                      onClick={(e) => {
                        e.stopPropagation()
                        dispatch(markNotificationAsReadApi(notif.id))
                      }}
                    >
                      Mark read
                    </button>
                  )}
                  <button 
                    className="btn-link text-danger"
                    onClick={(e) => {
                      e.stopPropagation()
                      dispatch(deleteNotification(notif.id))
                    }}
                  >
                    <Trash2 size={12} style={{ marginRight: 2 }} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
