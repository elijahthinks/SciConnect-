import { create } from 'zustand';
import axios from 'axios';

const useOnlineStatusStore = create((set, get) => ({
  // State
  onlineUsers: new Set(),
  userStatuses: new Map(), // userId -> { isOnline, lastActive }
  isLoading: false,

  // Actions
  fetchUserStatus: async (userId) => {
    try {
      const response = await axios.get(`/api/online-status/user/${userId}`);
      const { isOnline, lastActive } = response.data;
      
      set(state => {
        const newUserStatuses = new Map(state.userStatuses);
        newUserStatuses.set(userId, { isOnline, lastActive });
        return { userStatuses: newUserStatuses };
      });
      
      return { isOnline, lastActive };
    } catch (error) {
      console.error('Error fetching user status:', error);
      return { isOnline: false, lastActive: null };
    }
  },

  fetchMultipleUserStatuses: async (userIds) => {
    if (userIds.length === 0) return;
    
    try {
      set({ isLoading: true });
      
      const response = await axios.post('/api/online-status/users', { userIds });
      const statuses = response.data;
      
      set(state => {
        const newUserStatuses = new Map(state.userStatuses);
        const newOnlineUsers = new Set(state.onlineUsers);
        
        statuses.forEach(({ userId, isOnline, lastActive }) => {
          newUserStatuses.set(userId, { isOnline, lastActive });
          if (isOnline) {
            newOnlineUsers.add(userId);
          } else {
            newOnlineUsers.delete(userId);
          }
        });
        
        return { 
          userStatuses: newUserStatuses,
          onlineUsers: newOnlineUsers,
          isLoading: false
        };
      });
      
      return statuses;
    } catch (error) {
      console.error('Error fetching multiple user statuses:', error);
      set({ isLoading: false });
      return userIds.map(id => ({ userId: id, isOnline: false, lastActive: null }));
    }
  },

  fetchOnlineUsers: async () => {
    try {
      set({ isLoading: true });
      
      const response = await axios.get('/api/online-status/online');
      const onlineUsers = response.data;
      
      const onlineUserIds = new Set(onlineUsers.map(user => user.id));
      
      set(state => {
        const newUserStatuses = new Map(state.userStatuses);
        
        onlineUsers.forEach(user => {
          newUserStatuses.set(user.id, { 
            isOnline: true, 
            lastActive: user.lastActive 
          });
        });
        
        return { 
          onlineUsers: onlineUserIds,
          userStatuses: newUserStatuses,
          isLoading: false
        };
      });
      
      return onlineUsers;
    } catch (error) {
      console.error('Error fetching online users:', error);
      set({ isLoading: false });
      return [];
    }
  },

  fetchCurrentUserStatus: async () => {
    try {
      const response = await axios.get('/api/online-status/me');
      const { userId, isOnline, lastActive } = response.data;
      
      set(state => {
        const newUserStatuses = new Map(state.userStatuses);
        newUserStatuses.set(userId, { isOnline, lastActive });
        
        const newOnlineUsers = new Set(state.onlineUsers);
        if (isOnline) {
          newOnlineUsers.add(userId);
        } else {
          newOnlineUsers.delete(userId);
        }
        
        return { 
          userStatuses: newUserStatuses,
          onlineUsers: newOnlineUsers
        };
      });
      
      return { isOnline, lastActive };
    } catch (error) {
      console.error('Error fetching current user status:', error);
      return { isOnline: false, lastActive: null };
    }
  },

  // Helper methods
  isUserOnline: (userId) => {
    const { userStatuses } = get();
    const status = userStatuses.get(userId);
    return status ? status.isOnline : false;
  },

  getUserLastActive: (userId) => {
    const { userStatuses } = get();
    const status = userStatuses.get(userId);
    return status ? status.lastActive : null;
  },

  getOnlineUsersCount: () => {
    const { onlineUsers } = get();
    return onlineUsers.size;
  },

  // Update user status (for real-time updates)
  updateUserStatus: (userId, isOnline, lastActive = null) => {
    set(state => {
      const newUserStatuses = new Map(state.userStatuses);
      newUserStatuses.set(userId, { isOnline, lastActive });
      
      const newOnlineUsers = new Set(state.onlineUsers);
      if (isOnline) {
        newOnlineUsers.add(userId);
      } else {
        newOnlineUsers.delete(userId);
      }
      
      return { 
        userStatuses: newUserStatuses,
        onlineUsers: newOnlineUsers
      };
    });
  },

  // Clear all statuses (for logout)
  clearStatuses: () => {
    set({ 
      onlineUsers: new Set(),
      userStatuses: new Map(),
      isLoading: false
    });
  },

  // Get formatted last active time
  getFormattedLastActive: (userId) => {
    const lastActive = get().getUserLastActive(userId);
    if (!lastActive) return 'Never';
    
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffInMinutes = Math.floor((now - lastActiveDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return lastActiveDate.toLocaleDateString();
  }
}));

export default useOnlineStatusStore; 