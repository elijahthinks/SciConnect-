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
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  BellIcon as BellIconSolid,
  UserIcon as UserIconSolid
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

  // Navigation items with solid/outline icons for active states
  const navItems = [
    {
      name: 'Feed',
      path: '/',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
      description: 'Latest posts and updates'
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
      icon: UserGroupIcon,
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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-white">S</span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SciConnect
                </h1>
                <p className="text-xs text-gray-500">Community</p>
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
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  title={item.description}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{item.name}</span>
                  
                  {/* Tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.description}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
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
              className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
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
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.firstName?.[0] || user.username?.[0] || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.institution || 'Researcher'}
                  </p>
                </div>
                </button>
                
              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                        {user.firstName?.[0] || user.username?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {user.institution && (
                          <p className="text-xs text-gray-400 flex items-center">
                            <AcademicCapIcon className="h-3 w-3 mr-1" />
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
                      className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <UserIcon className="h-5 w-5" />
                      <span>View Profile</span>
                    </Link>
                    
                    <Link
                      to="/settings"
                      className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                      <span>Settings</span>
                  </Link>
                    
                    <hr className="my-2 border-gray-100" />
                  
                  <button
                    onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
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

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200 bg-white">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 4).map((item) => {
            const Icon = isActive(item.path) ? item.activeIcon : item.icon;
            return (
                <Link
                key={item.path}
                to={item.path}
                className={`relative flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                <div className="relative">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium">{item.name}</span>
                </Link>
            );
          })}
          
          {/* Profile in mobile */}
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex flex-col items-center space-y-1 p-2 rounded-lg text-gray-600"
          >
            <div className="relative">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {user.firstName?.[0] || 'U'}
              </div>
          </div>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
} 