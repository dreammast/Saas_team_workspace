import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  Hash, Send, Search, Users, Phone, Video, Info, 
  MessageSquare, Circle, Image, Paperclip, Smile,
  X, Mic, MicOff, VideoOff, Monitor, PhoneOff,
  Download, FileText, CheckCircle2, AlertCircle, Plus
} from 'lucide-react'
import { Client } from '@stomp/stompjs'
import { addToast } from '../store/slices/uiSlice'
import UserAvatar from '../components/common/UserAvatar'

const getDynamicApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  return `http://${hostname}:8080`
}

const API_BASE_URL = getDynamicApiUrl()

const getWsUrl = () => {
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/^http/, 'ws') + '/ws'
  }
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  return `${proto}//${hostname}:8080/ws`
}

const WS_URL = getWsUrl()

const DEFAULT_CHANNELS = [
  { id: 'ch-general', name: 'general', desc: 'Company-wide updates and announcements.' },
  { id: 'ch-website-redesign', name: 'website-redesign', desc: 'Discussions related to the marketing website redesign.', projectKey: 'WR' },
  { id: 'ch-mobile-app-v2', name: 'mobile-app-v2', desc: 'Syncing up on iOS & Android sprints.', projectKey: 'MA' },
  { id: 'ch-api-migration', name: 'api-migration', desc: 'Refactoring REST endpoints to GraphQL.', projectKey: 'API' },
]

const CATEGORIZED_EMOJIS = [
  '😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠','😈','👿','👹','👺','🤡','💩','👻','💀','☠️','👽','👾','🤖','🎃','😺','😸','😹','😻','😼','😽','🙀','😿','😾',
  '👋','🤚','🖐️','✋','🖖','👌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🧠','🦷','🦴','👀','👁️','👅','👄','💋','🩸',
  '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','💖','💗','💓','💞','💕','💟','❣️','💔','💘','💝','💟','🌟','⭐','✨','⚡','💥','🔥','🌈','☀️','🌤️','⛅','🌥️','☁️','🌧️','⛈️','🌩️','❄️','💨','💧','💦','🌊','🚀','🎯','🏆','💻','📅','📌','📎','🔑'
]

