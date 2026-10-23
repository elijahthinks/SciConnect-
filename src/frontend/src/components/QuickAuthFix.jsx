import { useState } from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function QuickAuthFix() {
  const [fixed, setFixed] = useState(false);

  const handleAuthFix = () => {
    try {
      // Clear invalid auth data
      localStorage.removeItem('auth');
      
      // Show success message
      setFixed(true);
      
      // Redirect to login after a brief delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (error) {
      console.error('Error fixing auth:', error);
    }
  };

  if (fixed) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
          <div className="text-center">
            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Fixed!
            </h3>
            <p className="text-gray-600 mb-4">
              Redirecting you to login...
            </p>
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-500">Please wait...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-amber-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Issue Detected
          </h3>
          <p className="text-gray-600 mb-6">
            Your session has expired or is invalid. Click below to fix this and log in again.
          </p>
          <button
            onClick={handleAuthFix}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105"
          >
            Fix Authentication
          </button>
        </div>
      </div>
    </div>
  );
} 