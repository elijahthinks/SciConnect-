import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../store/auth';
import GuestLoginButton from '../components/GuestLoginButton';
import { EyeIcon, EyeSlashIcon, UserIcon, LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const navigate = useNavigate();
  const loginAuth = useAuth((state) => state.login);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setResetMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (forgotPasswordMode) {
        // Handle forgot password
        const res = await axios.post('/api/auth/forgot-password', { email: form.email });
        setResetMessage('If an account with that email exists, a password reset link has been sent.');
        setForgotPasswordMode(false);
      } else {
        // Handle login
        console.log('Attempting login with:', { email: form.email });
        const res = await axios.post('/api/auth/login', form);
        console.log('Login response:', res.data);
        
        if (res.data.user && res.data.token) {
          console.log('Login successful, storing auth data');
          console.log('User data:', res.data.user);
          console.log('Token exists:', !!res.data.token);
          
          // Store auth data
          loginAuth(res.data.user, res.data.token);
          
          // Verify auth was stored
          const storedAuth = localStorage.getItem('auth');
          console.log('Auth stored in localStorage:', !!storedAuth);
          if (storedAuth) {
            try {
              const parsedAuth = JSON.parse(storedAuth);
              console.log('Parsed stored auth:', { hasUser: !!parsedAuth.user, hasToken: !!parsedAuth.token });
            } catch (parseError) {
              console.error('Error parsing stored auth:', parseError);
            }
          }
          
          console.log('Navigating to home page');
          navigate('/', { replace: true });
        } else {
          console.error('Invalid response format:', res.data);
          setError('Invalid response from server');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // More specific error handling
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        console.error('Error response:', {
          status,
          data,
          message: data?.message
        });
        
        // Handle specific error cases
        if (status === 401) {
          setError(data?.message || 'Invalid email or password');
        } else if (status === 423) {
          setError(data?.message || 'Account is temporarily locked');
        } else if (status === 403) {
          setError(data?.message || 'Account is deactivated');
        } else if (status === 429) {
          setError(data?.message || 'Too many attempts. Please try again later.');
        } else {
          setError(data?.message || 'Login failed. Please try again.');
        }
      } else if (err.request) {
        console.error('Network error:', err.request);
        setError('Network error. Please check your connection and try again.');
      } else {
        console.error('Request setup error:', err.message);
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-earth-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Welcome back to SciConnect
          </h2>
          <p className="text-sm text-gray-600">
            {forgotPasswordMode 
              ? 'Enter your email to reset your password'
              : 'Sign in to continue connecting with fellow scientists and technologists'
            }
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-error-50 border-l-4 border-error-400 p-4 rounded-lg">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-error-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {resetMessage && (
          <div className="bg-success-50 border-l-4 border-success-400 p-4 rounded-lg">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-success-700">{resetMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Guest access: skip sign-up on the demo site */}
        <GuestLoginButton />

        {/* OAuth Buttons */}
        {!forgotPasswordMode && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => handleOAuthLogin('facebook')}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-3" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {!forgotPasswordMode && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Forgot Password Link */}
          {!forgotPasswordMode && (
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => setForgotPasswordMode(true)}
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
                >
                  Forgot your password?
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-3"></div>
                  {forgotPasswordMode ? 'Sending...' : 'Signing in...'}
                </div>
              ) : (
                forgotPasswordMode ? 'Send Reset Link' : 'Sign in'
              )}
            </button>
          </div>

          {/* Back to Login / Sign Up Links */}
          <div className="text-center space-y-2">
            {forgotPasswordMode ? (
              <button
                type="button"
                onClick={() => setForgotPasswordMode(false)}
                className="text-sm text-primary-600 hover:text-primary-500 transition-colors duration-200"
              >
                ← Back to sign in
              </button>
            ) : (
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
                >
                  Sign up here
                </Link>
              </p>
            )}
          </div>
        </form>

        {/* Features Preview */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500 mb-4">Join the community</p>
                      <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-primary-600 text-sm font-semibold">Share</div>
                <p className="text-xs text-neutral-600">Research</p>
              </div>
              <div className="space-y-1">
                <div className="text-accent-600 text-sm font-semibold">Connect</div>
                <p className="text-xs text-neutral-600">Collaborate</p>
              </div>
              <div className="space-y-1">
                <div className="text-success-600 text-sm font-semibold">Discover</div>
                <p className="text-xs text-neutral-600">Ideas</p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
} 