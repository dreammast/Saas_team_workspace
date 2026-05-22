import { createSlice } from '@reduxjs/toolkit'

const getDynamicApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  return `http://${hostname}:8080`
}

const API_BASE_URL = getDynamicApiUrl()

const mapBackendStatusToFrontend = (status) => {
  if (status === 'TODO') return 'TO_DO';
  if (status === 'DONE') return 'COMPLETED';
  return status || 'TO_DO';
}

const mapFrontendStatusToBackend = (status) => {
  if (status === 'TO_DO') return 'TODO';
  if (status === 'COMPLETED') return 'DONE';
  if (status === 'TESTING') return 'IN_REVIEW';
  if (status === 'BLOCKED') return 'IN_PROGRESS';
  return status || 'TODO';
}

const getHeaders = (state) => {
  const token = state.auth.token
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

const initialState = {
  tasks: [],
  selectedTask: null,
  loading: false,
  error: null,
  filters: {
    status: 'all',
    priority: 'all',
    project: 'all',
    assignee: 'all',
    search: '',
  },
  viewMode: 'list', // 'list' | 'kanban' | 'table'
}

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload
    },
    addTask: (state, action) => {
      state.tasks.unshift(action.payload)
    },
    updateTask: (state, action) => {
      const idx = state.tasks.findIndex(t => t.id === action.payload.id)
      if (idx !== -1) state.tasks[idx] = { ...state.tasks[idx], ...action.payload }
    },
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload)
    },
    moveTask: (state, action) => {
      const { taskId, newStatus } = action.payload
      const task = state.tasks.find(t => t.id === taskId)
      if (task) {
        task.status = newStatus
        task.progress = newStatus === 'COMPLETED' ? 100 : newStatus === 'TO_DO' ? 0 : task.progress
      }
    },
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload
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
  setTasks,
  addTask,
  updateTask,
  deleteTask,
  moveTask,
  setSelectedTask,
  setFilters,
  setViewMode,
  setLoading,
  setError
} = taskSlice.actions

// Thunks
export const fetchTasks = () => async (dispatch, getState) => {
  dispatch(setLoading(true))
  try {
    const headers = getHeaders(getState())
    const response = await fetch(`${API_BASE_URL}/api/tasks`, { headers })
    if (!response.ok) throw new Error('Failed to fetch tasks')
    const data = await response.json()
    
    // Map backend tasks to frontend structure
    const mapped = data.map(t => {
      const assigneeInitials = t.assignee?.fullName?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || ''
      const frontendStatus = mapBackendStatusToFrontend(t.status)
      return {
        id: t.id,
        projectId: t.project?.id,
        projectName: t.project?.name,
        projectKey: t.project?.key,
        projectColor: t.project?.color || '#0052CC',
        key: `${t.project?.key || 'TASK'}-${t.id}`,
        title: t.title,
        description: t.description,
        status: frontendStatus,
        priority: t.priority || 'MEDIUM',
        assignedTo: t.assignee?.id || null,
        assignedName: t.assignee?.fullName || null,
        assignedAvatar: t.assignee?.avatarUrl || assigneeInitials,
        assignedColor: '#0052CC',
        reporter: t.creator?.id || null,
        reporterName: t.creator?.fullName || null,
        startDate: t.createdAt ? t.createdAt.split('T')[0] : null,
        dueDate: t.dueDate ? t.dueDate.split('T')[0] : null,
        estimatedHours: t.estimatedHours || 0,
        actualHours: t.actualHours || 0,
        storyPoints: t.storyPoints || 0,
        progress: frontendStatus === 'COMPLETED' ? 100 : frontendStatus === 'TO_DO' ? 0 : 50,
        labels: [],
        comments: 0,
        attachments: 0,
        createdAt: t.createdAt
      }
    })
    
    dispatch(setTasks(mapped))
  } catch (error) {
    dispatch(setError(error.message))
  } finally {
    dispatch(setLoading(false))
  }
}

