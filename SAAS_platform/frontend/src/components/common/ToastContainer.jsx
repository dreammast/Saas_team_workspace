import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { removeToast } from '../../store/slices/uiSlice'

export default function ToastContainer() {
  const toasts = useSelector(state => state.ui.toasts)
  const dispatch = useDispatch()

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => dispatch(removeToast(toast.id))}
        />
      ))}
    </div>
  )
}

function ToastItem({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={16} className="toast-icon text-success" />
      case 'error':
        return <AlertCircle size={16} className="toast-icon text-danger" />
      case 'warning':
        return <AlertTriangle size={16} className="toast-icon text-warning" />
      case 'info':
      default:
        return <Info size={16} className="toast-icon text-info" />
    }
  }

  return (
    <div className={`toast-item ${toast.type || 'info'}`}>
      {getIcon()}
      <div className="toast-content">
        {toast.title && <div className="toast-title">{toast.title}</div>}
        <div className="toast-message">{toast.message}</div>
      </div>
      <button className="toast-close-btn" onClick={onClose}>
        <X size={14} />
      </button>
    </div>
  )
}
