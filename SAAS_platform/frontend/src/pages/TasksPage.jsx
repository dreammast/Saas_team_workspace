import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { 
  Plus, Search, SlidersHorizontal, List, Kanban, Table, 
  Calendar, CheckCircle2, AlertCircle, Edit2, Trash2, ArrowUpRight
} from 'lucide-react'
import { 
  updateTaskStatusApi, deleteTaskApi, setFilters, setViewMode 
} from '../store/slices/taskSlice'
import { openModal } from '../store/slices/uiSlice'
import UserAvatar from '../components/common/UserAvatar'

const COLUMNS = [
  { id: 'TO_DO', title: 'To Do', color: '#6B778C' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: '#0052CC' },
  { id: 'IN_REVIEW', title: 'In Review', color: '#6554C0' },
  { id: 'TESTING', title: 'Testing', color: '#FF991F' },
  { id: 'COMPLETED', title: 'Completed', color: '#00875A' },
  { id: 'BLOCKED', title: 'Blocked', color: '#DE350B' },
]

const STATUS_COLORS = {
  'TO_DO': '#6B778C',
  'IN_PROGRESS': '#0052CC',
  'IN_REVIEW': '#6554C0',
  'TESTING': '#FF991F',
  'COMPLETED': '#00875A',
  'BLOCKED': '#DE350B',
}

const PRIORITY_STYLES = {
  'LOW': { bg: 'rgba(38, 132, 255, 0.1)', text: '#2684FF' },
  'MEDIUM': { bg: 'rgba(255, 153, 31, 0.1)', text: '#FF991F' },
  'HIGH': { bg: 'rgba(255, 116, 82, 0.1)', text: '#FF7452' },
  'CRITICAL': { bg: 'rgba(222, 53, 11, 0.1)', text: '#DE350B' },
  'HIGHEST': { bg: 'rgba(222, 53, 11, 0.1)', text: '#DE350B' },
}

