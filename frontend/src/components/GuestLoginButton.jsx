import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../store/auth';

// Lets visitors skip sign-up and explore the site with a shared guest account.
export default function GuestLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const loginAuth = useAuth((state) => state.login);

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/guest');
      loginAuth(res.data.user, res.data.token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start a guest session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleGuestLogin}
        disabled={loading}
        className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {loading ? 'Starting guest session...' : 'Continue as guest (no sign-up needed)'}
      </button>
      {error && <p className="text-sm text-center text-error-700">{error}</p>}
    </div>
  );
}
