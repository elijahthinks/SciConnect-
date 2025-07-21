import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import NotificationBell from './NotificationBell';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
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
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
      description: 'Research posts and fact-checking'
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
    <nav className="bg-white/95 backdrop-blur-sm border-b border-navy-200 sticky top-0 z-40 shadow-science">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 gradient-science rounded-full flex items-center justify-center shadow-science group-hover:shadow-science-lg transition-all duration-200">
                <span className="text-xl font-bold text-white">S</span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold gradient-science bg-clip-text text-transparent">
                  SciConnect
                </h1>
                <p className="text-xs text-navy-500">Research Community</p>
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
                  className={`relative group flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-teal-50 text-teal-700 shadow-science border border-teal-200'
                      : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'
                  }`}
                  title={item.description}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{item.name}</span>
                  
                  {/* Tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-navy-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.description}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-navy-900"></div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right side - Notifications, Create Post, Profile */}
          <div className="flex items-center space-x-3">
            {/* Create Post Button */}
            <button 
              onClick={handlePostClick}
              className="hidden md:flex items-center space-x-2 gradient-science text-white px-4 py-2 rounded-lg hover:shadow-science-lg transition-all duration-200 transform hover:scale-105 shadow-science"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="font-medium">Post</span>
            </button>

            {/* Notifications */}
            <NotificationBell />
                
            {/* Profile Dropdown */}
            <div className="relative">
                <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-navy-50 transition-colors"
              >
                <div className="w-8 h-8 gradient-science rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.firstName?.[0] || user.username?.[0] || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-navy-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-navy-500">
                    {user.institution || 'Researcher'}
                  </p>
                </div>
                </button>
                
              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-science-lg border border-navy-200 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-navy-100">
                <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 gradient-science rounded-full flex items-center justify-center text-white font-medium">
                        {user.firstName?.[0] || user.username?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-navy-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-navy-500">
                          {user.email}
                        </p>
                        {user.institution && (
                          <p className="text-xs text-navy-400">
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
                    
                    <hr className="my-2 border-navy-100" />
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors w-full text-left"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 