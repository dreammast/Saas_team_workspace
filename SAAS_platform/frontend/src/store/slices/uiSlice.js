import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sidebarCollapsed: false,
  activeModal: null,
  modalData: null,
  searchOpen: false,
  notificationPanelOpen: false,
  userMenuOpen: false,
  theme: 'light',
  toasts: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    openModal: (state, action) => {
      state.activeModal = action.payload.type
      state.modalData = action.payload.data || null
    },
    closeModal: (state) => {
      state.activeModal = null
      state.modalData = null
    },
    toggleSearch: (state) => {
      state.searchOpen = !state.searchOpen
    },
    toggleNotificationPanel: (state) => {
      state.notificationPanelOpen = !state.notificationPanelOpen
      if (state.notificationPanelOpen) state.userMenuOpen = false
    },
    closeNotificationPanel: (state) => {
      state.notificationPanelOpen = false
    },
    toggleUserMenu: (state) => {
      state.userMenuOpen = !state.userMenuOpen
      if (state.userMenuOpen) state.notificationPanelOpen = false
    },
    closeUserMenu: (state) => {
      state.userMenuOpen = false
    },
    addToast: (state, action) => {
      state.toasts.push({ id: Date.now(), ...action.payload })
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload)
    },
  },
})

export const {
  toggleSidebar, openModal, closeModal,
  toggleSearch, toggleNotificationPanel, closeNotificationPanel,
  toggleUserMenu, closeUserMenu, addToast, removeToast,
} = uiSlice.actions
export default uiSlice.reducer
