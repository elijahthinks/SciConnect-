import { useState } from "react";
import { Link } from "react-router-dom";
import { EnvelopeIcon, MagnifyingGlassIcon, UserGroupIcon, CogIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../store/auth";
import useChatStore from "../store/chat";
import NotificationBell from "./NotificationBell";

export default function Navbar({ onChatClick }) {
  const { user, logout } = useAuth();
  const { unreadCount, disconnectSocket } = useChatStore();

  const handleLogout = () => {
    disconnectSocket();
    logout();
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-xl border-b border-white/20 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-lg">SC</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SciConnect
              </span>
            </Link>
            
            {user && (
              <div className="ml-12 flex items-center space-x-8">
                <Link
                  to="/feed"
                  className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 hover:bg-blue-50"
                >
                  Feed
                </Link>
                <Link
                  to="/explore"
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 hover:bg-purple-50"
                >
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  <span>Explore</span>
                </Link>
                <Link
                  to="/connections"
                  className="flex items-center space-x-2 text-gray-700 hover:text-green-600 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 hover:bg-green-50"
                >
                  <UserGroupIcon className="h-4 w-4" />
                  <span>Connections</span>
                </Link>
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <div className="transform transition-all duration-200 hover:scale-105">
                  <NotificationBell />
                </div>
                
                {/* Messages */}
                <button 
                  onClick={onChatClick}
                  className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg relative transition-all duration-200 transform hover:scale-105"
                  title="Messages"
                >
                  <EnvelopeIcon className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Settings */}
                <Link
                  to="/settings"
                  className="p-3 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 transform hover:scale-105"
                  title="Settings"
                >
                  <CogIcon className="h-6 w-6" />
                </Link>
                
                {/* User menu */}
                <div className="flex items-center space-x-3">
                  <Link to={`/profile/${user.id}`} className="flex items-center space-x-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl p-3 transition-all duration-200 transform hover:scale-105 border border-transparent hover:border-blue-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg border border-white/50">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-10 h-10 rounded-full object-cover" 
                        />
                      ) : (
                        <span className="text-sm text-blue-600 font-bold">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-semibold text-gray-700">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        View Profile
                      </p>
                    </div>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 hover:bg-blue-50"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 