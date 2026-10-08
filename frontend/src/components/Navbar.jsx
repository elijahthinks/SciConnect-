import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import NotificationBell from './NotificationBell';
import { QuickActionButton } from './QuickActions';
import QuickActions from './QuickActions';
import UserAvatar from './UserAvatar';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  UserIcon,
  Cog6ToothIcon,
  PlusIcon,
  AcademicCapIcon,
  BeakerIcon,
  DocumentTextIcon,
  UserGroupIcon as UserGroupIconOutline
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  BellIcon as BellIconSolid,
  UserIcon as UserIconSolid,
  AcademicCapIcon as AcademicCapIconSolid,
  BeakerIcon as BeakerIconSolid,
  DocumentTextIcon as DocumentTextIconSolid
} from '@heroicons/react/24/solid';

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const handlePostClick = () => {
    // Navigate to home page if not already there
    if (location.pathname !== '/') {
      navigate('/');
    }
    // Scroll to top and focus on create post after a short delay
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        const textarea = document.querySelector('textarea[placeholder*="What"]');
        if (textarea) {
          textarea.focus();
        }
      }, 300);
    }, 100);
  };

  // Navigation items with science-themed icons
  const navItems = [
    {
      name: 'Feed',
      path: '/',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
      description: 'Latest research and updates'
    },
    {
      name: 'Research',
      path: '/research',
      icon: BeakerIcon,
      activeIcon: BeakerIconSolid,
      description: 'Research publications and findings'
    },
    {
      name: 'Explore',
      path: '/explore',
      icon: MagnifyingGlassIcon,
      activeIcon: MagnifyingGlassIconSolid,
      description: 'Discover research and researchers'
    },
    {
      name: 'Groups',
      path: '/groups',
      icon: UserGroupIcon,
      activeIcon: UserGroupIconSolid,
      description: 'Research groups and collaborations'
    },
    {
      name: 'Chat',
      path: '/chat',
      icon: ChatBubbleLeftRightIcon,
      activeIcon: ChatBubbleLeftRightIconSolid,
      description: 'Direct messages and group chats'
    },
    {
      name: 'Connections',
      path: '/connections',
      icon: UserGroupIconOutline,
      activeIcon: UserGroupIconSolid,
      description: 'Your research network'
    }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  if (!user) return null;

  return (
    <>
      {showQuickActions && (
        <QuickActions onClose={() => setShowQuickActions(false)} />
      )}
    <nav className="bg-white/95 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-40 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-medium group-hover:shadow-large transition-all duration-200">
                <span className="text-sm font-bold text-white">S</span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-neutral-900">
                SciConnect
                </h1>
                <p className="text-xs text-neutral-500">Research Community</p>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = isActive(item.path) ? item.activeIcon : item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative group flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-700 shadow-soft border border-primary-200'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                  title={item.description}
                >
                  <div className="relative">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-xs">{item.name}</span>
                  
                  {/* Tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-neutral-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.description}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-neutral-900"></div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right side - Notifications, Create Post, Profile */}
          <div className="flex items-center space-x-3">
            {/* Quick Actions Button */}
            <QuickActionButton onClick={() => setShowQuickActions(true)} />
            
            {/* Create Post Button */}
            <button 
              onClick={handlePostClick}
              className="hidden md:flex items-center space-x-1.5 bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-all duration-200 transform hover:scale-105 shadow-medium text-sm"
            >
              <PlusIcon className="h-3 w-3" />
              <span className="font-medium">Post</span>
            </button>

            {/* Notifications */}
            <NotificationBell />
                
            {/* Profile Dropdown */}
            <div className="relative">
                <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <UserAvatar user={user} size="sm" />
                <div className="hidden md:block text-left min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">
                    {user.institution || 'Researcher'}
                  </p>
                </div>
                </button>
                
              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-natural-lg border border-neutral-200 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-neutral-100">
                <div className="flex items-center space-x-3">
                                              <UserAvatar user={user} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-navy-900 truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-navy-500 truncate">
                          {user.email}
                        </p>
                        {user.institution && (
                          <p className="text-xs text-navy-400 truncate">
                            {user.institution}
                          </p>
                      )}
                    </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-2 text-navy-700 hover:bg-navy-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <UserIcon className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                    
                    <Link
                      to="/settings"
                      className="flex items-center space-x-3 px-4 py-2 text-navy-700 hover:bg-navy-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                      <span>Settings</span>
                  </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
              </div>
      </nav>
    </>
  );
} 