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
  projects: [],
  teamMembers: [],
  selectedProject: null,
  loading: false,
  error: null,
  filters: {
    status: 'all',
    priority: 'all',
    search: '',
  },
}

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action) => {
      state.projects = action.payload
    },
    addProject: (state, action) => {
      state.projects.unshift(action.payload)
    },
    updateProject: (state, action) => {
      const idx = state.projects.findIndex(p => p.id === action.payload.id)
      if (idx !== -1) state.projects[idx] = { ...state.projects[idx], ...action.payload }
    },
    deleteProject: (state, action) => {
      state.projects = state.projects.filter(p => p.id !== action.payload)
    },
    setSelectedProject: (state, action) => {
      state.selectedProject = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setTeamMembers: (state, action) => {
      state.teamMembers = action.payload
    },
    addTeamMember: (state, action) => {
      state.teamMembers.push(action.payload)
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
  setProjects,
  addProject,
  updateProject,
  deleteProject,
  setSelectedProject,
  setFilters,
  setTeamMembers,
  addTeamMember,
  setLoading,
  setError
} = projectSlice.actions

// Thunks
const mapBackendProjectStatusToFrontend = (status) => {
  if (status === 'ACTIVE') return 'IN_PROGRESS'
  if (status === 'ON_HOLD') return 'NOT_STARTED'
  return status || 'IN_PROGRESS'
}

const mapFrontendProjectStatusToBackend = (status) => {
  if (status === 'IN_PROGRESS') return 'ACTIVE'
  if (status === 'NOT_STARTED') return 'ON_HOLD'
  return status || 'ACTIVE'
}

export const fetchProjects = () => async (dispatch, getState) => {
  dispatch(setLoading(true))
  try {
    const headers = getHeaders(getState())
    const response = await fetch(`${API_BASE_URL}/api/projects`, { headers })
    if (!response.ok) throw new Error('Failed to fetch projects')
    const data = await response.json()
    const mapped = data.map(p => ({
      id: p.id,
      name: p.name,
      key: p.key,
      color: p.color || '#0052CC',
      description: p.description,
      status: mapBackendProjectStatusToFrontend(p.status),
      priority: p.priority || 'MEDIUM',
      progress: p.progress || 0,
      startDate: p.createdAt ? p.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: p.targetDate ? p.targetDate.split('T')[0] : '',
      budget: p.budget || 0,
      members: p.members ? p.members.map(m => m.id) : [],
      owner: p.owner ? p.owner.id : null,
      tags: p.tags || [],
    }))
    dispatch(setProjects(mapped))
  } catch (error) {
    dispatch(setError(error.message))
  } finally {
    dispatch(setLoading(false))
  }
}

export const createProject = (projectData) => async (dispatch, getState) => {
  dispatch(setLoading(true))
  try {
    const headers = getHeaders(getState())
    const payload = {
      name: projectData.name,
      key: projectData.key.toUpperCase(),
      description: projectData.description,
      budget: Number(projectData.budget) || 0,
      status: mapFrontendProjectStatusToBackend(projectData.status),
      targetDate: projectData.endDate ? `${projectData.endDate}T00:00:00` : null,
      memberIds: projectData.members || []
    }
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || 'Failed to create project')
    }
    const data = await response.json()
    const mapped = {
      id: data.id,
      name: data.name,
      key: data.key,
      color: projectData.color || '#0052CC',
      description: data.description,
      status: mapBackendProjectStatusToFrontend(data.status),
      priority: projectData.priority || 'MEDIUM',
      progress: 0,
      startDate: data.createdAt ? data.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: data.targetDate ? data.targetDate.split('T')[0] : '',
      budget: data.budget || 0,
      members: data.members ? data.members.map(m => m.id) : [],
      owner: data.owner ? data.owner.id : null,
      tags: projectData.tags || [],
    }
    dispatch(addProject(mapped))
    return mapped
  } catch (error) {
    dispatch(setError(error.message))
    throw error
  } finally {
    dispatch(setLoading(false))
  }
}

