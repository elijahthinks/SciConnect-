import { create } from 'zustand';

const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  
  addNotification: (notification) => 
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    })),
    
  markAsRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    })),
    
  setNotifications: (notifications) =>
    set({ notifications }),
    
  setUnreadCount: (count) =>
    set({ unreadCount: count }),
    
  clearNotifications: () =>
    set({ notifications: [], unreadCount: 0 }),
}));

export default useNotificationStore; 