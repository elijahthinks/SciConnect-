import { create } from 'zustand';
import useChatStore from './chat';
import useSocketStore from './socket';
import useOnlineStatusStore from './onlineStatus';

const getInitialAuth = () => {
  console.log('Getting initial auth state');
  const stored = localStorage.getItem('auth');
  if (stored) {
    try {
      const auth = JSON.parse(stored);
      console.log('Found stored auth:', { user: auth.user ? 'exists' : 'null', token: auth.token ? 'exists' : 'null' });
      // Initialize socket if user data exists
      if (auth.token) {
        useSocketStore.getState().initSocket(auth.token);
      }
      return auth;
    } catch (error) {
      console.error('Error parsing stored auth:', error);
      return { user: null, token: null };
    }
  }
  console.log('No stored auth found');
  return { user: null, token: null };
};

export const useAuth = create((set) => ({
  ...getInitialAuth(),
  login: (user, token) => {
    console.log('Auth store login called with:', { user: user ? 'exists' : 'null', token: token ? 'exists' : 'null' });
    if (!user || !token) {
      console.error('Invalid login data:', { user, token });
      return;
    }
    set({ user, token });
    const authData = { user, token };
    console.log('Saving auth data to localStorage');
    localStorage.setItem('auth', JSON.stringify(authData));
    console.log('Auth state updated, localStorage set');
    // Initialize sockets when user logs in
    useSocketStore.getState().initSocket(token);
    useChatStore.getState().initializeSocket(user.id);
    
    // Initialize online status
    useOnlineStatusStore.getState().fetchCurrentUserStatus();
    console.log('Sockets and online status initialized');
  },
  logout: () => {
    console.log('Auth store logout called');
    set({ user: null, token: null });
    localStorage.removeItem('auth');
    // Disconnect sockets when user logs out
    useSocketStore.getState().disconnect();
    useChatStore.getState().disconnectSocket();
    
    // Clear online status
    useOnlineStatusStore.getState().clearStatuses();
    console.log('Logout complete, auth cleared');
  },
})); 