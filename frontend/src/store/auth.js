import { create } from 'zustand';
import useChatStore from './chat';
import useSocketStore from './socket';

const getInitialAuth = () => {
  const stored = localStorage.getItem('auth');
  if (stored) {
    try {
      const auth = JSON.parse(stored);
      // Initialize socket if user data exists
      if (auth.token) {
        useSocketStore.getState().initSocket(auth.token);
      }
      return auth;
    } catch {
      return { user: null, token: null };
    }
  }
  return { user: null, token: null };
};

export const useAuth = create((set) => ({
  ...getInitialAuth(),
  login: (user, token) => {
    set({ user, token });
    localStorage.setItem('auth', JSON.stringify({ user, token }));
    // Initialize sockets when user logs in
    useSocketStore.getState().initSocket(token);
    useChatStore.getState().initializeSocket(user.id);
  },
  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('auth');
    // Disconnect sockets when user logs out
    useSocketStore.getState().disconnect();
    useChatStore.getState().disconnectSocket();
  },
})); 