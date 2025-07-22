import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { MobileQuickActionButton } from './QuickActions';
import QuickActions from './QuickActions';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  UserIcon,
  BeakerIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  BellIcon as BellIconSolid,
  UserIcon as UserIconSolid,
  BeakerIcon as BeakerIconSolid
} from '@heroicons/react/24/solid';

export default function MobileNav() {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);
  const [showQuickActions, setShowQuickActions] = useState(false);

  if (!user) return null;

  const navItems = [
    {
      name: 'Feed',
      path: '/',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
      description: 'Latest research'
    },
    {
      name: 'Research',
      path: '/research',
      icon: BeakerIcon,
      activeIcon: BeakerIconSolid,
      description: 'Research posts'
    },
    {
      name: 'Explore',
      path: '/explore',
      icon: MagnifyingGlassIcon,
      activeIcon: MagnifyingGlassIconSolid,
      description: 'Discover'
    },
    {
      name: 'Chat',
      path: '/chat',
      icon: ChatBubbleLeftRightIcon,
      activeIcon: ChatBubbleLeftRightIconSolid,
      description: 'Messages'
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: UserIcon,
      activeIcon: UserIconSolid,
      description: 'Your profile'
    }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleTabClick = (path) => {
    setActiveTab(path);
  };

  return (
    <>
      {showQuickActions && (
        <QuickActions onClose={() => setShowQuickActions(false)} />
      )}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-2 py-1 z-50 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = isActive(item.path) ? item.activeIcon : item.icon;
          const isActiveTab = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => handleTabClick(item.path)}
              className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                isActiveTab
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
              }`}
              title={item.description}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className={`text-xs font-medium ${isActiveTab ? 'text-primary-600' : 'text-neutral-500'}`}>
                {item.name}
              </span>
              
              {/* Active indicator */}
              {isActiveTab && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full"></div>
              )}
            </Link>
          );
        })}
        
        {/* Quick Post Button */}
        <button
          onClick={() => {
            // Navigate to home and scroll to create post
            window.location.href = '/';
            setTimeout(() => {
              const createPost = document.getElementById('create-research-post');
              if (createPost) {
                createPost.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                  const textarea = createPost.querySelector('textarea');
                  if (textarea) textarea.focus();
                }, 500);
              }
            }, 100);
          }}
          className="relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-primary-500 to-sage-500 text-white shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200"
          title="Create Post"
        >
          <PlusIcon className="h-6 w-6 mb-1" />
          <span className="text-xs font-medium">Post</span>
          
          {/* Pulse effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500 to-sage-500 animate-pulse opacity-50"></div>
        </button>
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-2"></div>
    </nav>
    
    {/* Quick Actions Button */}
    <MobileQuickActionButton onClick={() => setShowQuickActions(true)} />
    </>
  );
}

// Mobile-specific header component
export function MobileHeader({ title, onBack, rightAction }) {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 py-3 z-40 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-lg font-semibold text-neutral-900">{title}</h1>
        </div>
        
        {rightAction && (
          <div className="flex items-center space-x-2">
            {rightAction}
          </div>
        )}
      </div>
    </header>
  );
}

// Mobile search component
export function MobileSearch({ onSearch, placeholder = "Search research..." }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="md:hidden px-4 py-3 bg-white border-b border-neutral-200">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-12 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-neutral-900 placeholder-neutral-500"
        />
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
      </form>
    </div>
  );
}

// Mobile floating action button
export function MobileFAB({ icon: Icon, onClick, label, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`md:hidden fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-primary-500 to-sage-500 text-white rounded-full shadow-lg transform hover:scale-110 active:scale-95 transition-all duration-200 z-40 ${className}`}
      title={label}
    >
      <Icon className="h-6 w-6 mx-auto" />
    </button>
  );
} 