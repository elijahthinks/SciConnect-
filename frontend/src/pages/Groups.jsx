import { useState, useEffect } from 'react';
import { useAuth } from '../store/auth';
import { 
  UserGroupIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  AcademicCapIcon,
  BookOpenIcon,
  LockClosedIcon,
  GlobeAltIcon,
  HashtagIcon,
  UsersIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import UserAvatar from '../components/UserAvatar';
import axios from 'axios';

export default function Groups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [joiningGroup, setJoiningGroup] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [view, setView] = useState('list'); // 'list' or 'chat'

  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    type: 'public',
    tags: '',
    researchArea: '',
    maxMembers: 100
  });

  useEffect(() => {
    loadGroups();
  }, [searchQuery]);

  const loadGroups = async () => {
    try {
      console.log('Loading groups...');
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const response = await axios.get(`/api/groups/discover?${params.toString()}`);
      console.log('Groups response:', response.data);
      
      // Check if groups have isMember property
      if (response.data.groups) {
        response.data.groups.forEach(group => {
          console.log(`Group ${group.name}: isMember = ${group.isMember}`);
        });
      }
      
      setGroups(response.data.groups || response.data);
    } catch (error) {
      console.error('Error loading groups:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      setError('Failed to load groups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadGroupMessages = async (groupId) => {
    try {
      const response = await axios.get(`/api/groups/${groupId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages. Please try again.');
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    try {
      const groupData = {
        ...groupForm,
        tags: groupForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };
      
      const response = await axios.post('/api/groups', groupData);
      setGroups([response.data, ...groups]);
      setShowCreateGroup(false);
      setGroupForm({
        name: '',
        description: '',
        type: 'public',
        tags: '',
        researchArea: '',
        maxMembers: 100
      });
      setSuccess('Group created successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error creating group:', error);
      setError(error.response?.data?.message || 'Failed to create group. Please try again.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const joinGroup = async (groupId) => {
    try {
      setJoiningGroup(groupId);
      setError(null);
      await axios.post(`/api/groups/${groupId}/join`);
      await loadGroups(); // Reload groups from backend to get updated isMember
      setSuccess('Successfully joined group!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error joining group:', error);
      const errorMessage = error.response?.data?.message || 'Failed to join group. Please try again.';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setJoiningGroup(null);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup) return;

    try {
      await axios.post(`/api/groups/${selectedGroup.id}/messages`, {
        content: newMessage,
        type: 'text'
      });
      setNewMessage('');
      loadGroupMessages(selectedGroup.id);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const selectGroup = (group) => {
    setSelectedGroup(group);
    setView('chat');
    loadGroupMessages(group.id);
  };

  const getGroupIcon = (type) => {
    switch (type) {
      case 'research_group': return <AcademicCapIcon className="h-5 w-5" />;
      case 'study_group': return <BookOpenIcon className="h-5 w-5" />;
      case 'private': return <LockClosedIcon className="h-5 w-5" />;
      default: return <GlobeAltIcon className="h-5 w-5" />;
    }
  };

  const getGroupTypeColor = (type) => {
    switch (type) {
      case 'research_group': return 'bg-blue-100 text-blue-800';
      case 'study_group': return 'bg-green-100 text-green-800';
      case 'private': return 'bg-gray-100 text-gray-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  const getGroupTypeLabel = (type) => {
    switch (type) {
      case 'research_group': return 'Research';
      case 'study_group': return 'Study';
      case 'private': return 'Private';
      default: return 'Public';
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'chat' && selectedGroup) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setView('list')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Groups
            </button>
            <div className="flex items-center space-x-2">
              {getGroupIcon(selectedGroup.type)}
              <h1 className="text-2xl font-bold text-gray-900">{selectedGroup.name}</h1>
            </div>
          </div>
          <p className="text-gray-600 mt-2">{selectedGroup.description}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
          <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map(message => (
                  <div key={message.id} className="flex items-start space-x-3">
                    <UserAvatar user={message.sender} size="sm" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {message.sender?.firstName && message.sender?.lastName 
                            ? `${message.sender.firstName} ${message.sender.lastName}`
                            : message.sender?.username}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-1">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={sendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Error and Success Notifications */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <XMarkIcon className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <CheckIcon className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
          <button
            onClick={() => setSuccess(null)}
            className="text-green-400 hover:text-green-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <UserGroupIcon className="h-7 w-7 mr-2" />
          Groups
        </h1>
        <p className="text-gray-600">Join research groups and collaborate with peers</p>
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <button
          onClick={() => setShowCreateGroup(true)}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Create Group</span>
        </button>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Group</h2>
            <form onSubmit={createGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({...groupForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={groupForm.type}
                  onChange={(e) => setGroupForm({...groupForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="research_group">Research Group</option>
                  <option value="study_group">Study Group</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={groupForm.tags}
                  onChange={(e) => setGroupForm({...groupForm, tags: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., AI, Machine Learning, Research"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateGroup(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <UserGroupIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try a different search term' : 'Create your first group to get started'}
            </p>
          </div>
        ) : (
          filteredGroups.map(group => (
            <div key={group.id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getGroupIcon(group.type)}
                    <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGroupTypeColor(group.type)}`}>
                    {getGroupTypeLabel(group.type)}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {group.description || 'No description available'}
                </p>

                {group.tags && group.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {group.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                        <HashtagIcon className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {group.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{group.tags.length - 3} more</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <UsersIcon className="h-4 w-4" />
                    <span>{group.currentMemberCount || 0} members</span>
                  </div>
                  <div className="flex space-x-2">
                    {group.isMember ? (
                      <button
                        className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg flex items-center cursor-default opacity-70"
                        disabled
                      >
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Joined
                      </button>
                    ) : (
                      <button
                        onClick={() => joinGroup(group.id)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={joiningGroup === group.id}
                      >
                        {joiningGroup === group.id ? (
                          <div className="flex items-center">
                            <svg className="animate-spin h-4 w-4 text-white mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Joining...
                          </div>
                        ) : (
                          'Join'
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => selectGroup(group)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 