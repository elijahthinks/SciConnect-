import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { 
  ChatBubbleLeftRightIcon, 
  MagnifyingGlassIcon, 
  PlusIcon,
  UserIcon,
  PaperAirplaneIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import UserAvatar from '../components/UserAvatar';
import axios from 'axios';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchUsers = useCallback(async (query) => {
    console.log('Searching for:', query); // Debug log
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      console.log('Making API call to /api/social/users with query:', query); // Debug log
      const response = await axios.get('/api/social/users', {
        params: { q: query, limit: 10 }
      });
      console.log('Search response:', response.data); // Debug log
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
      console.error('Error details:', error.response?.data); // Debug log
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
    loadAvailableUsers();
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(() => {
        searchUsers(searchQuery);
      }, 300); // 300ms debounce
      
      return () => clearTimeout(debounceTimer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchUsers]);

  const loadConversations = async () => {
    try {
      const response = await axios.get('/api/chat/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const response = await axios.get('/api/social/users', {
        params: { limit: 100 } // Get all users for messaging
      });
      setAvailableUsers(response.data.users || []);
    } catch (error) {
      console.error('Error loading available users:', error);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await axios.get(`/api/chat/conversations/${conversationId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await axios.post(`/api/chat/conversations/${selectedConversation.conversationId}/messages`, {
        content: newMessage
      });
      setNewMessage('');
      loadMessages(selectedConversation.conversationId);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const startNewConversation = async (participantId) => {
    try {
      const response = await axios.post('/api/chat/conversations', {
        participantId
      });
      setConversations([response.data, ...conversations]);
      setSelectedConversation(response.data);
      setShowNewChat(false);
      setSearchQuery('');
      setSearchResults([]);
      loadMessages(response.data.conversationId);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <ChatBubbleLeftRightIcon className="h-7 w-7 mr-2" />
          Messages
        </h1>
        <p className="text-gray-600">Direct messages with your connections</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Conversations</h2>
                <button
                  onClick={() => setShowNewChat(!showNewChat)}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
              
              {showNewChat && (
                <div className="mb-3">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search people..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  
                  {searchLoading ? (
                    <div className="mt-2 p-2 text-sm text-gray-500 text-center border border-gray-200 rounded-lg">
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="mt-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                      {searchResults.map(person => (
                        <button
                          key={person.id}
                          onClick={() => startNewConversation(person.id)}
                          className="w-full p-2 hover:bg-gray-50 flex items-center space-x-2 text-left"
                        >
                          <UserAvatar user={person} size="sm" />
                          <span className="text-sm font-medium">
                            {person.firstName && person.lastName ? `${person.firstName} ${person.lastName}` : person.username}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : searchQuery && (
                    <div className="mt-2 p-2 text-sm text-gray-500 text-center border border-gray-200 rounded-lg">
                      No users found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4">
                  <div className="text-center text-gray-500 mb-4">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="font-medium">No conversations yet</p>
                    <p className="text-sm">Start messaging with community members</p>
                  </div>
                  
                  {/* Show available users when no conversations */}
                  {availableUsers.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        Community Members
                      </h3>
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {availableUsers.slice(0, 15).map(person => (
                          <div key={person.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                            <Link 
                              to={`/profile/${person.id}`}
                              className="flex items-center space-x-2 flex-1 min-w-0"
                            >
                              <UserAvatar user={person} size="sm" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {person.firstName && person.lastName ? `${person.firstName} ${person.lastName}` : person.username}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {person.position || 'Community Member'}
                                </p>
                              </div>
                            </Link>
                            <button
                              onClick={() => startNewConversation(person.id)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Start conversation"
                            >
                              <ChatBubbleLeftRightIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                conversations.map(conversation => (
                  <button
                    key={conversation.id}
                    onClick={() => {
                      setSelectedConversation(conversation);
                      loadMessages(conversation.conversationId);
                    }}
                    className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 text-left ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <UserAvatar user={conversation.otherParticipant} size="md" showOnlineStatus={true} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {conversation.otherParticipant?.firstName && conversation.otherParticipant?.lastName 
                            ? `${conversation.otherParticipant.firstName} ${conversation.otherParticipant.lastName}`
                            : conversation.otherParticipant?.username}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessageAt 
                            ? new Date(conversation.lastMessageAt).toLocaleDateString()
                            : 'No messages yet'}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <UserAvatar user={selectedConversation.otherParticipant} size="md" showOnlineStatus={true} />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedConversation.otherParticipant?.firstName && selectedConversation.otherParticipant?.lastName 
                            ? `${selectedConversation.otherParticipant.firstName} ${selectedConversation.otherParticipant.lastName}`
                            : selectedConversation.otherParticipant?.username}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {selectedConversation.otherParticipant?.position || 'Community Member'}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/profile/${selectedConversation.otherParticipant?.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId === user.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === user.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.createdAt)}
                          </p>
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
                      <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <ChatBubbleLeftRightIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Select a conversation to start messaging</p>
                  <p className="text-sm mt-2">Or click the + button to start a new conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 