import { create } from 'zustand';
import axios from 'axios';
import useChatStore from './chat';
import useSocketStore from './socket';
import useOnlineStatusStore from './onlineStatus';
import { isDemo } from '../demo/api';

// SciConnect has no sign-in: everyone uses the shared guest account.
// This placeholder is shown until the API answers, or if it can't be reached.
const GUEST = {
  id: 1,
  username: 'guest',
  firstName: 'Guest',
  lastName: 'Researcher',
  name: 'Guest Researcher',
};

// Clear sessions saved by the old sign-in
localStorage.removeItem('auth');

export const useAuth = create((set) => ({
  user: GUEST,
  token: null,
  loadUser: async () => {
    try {
      const { data } = await axios.get('/api/auth/me');
      if (!data?.user) return;
      set({ user: data.user });
      // The demo has no server to hold a live connection
      if (isDemo()) return;
      useSocketStore.getState().initSocket(null);
      useChatStore.getState().initializeSocket(data.user.id);
      useOnlineStatusStore.getState().fetchCurrentUserStatus();
    } catch (error) {
      console.warn('API unavailable; showing the guest placeholder.', error.message);
    }
  },
}));

useAuth.getState().loadUser();
