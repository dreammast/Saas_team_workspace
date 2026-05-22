import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { X } from 'lucide-react'
import { createTask, updateTaskApi } from '../../store/slices/taskSlice'
import { closeModal } from '../../store/slices/uiSlice'

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const STATUSES = ['TO_DO', 'IN_PROGRESS', 'IN_REVIEW', 'TESTING', 'COMPLETED', 'BLOCKED']

export default function TaskModal({ mode = 'create' }) {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { projects, teamMembers } = useSelector(state => state.projects)
  const { tasks } = useSelector(state => state.tasks)
  const { modalData } = useSelector(state => state.ui)

  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    description: '',
    status: 'TO_DO',
    priority: 'MEDIUM',
    assignedTo: '',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    estimatedHours: '',
    storyPoints: '',
    labels: '',
  })

  // Select first project by default on create and apply optional prefilled values
  useEffect(() => {
    if (mode === 'create') {
      const defaultProjId = modalData?.projectId || (projects.length > 0 ? projects[0].id : '')
      const defaultStatus = modalData?.status || 'TO_DO'
      setFormData(prev => ({
        ...prev,
        projectId: prev.projectId || defaultProjId,
        status: prev.status === 'TO_DO' && defaultStatus !== 'TO_DO' ? defaultStatus : prev.status
      }))
    }
  }, [mode, projects, modalData])

  useEffect(() => {
    if (mode === 'edit' && modalData) {
      setFormData({
        id: modalData.id,
        projectId: modalData.projectId || '',
        title: modalData.title || '',
        description: modalData.description || '',
        status: modalData.status || 'TO_DO',
        priority: modalData.priority === 'HIGHEST' ? 'CRITICAL' : modalData.priority || 'MEDIUM',
        assignedTo: modalData.assignedTo || '',
        startDate: modalData.startDate || '',
        dueDate: modalData.dueDate || '',
        estimatedHours: modalData.estimatedHours || '',
        storyPoints: modalData.storyPoints || '',
        labels: modalData.labels ? modalData.labels.join(', ') : '',
      })
    }
  }, [mode, modalData])

  // Get eligible assignees (members of the selected project, or all if none selected)
  const selectedProj = projects.find(p => p.id === formData.projectId)
  const eligibleAssignees = selectedProj 
    ? teamMembers.filter(m => selectedProj.members?.includes(m.id))
    : teamMembers

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleClose = () => {
    dispatch(closeModal())
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const project = projects.find(p => p.id === formData.projectId)
    if (!project) return

    const assignee = teamMembers.find(m => m.id === formData.assignedTo)
    const formattedLabels = formData.labels
      ? formData.labels.split(',').map(l => l.trim()).filter(Boolean)
      : []

    const payload = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      storyPoints: Number(formData.storyPoints) || 0,
      estimatedHours: Number(formData.estimatedHours) || 0,
      dueDate: formData.dueDate,
      assignedTo: formData.assignedTo || null
    }

    if (mode === 'create') {
      dispatch(createTask(formData.projectId, payload))
      dispatch({
        type: 'ui/addToast',
        payload: { type: 'success', title: 'Task Created', message: `Task "${formData.title}" has been created successfully.` }
      })
    } else {
      dispatch(updateTaskApi(modalData.id, payload))
      dispatch({
        type: 'ui/addToast',
        payload: { type: 'success', title: 'Task Updated', message: `Task "${formData.title}" has been updated.` }
      })
    }

    handleClose()
  }

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: 650 }}>
        <div className="modal-header">
          <h2 className="modal-title">{mode === 'create' ? 'Create New Task' : 'Edit Task'}</h2>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Project Selection */}
            <div className="form-group mb-4">
              <label className="form-label required">Project</label>
              <select 
                name="projectId" 
                value={formData.projectId} 
                onChange={handleInputChange} 
                className="form-control"
                required
                disabled={mode === 'edit'}
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.key})
                  </option>
                ))}
              </select>
            </div>

            {/* Task Title */}
            <div className="form-group mb-4">
              <label className="form-label required">Summary / Title</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleInputChange} 
                className="form-control"
                placeholder="Brief summary of the work..."
                required
              />
            </div>

            {/* Description */}
            <div className="form-group mb-4">
              <label className="form-label">Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                className="form-control"
                placeholder="Explain the technical details and steps to reproduce or build..."
                rows={4}
              />
            </div>

            {/* Fields Grid */}
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="form-control">
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select name="priority" value={formData.priority} onChange={handleInputChange} className="form-control">
                  {PRIORITIES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assignee</label>
                <select name="assignedTo" value={formData.assignedTo} onChange={handleInputChange} className="form-control">
                  <option value="">Unassigned</option>
                  {eligibleAssignees.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Labels (comma-separated)</label>
                <input 
                  type="text" 
                  name="labels" 
                  value={formData.labels} 
                  onChange={handleInputChange} 
                  className="form-control"
                  placeholder="e.g. Frontend, React, Bug"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input 
                  type="date" 
                  name="startDate" 
                  value={formData.startDate} 
                  onChange={handleInputChange} 
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input 
                  type="date" 
                  name="dueDate" 
                  value={formData.dueDate} 
                  onChange={handleInputChange} 
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Hours</label>
                <input 
                  type="number" 
                  name="estimatedHours" 
                  value={formData.estimatedHours} 
                  onChange={handleInputChange} 
                  className="form-control"
                  placeholder="e.g. 16"
                  min={0}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Story Points</label>
                <input 
                  type="number" 
                  name="storyPoints" 
                  value={formData.storyPoints} 
                  onChange={handleInputChange} 
                  className="form-control"
                  placeholder="e.g. 8"
                  min={0}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{mode === 'create' ? 'Create Task' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
