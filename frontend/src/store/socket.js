import { io } from 'socket.io-client';
import { create } from 'zustand';
import useNotificationStore from './notifications';

let socket = null;

const useSocketStore = create((set) => ({
  socket: null,
  isConnected: false,

  initSocket: (token) => {
    if (socket) return;

    // Determine API URL depending on environment (Vite uses import.meta.env)
    const apiUrl = import.meta.env.VITE_API_URL || (
      import.meta.env.MODE === 'production'
        ? 'https://sciconnect.com'
        : 'http://localhost:3000'
    );

    // Create new socket connection
    socket = io(apiUrl, {
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

export default useSocketStore; 