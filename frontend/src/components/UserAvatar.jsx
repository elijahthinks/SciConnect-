import { UserIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import useOnlineStatusStore from '../store/onlineStatus';

export default function UserAvatar({ 
  user, 
  size = 'md', 
  showOnlineStatus = false, 
  isOnline = false,
  className = '',
  onClick = null 
}) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-2xl',
    xxl: 'w-32 h-32 text-4xl'
  };

  const onlineIndicatorSizes = {
    xs: 'w-2 h-2 border',
    sm: 'w-2.5 h-2.5 border',
    md: 'w-3 h-3 border-2',
    lg: 'w-4 h-4 border-2',
    xl: 'w-5 h-5 border-2',
    xxl: 'w-6 h-6 border-2'
  };

  const getUserInitial = () => {
    if (!user) return <UserIcon className="w-1/2 h-1/2" />;
    
    // Try different name formats
    if (user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    
    if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    
    if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    
    return <UserIcon className="w-1/2 h-1/2" />;
  };

  const getUserName = () => {
    if (!user) return '';
    
    // Try different name formats
    if (user.name) return user.name;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.username) return user.username;
    return '';
  };

  const avatarClasses = `
    ${sizeClasses[size]} 
    bg-gradient-to-br from-blue-100 to-purple-100 
    rounded-full flex items-center justify-center 
    shadow-lg border border-white/50 overflow-hidden 
    relative flex-shrink-0
    ${onClick ? 'cursor-pointer hover:scale-105 transition-transform duration-200' : ''}
    ${className}
  `;

  // Get online status from store if not provided
  const { fetchUserStatus, isUserOnline } = useOnlineStatusStore();
  const actualIsOnline = isOnline !== undefined ? isOnline : (user ? isUserOnline(user.id) : false);

  // Fetch user status when component mounts if showOnlineStatus is true
  useEffect(() => {
    if (showOnlineStatus && user?.id && isOnline === undefined) {
      fetchUserStatus(user.id);
    }
  }, [showOnlineStatus, user?.id, fetchUserStatus, isOnline]);

  return (
    <div className="relative inline-block" onClick={onClick}>
      <div className={avatarClasses}>
        {user?.avatar ? (
          <img 
            src={user.avatar} 
            alt={getUserName()} 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials if image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback initials - always rendered but hidden if image loads */}
        <span 
          className={`text-blue-600 font-bold flex items-center justify-center w-full h-full ${
            user?.avatar ? 'hidden' : 'flex'
          }`}
          style={{ display: user?.avatar ? 'none' : 'flex' }}
        >
          {getUserInitial()}
        </span>
      </div>
      
      {/* Online Status Indicator */}
      {showOnlineStatus && (
        <div className={`
          absolute -bottom-0.5 -right-0.5 
          ${onlineIndicatorSizes[size]}
          rounded-full border-white
          ${actualIsOnline ? 'bg-green-500' : 'bg-gray-400'}
        `} />
      )}
    </div>
  );
} 