export default function MessagesPage() {
  const { user, token } = useSelector(state => state.auth)
  const teamMembers = useSelector(state => state.projects.teamMembers)
  const dispatch = useDispatch()

  const [channels, setChannels] = useState(DEFAULT_CHANNELS)

  const [showAddChannelModal, setShowAddChannelModal] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelDesc, setNewChannelDesc] = useState('')

  const [activeChannelId, setActiveChannelId] = useState('ch-general')
  const [messages, setMessages] = useState({})
  const [inputText, setInputText] = useState('')
  const [connected, setConnected] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Premium interactive states
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(null)
  const [activeCall, setActiveCall] = useState(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isSharingScreen, setIsSharingScreen] = useState(false)

  const stompClientRef = useRef(null)
  const chatEndRef = useRef(null)
  const activeSubscriptionRef = useRef(null)
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)

  const isDm = activeChannelId.startsWith('dm-')
  const activeChannel = channels.find(c => c.id === activeChannelId)
  
  let activeChannelName = activeChannel?.name
  let activeChannelDesc = activeChannel?.desc
  let activeDMRecipient = null

  if (isDm) {
    const parts = activeChannelId.split('-')
    const recipientId = parts[1] === String(user?.id) ? parts[2] : parts[1]
    activeDMRecipient = teamMembers.find(m => String(m.id) === recipientId)
    activeChannelName = activeDMRecipient ? activeDMRecipient.name : 'Direct Message'
    activeChannelDesc = activeDMRecipient ? `Chatting with ${activeDMRecipient.name}` : ''
  }

  const channelMessages = messages[activeChannelId] || []

  // Generate sorted DM channel ID
  const getDmChannelId = (memberId) => {
    if (!user?.id) return 'dm-temp'
    const sorted = [Number(user.id), Number(memberId)].sort((a, b) => a - b)
    return `dm-${sorted[0]}-${sorted[1]}`
  }

  // Fetch Channels from DB
  const fetchChannels = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/channels`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          const mapped = data.map(c => ({
            id: c.id,
            name: c.name,
            desc: c.description
          }))
          setChannels(mapped)
        }
      }
    } catch (err) {
      console.error('Failed to load channels from backend', err)
    }
  }

  // Load channels on mount / auth
  useEffect(() => {
    if (token) {
      fetchChannels()
    }
  }, [token])

  const handleAddChannel = async (e) => {
    e.preventDefault()
    if (!newChannelName.trim()) return

    // Clean name: lower case, hyphens instead of spaces
    const cleanName = newChannelName.trim().toLowerCase().replace(/\s+/g, '-')
    const channelId = `ch-${cleanName}`
    
    // Check if channel already exists
    if (channels.some(c => c.name === cleanName)) {
      dispatch(addToast({
        id: Date.now(),
        type: 'ERROR',
        message: `Channel #${cleanName} already exists!`
      }))
      return
    }

    const newChan = {
      id: channelId,
      name: cleanName,
      description: newChannelDesc.trim() || 'Custom channel created by user.'
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newChan)
      })

      if (response.ok) {
        const saved = await response.json()
        const mappedSaved = {
          id: saved.id,
          name: saved.name,
          desc: saved.description
        }
        
        setChannels(prev => [...prev, mappedSaved])
        setActiveChannelId(saved.id)
        
        // Clear fields & close modal
        setNewChannelName('')
        setNewChannelDesc('')
        setShowAddChannelModal(false)

        dispatch(addToast({
          id: Date.now(),
          type: 'SUCCESS',
          message: `Channel #${cleanName} created successfully!`
        }))
      } else {
        const errText = await response.text()
        dispatch(addToast({
          id: Date.now(),
          type: 'ERROR',
          message: errText || 'Failed to create channel.'
        }))
      }
    } catch (err) {
      console.error('Failed to create channel', err)
      dispatch(addToast({
        id: Date.now(),
        type: 'ERROR',
        message: 'Network error creating channel.'
      }))
    }
  }

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeChannelId])

  // Fetch Chat History
  const fetchChatHistory = async (channelId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/${channelId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const history = await response.json()
        const mapped = history.map(msg => ({
          id: msg.id,
          sender: msg.senderEmail === user?.email ? user?.id : msg.senderEmail,
          name: msg.senderName,
          avatar: msg.senderAvatar || msg.senderName.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2),
          color: msg.senderColor || '#0052CC',
          content: msg.content,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
        setMessages(prev => ({
          ...prev,
          [channelId]: mapped
        }))
      }
    } catch (err) {
      console.error('Failed to load chat history', err)
    }
  }

  // Load chat history when switching channel
  useEffect(() => {
    if (activeChannelId) {
      fetchChatHistory(activeChannelId)
    }
  }, [activeChannelId])

  // Establish WebSocket Connection
  useEffect(() => {
    if (!user || !token) return

    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: {
        'Authorization': `Bearer ${token}`
      },
      debug: (str) => {
        console.log(str)
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    })

    client.onConnect = () => {
      setConnected(true)
      stompClientRef.current = client

      // Subscribe to active channel
      subscribeToChannel(client, activeChannelId)
    }

    client.onDisconnect = () => {
      setConnected(false)
      stompClientRef.current = null
    }

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message'])
      console.error('Additional details: ' + frame.body)
    }

    client.activate()

    return () => {
      if (activeSubscriptionRef.current) {
        activeSubscriptionRef.current.unsubscribe()
        activeSubscriptionRef.current = null
      }
      client.deactivate()
    }
  }, [user, token])

  // Resubscribe when activeChannelId changes
  useEffect(() => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      subscribeToChannel(stompClientRef.current, activeChannelId)
    }
  }, [activeChannelId])

  // Subscription management with Refs (No memory leaks!)
  const subscribeToChannel = (client, channelId) => {
    if (activeSubscriptionRef.current) {
      activeSubscriptionRef.current.unsubscribe()
      activeSubscriptionRef.current = null
    }

    activeSubscriptionRef.current = client.subscribe(`/topic/messages/${channelId}`, (frame) => {
      const msg = JSON.parse(frame.body)
      const mappedMsg = {
        id: msg.id,
        sender: msg.senderEmail === user?.email ? user?.id : msg.senderEmail,
        name: msg.senderName,
        avatar: msg.senderAvatar || msg.senderName.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2),
        color: msg.senderColor || '#0052CC',
        content: msg.content,
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => {
        const currentList = prev[channelId] || []
        if (currentList.some(m => m.id === mappedMsg.id)) return prev
        return {
          ...prev,
          [channelId]: [...currentList, mappedMsg]
        }
      })
    })
  }

  // Call timer effect
  useEffect(() => {
    if (!activeCall || activeCall.status !== 'active') return

    const interval = setInterval(() => {
      setActiveCall(prev => {
        if (!prev || prev.status !== 'active') return prev
        return {
          ...prev,
          duration: prev.duration + 1
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [activeCall?.status])

  // Canvas wave animation visualizer for video camera stream
  useEffect(() => {
    if (activeCall?.status !== 'active' || activeCall?.type !== 'video' || isVideoOff) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationId

    canvas.width = 400
    canvas.height = 300

    let waveOffset = 0

    const draw = () => {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Abstract deep luxury glassmorphic background
      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      bgGrad.addColorStop(0, '#091E42')
      bgGrad.addColorStop(1, '#001A3E')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Ambient pulsing digital matrix circles
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.strokeStyle = 'rgba(0, 82, 204, 0.12)'
      ctx.lineWidth = 1
      for (let r = 50; r < 220; r += 40) {
        ctx.beginPath()
        ctx.arc(0, 0, r + Math.sin(waveOffset + r * 0.05) * 8, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.restore()

      // Interactive fluid audio waves (simulating camera feed / real-time talk sync)
      ctx.strokeStyle = 'rgba(0, 82, 204, 0.45)'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + Math.sin(x * 0.015 + waveOffset) * 16 * Math.sin(x * 0.005)
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      // High-frequency secondary accent wave
      ctx.strokeStyle = 'rgba(101, 84, 192, 0.35)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + Math.cos(x * 0.025 - waveOffset) * 10 * Math.sin(x * 0.008)
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Local user miniature pip webcam feed box
      ctx.save()
      ctx.translate(canvas.width - 95, canvas.height - 75)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.07)'
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.roundRect(0, 0, 80, 60, 6)
      ctx.fill()
      ctx.stroke()
      
      // Blinking small green recording indicator
      ctx.fillStyle = Math.floor(waveOffset * 3) % 2 === 0 ? 'rgba(0, 135, 90, 0.8)' : 'rgba(0, 135, 90, 0.2)'
      ctx.beginPath()
      ctx.arc(12, 12, 3.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      waveOffset += 0.05
      animationId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [activeCall?.status, activeCall?.type, isVideoOff])

  const startCall = (type) => {
    if (!isDm) {
      dispatch(addToast({ type: 'warning', title: 'Direct Chat Only', message: 'Calling features are exclusively available in 1:1 direct messages with team members.' }))
      return
    }

    setActiveCall({
      recipient: activeDMRecipient || { name: activeChannelName },
      type,
      status: 'ringing',
      duration: 0
    })

    // Phase 1 transition: Ringing -> Connecting (2.5s)
    setTimeout(() => {
      setActiveCall(prev => {
        if (!prev || prev.status !== 'ringing') return prev
        return { ...prev, status: 'connecting' }
      })

      // Phase 2 transition: Connecting -> Active (1s)
      setTimeout(() => {
        setActiveCall(prev => {
          if (!prev || prev.status !== 'connecting') return prev
          return { ...prev, status: 'active' }
        })
      }, 1000)
    }, 2500)
  }

  const endCall = () => {
    if (!activeCall) return

    const durationText = formatDuration(activeCall.duration)
    const callTypeUpper = activeCall.type.toUpperCase()

    // Publish structured calling message to save inside DB
    const payload = {
      senderEmail: user.email,
      senderName: user.name,
      senderAvatar: user.avatar,
      senderColor: user.avatarColor || '#6554C0',
      content: `[CALL]${callTypeUpper}|${durationText}|ended`
    }

    if (stompClientRef.current && connected) {
      stompClientRef.current.publish({
        destination: `/app/chat/${activeChannelId}`,
        body: JSON.stringify(payload)
      })
      dispatch(addToast({ type: 'success', title: 'Call Logged', message: `${callTypeUpper === 'VIDEO' ? '🎥 Video Call' : '📞 Voice Call'} successfully synced to chat feed.` }))
    }

    setActiveCall(null)
    setIsMuted(false)
    setIsVideoOff(false)
    setIsSharingScreen(false)
  }

  const formatDuration = (secs) => {
    const mins = Math.floor(secs / 60)
    const remainSecs = secs % 60
    return `${String(mins).padStart(2, '0')}:${String(remainSecs).padStart(2, '0')}`
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return

    if (!stompClientRef.current || !connected) {
      dispatch(addToast({ type: 'error', title: 'Connection Error', message: 'Not connected to chat server. Retrying...' }))
      return
    }

    const payload = {
      senderEmail: user.email,
      senderName: user.name,
      senderAvatar: user.avatar,
      senderColor: user.avatarColor || '#6554C0',
      content: inputText
    }

    stompClientRef.current.publish({
      destination: `/app/chat/${activeChannelId}`,
      body: JSON.stringify(payload)
    })

    setInputText('')
  }

  // Trigger file dialog
  const triggerFileInput = (acceptType) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = acceptType
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const isImage = file.type.startsWith('image/')
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
    const displaySize = sizeMb > 0 ? `${sizeMb} MB` : `${Math.round(file.size / 1024)} KB`

    setUploadingFile({
      name: file.name,
      size: displaySize,
      progress: 0,
      type: isImage ? 'image' : 'file'
    })

    // Elite glassmorphic upload progress count simulation
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 18) + 6
      if (currentProgress >= 100) {
        currentProgress = 100
        clearInterval(interval)
        
        setTimeout(() => {
          const payload = {
            senderEmail: user.email,
            senderName: user.name,
            senderAvatar: user.avatar,
            senderColor: user.avatarColor || '#6554C0',
            content: isImage 
              ? `[IMAGE]${file.name}|https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600`
              : `[FILE]${file.name}|${displaySize}|https://demo.projectflow.io/files/${encodeURIComponent(file.name)}`
          }

          if (stompClientRef.current && connected) {
            stompClientRef.current.publish({
              destination: `/app/chat/${activeChannelId}`,
              body: JSON.stringify(payload)
            })
            dispatch(addToast({ type: 'success', title: 'Upload Successful', message: `Attached "${file.name}" to channel.` }))
          } else {
            dispatch(addToast({ type: 'error', title: 'Connection Failure', message: 'WebSocket is currently offline. Attachment failed.' }))
          }
          setUploadingFile(null)
        }, 200)
      } else {
        setUploadingFile(prev => prev ? { ...prev, progress: currentProgress } : null)
      }
    }, 120)
  }

  const handleAddEmoji = (emoji) => {
    setInputText(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  const renderMessageContent = (msg) => {
    const content = msg.content || ''
    
    if (content.startsWith('[FILE]')) {
      const parts = content.substring(6).split('|')
      const fileName = parts[0] || 'Attachment'
      const fileSize = parts[1] || 'Unknown size'
      const fileUrl = parts[2] || '#'
      
      return (
        <div style={{
          marginTop: 6,
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(9, 30, 66, 0.08)',
          borderRadius: 8,
          padding: '10px 14px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 2px 4px rgba(9, 30, 66, 0.03)',
          maxWidth: '100%'
        }} className="file-attachment-card">
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            background: 'rgba(9, 30, 66, 0.04)',
            color: '#0052CC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText size={16} />
          </div>
          <div style={{ minWidth: 0, marginRight: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#172B4D' }} className="truncate">{fileName}</div>
            <div style={{ fontSize: 10, color: '#6B778C' }}>{fileSize}</div>
          </div>
          <a 
            href={fileUrl} 
            download={fileName}
            style={{
              marginLeft: 'auto',
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#0052CC',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0, 82, 204, 0.25)',
              border: 'none',
              cursor: 'pointer'
            }}
            className="download-btn-hover"
            title="Download file"
            onClick={(e) => {
              e.preventDefault()
              dispatch(addToast({ type: 'success', title: 'File Downloaded', message: `Saved locally: ${fileName}` }))
            }}
          >
            <Download size={12} />
          </a>
        </div>
      )
    }
    
    if (content.startsWith('[IMAGE]')) {
      const parts = content.substring(7).split('|')
      const imageName = parts[0] || 'Image'
      const imageUrl = parts[1] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'
      
      return (
        <div style={{
          marginTop: 6,
          display: 'inline-block',
          position: 'relative',
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid rgba(9, 30, 66, 0.08)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          maxWidth: 'min(420px, 100%)'
        }} className="image-attachment-card">
          <img 
            src={imageUrl} 
            alt={imageName} 
            style={{ display: 'block', width: '100%', height: 'auto', maxHeight: 200, objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
            padding: '8px 12px',
            color: 'white',
            fontSize: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span className="truncate" style={{ flex: 1, fontWeight: 500, marginRight: 8 }}>{imageName}</span>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                dispatch(addToast({ type: 'success', title: 'Image Saved', message: `Saved image: ${imageName}` }))
              }}
              style={{
                background: 'rgba(255,255,255,0.25)',
                border: 'none',
                color: 'white',
                width: 20,
                height: 20,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Download size={10} />
            </button>
          </div>
        </div>
      )
    }

    if (content.startsWith('[CALL]')) {
      const parts = content.substring(6).split('|')
      const callType = parts[0] || 'VOICE'
      const callDuration = parts[1] || '00:00'
      const status = parts[2] || 'ended'
      const isVideoCall = callType === 'VIDEO'
      
      return (
        <div style={{
          marginTop: 6,
          background: 'rgba(9, 30, 66, 0.03)',
          border: '1px dashed rgba(9, 30, 66, 0.15)',
          borderRadius: 8,
          padding: '8px 12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12,
          color: '#6B778C',
          fontWeight: 500
        }}>
          {isVideoCall ? (
            <Video size={14} color="#6554C0" style={{ opacity: 0.85 }} />
          ) : (
            <Phone size={14} color="#0052CC" style={{ opacity: 0.85 }} />
          )}
          <span>
            {isVideoCall ? 'Sprint Video Call' : 'Sprint Voice Call'} ended • Duration: {callDuration}
          </span>
          <span style={{
            fontSize: 9,
            background: 'rgba(9, 30, 66, 0.06)',
            color: '#172B4D',
            padding: '2px 6px',
            borderRadius: 10,
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: 0.3
          }}>
            {status}
          </span>
        </div>
      )
    }

    return content
  }

  // Filter members based on search query
  const filteredMembers = teamMembers.filter(m => 
    m.id !== user?.id && m.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredChannels = channels.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="card animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', height: 'calc(100vh - 120px)', background: 'white', overflow: 'hidden', border: '1px solid var(--color-border-subtle)' }}>
      
      {/* Styles Injection for interactive elements */}
      <style>{`
        @keyframes pulseGlow {
          0% {
            transform: scale(0.95);
            opacity: 1;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .call-btn-hover:hover {
          background: rgba(255, 255, 255, 0.28) !important;
          transform: scale(1.06);
        }
        .hangup-btn-hover:hover {
          background: #B32E09 !important;
          transform: scale(1.08) rotate(15deg);
        }
        .emoji-btn:hover {
          background: rgba(0, 82, 204, 0.1) !important;
          transform: scale(1.22);
        }
        .download-btn-hover:hover {
          background: #0065FF !important;
          transform: scale(1.06);
        }
        .file-attachment-card:hover {
          border-color: rgba(9, 30, 66, 0.2) !important;
          background: rgba(255, 255, 255, 0.95) !important;
          transform: translateY(-1px);
        }
        .image-attachment-card:hover img {
          transform: scale(1.015);
          transition: transform 0.25s ease-in-out;
        }
      `}</style>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />

      {/* Calling Screen Overlay */}
      {activeCall && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(9, 30, 66, 0.95)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          color: 'white'
        }}>
          {/* Upper Info */}
          <div style={{ textAlign: 'center', marginBottom: 24, zIndex: 10 }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#0065FF',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              marginBottom: 10
            }}>
              {activeCall.type === 'video' ? 'SECURE VIDEO SPRINT CALL' : 'SECURE VOICE SPRINT CALL'}
            </div>
            
            {/* Pulsing Avatar Container */}
            <div style={{ position: 'relative', display: 'inline-block', margin: '20px 0' }}>
              {activeCall.status === 'ringing' && (
                <>
                  <div style={{
                    position: 'absolute',
                    top: -12, left: -12, right: -12, bottom: -12,
                    borderRadius: '50%',
                    border: '2px solid rgba(0, 82, 204, 0.45)',
                    animation: 'pulseGlow 2.2s infinite ease-in-out'
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: -26, left: -26, right: -26, bottom: -26,
                    borderRadius: '50%',
                    border: '1px solid rgba(101, 84, 192, 0.22)',
                    animation: 'pulseGlow 2.2s infinite ease-in-out',
                    animationDelay: '0.6s'
                  }} />
                </>
              )}

              <div style={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                backgroundColor: activeDMRecipient?.avatarColor || '#6554C0',
                fontSize: 32,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '4px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
              }}>
                {activeDMRecipient?.avatar || activeChannelName.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)}
              </div>
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 700, margin: '8px 0', color: '#FFFFFF' }}>
              {activeDMRecipient?.name || activeChannelName}
            </h2>
            
            <p style={{
              fontSize: 13,
              color: activeCall.status === 'ringing' ? '#97A0AF' : '#36B37E',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}>
              {activeCall.status === 'ringing' && <span>Calling...</span>}
              {activeCall.status === 'connecting' && <span>Connecting securely...</span>}
              {activeCall.status === 'active' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#36B37E', display: 'inline-block', animation: 'blink 1.2s infinite' }} />
                  Active ({formatDuration(activeCall.duration)})
                </span>
              )}
            </p>
          </div>

          {/* Canvas Stream Area (Only for active video call) */}
          {activeCall.type === 'video' && activeCall.status === 'active' && (
            <div style={{
              width: '400px',
              height: '300px',
              borderRadius: 12,
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 12px 48px rgba(0, 0, 0, 0.55)',
              marginBottom: 32,
              background: '#091E42'
            }}>
              {isVideoOff ? (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: '#091E42',
                  color: '#97A0AF',
                  gap: 8
                }}>
                  <VideoOff size={32} />
                  <span style={{ fontSize: 12 }}>Webcam feed disabled</span>
                </div>
              ) : (
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
              )}
              
              {isSharingScreen && (
                <div style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  background: 'rgba(0, 135, 90, 0.95)',
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.35)'
                }}>
                  <Monitor size={10} />
                  <span>SCREEN SHARING ACTIVE</span>
                </div>
              )}
            </div>
          )}

          {/* Calling Action Panel */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '16px 28px',
            borderRadius: 40,
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            zIndex: 10
          }}>
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: isMuted ? '#DE350B' : 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.25s'
              }}
              title={isMuted ? 'Unmute' : 'Mute'}
              className="call-btn-hover"
            >
              {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {activeCall.type === 'video' && (
              <>
                <button 
                  onClick={() => setIsVideoOff(!isVideoOff)} 
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: isVideoOff ? '#DE350B' : 'rgba(255, 255, 255, 0.12)',
                    border: 'none',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.25s'
                  }}
                  title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
                  className="call-btn-hover"
                >
                  {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
                </button>

                <button 
                  onClick={() => setIsSharingScreen(!isSharingScreen)} 
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: isSharingScreen ? '#36B37E' : 'rgba(255, 255, 255, 0.12)',
                    border: 'none',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.25s'
                  }}
                  title={isSharingScreen ? 'Stop Sharing' : 'Share Screen'}
                  className="call-btn-hover"
                >
                  <Monitor size={18} />
                </button>
              </>
            )}

            <button 
              onClick={endCall} 
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#DE350B',
                border: 'none',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(222, 53, 11, 0.4)'
              }}
              title="Hang Up"
              className="hangup-btn-hover"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Sidebar Channels */}
      <div style={{ borderRight: '1px solid var(--color-border-subtle)', background: '#F4F5F7', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 12px', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <div className="relative">
            <Search size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#6B778C' }} />
            <input 
              type="text" 
              placeholder="Search chat..." 
              className="form-control form-control-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 26, height: 28, fontSize: 11, background: 'white' }}
            />
          </div>
        </div>

        {/* Channel Lists */}
        <div className="overflow-y-auto" style={{ flex: 1, padding: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 4px 4px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#6B778C', letterSpacing: 0.5 }}>Channels</div>
            <button 
              onClick={() => setShowAddChannelModal(true)}
              title="Create Channel"
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: '#6B778C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px 4px',
                borderRadius: 4,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#0052CC'; e.currentTarget.style.background = 'rgba(0, 82, 204, 0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6B778C'; e.currentTarget.style.background = 'none' }}
            >
              <Plus size={12} />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {filteredChannels.map(c => {
              const active = c.id === activeChannelId
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveChannelId(c.id)}
                  className="flex items-center gap-2"
                  style={{ 
                    width: '100%', 
                    padding: '6px 8px', 
                    borderRadius: 4, 
                    fontSize: 12, 
                    fontWeight: active ? 700 : 500,
                    color: active ? '#0052CC' : '#6B778C',
                    background: active ? 'rgba(0, 82, 204, 0.08)' : 'none',
                    textAlign: 'left',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Hash size={13} style={{ opacity: active ? 1 : 0.6 }} />
                  <span className="truncate">{c.name}</span>
                </button>
              )
            })}
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#6B778C', margin: '20px 4px 4px', letterSpacing: 0.5 }}>Direct Messages</div>
          <div className="flex flex-col gap-1">
            {filteredMembers.map(m => {
              const dmId = getDmChannelId(m.id)
              const active = dmId === activeChannelId
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveChannelId(dmId)}
                  className="flex items-center gap-2"
                  style={{ 
                    width: '100%',
                    padding: '6px 8px', 
                    borderRadius: 4,
                    fontSize: 12, 
                    fontWeight: active ? 700 : 500,
                    color: active ? '#0052CC' : '#6B778C',
                    background: active ? 'rgba(0, 82, 204, 0.08)' : 'none',
                    textAlign: 'left',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <UserAvatar avatar={m.avatar} name={m.name} avatarColor={m.avatarColor || '#6554C0'} size="xs" />
                    <Circle size={6} fill="#00875A" color="none" style={{ position: 'absolute', bottom: -1, right: -1, border: '1px solid white', borderRadius: '50%' }} />
                  </div>
                  <span className="truncate">{m.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Chat Window */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>
        {/* Chat Window Header */}
        <div className="flex justify-between items-center" style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-border-subtle)', background: 'white' }}>
          <div className="flex items-center gap-2">
            {isDm ? (
              <UserAvatar avatar={activeDMRecipient?.avatar} name={activeDMRecipient?.name} avatarColor={activeDMRecipient?.avatarColor || '#6554C0'} size="xs" />
            ) : (
              <Hash size={18} color="#0052CC" />
            )}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#172B4D', margin: 0 }}>{activeChannelName}</h3>
              <p style={{ fontSize: 11, color: '#6B778C', margin: 0 }}>{activeChannelDesc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span style={{ fontSize: 11, color: connected ? '#00875A' : '#DE350B', fontWeight: 600, marginRight: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: connected ? '#00875A' : '#DE350B' }} />
              {connected ? 'Connected' : 'Offline'}
            </span>
            <button 
              className="icon-btn" 
              style={{ width: 28, height: 28, color: isDm ? '#172B4D' : '#C1C7D0', cursor: isDm ? 'pointer' : 'not-allowed' }}
              disabled={!isDm}
              onClick={() => startCall('voice')}
              title={isDm ? "Start Voice Call" : "Calling only available in 1:1 DMs"}
            >
              <Phone size={14} />
            </button>
            <button 
              className="icon-btn" 
              style={{ width: 28, height: 28, color: isDm ? '#172B4D' : '#C1C7D0', cursor: isDm ? 'pointer' : 'not-allowed' }}
              disabled={!isDm}
              onClick={() => startCall('video')}
              title={isDm ? "Start Video Call" : "Calling only available in 1:1 DMs"}
            >
              <Video size={14} />
            </button>
            <button className="icon-btn" style={{ width: 28, height: 28 }}><Info size={14} /></button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="overflow-y-auto" style={{ flex: 1, padding: 20, background: '#FAFBFC' }}>
          <div className="flex flex-col gap-4">
            {channelMessages.map(msg => {
              const isSelf = msg.sender === user?.id
              return (
                <div key={msg.id} className="flex gap-3 items-start animate-fade-in">
                  <UserAvatar
                    avatar={msg.avatar}
                    name={msg.name}
                    avatarColor={msg.color}
                    size="sm"
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold" style={{ fontSize: 13, color: '#172B4D' }}>{msg.name}</span>
                      <span style={{ fontSize: 10, color: '#97A0AF' }}>{msg.time}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#172B4D', margin: '4px 0 0', lineHeight: 1.4, wordBreak: 'break-word' }}>
                      {renderMessageContent(msg)}
                    </div>
                  </div>
                </div>
              )
            })}
            {channelMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-2" style={{ padding: 48, opacity: 0.6 }}>
                <MessageSquare size={36} color="#6B778C" />
                <span style={{ fontSize: 13, color: '#6B778C', fontWeight: 500 }}>This is the start of your chat history.</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* File Upload Progress Card */}
        {uploadingFile && (
          <div className="animate-fade-in" style={{
            padding: '12px 20px',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 -4px 12px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: uploadingFile.type === 'image' ? 'rgba(0, 82, 204, 0.1)' : 'rgba(101, 84, 192, 0.1)',
              color: uploadingFile.type === 'image' ? '#0052CC' : '#6554C0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {uploadingFile.type === 'image' ? <Image size={18} /> : <FileText size={18} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#172B4D' }} className="truncate">{uploadingFile.name}</span>
                <span style={{ fontSize: 10, color: '#6B778C', fontWeight: 500 }}>{uploadingFile.progress}%</span>
              </div>
              <div style={{ height: 6, width: '100%', background: 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${uploadingFile.progress}%`,
                  background: 'linear-gradient(90deg, #0052CC 0%, #6554C0 100%)',
                  borderRadius: 3,
                  transition: 'width 0.15s ease-out'
                }} />
              </div>
              <span style={{ fontSize: 9, color: '#97A0AF', marginTop: 2, display: 'block' }}>Uploading • {uploadingFile.size}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setUploadingFile(null)} 
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6B778C',
                width: 24,
                height: 24,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              className="icon-btn"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} style={{ padding: 16, borderTop: '1px solid var(--color-border-subtle)', background: 'white' }}>
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, display: 'flex', flexDirection: 'column', background: 'white', position: 'relative' }}>
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={isDm ? `Message ${activeChannelName}` : `Message #${activeChannelName}`}
              className="w-full"
              rows={2}
              style={{ border: 'none', resize: 'none', padding: 8, outline: 'none', fontSize: 13, fontFamily: 'inherit' }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
            />
            
            {/* Input Toolbar */}
            <div className="flex justify-between items-center" style={{ padding: '6px 8px', borderTop: '1px solid var(--color-border-subtle)', background: '#FAFBFC' }}>
              <div className="flex gap-1" style={{ position: 'relative' }}>
                <button 
                  type="button" 
                  className="icon-btn" 
                  style={{ width: 24, height: 24 }}
                  onClick={() => triggerFileInput('*/*')}
                  title="Attach File"
                >
                  <Paperclip size={12} />
                </button>
                <button 
                  type="button" 
                  className="icon-btn" 
                  style={{ width: 24, height: 24 }}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Insert Emoji"
                >
                  <Smile size={12} />
                </button>
                <button 
                  type="button" 
                  className="icon-btn" 
                  style={{ width: 24, height: 24 }}
                  onClick={() => triggerFileInput('image/*')}
                  title="Attach Image"
                >
                  <Image size={12} />
                </button>

                {/* Glassmorphic Emoji Picker Popover */}
                {showEmojiPicker && (
                  <div className="emoji-picker-popover animate-fade-in" style={{
                    position: 'absolute',
                    bottom: 34,
                    left: 0,
                    zIndex: 100,
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(20px) saturate(190%)',
                    border: '1px solid rgba(255, 255, 255, 0.45)',
                    boxShadow: '0 8px 32px 0 rgba(9, 30, 66, 0.15)',
                    borderRadius: 12,
                    width: 290,
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(9, 30, 66, 0.08)', paddingBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#172B4D', textTransform: 'uppercase', letterSpacing: 0.5 }}>Insert Emoji</span>
                      <button 
                        type="button" 
                        onClick={() => setShowEmojiPicker(false)} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C', display: 'flex', alignItems: 'center', padding: 2 }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6, maxHeight: 180, overflowY: 'auto', padding: '4px 0' }}>
                      {CATEGORIZED_EMOJIS.map((emoji, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddEmoji(emoji)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: 16,
                            padding: 4,
                            cursor: 'pointer',
                            borderRadius: 6,
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          className="emoji-btn"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary btn-sm flex items-center gap-1"
                style={{ padding: '2px 10px', height: 26 }}
                disabled={!inputText.trim() || !connected}
              >
                <span>Send</span>
                <Send size={10} />
              </button>
            </div>
          </div>
        </form>

      </div>

      {showAddChannelModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(9, 30, 66, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            overflow: 'hidden',
            margin: '20px'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid var(--color-border-subtle)',
              background: 'linear-gradient(135deg, #F4F5F7 0%, #FFFFFF 100%)'
            }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#172B4D', margin: 0 }}>Create a new channel</h3>
                <span style={{ fontSize: 11, color: '#6B778C' }}>Channels are where your team communicates.</span>
              </div>
              <button
                onClick={() => {
                  setNewChannelName('')
                  setNewChannelDesc('')
                  setShowAddChannelModal(false)
                }}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#6B778C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 4,
                  borderRadius: '50%',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(9, 30, 66, 0.08)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddChannel}>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Channel Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label htmlFor="channel-name" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#172B4D' }}>
                    Name <span style={{ color: '#FF5630' }}>*</span>
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: 12, color: '#6B778C', fontSize: 14, fontWeight: 500 }}>#</span>
                    <input
                      id="channel-name"
                      type="text"
                      className="form-control"
                      placeholder="e.g. design-sync"
                      value={newChannelName}
                      onChange={e => setNewChannelName(e.target.value)}
                      required
                      style={{ paddingLeft: 24, fontSize: 13, height: 38 }}
                      autoFocus
                    />
                  </div>
                  <span style={{ fontSize: 11, color: '#6B778C' }}>
                    Lowercase letters, numbers, and hyphens only.
                  </span>
                </div>

                {/* Channel Description */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label htmlFor="channel-desc" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#172B4D' }}>
                    Description
                  </label>
                  <textarea
                    id="channel-desc"
                    className="form-control"
                    placeholder="What is this channel about?"
                    value={newChannelDesc}
                    onChange={e => setNewChannelDesc(e.target.value)}
                    style={{ fontSize: 13, minHeight: 80, padding: '10px 12px', resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                padding: '12px 20px',
                borderTop: '1px solid var(--color-border-subtle)',
                backgroundColor: '#F4F5F7'
              }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setNewChannelName('')
                    setNewChannelDesc('')
                    setShowAddChannelModal(false)
                  }}
                  style={{ height: 32 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={!newChannelName.trim()}
                  style={{ height: 32 }}
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
