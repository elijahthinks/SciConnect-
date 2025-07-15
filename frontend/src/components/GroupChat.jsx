import { useState, useEffect } from 'react';
import { useSocket } from '../store/socket';
import { useAuth } from '../store/auth';
import { 
  PlusIcon, 
  UserGroupIcon, 
  CogIcon, 
  HashtagIcon,
  LockClosedIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  EllipsisVerticalIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

export default function GroupChat() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const socket = useSocket((state) => state.socket);

  // Group creation form
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    type: 'public', // public, private, research, study
    tags: '',
    researchArea: '',
    maxMembers: 100,
    settings: {
      allowMemberInvites: true,
      requireApproval: false,
      allowFileSharing: true,
      allowReactions: true
    }
  });

  useEffect(() => {
    loadGroups();
    
    if (socket) {
      socket.on('group_message', handleNewMessage);
      socket.on('group_member_joined', handleMemberJoined);
      socket.on('group_member_left', handleMemberLeft);
      
      return () => {
        socket.off('group_message');
        socket.off('group_member_joined');
        socket.off('group_member_left');
      };
    }
  }, [socket]);

  const loadGroups = async () => {
    try {
      const res = await axios.get('/api/groups');
      setGroups(res.data);
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupMessages = async (groupId) => {
    try {
      const res = await axios.get(`/api/groups/${groupId}/messages`);
      setMessages(res.data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleNewMessage = (message) => {
    if (selectedGroup && message.groupId === selectedGroup.id) {
      setMessages(prev => [...prev, message]);
    }
  };

  const handleMemberJoined = ({ groupId, member }) => {
    if (selectedGroup && groupId === selectedGroup.id) {
      setSelectedGroup(prev => ({
        ...prev,
        members: [...prev.members, member]
      }));
    }
  };

  const handleMemberLeft = ({ groupId, memberId }) => {
    if (selectedGroup && groupId === selectedGroup.id) {
      setSelectedGroup(prev => ({
        ...prev,
        members: prev.members.filter(m => m.id !== memberId)
      }));
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    try {
      const groupData = {
        ...groupForm,
        tags: groupForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };
      
      const res = await axios.post('/api/groups', groupData);
      setGroups(prev => [res.data, ...prev]);
      setShowCreateGroup(false);
      setGroupForm({
        name: '',
        description: '',
        type: 'public',
        tags: '',
        researchArea: '',
        maxMembers: 100,
        settings: {
          allowMemberInvites: true,
          requireApproval: false,
          allowFileSharing: true,
          allowReactions: true
        }
      });
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const joinGroup = async (groupId) => {
    try {
      await axios.post(`/api/groups/${groupId}/join`);
      loadGroups(); // Refresh groups
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  const selectGroup = async (group) => {
    setSelectedGroup(group);
    await loadGroupMessages(group.id);
    
    if (socket) {
      socket.emit('join_group', group.id);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup) return;

    try {
      const message = {
        content: newMessage,
        groupId: selectedGroup.id,
        type: 'text'
      };

      await axios.post(`/api/groups/${selectedGroup.id}/messages`, message);
      setNewMessage('');
      
      if (socket) {
        socket.emit('group_message', message);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getGroupIcon = (type) => {
    switch (type) {
      case 'research': return <AcademicCapIcon className="h-5 w-5" />;
      case 'study': return <BookOpenIcon className="h-5 w-5" />;
      case 'private': return <LockClosedIcon className="h-5 w-5" />;
      default: return <UserGroupIcon className="h-5 w-5" />;
    }
  };

  const getGroupTypeColor = (type) => {
    switch (type) {
      case 'research': return 'bg-blue-100 text-blue-800';
      case 'study': return 'bg-green-100 text-green-800';
      case 'private': return 'bg-gray-100 text-gray-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Groups List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <ChatBubbleLeftRightIcon className="h-6 w-6 mr-2 text-blue-600" />
              Group Chats
            </h2>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Groups List */}
        <div className="flex-1 overflow-y-auto">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => selectGroup(group)}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedGroup?.id === group.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div className="text-gray-500 mr-2">
                      {getGroupIcon(group.type)}
                    </div>
                    <h3 className="font-medium text-gray-900 truncate">{group.name}</h3>
                    {group.type === 'private' && (
                      <LockClosedIcon className="h-4 w-4 ml-1 text-gray-400" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGroupTypeColor(group.type)}`}>
                      {group.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {group.memberCount || 0} members
                    </span>
                  </div>
                  
                  {group.tags && group.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {group.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                          <HashtagIcon className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                      {group.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{group.tags.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {filteredGroups.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No groups found</p>
              <p className="text-sm">Try adjusting your search or create a new group</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedGroup ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-gray-500 mr-3">
                    {getGroupIcon(selectedGroup.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedGroup.name}</h3>
                    <p className="text-sm text-gray-600">{selectedGroup.memberCount || 0} members</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                    <UserPlusIcon className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                    <CogIcon className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                    <EllipsisVerticalIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {message.sender?.firstName?.[0] || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {message.sender?.firstName} {message.sender?.lastName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No messages yet</p>
                  <p className="text-sm text-gray-400">Start the conversation!</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={sendMessage} className="flex space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${selectedGroup.name}`}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Select a group</h3>
              <p className="text-gray-500">Choose a group from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Group</h2>
                <button
                  onClick={() => setShowCreateGroup(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={createGroup} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={groupForm.name}
                      onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter group name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group Type
                    </label>
                    <select
                      value={groupForm.type}
                      onChange={(e) => setGroupForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="research">Research</option>
                      <option value="study">Study Group</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={groupForm.description}
                    onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your group..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={groupForm.tags}
                      onChange={(e) => setGroupForm(prev => ({ ...prev, tags: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="biology, research, collaboration"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Research Area
                    </label>
                    <input
                      type="text"
                      value={groupForm.researchArea}
                      onChange={(e) => setGroupForm(prev => ({ ...prev, researchArea: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Molecular Biology, Physics"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Members
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="1000"
                    value={groupForm.maxMembers}
                    onChange={(e) => setGroupForm(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-900">Group Settings</h3>
                  
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={groupForm.settings.allowMemberInvites}
                        onChange={(e) => setGroupForm(prev => ({
                          ...prev,
                          settings: { ...prev.settings, allowMemberInvites: e.target.checked }
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Allow members to invite others</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={groupForm.settings.requireApproval}
                        onChange={(e) => setGroupForm(prev => ({
                          ...prev,
                          settings: { ...prev.settings, requireApproval: e.target.checked }
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Require approval to join</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={groupForm.settings.allowFileSharing}
                        onChange={(e) => setGroupForm(prev => ({
                          ...prev,
                          settings: { ...prev.settings, allowFileSharing: e.target.checked }
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Allow file sharing</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={groupForm.settings.allowReactions}
                        onChange={(e) => setGroupForm(prev => ({
                          ...prev,
                          settings: { ...prev.settings, allowReactions: e.target.checked }
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Allow message reactions</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateGroup(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 