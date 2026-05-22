import { useSelector, useDispatch } from 'react-redux'
import { 
  Plus, Calendar, DollarSign, CheckCircle2, AlertTriangle, 
  Trash2, Edit2, Users, Briefcase, Eye
} from 'lucide-react'
import { deleteProjectApi, setFilters } from '../store/slices/projectSlice'
import { openModal } from '../store/slices/uiSlice'

const PRIORITY_BADGES = {
  'LOW': 'badge-success',
  'MEDIUM': 'badge-primary',
  'HIGH': 'badge-warning',
  'CRITICAL': 'badge-danger',
}

export default function ProjectsPage() {
  const dispatch = useDispatch()
  const { projects, teamMembers, filters } = useSelector(state => state.projects)
  const { user } = useSelector(state => state.auth)

  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN'

  const handleOpenCreateModal = () => {
    dispatch(openModal({ type: 'CREATE_PROJECT', data: null }))
  }

  const handleOpenEditModal = (project) => {
    dispatch(openModal({ type: 'EDIT_PROJECT', data: project }))
  }

  const handleDeleteProject = (projectId, name) => {
    if (window.confirm(`Are you sure you want to delete project "${name}"? This will delete all associated statistics.`)) {
      dispatch(deleteProjectApi(projectId))
        .then(() => {
          dispatch({
            type: 'ui/addToast',
            payload: { type: 'warning', title: 'Project Deleted', message: `Project "${name}" has been deleted.` }
          })
        })
        .catch(err => {
          dispatch({
            type: 'ui/addToast',
            payload: { type: 'error', title: 'Delete Failed', message: err.message || 'Could not delete project.' }
          })
        })
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    dispatch(setFilters({ [name]: value }))
  }

  // Filter projects
  const filteredProjects = projects.filter(p => {
    const matchStatus = filters.status === 'all' || p.status === filters.status
    const matchPriority = filters.priority === 'all' || p.priority === filters.priority
    const matchSearch = !filters.search || p.name.toLowerCase().includes(filters.search.toLowerCase()) || p.key.toLowerCase().includes(filters.search.toLowerCase())
    return matchStatus && matchPriority && matchSearch
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#172B4D' }}>Projects</h2>
          <p style={{ fontSize: 13, color: '#6B778C' }}>Create and manage client products, development sprints, and client portfolios.</p>
        </div>
        {isManager && (
          <button 
            className="btn btn-primary btn-sm flex items-center gap-1"
            onClick={handleOpenCreateModal}
          >
            <Plus size={14} />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex justify-between items-center gap-3 p-3 border" style={{ background: 'white', borderRadius: 8, borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2" style={{ flex: 1 }}>
          <input 
            type="text" 
            name="search"
            value={filters.search || ''}
            onChange={handleFilterChange}
            className="form-control form-control-sm" 
            style={{ width: 220, height: 32, fontSize: 12 }} 
            placeholder="Search projects..." 
          />
          
          <select 
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="form-control form-control-sm"
            style={{ width: 140, height: 32, fontSize: 12 }}
          >
            <option value="all">All Statuses</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select 
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
            className="form-control form-control-sm"
            style={{ width: 140, height: 32, fontSize: 12 }}
          >
            <option value="all">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div style={{ fontSize: 12, color: '#6B778C', fontWeight: 500 }}>
          {filteredProjects.length} Projects Total
        </div>
      </div>

      {/* Project Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {filteredProjects.map(project => {
          // Get member details
          const membersList = teamMembers.filter(m => project.members?.includes(m.id))
          
          return (
            <div key={project.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderTop: `4px solid ${project.color || '#0052CC'}` }}>
              
              <div className="card-header" style={{ padding: 16, borderBottom: 'none' }}>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span 
                      className="project-key-badge" 
                      style={{ 
                        backgroundColor: project.color || '#0052CC',
                        fontSize: 10,
                        width: 22,
                        height: 22,
                        borderRadius: 4
                      }}
                    >
                      {project.key[0]}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#6B778C' }}>{project.key}</span>
                    <span className={`badge badge-sm badge-${project.status === 'COMPLETED' ? 'success' : project.status === 'IN_PROGRESS' ? 'primary' : 'secondary'}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-bold" style={{ fontSize: 16, color: '#172B4D', marginTop: 4 }}>{project.name}</h3>
                </div>

                {isManager && (
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <button 
                      className="icon-btn" 
                      style={{ width: 24, height: 24 }}
                      onClick={() => handleOpenEditModal(project)}
                      title="Edit Project"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button 
                      className="icon-btn text-danger" 
                      style={{ width: 24, height: 24 }}
                      onClick={() => handleDeleteProject(project.id, project.name)}
                      title="Delete Project"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>

              <div className="card-body" style={{ padding: '0 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 12, color: '#6B778C', lineHeight: 1.5, marginBottom: 16 }}>
                    {project.description || 'No description provided.'}
                  </p>

                  {/* Dates & Budget */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, fontSize: 11, color: '#6B778C' }}>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{project.startDate} to {project.endDate || 'TBD'}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign size={12} />
                      <span>Budget: ${project.budget?.toLocaleString() || '--'}</span>
                    </span>
                  </div>

                  {/* Task counts */}
                  <div className="flex gap-4 items-center mb-4" style={{ fontSize: 11, color: '#6B778C', background: 'var(--color-bg)', padding: '6px 10px', borderRadius: 4 }}>
                    <span className="flex items-center gap-1">
                      <Briefcase size={12} />
                      <span>{project.taskCount?.total || 0} Tickets</span>
                    </span>
                    <span className="flex items-center gap-1" style={{ color: '#00875A' }}>
                      <CheckCircle2 size={12} />
                      <span>{project.taskCount?.completed || 0} Done</span>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1" style={{ fontSize: 11, fontWeight: 600, color: '#172B4D' }}>
                      <span>Sprints Progress</span>
                      <span>{project.progress || 0}%</span>
                    </div>
                    <div style={{ height: 6, width: '100%', background: 'var(--color-border-subtle)', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${project.progress || 0}%`, background: project.color || '#0052CC', borderRadius: 3 }} />
                    </div>
                  </div>
                </div>

                {/* Team members */}
                <div className="flex justify-between items-center" style={{ paddingTop: 12, borderTop: '1px solid var(--color-border-subtle)' }}>
                  <div className="flex items-center">
                    <span style={{ fontSize: 11, color: '#6B778C', fontWeight: 600, marginRight: 8 }}>Team:</span>
                    <div className="flex" style={{ marginLeft: 4 }}>
                      {membersList.slice(0, 4).map((member, index) => (
                        <div 
                          key={member.id} 
                          className="user-avatar-sm"
                          style={{ 
                            backgroundColor: member.avatarColor || '#0052CC', 
                            marginLeft: index > 0 ? -6 : 0, 
                            border: '2px solid white',
                            width: 24,
                            height: 24,
                            fontSize: 8,
                            fontWeight: 700 
                          }}
                          title={member.name}
                        >
                          {member.avatar}
                        </div>
                      ))}
                      {membersList.length > 4 && (
                        <div 
                          className="user-avatar-sm flex items-center justify-center"
                          style={{ 
                            backgroundColor: '#6B778C', 
                            color: 'white',
                            marginLeft: -6, 
                            border: '2px solid white',
                            width: 24,
                            height: 24,
                            fontSize: 8,
                            fontWeight: 700 
                          }}
                        >
                          +{membersList.length - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className={`badge badge-sm ${PRIORITY_BADGES[project.priority] || 'badge-secondary'}`} style={{ fontWeight: 600 }}>
                    {project.priority} PRIORITY
                  </span>
                </div>

              </div>
            </div>
          )
        })}

        {filteredProjects.length === 0 && (
          <div className="card" style={{ gridColumn: 'span 3', padding: 48, textAlign: 'center' }}>
            <div className="flex flex-col items-center justify-center gap-2">
              <AlertTriangle size={36} color="#FF991F" style={{ opacity: 0.6 }} />
              <h4 style={{ fontSize: 15, fontWeight: 600 }}>No Projects Matching Filters</h4>
              <p style={{ fontSize: 12, color: '#6B778C' }}>Try selecting a different status or priority option.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
