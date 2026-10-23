import { create } from 'zustand';
import { io } from 'socket.io-client';
import axios from 'axios';
import { persist } from 'zustand/middleware';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds
const RECONNECT_DELAY = 5000; // 5 seconds
const MAX_CACHED_MESSAGES = 100; // Per conversation

const useChatStore = create(
  persist(
    (set, get) => ({
      // State
      conversations: [],
      currentConversation: null,
      messages: [],
      socket: null,
      isConnected: false,
      typingUsers: new Set(),
      unreadCount: 0,
      pendingMessages: new Map(), // Track messages waiting for acknowledgment
      messageCache: new Map(), // Cache messages by conversationId
      socketRetryCount: 0,
      socketRetryTimeout: null,

      // Actions
      initializeSocket: (userId) => {
        const { socket, socketRetryCount } = get();
        
        // Clean up existing socket
        if (socket) {
          socket.disconnect();
        }

        // Clear retry timeout
        if (get().socketRetryTimeout) {
          clearTimeout(get().socketRetryTimeout);
        }

        const apiUrl = import.meta.env.VITE_API_URL || (
          import.meta.env.MODE === 'production' ? 'https://sciconnect.com' : 'http://localhost:3000');

        // Get token from auth store format
        let token = null;
        try {
          const auth = localStorage.getItem('auth');
          if (auth) {
            const parsedAuth = JSON.parse(auth);
            token = parsedAuth.token;
          }
        } catch (error) {
          console.error('Error getting token from localStorage:', error);
        }

        const newSocket = io(apiUrl, {
          auth: { token },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: RECONNECT_DELAY,
          timeout: 10000
        });
        
        newSocket.on('connect', () => {
          console.log('Connected to chat server');
          set({ 
            isConnected: true,
            socketRetryCount: 0,
            socket: newSocket
          });
          newSocket.emit('join', userId);
          
          // Retry pending messages
          get().retryPendingMessages();
        });

        newSocket.on('disconnect', () => {
          console.log('Disconnected from chat server');
          set({ isConnected: false });

          // Attempt to reconnect
          const retryCount = get().socketRetryCount + 1;
          if (retryCount <= MAX_RETRY_ATTEMPTS) {
            const timeout = setTimeout(() => {
              set({ socketRetryCount: retryCount });
              get().initializeSocket(userId);
            }, RECONNECT_DELAY * retryCount);
            set({ socketRetryTimeout: timeout });
          }
        });

        newSocket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          set({ isConnected: false });
        });

        newSocket.on('new_message', (message) => {
          const { currentConversation, messages, messageCache } = get();
          
          // Send delivery acknowledgment
          newSocket.emit('message_received', message.id);
          
          // Add message to current conversation if it matches
          if (currentConversation && message.conversationId === currentConversation.conversationId) {
            set({ messages: [...messages, message] });
            
            // Mark as read if conversation is open
            newSocket.emit('message_read', message.id);
          }

          // Update message cache
          const cachedMessages = messageCache.get(message.conversationId) || [];
          const updatedCache = [...cachedMessages, message].slice(-MAX_CACHED_MESSAGES);
          const newCache = new Map(messageCache);
          newCache.set(message.conversationId, updatedCache);
          set({ messageCache: newCache });
          
          // Update conversations list
          get().fetchConversations();
        });

        newSocket.on('message_status', ({ messageId, status }) => {
          const { messages, pendingMessages, messageCache } = get();
          
          // Update message status in messages list
          const updatedMessages = messages.map(msg => 
            msg.id === messageId ? { ...msg, status } : msg
          );
          
          // Update message cache
          const newCache = new Map(messageCache);
          messageCache.forEach((cachedMessages, conversationId) => {
            const updatedCachedMessages = cachedMessages.map(msg =>
              msg.id === messageId ? { ...msg, status } : msg
            );
            newCache.set(conversationId, updatedCachedMessages);
          });
          
          // Remove from pending if delivered or read
          if (status === 'delivered' || status === 'read') {
            const newPending = new Map(pendingMessages);
            newPending.delete(messageId);
            set({ pendingMessages: newPending });
          }
          
          set({ 
            messages: updatedMessages,
            messageCache: newCache
          });
        });

        newSocket.on('message_error', ({ messageId, error }) => {
          const { messages, pendingMessages, messageCache } = get();
          
          // Update message status to failed
          const updatedMessages = messages.map(msg =>
            msg.id === messageId ? { ...msg, status: 'failed', error } : msg
          );
          
          // Update message cache
          const newCache = new Map(messageCache);
          messageCache.forEach((cachedMessages, conversationId) => {
            const updatedCachedMessages = cachedMessages.map(msg =>
              msg.id === messageId ? { ...msg, status: 'failed', error } : msg
            );
            newCache.set(conversationId, updatedCachedMessages);
          });
          
          // Add to pending messages for retry
          if (!pendingMessages.has(messageId)) {
            const newPending = new Map(pendingMessages);
            newPending.set(messageId, {
              retryCount: 0,
              message: updatedMessages.find(m => m.id === messageId)
            });
            set({ pendingMessages: newPending });
          }
          
          set({ 
            messages: updatedMessages,
            messageCache: newCache
          });
        });

        newSocket.on('user_typing', (data) => {
          const { typingUsers } = get();
          const newTypingUsers = new Set(typingUsers);
          newTypingUsers.add(data.senderId);
          set({ typingUsers: newTypingUsers });
        });

        newSocket.on('user_stop_typing', (data) => {
          const { typingUsers } = get();
          const newTypingUsers = new Set(typingUsers);
          newTypingUsers.delete(data.senderId);
          set({ typingUsers: newTypingUsers });
        });

        set({ socket: newSocket });
      },

      retryPendingMessages: async () => {
        const { pendingMessages, socket } = get();
        
        for (const [messageId, { retryCount, message }] of pendingMessages.entries()) {
          if (retryCount < MAX_RETRY_ATTEMPTS) {
            // Update retry count
            const newPending = new Map(pendingMessages);
            newPending.set(messageId, {
              retryCount: retryCount + 1,
              message
            });
            set({ pendingMessages: newPending });
            
            // Retry sending after delay
            setTimeout(() => {
              if (socket && socket.connected) {
                socket.emit('send_message', message);
              }
            }, RETRY_DELAY * (retryCount + 1));
          }
        }
      },

      disconnectSocket: () => {
        const { socket, socketRetryTimeout } = get();
        if (socket) {
          socket.disconnect();
        }
        if (socketRetryTimeout) {
          clearTimeout(socketRetryTimeout);
        }
        set({ 
          socket: null,
          isConnected: false,
          socketRetryCount: 0,
          socketRetryTimeout: null
        });
      },

      fetchConversations: async () => {
        try {
          const response = await axios.get('/api/chat/conversations');
          
          const conversations = response.data;
          const unreadCount = conversations.reduce((total, conv) => total + conv.unreadCount, 0);
          
          set({ conversations, unreadCount });
        } catch (error) {
          console.error('Error fetching conversations:', error);
        }
      },

      createConversation: async (participantId) => {
        try {
          const response = await axios.post('/api/chat/conversations', 
            { participantId }
          );
          
          const newConversation = response.data;
          set(state => ({
            conversations: [newConversation, ...state.conversations]
          }));
          
          return newConversation;
        } catch (error) {
          console.error('Error creating conversation:', error);
          throw error;
        }
      },

      selectConversation: (conversation) => {
        const { messageCache } = get();
        set({ currentConversation: conversation });

        // Check cache first
        const cachedMessages = messageCache.get(conversation.conversationId);
        if (cachedMessages) {
          set({ messages: cachedMessages });
        }

        // Fetch latest messages
        get().fetchMessages(conversation.conversationId);
      },

      fetchMessages: async (conversationId, page = 1) => {
        try {
          const response = await axios.get(`/api/chat/conversations/${conversationId}/messages?page=${page}`);
          
          const newMessages = response.data;
          
          if (page === 1) {
            // Update cache
            const { messageCache } = get();
            const newCache = new Map(messageCache);
            newCache.set(conversationId, newMessages);
            set({ 
              messages: newMessages,
              messageCache: newCache
            });
          } else {
            set(state => {
              const updatedMessages = [...newMessages, ...state.messages];
              // Update cache
              const newCache = new Map(state.messageCache);
              newCache.set(conversationId, updatedMessages.slice(-MAX_CACHED_MESSAGES));
              return { 
                messages: updatedMessages,
                messageCache: newCache
              };
            });
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      },

      sendMessage: async (content, messageType = 'text', mediaUrl = null) => {
        const { currentConversation, socket, messages, messageCache } = get();
        
        if (!currentConversation) return;

        try {
          const response = await axios.post(
            `/api/chat/conversations/${currentConversation.conversationId}/messages`,
            { content, messageType, mediaUrl }
          );

          const message = response.data;
          
          // Add message to local state with sending status
          const updatedMessages = [...messages, { ...message, status: 'sending' }];
          set({ messages: updatedMessages });

          // Update cache
          const newCache = new Map(messageCache);
          const cachedMessages = messageCache.get(currentConversation.conversationId) || [];
          newCache.set(
            currentConversation.conversationId,
            [...cachedMessages, { ...message, status: 'sending' }].slice(-MAX_CACHED_MESSAGES)
          );
          set({ messageCache: newCache });
          
          // Emit socket event for real-time delivery
          if (socket && socket.connected) {
            socket.emit('send_message', {
              ...message,
              receiverId: message.receiverId
            });
          } else {
            // Add to pending messages if socket is not connected
            const { pendingMessages } = get();
            const newPending = new Map(pendingMessages);
            newPending.set(message.id, {
              retryCount: 0,
              message
            });
            set({ pendingMessages: newPending });
          }
          
          // Update conversations list
          get().fetchConversations();
          
          return message;
        } catch (error) {
          console.error('Error sending message:', error);
          throw error;
        }
      },

      markAsRead: async (conversationId) => {
        try {
          await axios.put(`/api/chat/conversations/${conversationId}/read`, {});
          
          // Update conversations list
          get().fetchConversations();
        } catch (error) {
          console.error('Error marking as read:', error);
        }
      },

      sendTypingIndicator: (receiverId, conversationId) => {
        const { socket } = get();
        if (socket && socket.connected) {
          socket.emit('typing', { receiverId, conversationId });
        }
      },

      stopTypingIndicator: (receiverId, conversationId) => {
        const { socket } = get();
        if (socket && socket.connected) {
          socket.emit('stop_typing', { receiverId, conversationId });
        }
      },

      clearCurrentConversation: () => {
        set({ currentConversation: null, messages: [] });
      },

      clearCache: () => {
        set({ messageCache: new Map() });
      }
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        messageCache: Array.from(state.messageCache.entries()),
        pendingMessages: Array.from(state.pendingMessages.entries())
      }),
      onRehydrateStorage: () => (state) => {
        // Convert arrays back to Maps
        if (state) {
          state.messageCache = new Map(state.messageCache);
          state.pendingMessages = new Map(state.pendingMessages);
        }
      }
    }
  )
);

export default useChatStore; 