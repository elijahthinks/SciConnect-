export default function LoadingSpinner({ size = 'md', color = 'primary', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    primary: 'border-primary-500',
    white: 'border-white',
    gray: 'border-gray-500'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

// Full page loading component
export function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  );
}

// Card loading skeleton
export function CardSkeleton({ className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 animate-pulse ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );
}

// Button loading state
export function ButtonSpinner({ size = 'sm' }) {
  return (
    <LoadingSpinner 
      size={size} 
      color="white" 
      className="inline-flex"
    />
  );
} 