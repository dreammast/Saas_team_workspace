import { createSlice } from '@reduxjs/toolkit'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../../firebase'

const getDynamicApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  return `http://${hostname}:8080`
}

const API_BASE_URL = getDynamicApiUrl()

// Mock users for demo
const DEMO_USERS = {
  'manager@projectflow.com': {
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'manager@projectflow.com',
    role: 'MANAGER',
    avatar: 'AJ',
    avatarColor: '#6554C0',
    title: 'Engineering Manager',
    department: 'Engineering',
    phone: '+1 (555) 123-4567',
    bio: 'Engineering Manager with 8+ years of experience leading cross-functional teams.',
    joinedDate: '2022-01-15',
  },
  'employee@projectflow.com': {
    id: 'user-2',
    name: 'Sarah Chen',
    email: 'employee@projectflow.com',
    role: 'EMPLOYEE',
    avatar: 'SC',
    avatarColor: '#0052CC',
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    phone: '+1 (555) 987-6543',
    bio: 'Passionate frontend developer specializing in React and TypeScript.',
    joinedDate: '2022-06-01',
  },
  'admin@projectflow.com': {
    id: 'user-3',
    name: 'Michael Torres',
    email: 'admin@projectflow.com',
    role: 'ADMIN',
    avatar: 'MT',
    avatarColor: '#00875A',
    title: 'Platform Administrator',
    department: 'IT',
    joinedDate: '2021-03-10',
  },
}

const DEMO_PASSWORDS = {
  'manager@projectflow.com': 'Manager@123',
  'employee@projectflow.com': 'Employee@123',
  'admin@projectflow.com': 'Admin@123',
}

// Load persisted auth
const loadAuth = () => {
  try {
    const saved = localStorage.getItem('pf_auth')
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

const savedAuth = loadAuth()

const initialState = {
  user: savedAuth?.user || null,
  token: savedAuth?.token || null,
  isAuthenticated: !!savedAuth?.token,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action) => {
      state.loading = false
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.error = null
      // Persist to localStorage
      localStorage.setItem('pf_auth', JSON.stringify({
        user: action.payload.user,
        token: action.payload.token,
      }))
    },
    loginFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
      state.isAuthenticated = false
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('pf_auth')
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('pf_auth', JSON.stringify({
        user: state.user,
        token: state.token,
      }))
    },
    clearError: (state) => {
      state.error = null
    },
    registerSuccess: (state, action) => {
      state.loading = false
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.error = null
      localStorage.setItem('pf_auth', JSON.stringify({
        user: action.payload.user,
        token: action.payload.token,
      }))
    }
  },
})

export const { loginStart, loginSuccess, loginFailure, logout, updateUser, clearError, registerSuccess } = authSlice.actions

const parseApiResponse = async (response) => {
  const text = await response.text()
  if (!text) {
    return { status: response.status, ok: response.ok, body: null }
  }
  try {
    const json = JSON.parse(text)
    return { status: response.status, ok: response.ok, body: json }
  } catch {
    return { status: response.status, ok: response.ok, body: { message: text } }
  }
}

const getErrorMessage = (result, fallback) => {
  if (result.body?.message) return result.body.message
  if (result.body?.error) return result.body.error
  if (!result.ok) return fallback || `Request failed with status ${result.status}`
  return fallback
}

// Thunks
export const loginUser = (email, password, selectedRole) => async (dispatch) => {
  dispatch(loginStart())
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const result = await parseApiResponse(response)
    if (!result.ok) {
      const message = getErrorMessage(result, 'Invalid email or password')
      throw new Error(message)
    }

    const data = result.body

    const fallbackRole = selectedRole?.toUpperCase() === 'MANAGER' ? 'MANAGER' : selectedRole?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE'
    const normalizedRole = data.role?.replace(/^ROLE_/, '') || fallbackRole

    const user = {
      id: data.id,
      name: data.fullName,
      email: data.email,
      role: normalizedRole,
      avatar: data.avatarUrl || data.fullName?.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2),
      avatarColor: '#0052CC',
      title: normalizedRole === 'MANAGER' ? 'Project Manager' : 'Team Member',
      department: 'Engineering',
      joinedDate: new Date().toISOString().split('T')[0],
    }

    dispatch(loginSuccess({ user, token: data.token }))
    return user
  } catch (error) {
    dispatch(loginFailure(error.message || 'Login failed'))
    throw error
  }
}

export const loginWithGoogle = (selectedRole) => async (dispatch) => {
  dispatch(loginStart())
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const firebaseUser = result.user
    const displayName = firebaseUser.displayName || firebaseUser.email || 'Google User'
    const initials = displayName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    const role = selectedRole?.toUpperCase() === 'MANAGER' ? 'MANAGER' : selectedRole?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE'
    const roleToSend = role.startsWith('ROLE_') ? role : `ROLE_${role}`
    const payload = {
      email: firebaseUser.email,
      fullName: displayName,
      role: roleToSend,
      avatarUrl: firebaseUser.photoURL || null,
    }

    const googleResp = await fetch(`${API_BASE_URL}/api/auth/register/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const googleResult = await parseApiResponse(googleResp)
    if (!googleResult.ok) {
      const msg = getErrorMessage(googleResult, 'Google registration failed')
      throw new Error(msg)
    }

    const loginResponse = googleResult.body
    const token = loginResponse.token
    const userRole = loginResponse.role?.replace(/^ROLE_/, '') || role
    
    const user = {
      id: loginResponse.id,
      name: loginResponse.fullName,
      email: loginResponse.email,
      role: userRole,
      avatar: loginResponse.avatarUrl || initials,
      avatarColor: '#0052CC',
      title: userRole === 'MANAGER' ? 'Project Manager' : 'Team Member',
      department: 'Engineering',
      joinedDate: new Date().toISOString().split('T')[0],
    }

    dispatch(loginSuccess({ user, token }))
    return user
  } catch (error) {
    const errorMessage = error?.message || 'Google sign in failed'
    dispatch(loginFailure(errorMessage))
    throw error
  }
}

export const registerUser = (data) => async (dispatch) => {
  dispatch(loginStart())
  try {
    const roleToSend = data.role?.startsWith('ROLE_') ? data.role : `ROLE_${data.role}`
    const resp = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        fullName: data.name,
        role: roleToSend,
      }),
    })

    const result = await parseApiResponse(resp)
    if (!result.ok) {
      const msg = getErrorMessage(result, 'Registration failed')
      throw new Error(msg)
    }

    const resData = result.body

    const loggedIn = await dispatch(loginUser(data.email, data.password, roleToSend))
    return loggedIn
  } catch (error) {
    dispatch(loginFailure(error.message || 'Registration failed'))
    throw error
  }
}

export default authSlice.reducer
