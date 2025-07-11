import { useState, useEffect, useRef, useCallback } from 'react';
import { PaperAirplaneIcon, CheckIcon, CheckCircleIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../store/auth';
import useChatStore from '../store/chat';
import useSocketStore from '../store/socket';
import ChatMediaUpload from './ChatMediaUpload';
import ChatMediaMessage from './ChatMediaMessage';
import ReactMarkdown from 'react-markdown';
import EmojiPicker from 'emoji-picker-react';

const MessageStatus = ({ status }) => {
  switch (status) {
    case 'sending':
      return (
        <div className="flex items-center text-blue-400">
          <CheckIcon className="w-4 h-4" />
        </div>
      );
    case 'sent':
      return (
        <div className="flex items-center text-blue-400">
          <CheckIcon className="w-4 h-4" />
          <CheckIcon className="w-4 h-4 -ml-2" />
        </div>
      );
    case 'delivered':
      return (
        <div className="flex items-center text-blue-500">
          <CheckIcon className="w-4 h-4" />
          <CheckIcon className="w-4 h-4 -ml-2" />
        </div>
      );
    case 'read':
      return (
        <div className="flex items-center text-green-500">
          <CheckCircleIcon className="w-4 h-4" />
          <CheckCircleIcon className="w-4 h-4 -ml-2" />
        </div>
      );
    case 'failed':
      return (
        <div className="flex items-center text-red-500 cursor-pointer hover:text-red-600 transition-colors duration-200">
          <ExclamationCircleIcon className="w-4 h-4" />
        </div>
      );
    default:
      return null;
  }
};

export default function ChatWindow({ isOpen, onClose }) {
  const { user } = useAuth();
  const {
    conversations,
    currentConversation,
    messages,
    fetchConversations,
    selectConversation,
    sendMessage,
    markAsRead,
    sendTypingIndicator,
    stopTypingIndicator,
    retryPendingMessages,
    fetchMessages
  } = useChatStore();
  
  const { isConnected, socket } = useSocketStore();

  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [retryingMessages, setRetryingMessages] = useState(new Set());
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastScrollHeightRef = useRef(0);

  useEffect(() => {
    if (isOpen && !isInitializing) {
      setIsInitializing(true);
      fetchConversations().finally(() => {
        setIsInitializing(false);
      });
    }
  }, [isOpen, fetchConversations]);

  useEffect(() => {
    if (currentConversation) {
      markAsRead(currentConversation.conversationId);
      setCurrentPage(1);
      setHasMore(true);
    }
  }, [currentConversation, markAsRead]);

  useEffect(() => {
    if (!isLoadingMore && messages.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages, isLoadingMore]);

  useEffect(() => {
    if (!isConnected && socket) {
      retryPendingMessages();
    }
  }, [isConnected, socket, retryPendingMessages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = useCallback(async () => {
    const container = messagesContainerRef.current;
    if (!container || isLoadingMore || !hasMore || !currentConversation) return;

    if (container.scrollTop <= 100) {
      setIsLoadingMore(true);
      lastScrollHeightRef.current = container.scrollHeight;

      try {
        const nextPage = currentPage + 1;
        const oldMessagesLength = messages.length;
        await fetchMessages(currentConversation.conversationId, nextPage);
        
        // Check if we got new messages
        if (messages.length === oldMessagesLength) {
          setHasMore(false);
        } else {
          setCurrentPage(nextPage);
          // Maintain scroll position
          setTimeout(() => {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - lastScrollHeightRef.current;
          }, 50);
        }
      } catch (error) {
        console.error('Error loading more messages:', error);
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [isLoadingMore, hasMore, currentConversation, currentPage, messages.length, fetchMessages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentConversation) return;

    try {
      await sendMessage(messageInput.trim());
      setMessageInput('');
      stopTypingIndicator(currentConversation.otherParticipant.id, currentConversation.conversationId);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleMediaUpload = async (mediaData) => {
    if (!currentConversation) return;

    try {
      await sendMessage(
        mediaData.type === 'document' ? `Sent a document: ${mediaData.url.split('/').pop()}` : '',
        mediaData.type,
        mediaData.url
      );
    } catch (error) {
      console.error('Failed to send media message:', error);
    }
  };

  const handleMediaUploadError = (error) => {
    console.error('Media upload error:', error);
  };

  const handleRetryMessage = async (message) => {
    if (retryingMessages.has(message.id)) return;

    setRetryingMessages(prev => new Set([...prev, message.id]));
    try {
      await sendMessage(message.content, message.messageType, message.mediaUrl);
    } catch (error) {
      console.error('Failed to retry message:', error);
    } finally {
      setRetryingMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(message.id);
        return newSet;
      });
    }
  };

  const handleTyping = (e) => {
    setMessageInput(e.target.value);
    
    if (!currentConversation) return;

    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(currentConversation.otherParticipant.id, currentConversation.conversationId);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTypingIndicator(currentConversation.otherParticipant.id, currentConversation.conversationId);
    }, 1000);
  };

  const handleEmojiClick = (emojiData) => {
    setMessageInput(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/90 to-purple-50/90 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">💬</span>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Messages
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white/70 rounded-xl transition-all duration-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200/50 bg-gradient-to-b from-blue-50/20 to-purple-50/20 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-700 mb-4 text-lg">Conversations</h3>
              {isInitializing ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="p-4 bg-white/60 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => selectConversation(conversation)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                        currentConversation?.id === conversation.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-[1.02]'
                          : 'bg-white/70 hover:bg-white/90 shadow-sm hover:shadow-md hover:transform hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg border border-white/50 flex-shrink-0">
                          {conversation.otherParticipant.avatar ? (
                            <img
                              src={conversation.otherParticipant.avatar}
                              alt={conversation.otherParticipant.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm text-blue-600 font-bold">
                              {conversation.otherParticipant.name?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`font-semibold truncate ${
                              currentConversation?.id === conversation.id ? 'text-white' : 'text-gray-900'
                            }`}>
                              {conversation.otherParticipant.name}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full px-2 py-1 font-bold shadow-lg ml-2 flex-shrink-0">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm truncate ${
                            currentConversation?.id === conversation.id ? 'text-white/80' : 'text-gray-500'
                          }`}>
                            {conversation.lastMessageAt
                              ? formatTime(conversation.lastMessageAt)
                              : 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {conversations.length === 0 && !isInitializing && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">💬</span>
                      </div>
                      <p className="text-gray-500 font-medium">No conversations yet</p>
                      <p className="text-gray-400 text-sm mt-1">Start a conversation from a user's profile</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-gradient-to-b from-white/50 to-white/30">
            {currentConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm flex-shrink-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg border border-white/50">
                      {currentConversation.otherParticipant.avatar ? (
                        <img
                          src={currentConversation.otherParticipant.avatar}
                          alt={currentConversation.otherParticipant.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm text-blue-600 font-bold">
                          {currentConversation.otherParticipant.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {currentConversation.otherParticipant.name}
                      </h3>
                      <p className={`text-sm font-medium ${
                        isConnected ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {isConnected ? '🟢 Online' : '⚪ Offline'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  {isLoadingMore && (
                    <div className="flex justify-center py-2">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === user.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`relative max-w-[70%] rounded-2xl p-4 shadow-lg ${
                          message.senderId === user.id
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                            : 'bg-white/95 backdrop-blur-sm text-gray-900 border border-white/50'
                        }`}
                      >
                        {message.messageType === 'text' ? (
                          <div className="whitespace-pre-wrap break-words">
                            {message.content}
                          </div>
                        ) : (
                          <ChatMediaMessage
                            type={message.messageType}
                            url={message.mediaUrl}
                            messageType={message.messageType === 'video' ? 'video/mp4' : undefined}
                          />
                        )}
                        <div className="flex items-center justify-end mt-2 space-x-2">
                          <span className={`text-xs font-medium ${
                            message.senderId === user.id ? 'text-white/80' : 'text-gray-500'
                          }`}>
                            {formatTime(message.createdAt)}
                          </span>
                          {message.senderId === user.id && (
                            <div 
                              onClick={() => message.status === 'failed' && handleRetryMessage(message)}
                              className={message.status === 'failed' ? 'cursor-pointer' : ''}
                            >
                              <MessageStatus status={message.status} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200/50 bg-white/90 backdrop-blur-sm flex-shrink-0">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <ChatMediaUpload
                        onUploadComplete={handleMediaUpload}
                        onUploadError={handleMediaUploadError}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 flex-shrink-0"
                    >
                      <span className="text-xl">😊</span>
                    </button>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={handleTyping}
                        placeholder="Type a message..."
                        className="w-full p-3 bg-white/90 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                      {showEmojiPicker && (
                        <div className="absolute bottom-full mb-2 right-0 z-50">
                          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                            <EmojiPicker
                              onEmojiClick={handleEmojiClick}
                              width={320}
                              height={400}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={!messageInput.trim()}
                      className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex-shrink-0"
                    >
                      <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">💬</span>
                  </div>
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500">Choose a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 