export const createTask = (projectId, taskData) => async (dispatch, getState) => {
  dispatch(setLoading(true))
  try {
    const headers = getHeaders(getState())
    let formattedDueDate = null
    if (taskData.dueDate) {
      formattedDueDate = taskData.dueDate.includes('T') ? taskData.dueDate : `${taskData.dueDate}T00:00:00`
    }
    
    const payload = {
      title: taskData.title,
      description: taskData.description || '',
      status: mapFrontendStatusToBackend(taskData.status || 'TO_DO'),
      priority: taskData.priority || 'MEDIUM',
      storyPoints: taskData.storyPoints || 0,
      estimatedHours: taskData.estimatedHours || 0,
      actualHours: taskData.actualHours || 0,
      dueDate: formattedDueDate,
      assigneeId: taskData.assignedTo || null
    }
    
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) throw new Error('Failed to create task')
    const t = await response.json()
    
    const assigneeInitials = t.assignee?.fullName?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || ''
    const frontendStatus = mapBackendStatusToFrontend(t.status)
    const mapped = {
      id: t.id,
      projectId: t.project?.id,
      projectName: t.project?.name,
      projectKey: t.project?.key,
      projectColor: t.project?.color || '#0052CC',
      key: `${t.project?.key || 'TASK'}-${t.id}`,
      title: t.title,
      description: t.description,
      status: frontendStatus,
      priority: t.priority || 'MEDIUM',
      assignedTo: t.assignee?.id || null,
      assignedName: t.assignee?.fullName || null,
      assignedAvatar: t.assignee?.avatarUrl || assigneeInitials,
      assignedColor: '#0052CC',
      reporter: t.creator?.id || null,
      reporterName: t.creator?.fullName || null,
      startDate: t.createdAt ? t.createdAt.split('T')[0] : null,
      dueDate: t.dueDate ? t.dueDate.split('T')[0] : null,
      estimatedHours: t.estimatedHours || 0,
      actualHours: t.actualHours || 0,
      storyPoints: t.storyPoints || 0,
      progress: frontendStatus === 'COMPLETED' ? 100 : frontendStatus === 'TO_DO' ? 0 : 50,
      labels: [],
      comments: 0,
      attachments: 0,
      createdAt: t.createdAt
    }
    
    dispatch(addTask(mapped))
    return mapped
  } catch (error) {
    dispatch(setError(error.message))
    throw error
  } finally {
    dispatch(setLoading(false))
  }
}

export const updateTaskApi = (taskId, taskData) => async (dispatch, getState) => {
  dispatch(setLoading(true))
  try {
    const headers = getHeaders(getState())
    let formattedDueDate = null
    if (taskData.dueDate) {
      formattedDueDate = taskData.dueDate.includes('T') ? taskData.dueDate : `${taskData.dueDate}T00:00:00`
    }
    
    const payload = {
      title: taskData.title,
      description: taskData.description || '',
      status: mapFrontendStatusToBackend(taskData.status || 'TO_DO'),
      priority: taskData.priority || 'MEDIUM',
      storyPoints: taskData.storyPoints || 0,
      estimatedHours: taskData.estimatedHours || 0,
      actualHours: taskData.actualHours || 0,
      dueDate: formattedDueDate,
      assigneeId: taskData.assignedTo || null
    }
    
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) throw new Error('Failed to update task')
    const t = await response.json()
    
    const assigneeInitials = t.assignee?.fullName?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || ''
    const frontendStatus = mapBackendStatusToFrontend(t.status)
    const mapped = {
      id: t.id,
      projectId: t.project?.id,
      projectName: t.project?.name,
      projectKey: t.project?.key,
      projectColor: t.project?.color || '#0052CC',
      key: `${t.project?.key || 'TASK'}-${t.id}`,
      title: t.title,
      description: t.description,
      status: frontendStatus,
      priority: t.priority || 'MEDIUM',
      assignedTo: t.assignee?.id || null,
      assignedName: t.assignee?.fullName || null,
      assignedAvatar: t.assignee?.avatarUrl || assigneeInitials,
      assignedColor: '#0052CC',
      reporter: t.creator?.id || null,
      reporterName: t.creator?.fullName || null,
      startDate: t.createdAt ? t.createdAt.split('T')[0] : null,
      dueDate: t.dueDate ? t.dueDate.split('T')[0] : null,
      estimatedHours: t.estimatedHours || 0,
      actualHours: t.actualHours || 0,
      storyPoints: t.storyPoints || 0,
      progress: frontendStatus === 'COMPLETED' ? 100 : frontendStatus === 'TO_DO' ? 0 : 50,
      labels: [],
      comments: 0,
      attachments: 0,
      createdAt: t.createdAt
    }
    
    dispatch(updateTask(mapped))
    return mapped
  } catch (error) {
    dispatch(setError(error.message))
    throw error
  } finally {
    dispatch(setLoading(false))
  }
}

export const updateTaskStatusApi = (taskId, status) => async (dispatch, getState) => {
  try {
    const headers = getHeaders(getState())
    const backendStatus = mapFrontendStatusToBackend(status)
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/status?status=${backendStatus}`, {
      method: 'PATCH',
      headers
    })
    if (!response.ok) throw new Error('Failed to update task status')
    dispatch(moveTask({ taskId, newStatus: status }))
  } catch (error) {
    dispatch(setError(error.message))
  }
}

export const deleteTaskApi = (taskId) => async (dispatch, getState) => {
  dispatch(setLoading(true))
  try {
    const headers = getHeaders(getState())
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers
    })
    if (!response.ok) throw new Error('Failed to delete task')
    dispatch(deleteTask(taskId))
  } catch (error) {
    dispatch(setError(error.message))
    throw error
  } finally {
    dispatch(setLoading(false))
  }
}

export default taskSlice.reducer
