import { useState, useEffect } from 'react'

/**
 * UserAvatar - Smart avatar component
 * Renders a profile image if `avatar` is a URL, otherwise renders initials.
 */
export default function UserAvatar({ avatar, name, avatarColor, size = 'sm', className = '' }) {
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setImageError(false)
  }, [avatar])

  let resolvedAvatar = avatar || ''
  
  // Auto-resolve partial Unsplash IDs (e.g., "1534528741775-53994a69daeb?w=100")
  if (resolvedAvatar && !resolvedAvatar.startsWith('http://') && !resolvedAvatar.startsWith('https://') && !resolvedAvatar.startsWith('/')) {
    const isLikelyImageRef = resolvedAvatar.length > 5 && (resolvedAvatar.includes('-') || resolvedAvatar.includes('.') || resolvedAvatar.includes('/') || resolvedAvatar.includes('?'))
    if (isLikelyImageRef) {
      if (resolvedAvatar.match(/^\d+-[a-zA-Z0-9]+/) || resolvedAvatar.includes('w=') || resolvedAvatar.startsWith('photo-')) {
        resolvedAvatar = `https://images.unsplash.com/photo-${resolvedAvatar}`
      }
    }
  }

  const isUrl = resolvedAvatar && (resolvedAvatar.startsWith('http://') || resolvedAvatar.startsWith('https://') || resolvedAvatar.startsWith('/'))
  
  // Use first 2 letters of name as initials, or avatar if it's explicitly a short initials string
  const initials = (avatar && !isUrl && avatar.length <= 3)
    ? avatar
    : (name?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || '?')

  const sizeClass = size === 'lg' ? 'user-avatar-lg' : size === 'xs' ? 'user-avatar-xs' : 'user-avatar-sm'

  if (isUrl && !imageError) {
    return (
      <img
        src={resolvedAvatar}
        alt={name || 'User'}
        className={`${sizeClass} ${className}`}
        style={{ objectFit: 'cover', borderRadius: '50%' }}
        onError={() => setImageError(true)}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} ${className}`}
      style={{ 
        backgroundColor: avatarColor || '#0052CC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontWeight: '600',
        borderRadius: '50%',
        textTransform: 'uppercase'
      }}
    >
      {initials}
    </div>
  )
}

