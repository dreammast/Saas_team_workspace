import { createSlice } from '@reduxjs/toolkit'

const getDynamicApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  return `http://${hostname}:8080`
}

const API_BASE_URL = getDynamicApiUrl()

const getHeaders = (state) => {
  const token = state.auth.token
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload
      state.unreadCount = action.payload.filter(n => !n.isRead).length
    },
    addNotification: (state, action) => {
      // Avoid duplicate notifications in array
      if (!state.notifications.some(n => n.id === action.payload.id)) {
        state.notifications.unshift(action.payload)
        if (!action.payload.isRead) state.unreadCount += 1
      }
    },
    markAsRead: (state, action) => {
      const notif = state.notifications.find(n => n.id === action.payload)
      if (notif && !notif.isRead) {
        notif.isRead = true
        notif.readAt = new Date().toISOString()
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => {
        n.isRead = true
        n.readAt = new Date().toISOString()
      })
      state.unreadCount = 0
    },
    deleteNotification: (state, action) => {
      const notif = state.notifications.find(n => n.id === action.payload)
      if (notif && !notif.isRead) state.unreadCount = Math.max(0, state.unreadCount - 1)
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    }
  },
})

export const {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  setLoading,
  setError
} = notificationSlice.actions

// Thunks
export const fetchNotifications = () => async (dispatch, getState) => {
  dispatch(setLoading(true))
  try {
    const headers = getHeaders(getState())
    const response = await fetch(`${API_BASE_URL}/api/notifications`, { headers })
    if (!response.ok) throw new Error('Failed to fetch notifications')
    const data = await response.json()
    
    // Map backend notifications to frontend structure
    const mapped = data.map(n => {
      let title = 'Notification'
      let entityType = 'other'
      if (n.type === 'TASK_ASSIGNED') {
        title = 'Task Assigned'
        entityType = 'task'
      } else if (n.type === 'TASK_UPDATED') {
        title = 'Task Updated'
        entityType = 'task'
      } else if (n.type === 'COMMENT_ADDED') {
        title = 'New Comment'
        entityType = 'task'
      }
      
      return {
        id: n.id,
        type: n.type,
        title,
        message: n.content,
        isRead: n.read,
        createdAt: n.createdAt,
        entityType,
        entityId: null
      }
    })
    
    dispatch(setNotifications(mapped))
  } catch (error) {
    dispatch(setError(error.message))
  } finally {
    dispatch(setLoading(false))
  }
}

export const markNotificationAsReadApi = (id) => async (dispatch, getState) => {
  try {
    const headers = getHeaders(getState())
    const response = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers
    })
    if (!response.ok) throw new Error('Failed to mark notification as read')
    dispatch(markAsRead(id))
  } catch (error) {
    console.error(error)
  }
}

export const markAllNotificationsAsReadApi = () => async (dispatch, getState) => {
  try {
    const headers = getHeaders(getState())
    const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
      method: 'POST',
      headers
    })
    if (!response.ok) throw new Error('Failed to mark all as read')
    dispatch(markAllAsRead())
  } catch (error) {
    console.error(error)
  }
}

export default notificationSlice.reducer