export default function TasksPage() {
  const dispatch = useDispatch()
  
  const { tasks, filters, viewMode } = useSelector(state => state.tasks)
  const { projects, teamMembers } = useSelector(state => state.projects)
  const { user } = useSelector(state => state.auth)

  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN'

  // Handle Drag & Drop End
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result
    
    // Dropped outside a valid column
    if (!destination) return
    
    // Dropped in the same column at the same index
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return

    dispatch(updateTaskStatusApi(draggableId, destination.droppableId))

    dispatch({
      type: 'ui/addToast',
      payload: { 
        type: 'success', 
        title: 'Status Updated', 
        message: `Task status updated to ${destination.droppableId.replace('_', ' ')}.` 
      }
    })
  }

  // Handle Filter Changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    dispatch(setFilters({ [name]: value }))
  }

  // Clear Filters
  const handleResetFilters = () => {
    dispatch(setFilters({
      status: 'all',
      priority: 'all',
      project: 'all',
      assignee: 'all',
      search: '',
    }))
  }

  // Filter Tasks
  const filteredTasks = tasks.filter(task => {
    const matchProject = filters.project === 'all' || String(task.projectId) === String(filters.project)
    const matchPriority = filters.priority === 'all' || task.priority === filters.priority
    const matchAssignee = filters.assignee === 'all' || String(task.assignedTo) === String(filters.assignee)
    const matchStatus = filters.status === 'all' || task.status === filters.status
    const matchSearch = !filters.search || 
      task.title.toLowerCase().includes(filters.search.toLowerCase()) || 
      task.key.toLowerCase().includes(filters.search.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(filters.search.toLowerCase()))

    return matchProject && matchPriority && matchAssignee && matchStatus && matchSearch
  })

  const handleEditTask = (task) => {
    dispatch(openModal({ type: 'EDIT_TASK', data: task }))
  }

  const handleDeleteTask = (taskId, title) => {
    if (window.confirm(`Are you sure you want to delete task "${title}"?`)) {
      dispatch(deleteTaskApi(taskId))
      dispatch({
        type: 'ui/addToast',
        payload: { type: 'warning', title: 'Task Deleted', message: `Task "${title}" has been deleted.` }
      })
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Page Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#172B4D' }}>Sprint Backlog</h2>
          <p style={{ fontSize: 13, color: '#6B778C' }}>Manage development tickets, sprint tasks, and track statuses.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggles */}
          <div className="flex border" style={{ borderRadius: 6, background: 'white', padding: 2, borderColor: 'var(--color-border)' }}>
            <button 
              className={`icon-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              style={{ width: 28, height: 28, borderRadius: 4, background: viewMode === 'kanban' ? '#DEEBFF' : 'none', color: viewMode === 'kanban' ? '#0052CC' : '#6B778C' }}
              onClick={() => dispatch(setViewMode('kanban'))}
              title="Kanban Board"
            >
              <Kanban size={14} />
            </button>
            <button 
              className={`icon-btn ${viewMode === 'list' ? 'active' : ''}`}
              style={{ width: 28, height: 28, borderRadius: 4, background: viewMode === 'list' ? '#DEEBFF' : 'none', color: viewMode === 'list' ? '#0052CC' : '#6B778C' }}
              onClick={() => dispatch(setViewMode('list'))}
              title="List View"
            >
              <List size={14} />
            </button>
          </div>
          
          <button 
            className="btn btn-primary btn-sm flex items-center gap-1"
            onClick={() => dispatch(openModal({ type: 'CREATE_TASK' }))}
          >
            <Plus size={14} />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex justify-between items-center gap-3 p-3 border shrink-0" style={{ background: 'white', borderRadius: 8, borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2 flex-wrap" style={{ flex: 1 }}>
          <div className="relative" style={{ minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6B778C' }} />
            <input 
              type="text" 
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="form-control form-control-sm" 
              style={{ paddingLeft: 30, height: 32, fontSize: 12 }} 
              placeholder="Search keys, titles..." 
            />
          </div>

          <select 
            name="project"
            value={filters.project}
            onChange={handleFilterChange}
            className="form-control form-control-sm"
            style={{ width: 140, height: 32, fontSize: 12, padding: '0 8px' }}
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select 
            name="assignee"
            value={filters.assignee}
            onChange={handleFilterChange}
            className="form-control form-control-sm"
            style={{ width: 140, height: 32, fontSize: 12, padding: '0 8px' }}
          >
            <option value="all">All Assignees</option>
            <option value={user?.id}>Assigned to Me</option>
            {teamMembers.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          <select 
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
            className="form-control form-control-sm"
            style={{ width: 120, height: 32, fontSize: 12, padding: '0 8px' }}
          >
            <option value="all">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          {(filters.project !== 'all' || filters.priority !== 'all' || filters.assignee !== 'all' || filters.search) && (
            <button 
              className="btn btn-ghost btn-sm text-xs font-semibold" 
              style={{ color: '#0052CC', padding: '4px 8px' }}
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          )}
        </div>
        
        <div style={{ fontSize: 12, color: '#6B778C', fontWeight: 500 }}>
          Showing {filteredTasks.length} tasks
        </div>
      </div>

      {/* Main Backlog Views */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'kanban' ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <div 
              className="kanban-board-container" 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(6, 280px)', 
                gap: 12, 
                overflowX: 'auto', 
                height: '100%',
                paddingBottom: 8 
              }}
            >
              {COLUMNS.map(col => {
                const colTasks = filteredTasks.filter(t => t.status === col.id)
                return (
                  <div 
                    key={col.id} 
                    className="kanban-column"
                    style={{ 
                      background: '#F4F5F7', 
                      borderRadius: 8, 
                      padding: 10, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      maxHeight: '100%',
                      boxShadow: 'inset 0 0 4px rgba(0,0,0,0.02)'
                    }}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-3 shrink-0" style={{ padding: '2px 4px' }}>
                      <div className="flex items-center gap-2">
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#172B4D' }}>{col.title}</span>
                        <span className="badge badge-sm" style={{ background: 'rgba(9, 30, 66, 0.08)', color: '#6B778C' }}>{colTasks.length}</span>
                      </div>
                      <button 
                        className="sidebar-section-btn" 
                        onClick={() => dispatch(openModal({ type: 'CREATE_TASK', data: { status: col.id } }))}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Droppable Area */}
                    <Droppable droppableId={col.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="kanban-cards-wrapper flex-1 overflow-y-auto flex flex-col gap-2"
                          style={{ 
                            padding: 2, 
                            minHeight: 150,
                            background: snapshot.isDraggingOver ? 'rgba(0,82,204,0.03)' : 'transparent',
                            borderRadius: 6,
                            transition: 'background-color 0.2s ease'
                          }}
                        >
                          {colTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="card kanban-card flex flex-col gap-2 hover-bg"
                                  onClick={() => handleEditTask(task)}
                                  style={{
                                    ...provided.draggableProps.style,
                                    padding: 12,
                                    cursor: 'grab',
                                    userSelect: 'none',
                                    borderLeft: `3px solid ${task.projectColor || col.color}`,
                                    boxShadow: snapshot.isDragging ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                                    transform: snapshot.isDragging ? 'rotate(1.5deg)' : 'none',
                                    transition: 'box-shadow 0.15s ease'
                                  }}
                                >
                                  {/* Project and Key */}
                                  <div className="flex justify-between items-center">
                                    <span style={{ fontSize: 10, color: '#6B778C', fontWeight: 700 }}>
                                      {task.key}
                                    </span>
                                    <span 
                                      className="badge badge-sm font-semibold"
                                      style={{ 
                                        background: PRIORITY_STYLES[task.priority]?.bg || '#DFE1E6', 
                                        color: PRIORITY_STYLES[task.priority]?.text || '#6B778C',
                                        fontSize: 9
                                      }}
                                    >
                                      {task.priority}
                                    </span>
                                  </div>

                                  {/* Task Title */}
                                  <h4 style={{ fontSize: 13, fontWeight: 600, color: '#172B4D', margin: 0, lineHeight: 1.4 }}>
                                    {task.title}
                                  </h4>

                                  {/* Labels */}
                                  {task.labels && task.labels.length > 0 && (
                                    <div className="flex gap-1 flex-wrap" style={{ marginTop: 2 }}>
                                      {task.labels.map(l => (
                                        <span key={l} className="badge badge-sm text-xs" style={{ background: '#F4F5F7', color: '#6B778C', borderRadius: 3, fontSize: 9 }}>
                                          {l}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Card Footer */}
                                  <div className="flex justify-between items-center mt-2" style={{ paddingTop: 8, borderTop: '1px solid var(--color-border-subtle)' }}>
                                    <div className="flex gap-2 items-center text-xs" style={{ color: '#97A0AF' }}>
                                      {task.dueDate && (
                                        <span className="flex items-center gap-1">
                                          <Calendar size={10} />
                                          <span style={{ fontSize: 10 }}>{task.dueDate.split('-').slice(1).join('/')}</span>
                                        </span>
                                      )}
                                      {task.storyPoints > 0 && (
                                        <span className="badge badge-sm font-semibold" style={{ background: 'var(--color-primary-subtle)', color: '#0052CC', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                                          {task.storyPoints}
                                        </span>
                                      )}
                                    </div>

                                    {/* Assignee Avatar */}
                                    <UserAvatar
                                      avatar={task.assignedAvatar}
                                      name={task.assignedName}
                                      avatarColor={task.assignedColor || '#6B778C'}
                                      size="xs"
                                    />
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                )
              })}
            </div>
          </DragDropContext>
        ) : (
          /* List View */
          <div className="card h-full flex flex-col overflow-hidden">
            <div className="card-body overflow-y-auto flex-1 p-0">
              <table className="w-full" style={{ borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F4F5F7', borderBottom: '1px solid var(--color-border)', fontSize: 11, fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px', width: 80 }}>Key</th>
                    <th style={{ padding: '12px 16px' }}>Summary</th>
                    <th style={{ padding: '12px 16px', width: 120 }}>Project</th>
                    <th style={{ padding: '12px 16px', width: 130 }}>Assignee</th>
                    <th style={{ padding: '12px 16px', width: 100 }}>Status</th>
                    <th style={{ padding: '12px 16px', width: 100 }}>Priority</th>
                    <th style={{ padding: '12px 16px', width: 100 }}>Due Date</th>
                    <th style={{ padding: '12px 16px', width: 80, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map(task => (
                    <tr 
                      key={task.id} 
                      className="hover-bg border-b"
                      style={{ borderBottomColor: 'var(--color-border-subtle)', cursor: 'pointer' }}
                      onClick={() => handleEditTask(task)}
                    >
                      <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#6B778C' }}>{task.key}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold" style={{ fontSize: 13, color: '#172B4D' }}>{task.title}</span>
                          {task.labels && task.labels.length > 0 && (
                            <div className="flex gap-1">
                              {task.labels.map(l => (
                                <span key={l} className="badge badge-sm" style={{ background: 'var(--color-border-subtle)', color: '#6B778C', fontSize: 9 }}>{l}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="flex items-center gap-2">
                          <span className="project-key-badge" style={{ backgroundColor: task.projectColor, fontSize: 8, width: 16, height: 16 }}>{task.projectKey[0]}</span>
                          <span style={{ fontSize: 13 }}>{task.projectName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            avatar={task.assignedAvatar}
                            name={task.assignedName}
                            avatarColor={task.assignedColor}
                            size="xs"
                          />
                          <span style={{ fontSize: 12 }}>{task.assignedName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`badge badge-sm`} style={{ background: `${STATUS_COLORS[task.status]}15`, color: STATUS_COLORS[task.status], fontWeight: 600 }}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`badge badge-sm`} style={{ background: `${PRIORITY_STYLES[task.priority]?.bg}`, color: PRIORITY_STYLES[task.priority]?.text, fontWeight: 600 }}>
                          {task.priority}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#6B778C' }}>{task.dueDate || '--'}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <button 
                            className="icon-btn" 
                            style={{ width: 24, height: 24 }}
                            onClick={() => handleEditTask(task)}
                          >
                            <Edit2 size={12} />
                          </button>
                          {isManager && (
                            <button 
                              className="icon-btn text-danger" 
                              style={{ width: 24, height: 24 }}
                              onClick={() => handleDeleteTask(task.id, task.title)}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTasks.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: 48, textAlign: 'center' }}>
                        <div className="flex flex-col items-center justify-center gap-2">
                          <CheckCircle2 size={36} color="#00875A" style={{ opacity: 0.5 }} />
                          <h4 style={{ fontSize: 14, fontWeight: 600 }}>No Tasks Found</h4>
                          <p style={{ fontSize: 12, color: '#6B778C' }}>Try adjusting your filters or search keywords.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
