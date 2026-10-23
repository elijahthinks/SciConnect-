import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

class AuthErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasAuthError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Check if it's an authentication error
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      return { hasAuthError: true, error };
    }
    return null;
  }

  componentDidCatch(error, errorInfo) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      console.error('Authentication error caught:', error, errorInfo);
      // Clear invalid auth data
      localStorage.removeItem('auth');
    }
  }

  handleRetry = () => {
    // Clear auth and redirect to login
    localStorage.removeItem('auth');
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasAuthError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 p-8 max-w-md mx-4">
            <div className="text-center">
              <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Authentication Required
              </h2>
              <p className="text-gray-600 mb-6">
                Your session has expired. Please log in again to continue.
              </p>
              <button
                onClick={this.handleRetry}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 px-6 rounded-lg hover:from-red-700 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105"
              >
                <ArrowPathIcon className="inline h-5 w-5 mr-2" />
                Login Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary; 