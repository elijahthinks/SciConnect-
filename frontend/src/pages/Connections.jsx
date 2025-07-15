import { useState, useEffect } from 'react';
import { useAuth } from '../store/auth';
import { UserGroupIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import FollowButton from '../components/FollowButton';
import UserList from '../components/UserList';
import axios from 'axios';

export default function Connections() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('followers');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConnections();
      fetchSuggestions();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(() => {
        searchUsers();
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else if (activeTab === 'suggestions') {
      fetchSuggestions();
    }
  }, [searchQuery]);

  const fetchConnections = async () => {
    try {
      console.log('Fetching connections for user:', user.id);
      const [followersRes, followingRes] = await Promise.all([
        axios.get(`/api/social/${user.id}/followers`),
        axios.get(`/api/social/${user.id}/following`)
      ]);
      console.log('Followers response:', followersRes.data);
      console.log('Following response:', followingRes.data);
      setFollowers(followersRes.data);
      setFollowing(followingRes.data);
    } catch (error) {
      console.error('Error fetching connections:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      console.log('Fetching suggestions...');
      const response = await axios.get('/api/social/suggestions', {
        params: { limit: 10 }
      });
      console.log('Suggestions response:', response.data);
      setSuggestions(response.data.users || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const response = await axios.get('/api/social/suggestions', { params: { q: searchQuery, limit: 20 }
      });
      setSuggestions(response.data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFollowChange = () => {
    fetchConnections();
    fetchSuggestions();
  };

  const tabs = [
    { id: 'followers', label: 'Followers', count: followers.length },
    { id: 'following', label: 'Following', count: following.length },
    { id: 'suggestions', label: 'Discover', count: suggestions.length }
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <UserGroupIcon className="h-7 w-7 mr-2" />
          Connections
        </h1>
        <p className="text-gray-600">Manage your network and discover new connections</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {searchLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'followers' && (
          <UserList 
            users={followers} 
            emptyMessage="No followers yet. Share great content to attract followers!"
            onFollowChange={handleFollowChange}
          />
        )}
        
        {activeTab === 'following' && (
          <UserList 
            users={following} 
            emptyMessage="You're not following anyone yet. Discover people to follow!"
            onFollowChange={handleFollowChange}
          />
        )}
        
        {activeTab === 'suggestions' && (
          <UserList 
            users={suggestions} 
            emptyMessage={searchQuery ? "No users found matching your search." : "No suggestions available right now."}
            onFollowChange={handleFollowChange}
            showFollowButton={true}
          />
        )}
      </div>
    </div>
  );
} 