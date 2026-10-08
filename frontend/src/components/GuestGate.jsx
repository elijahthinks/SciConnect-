import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../store/auth';

// This is a show-only site, so there are no login or sign-up pages.
// Anyone who opens the site is signed in automatically with a shared guest account.
export default function GuestGate() {
  const [error, setError] = useState('');
  const loginAuth = useAuth((state) => state.login);

  const startGuestSession = useCallback(async () => {
    setError('');
    try {
      const res = await axios.post('/api/auth/guest');
      loginAuth(res.data.user, res.data.token);
    } catch (err) {
      // Show the server's own explanation when there is one, so setup
      // problems (missing env vars, no database) are visible on the page.
      const status = err.response?.status;
      const message = err.response?.data?.message;
      setError(message || (status
        ? `The server responded with an error (${status}). Check the function logs on Vercel.`
        : 'Could not reach the server.'));
    }
  }, [loginAuth]);

  useEffect(() => {
    startGuestSession();
  }, [startGuestSession]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-2xl font-bold text-white">S</span>
        </div>
        {error ? (
          <>
            <p className="text-gray-900 font-semibold">SciConnect couldn&apos;t start</p>
            <p className="text-sm text-error-700 break-words">{error}</p>
            <button
              type="button"
              onClick={startGuestSession}
              className="py-2 px-4 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Try again
            </button>
          </>
        ) : (
          <p className="text-gray-600">Loading SciConnect…</p>
        )}
      </div>
    </div>
  );
}
