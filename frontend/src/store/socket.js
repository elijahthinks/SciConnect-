import { io } from 'socket.io-client';
import { create } from 'zustand';
import useNotificationStore from './notifications';
import { SOCKET_URL } from '../config';

let socket = null;

const useSocketStore = create((set) => ({
  socket: null,
  isConnected: false,

  initSocket: (token) => {
    if (socket || !SOCKET_URL) return;

    // Create new socket connection
    socket = io(SOCKET_URL, {
      auth: { token }
    });

    // Set up event listeners
    socket.on('connect', () => {
      set({ isConnected: true, socket });
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
      console.log('Socket disconnected');
    });

    socket.on('notification', (notification) => {
      useNotificationStore.getState().addNotification(notification);
    });

    return socket;
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
      set({ socket: null, isConnected: false });
    }
  },

  // Helper method to emit events
  emit: (event, data) => {
    if (socket) {
      socket.emit(event, data);
    }
  }
}));

// Export both the store and a convenience hook
export default useSocketStore;
export const useSocket = useSocketStore; 