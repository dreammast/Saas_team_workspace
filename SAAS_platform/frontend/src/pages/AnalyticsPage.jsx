import { useSelector } from 'react-redux'
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line
} from 'recharts'
import { BarChart2, TrendingUp, DollarSign, Calendar, Target, Award } from 'lucide-react'

const COLORS = ['#0052CC', '#6554C0', '#00875A', '#FF991F', '#FF5630', '#00B8D9']

export default function AnalyticsPage() {
  const projects = useSelector(state => state.projects.projects)
  const teamMembers = useSelector(state => state.projects.teamMembers)
  const tasks = useSelector(state => state.tasks.tasks)

  // 1. Task Status Distribution
  const tasksByStatus = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1
    return acc
  }, {})
  const pieData = Object.keys(tasksByStatus).map((status, index) => ({
    name: status.replace('_', ' '),
    value: tasksByStatus[status],
    color: COLORS[index % COLORS.length]
  }))

  // 2. Sprint Burndown Chart Data (Standard 10-day sprint mockup)
  const burndownData = [
    { day: 'Day 0', target: 80, actual: 80 },
    { day: 'Day 1', target: 72, actual: 78 },
    { day: 'Day 2', target: 64, actual: 75 },
    { day: 'Day 3', target: 56, actual: 68 },
    { day: 'Day 4', target: 48, actual: 50 },
    { day: 'Day 5', target: 40, actual: 44 },
    { day: 'Day 6', target: 32, actual: 32 },
    { day: 'Day 7', target: 24, actual: 28 },
    { day: 'Day 8', target: 16, actual: 20 },
    { day: 'Day 9', target: 8, actual: 10 },
    { day: 'Day 10', target: 0, actual: 0 },
  ]

  // 3. Project Budget Allocations (Horizontal Bar Chart)
  const budgetData = projects.map(p => ({
    name: p.key,
    budget: p.budget || 0,
    progress: p.progress || 0
  }))

  // 4. Developer Productivity/Story Points Completed
  const memberProductivity = teamMembers.map((member, index) => {
    const memberTasks = tasks.filter(t => String(t.assignedTo) === String(member.id) && t.status === 'COMPLETED')
    const totalPoints = memberTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0)
    return {
      name: member.name.split(' ')[0],
      storyPoints: totalPoints,
      color: COLORS[index % COLORS.length]
    }
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#172B4D' }}>Sprint & Project Analytics</h2>
          <p style={{ fontSize: 13, color: '#6B778C' }}>Deep-dive analysis of velocity, sprint burn rates, and financial allocations.</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        
        {/* Sprint Burndown */}
        <div className="card">
          <div className="card-header">
            <div className="flex flex-col">
              <h3 className="card-title">Sprint 4 Burndown Rate</h3>
              <span style={{ fontSize: 11, color: '#6B778C' }}>Story points remaining vs guideline timeline</span>
            </div>
            <div className="flex items-center gap-1" style={{ fontSize: 11, color: '#6B778C', fontWeight: 500 }}>
              <Target size={12} /> Target: 80 Pts
            </div>
          </div>
          <div className="card-body" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={burndownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBECF0" />
                <XAxis dataKey="day" stroke="#6B778C" fontSize={11} tickLine={false} />
                <YAxis stroke="#6B778C" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="target" name="Guidelines Target" stroke="#FF7452" strokeWidth={2} strokeDasharray="5 5" activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="actual" name="Actual Burndown" stroke="#0052CC" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Developer Velocity (Story Points Resolved) */}
        <div className="card">
          <div className="card-header">
            <div className="flex flex-col">
              <h3 className="card-title">Developer Velocity</h3>
              <span style={{ fontSize: 11, color: '#6B778C' }}>Accumulated Story Points completed this sprint</span>
            </div>
            <div style={{ fontSize: 11, color: '#00875A', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
              <Award size={12} /> Target met: 90%
            </div>
          </div>
          <div className="card-body" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberProductivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBECF0" />
                <XAxis dataKey="name" stroke="#6B778C" fontSize={11} tickLine={false} />
                <YAxis stroke="#6B778C" fontSize={11} tickLine={false} />
                <Tooltip />
                <Bar dataKey="storyPoints" name="Story Points Resolved" fill="#00875A" radius={[4, 4, 0, 0]}>
                  {memberProductivity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Backlog Allocation Statuses */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Backlog Allocations</h3>
          </div>
          <div className="card-body" style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Budgets */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Budget Allocations per Sprint Product</h3>
          </div>
          <div className="card-body" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={budgetData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EBECF0" />
                <XAxis type="number" stroke="#6B778C" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#6B778C" fontSize={11} tickLine={false} />
                <Tooltip />
                <Bar dataKey="budget" name="Funding Budget ($)" fill="#6554C0" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )
}