export const updateProjectApi = (projectId, projectData) => async (dispatch, getState) => {
  dispatch(setLoading(true))
  try {
    const headers = getHeaders(getState())
    const payload = {
      name: projectData.name,
      key: projectData.key?.toUpperCase(),
      description: projectData.description,
      budget: Number(projectData.budget) || 0,
      status: mapFrontendProjectStatusToBackend(projectData.status),
      targetDate: projectData.endDate ? `${projectData.endDate}T00:00:00` : null,
      memberIds: projectData.members || []
    }
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || 'Failed to update project')
    }
    const data = await response.json()
    const mapped = {
      id: data.id,
      name: data.name,
      key: data.key,
      color: projectData.color || '#0052CC',
      description: data.description,
      status: mapBackendProjectStatusToFrontend(data.status),
      priority: projectData.priority || 'MEDIUM',
      progress: projectData.progress || 0,
      startDate: data.createdAt ? data.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: data.targetDate ? data.targetDate.split('T')[0] : '',
      budget: data.budget || 0,
      members: data.members ? data.members.map(m => m.id) : [],
      owner: data.owner ? data.owner.id : null,
      tags: projectData.tags || [],
    }
    dispatch(updateProject(mapped))
    return mapped
  } catch (error) {
    dispatch(setError(error.message))
    throw error
  } finally {
    dispatch(setLoading(false))
  }
}

export const deleteProjectApi = (projectId) => async (dispatch, getState) => {
  dispatch(setLoading(true))
  try {
    const headers = getHeaders(getState())
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
      method: 'DELETE',
      headers
    })
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || 'Failed to delete project')
    }
    dispatch(deleteProject(projectId))
  } catch (error) {
    dispatch(setError(error.message))
    throw error
  } finally {
    dispatch(setLoading(false))
  }
}

export const fetchTeamMembers = () => async (dispatch, getState) => {
  dispatch(setLoading(true))
  try {
    const headers = getHeaders(getState())
    const response = await fetch(`${API_BASE_URL}/api/users`, { headers })
    if (!response.ok) throw new Error('Failed to fetch team members')
    const data = await response.json()
    const mapped = data.map(u => {
      const initials = u.fullName?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || 'TM'
      const roleName = u.role?.replace(/^ROLE_/, '') || 'EMPLOYEE'
      return {
        id: u.id,
        name: u.fullName,
        avatar: u.avatarUrl || initials,
        avatarColor: '#0052CC',
        role: roleName,
        title: roleName === 'MANAGER' ? 'Project Manager' : roleName === 'ADMIN' ? 'Administrator' : 'Senior Software Engineer',
        email: u.email,
        active: u.active
      }
    })
    dispatch(setTeamMembers(mapped))
  } catch (error) {
    dispatch(setError(error.message))
  } finally {
    dispatch(setLoading(false))
  }
}

export const createTeamMember = (memberData) => async (dispatch, getState) => {
  dispatch(setLoading(true))
  try {
    const headers = getHeaders(getState())
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: memberData.email,
        password: memberData.password || 'Employee@123',
        fullName: memberData.name,
        role: memberData.role ? `ROLE_${memberData.role}` : 'ROLE_EMPLOYEE'
      })
    })
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || 'Failed to create team member')
    }
    const data = await response.json()
    const initials = data.fullName?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || 'TM'
    const roleName = data.role?.replace(/^ROLE_/, '') || 'EMPLOYEE'
    const mapped = {
      id: data.id,
      name: data.fullName,
      avatar: data.avatarUrl || initials,
      avatarColor: '#0052CC',
      role: roleName,
      title: roleName === 'MANAGER' ? 'Project Manager' : roleName === 'ADMIN' ? 'Administrator' : 'Senior Software Engineer',
      email: data.email,
      active: data.active
    }
    dispatch(addTeamMember(mapped))
    return mapped
  } catch (error) {
    dispatch(setError(error.message))
    throw error
  } finally {
    dispatch(setLoading(false))
  }
}

export default projectSlice.reducer
