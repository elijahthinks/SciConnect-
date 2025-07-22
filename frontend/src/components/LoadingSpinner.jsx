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
    gray: 'border-neutral-500'
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

// Enhanced full page loading component
export function PageLoader({ message = 'Loading...', showSpinner = true }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-earth-50 flex items-center justify-center animate-fadeIn">
      <div className="text-center max-w-md mx-auto px-6">
        {showSpinner && (
          <div className="mb-6">
            <div className="relative">
              <LoadingSpinner size="xl" className="animate-float" />
              <div className="absolute inset-0 rounded-full border-2 border-primary-200 animate-pulse"></div>
            </div>
          </div>
        )}
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">{message}</h2>
        <p className="text-neutral-600">Please wait while we prepare your experience...</p>
        <div className="mt-6 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}

// Enhanced card loading skeleton
export function CardSkeleton({ className = '', lines = 3 }) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 animate-pulse ${className}`}>
      <div className="flex items-center space-x-4 mb-6">
        <div className="h-12 w-12 bg-neutral-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
          <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={`h-4 bg-neutral-200 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}></div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div className="flex space-x-2">
          <div className="h-8 w-16 bg-neutral-200 rounded-lg"></div>
          <div className="h-8 w-16 bg-neutral-200 rounded-lg"></div>
        </div>
        <div className="h-8 w-20 bg-neutral-200 rounded-lg"></div>
      </div>
    </div>
  );
}

// Enhanced post skeleton
export function PostSkeleton({ className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 animate-pulse ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="h-12 w-12 bg-neutral-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-neutral-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-neutral-200 rounded w-1/3"></div>
        </div>
        <div className="h-6 w-6 bg-neutral-200 rounded"></div>
      </div>
      
      {/* Content */}
      <div className="space-y-3 mb-4">
        <div className="h-4 bg-neutral-200 rounded w-full"></div>
        <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
        <div className="h-4 bg-neutral-200 rounded w-4/6"></div>
      </div>
      
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="h-6 w-16 bg-neutral-200 rounded-full"></div>
        <div className="h-6 w-20 bg-neutral-200 rounded-full"></div>
        <div className="h-6 w-14 bg-neutral-200 rounded-full"></div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
        <div className="flex space-x-4">
          <div className="h-8 w-16 bg-neutral-200 rounded-lg"></div>
          <div className="h-8 w-16 bg-neutral-200 rounded-lg"></div>
          <div className="h-8 w-16 bg-neutral-200 rounded-lg"></div>
        </div>
        <div className="h-8 w-20 bg-neutral-200 rounded-lg"></div>
      </div>
    </div>
  );
}

// Enhanced button loading state
export function ButtonSpinner({ size = 'sm', text = 'Loading...' }) {
  return (
    <div className="inline-flex items-center space-x-2">
      <LoadingSpinner 
        size={size} 
        color="white" 
        className="inline-flex"
      />
      {text && <span className="text-sm">{text}</span>}
    </div>
  );
}

// Enhanced skeleton for forms
export function FormSkeleton({ className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 animate-pulse ${className}`}>
      <div className="space-y-6">
        <div>
          <div className="h-4 bg-neutral-200 rounded w-1/4 mb-2"></div>
          <div className="h-12 bg-neutral-200 rounded-xl"></div>
        </div>
        <div>
          <div className="h-4 bg-neutral-200 rounded w-1/3 mb-2"></div>
          <div className="h-12 bg-neutral-200 rounded-xl"></div>
        </div>
        <div>
          <div className="h-4 bg-neutral-200 rounded w-1/5 mb-2"></div>
          <div className="h-24 bg-neutral-200 rounded-xl"></div>
        </div>
        <div className="flex space-x-3">
          <div className="h-10 w-20 bg-neutral-200 rounded-lg"></div>
          <div className="h-10 w-20 bg-neutral-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

// Enhanced skeleton for lists
export function ListSkeleton({ items = 5, className = '' }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-neutral-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
              <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
            </div>
            <div className="h-6 w-6 bg-neutral-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Enhanced skeleton for tables
export function TableSkeleton({ rows = 5, columns = 4, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden animate-pulse ${className}`}>
      {/* Header */}
      <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-neutral-200 rounded w-20"></div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-neutral-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-neutral-200 rounded w-16"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 