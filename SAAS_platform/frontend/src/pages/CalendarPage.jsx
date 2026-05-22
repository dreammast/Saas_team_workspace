import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, ArrowUpRight 
} from 'lucide-react'
import { openModal } from '../store/slices/uiSlice'

export default function CalendarPage() {
  const dispatch = useDispatch()
  const tasks = useSelector(state => state.tasks.tasks)

  const [currentDate, setCurrentDate] = useState(new Date())
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Month metadata
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  // Generate calendar grid (including padded days from previous/next months)
  const calendarCells = []
  
  // Previous month padded days
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate()
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarCells.push({
      date: new Date(currentYear, currentMonth - 1, prevMonthDays - i),
      isCurrentMonth: false
    })
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({
      date: new Date(currentYear, currentMonth, i),
      isCurrentMonth: true
    })
  }

  // Next month padded days to complete grid row (7 x 6 cells = 42 total)
  const remainingCells = 42 - calendarCells.length
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({
      date: new Date(currentYear, currentMonth + 1, i),
      isCurrentMonth: false
    })
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  // Filter tasks with due dates falling on a specific cell date
  const getTasksForDate = (date) => {
    const formattedCellDate = date.toISOString().split('T')[0]
    return tasks.filter(t => t.dueDate === formattedCellDate)
  }

  const handleTaskClick = (task) => {
    dispatch(openModal({ type: 'EDIT_TASK', data: task }))
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Calendar Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#172B4D' }}>Calendar</h2>
          <p style={{ fontSize: 13, color: '#6B778C' }}>Track task deliverables, sprint deadlines, and launch target dates.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex border" style={{ borderRadius: 6, background: 'white', padding: 2, borderColor: 'var(--color-border)' }}>
            <button className="icon-btn" style={{ width: 28, height: 28, borderRadius: 4 }} onClick={handlePrevMonth}>
              <ChevronLeft size={16} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 13, fontWeight: 700, color: '#172B4D', minWidth: 140, justifyContent: 'center' }}>
              {monthNames[currentMonth]} {currentYear}
            </div>
            <button className="icon-btn" style={{ width: 28, height: 28, borderRadius: 4 }} onClick={handleNextMonth}>
              <ChevronRight size={16} />
            </button>
          </div>
          
          <button 
            className="btn btn-secondary btn-sm flex items-center gap-1"
            onClick={() => setCurrentDate(new Date())}
          >
            <CalendarIcon size={14} />
            <span>Today</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="card flex-1 flex flex-col overflow-hidden" style={{ minHeight: 450 }}>
        {/* Day Name Headers */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            background: '#F4F5F7', 
            borderBottom: '1px solid var(--color-border)', 
            textAlign: 'center', 
            fontSize: 11, 
            fontWeight: 700, 
            color: '#6B778C', 
            padding: '8px 0',
            textTransform: 'uppercase'
          }}
        >
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* 42 grid cells */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gridTemplateRows: 'repeat(6, 1fr)', 
            flex: 1, 
            overflowY: 'auto' 
          }}
        >
          {calendarCells.map((cell, idx) => {
            const dateTasks = getTasksForDate(cell.date)
            const isToday = new Date().toDateString() === cell.date.toDateString()
            
            return (
              <div 
                key={idx} 
                style={{ 
                  borderRight: '1px solid var(--color-border-subtle)', 
                  borderBottom: '1px solid var(--color-border-subtle)', 
                  padding: 8, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 4, 
                  background: cell.isCurrentMonth ? 'white' : '#FAFBFC',
                  minHeight: 80
                }}
              >
                {/* Cell date label */}
                <div className="flex justify-between items-center">
                  <span 
                    style={{ 
                      fontSize: 12, 
                      fontWeight: 700, 
                      color: cell.isCurrentMonth ? '#172B4D' : '#97A0AF',
                      display: 'flex',
                      width: 22,
                      height: 22,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      background: isToday ? '#0052CC' : 'none',
                      color: isToday ? 'white' : cell.isCurrentMonth ? '#172B4D' : '#97A0AF'
                    }}
                  >
                    {cell.date.getDate()}
                  </span>
                </div>

                {/* Tasks inside cell */}
                <div className="flex flex-col gap-1 overflow-y-auto" style={{ flex: 1, maxHeight: 80 }}>
                  {dateTasks.slice(0, 3).map(task => (
                    <div 
                      key={task.id}
                      onClick={() => handleTaskClick(task)}
                      className="truncate text-xs font-medium"
                      style={{ 
                        background: task.projectColor || '#0052CC',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: 3,
                        cursor: 'pointer',
                        fontSize: 10,
                        opacity: task.status === 'COMPLETED' ? 0.6 : 1,
                        textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none'
                      }}
                      title={task.title}
                    >
                      {task.key}: {task.title}
                    </div>
                  ))}
                  {dateTasks.length > 3 && (
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#6B778C', paddingLeft: 4 }}>
                      +{dateTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
