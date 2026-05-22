import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts'
import { 
  Folder, CheckSquare, Users, AlertCircle, TrendingUp, 
  Clock, Award, Calendar, CheckCircle2, ChevronRight, Play
} from 'lucide-react'
import { openModal } from '../store/slices/uiSlice'
import UserAvatar from '../components/common/UserAvatar'

// Chart Colors
const STATUS_COLORS = {
  'TO_DO': '#6B778C',
  'IN_PROGRESS': '#0052CC',
  'IN_REVIEW': '#6554C0',
  'TESTING': '#FF991F',
  'COMPLETED': '#00875A',
  'BLOCKED': '#DE350B',
}

const PRIORITY_COLORS = {
  'LOW': '#2684FF',
  'MEDIUM': '#FF991F',
  'HIGH': '#FF7452',
  'CRITICAL': '#DE350B',
  'HIGHEST': '#DE350B',
}

export default function DashboardPage() {
  const { user } = useSelector(state => state.auth)
  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN'

  if (isManager) {
    return <ManagerDashboard user={user} />
  }
  return <EmployeeDashboard user={user} />
}

/* ============================================================================
   MANAGER DASHBOARD
   ============================================================================ */
function ManagerDashboard({ user }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const projects = useSelector(state => state.projects.projects)
  const teamMembers = useSelector(state => state.projects.teamMembers)
  const tasks = useSelector(state => state.tasks.tasks)

  // 1. Calculate Stats
  const totalProjects = projects.length
  const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length
  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length
  
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'COMPLETED') return false
    if (!t.dueDate) return false
    return new Date(t.dueDate) < new Date()
  }).length

  // 2. Data for Status Pie Chart
  const tasksByStatus = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1
    return acc
  }, {})

  const pieData = Object.keys(tasksByStatus).map(status => ({
    name: status.replace('_', ' '),
    value: tasksByStatus[status],
    color: STATUS_COLORS[status] || '#6B778C'
  }))

  // 3. Workload Data by Team Member (Bar Chart)
  const workloadData = teamMembers.map(member => {
    const memberTasks = tasks.filter(t => String(t.assignedTo) === String(member.id))
    return {
      name: member.name.split(' ')[0], // First name
      tasks: memberTasks.length,
      completed: memberTasks.filter(t => t.status === 'COMPLETED').length,
    }
  })

  // 4. Productivity Over Time (Area Chart - static mockup for demo)
  const productivityData = [
    { name: 'Sprint 1', completed: 12, storyPoints: 45 },
    { name: 'Sprint 2', completed: 18, storyPoints: 58 },
    { name: 'Sprint 3', completed: 25, storyPoints: 80 },
    { name: 'Sprint 4', completed: 20, storyPoints: 68 },
    { name: 'Sprint 5', completed: 32, storyPoints: 104 },
    { name: 'Sprint 6', completed: 28, storyPoints: 92 },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#172B4D' }}>Welcome, {user.name}</h2>
          <p style={{ fontSize: 14, color: '#6B778C' }}>Here is a performance and workload summary of your workspace.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/analytics')}
          >
            Detailed Analytics
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => dispatch(openModal({ type: 'CREATE_TASK' }))}
          >
            Create Task
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        
        {/* Projects Card */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Projects</span>
            <div className="stat-icon" style={{ background: 'rgba(0, 82, 204, 0.1)', color: '#0052CC' }}>
              <Folder size={18} />
            </div>
          </div>
          <div className="stat-value">{totalProjects}</div>
          <div className="stat-trend up" style={{ fontSize: 11 }}>
            <TrendingUp size={12} />
            <span>{activeProjects} Active Sprints</span>
          </div>
        </div>

        {/* Completion Rate Card */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Task Completion</span>
            <div className="stat-icon" style={{ background: 'rgba(0, 135, 90, 0.1)', color: '#00875A' }}>
              <CheckSquare size={18} />
            </div>
          </div>
          <div className="stat-value">{taskCompletionRate}%</div>
          <div className="progress-bar-container" style={{ width: '100%', height: 4, background: '#DFE1E6', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${taskCompletionRate}%`, background: '#00875A', borderRadius: 2 }} />
          </div>
        </div>

        {/* Overdue Card */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Overdue Tasks</span>
            <div className="stat-icon" style={{ background: 'rgba(222, 53, 11, 0.1)', color: '#DE350B' }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: overdueTasks > 0 ? '#DE350B' : '#172B4D' }}>{overdueTasks}</div>
          <div style={{ fontSize: 11, color: '#6B778C' }}>
            Requires team updates
          </div>
        </div>

        {/* Team Members Card */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Team Members</span>
            <div className="stat-icon" style={{ background: 'rgba(101, 84, 192, 0.1)', color: '#6554C0' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="stat-value">{teamMembers.length}</div>
          <div style={{ fontSize: 11, color: '#6B778C' }}>
            Active contributors
          </div>
        </div>
      </div>

      {/* Main Charts Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Sprint Productivity Area Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Sprint Productivity (Tasks Resolved)</h3>
            <span style={{ fontSize: 12, color: '#00875A', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
              <TrendingUp size={14} /> +24% YoY
            </span>
          </div>
          <div className="card-body" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0052CC" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0052CC" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBECF0" />
                <XAxis dataKey="name" stroke="#6B778C" fontSize={11} tickLine={false} />
                <YAxis stroke="#6B778C" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="completed" name="Resolved Tasks" stroke="#0052CC" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Task Distribution</h3>
          </div>
          <div className="card-body flex justify-center items-center" style={{ height: 300, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Summary */}
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{totalTasks}</div>
              <div style={{ fontSize: 11, color: '#6B778C' }}>Total Tasks</div>
            </div>
          </div>
          {/* Status Legends */}
          <div className="flex gap-2 justify-center flex-wrap" style={{ padding: '0px 16px 16px', fontSize: 11 }}>
            {pieData.map(d => (
              <span key={d.name} className="flex items-center gap-1">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                <span style={{ color: '#6B778C' }}>{d.name}: {d.value}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Team Workload & Active Tasks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Workload Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Team Workload Distribution</h3>
          </div>
          <div className="card-body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBECF0" />
                <XAxis dataKey="name" stroke="#6B778C" fontSize={11} tickLine={false} />
                <YAxis stroke="#6B778C" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="tasks" name="Assigned Tasks" fill="#0052CC" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#00875A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Blockers list */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Critical & Blocked Tasks</h3>
            <button className="btn-link" onClick={() => navigate('/tasks')}>View all</button>
          </div>
          <div className="card-body overflow-y-auto" style={{ height: 280, padding: 0 }}>
            {tasks.filter(t => t.priority === 'CRITICAL' || t.status === 'BLOCKED').slice(0, 4).map(t => (
              <div 
                key={t.id} 
                className="flex justify-between items-center p-3 border-b hover-bg"
                style={{ borderBottomColor: 'var(--color-border-subtle)', cursor: 'pointer' }}
                onClick={() => navigate('/tasks')}
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="project-key-badge" style={{ backgroundColor: t.projectColor, fontSize: 8, width: 14, height: 14 }}>{t.projectKey[0]}</span>
                    <span style={{ fontSize: 11, color: '#6B778C', fontWeight: 600 }}>{t.key}</span>
                    <span className={`badge badge-sm badge-${t.status === 'BLOCKED' ? 'danger' : 'warning'}`}>{t.status}</span>
                  </div>
                  <span className="font-semibold truncate" style={{ fontSize: 13, color: '#172B4D' }}>{t.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <UserAvatar
                    avatar={t.assignedAvatar}
                    name={t.assignedName}
                    avatarColor={t.assignedColor}
                    size="xs"
                  />
                  <ChevronRight size={16} color="#97A0AF" />
                </div>
              </div>
            ))}
            {tasks.filter(t => t.priority === 'CRITICAL' || t.status === 'BLOCKED').length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-2" style={{ padding: 24 }}>
                <CheckCircle2 size={36} color="#00875A" style={{ opacity: 0.5 }} />
                <span style={{ fontSize: 13, color: '#6B778C', fontWeight: 500 }}>No critical blockers or blocked items.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================================================
   EMPLOYEE DASHBOARD
   ============================================================================ */
function EmployeeDashboard({ user }) {
  const navigate = useNavigate()
  
  const tasks = useSelector(state => state.tasks.tasks)
  
  // 1. Calculations
  const myTasks = tasks.filter(t => String(t.assignedTo) === String(user.id))
  const todoTasksCount = myTasks.filter(t => t.status === 'TO_DO' || t.status === 'IN_PROGRESS').length
  const completedTasksCount = myTasks.filter(t => t.status === 'COMPLETED').length
  const reviewTasksCount = myTasks.filter(t => t.status === 'IN_REVIEW' || t.status === 'TESTING').length
  
  const storyPointsResolved = myTasks
    .filter(t => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + (t.storyPoints || 0), 0)

  // 2. Upcoming Deadlines (within next 7 days, uncompleted)
  const upcomingTasks = myTasks
    .filter(t => t.status !== 'COMPLETED' && t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3)

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting Header */}
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#172B4D' }}>Good Afternoon, {user.name}</h2>
        <p style={{ fontSize: 14, color: '#6B778C' }}>Here is a checklist of your assigned workload for the sprint.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        
        {/* Active Workload */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">My Active Tasks</span>
            <div className="stat-icon" style={{ background: 'rgba(0, 82, 204, 0.1)', color: '#0052CC' }}>
              <Play size={16} />
            </div>
          </div>
          <div className="stat-value">{todoTasksCount}</div>
          <div style={{ fontSize: 11, color: '#6B778C' }}>To Do or In Progress</div>
        </div>

        {/* Story Points Resolved */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Points Resolved</span>
            <div className="stat-icon" style={{ background: 'rgba(0, 135, 90, 0.1)', color: '#00875A' }}>
              <Award size={16} />
            </div>
          </div>
          <div className="stat-value">{storyPointsResolved}</div>
          <div style={{ fontSize: 11, color: '#6B778C' }}>From completed tickets</div>
        </div>

        {/* Pending Review */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Pending Review</span>
            <div className="stat-icon" style={{ background: 'rgba(101, 84, 192, 0.1)', color: '#6554C0' }}>
              <Clock size={16} />
            </div>
          </div>
          <div className="stat-value">{reviewTasksCount}</div>
          <div style={{ fontSize: 11, color: '#6B778C' }}>In Review or Testing</div>
        </div>

        {/* Resolved this sprint */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Tasks Completed</span>
            <div className="stat-icon" style={{ background: 'rgba(0, 135, 90, 0.1)', color: '#00875A' }}>
              <CheckSquare size={16} />
            </div>
          </div>
          <div className="stat-value">{completedTasksCount}</div>
          <div style={{ fontSize: 11, color: '#6B778C' }}>Fully resolved</div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* My Assigned Tasks List */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">My Tasks Checklist</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tasks')}>Go to Kanban</button>
          </div>
          <div className="card-body overflow-y-auto" style={{ height: 350, padding: 0 }}>
            {myTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center" style={{ padding: 48 }}>
                <CheckCircle2 size={48} color="#00875A" style={{ opacity: 0.5, marginBottom: 8 }} />
                <h4 style={{ fontSize: 15, fontWeight: 600 }}>All Caught Up!</h4>
                <p style={{ fontSize: 13, color: '#6B778C', maxWidth: 300 }}>No tasks are currently assigned to you. Enjoy your clean backlog!</p>
              </div>
            ) : (
              myTasks.slice(0, 6).map(t => (
                <div 
                  key={t.id} 
                  className="flex justify-between items-center p-3 border-b hover-bg"
                  style={{ borderBottomColor: 'var(--color-border-subtle)', cursor: 'pointer' }}
                  onClick={() => navigate('/tasks')}
                >
                  <div className="flex flex-col gap-1 min-w-0" style={{ flex: 1 }}>
                    <div className="flex items-center gap-2">
                      <span className="project-key-badge" style={{ backgroundColor: t.projectColor, fontSize: 8, width: 14, height: 14 }}>{t.projectKey[0]}</span>
                      <span style={{ fontSize: 11, color: '#6B778C', fontWeight: 600 }}>{t.key}</span>
                      <span className={`badge badge-sm badge-${t.status === 'COMPLETED' ? 'success' : t.status === 'IN_PROGRESS' ? 'primary' : 'secondary'}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="font-semibold truncate" style={{ fontSize: 13, color: '#172B4D' }}>{t.title}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span style={{ fontSize: 11, color: '#6B778C', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} /> {t.dueDate || 'No due date'}
                    </span>
                    <span className={`badge badge-sm`} style={{ background: PRIORITY_COLORS[t.priority] + '15', color: PRIORITY_COLORS[t.priority], fontWeight: 600 }}>
                      {t.priority}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Deadlines Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Upcoming Deadlines */}
          <div className="card flex-1">
            <div className="card-header">
              <h3 className="card-title">Upcoming Deadlines</h3>
            </div>
            <div className="card-body flex flex-col gap-3" style={{ padding: 16 }}>
              {upcomingTasks.map(t => {
                const diffMs = new Date(t.dueDate) - new Date()
                const diffDays = Math.ceil(diffMs / (86400000))
                const isUrgent = diffDays <= 3
                return (
                  <div 
                    key={t.id} 
                    className="flex flex-col gap-1 p-3 border" 
                    style={{ borderRadius: 6, borderColor: isUrgent ? 'rgba(222, 53, 11, 0.2)' : 'var(--color-border-subtle)', background: isUrgent ? '#FFEBE6' : 'white', cursor: 'pointer' }}
                    onClick={() => navigate('/tasks')}
                  >
                    <div className="flex justify-between items-center">
                      <span style={{ fontSize: 10, color: isUrgent ? '#DE350B' : '#6B778C', fontWeight: 700 }}>{t.key}</span>
                      <span style={{ fontSize: 10, color: isUrgent ? '#DE350B' : '#6B778C', fontWeight: 600 }}>
                        {diffDays < 0 ? 'Overdue!' : diffDays === 0 ? 'Due Today' : diffDays === 1 ? 'Due Tomorrow' : `In ${diffDays} days`}
                      </span>
                    </div>
                    <span className="font-semibold truncate" style={{ fontSize: 12, color: '#172B4D' }}>{t.title}</span>
                  </div>
                )
              })}
              {upcomingTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                  <CheckCircle2 size={24} color="#00875A" style={{ opacity: 0.5 }} />
                  <span style={{ fontSize: 12, color: '#6B778C' }}>No urgent deadlines.</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="card" style={{ background: 'var(--color-primary-subtle)', border: 'none' }}>
            <div className="card-body flex flex-col gap-2" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0747A6' }}>Need support?</h4>
              <p style={{ fontSize: 11, color: '#172B4D', opacity: 0.8, lineHeight: 1.4 }}>If you face any issues with tasks or assignments, request updates from your Engineering Lead via messages.</p>
              <button 
                className="btn btn-primary btn-sm mt-2" 
                style={{ width: 'fit-content' }}
                onClick={() => navigate('/messages')}
              >
                Go to Messages
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
