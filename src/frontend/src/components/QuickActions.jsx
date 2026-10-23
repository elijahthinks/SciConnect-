import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import {
  PlusIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  BeakerIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  ChartBarIcon,
  BookmarkIcon,
  ShareIcon,
  LightBulbIcon,
  CogIcon,
  XMarkIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

export default function QuickActions({ onClose, className = '' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const quickActions = [
    {
      id: 'create-research',
      title: 'Create Research Post',
      description: 'Share your latest findings and discoveries',
      icon: PlusIcon,
      color: 'from-primary-500 to-sage-500',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-700',
      action: () => {
        navigate('/');
        setTimeout(() => {
          const createPost = document.getElementById('create-research-post');
          if (createPost) {
            createPost.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
              const textarea = createPost.querySelector('textarea');
              if (textarea) textarea.focus();
            }, 500);
          }
        }, 100);
        onClose?.();
      }
    },
    {
      id: 'find-collaborators',
      title: 'Find Collaborators',
      description: 'Connect with researchers in your field',
      icon: UserGroupIcon,
      color: 'from-sage-500 to-primary-500',
      bgColor: 'bg-sage-50',
      textColor: 'text-sage-700',
      action: () => {
        navigate('/explore');
        onClose?.();
      }
    },
    {
      id: 'browse-research',
      title: 'Browse Research',
      description: 'Discover latest research and publications',
      icon: MagnifyingGlassIcon,
      color: 'from-earth-500 to-warm-500',
      bgColor: 'bg-earth-50',
      textColor: 'text-earth-700',
      action: () => {
        navigate('/research');
        onClose?.();
      }
    },
    {
      id: 'start-experiment',
      title: 'Start Experiment',
      description: 'Document your experimental process',
      icon: BeakerIcon,
      color: 'from-warm-500 to-neutral-500',
      bgColor: 'bg-warm-50',
      textColor: 'text-warm-700',
      action: () => {
        navigate('/');
        setTimeout(() => {
          const createPost = document.getElementById('create-research-post');
          if (createPost) {
            // Set research type to experiment
            const experimentButton = createPost.querySelector('[data-research-type="experiment"]');
            if (experimentButton) experimentButton.click();
            createPost.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        onClose?.();
      }
    },
    {
      id: 'write-paper',
      title: 'Write Paper',
      description: 'Create academic papers and publications',
      icon: DocumentTextIcon,
      color: 'from-neutral-500 to-primary-500',
      bgColor: 'bg-neutral-50',
      textColor: 'text-neutral-700',
      action: () => {
        navigate('/');
        setTimeout(() => {
          const createPost = document.getElementById('create-research-post');
          if (createPost) {
            // Set research type to methodology
            const methodologyButton = createPost.querySelector('[data-research-type="methodology"]');
            if (methodologyButton) methodologyButton.click();
            createPost.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        onClose?.();
      }
    },
    {
      id: 'join-study',
      title: 'Join Study',
      description: 'Participate in ongoing research studies',
      icon: AcademicCapIcon,
      color: 'from-primary-500 to-earth-500',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-700',
      action: () => {
        navigate('/explore');
        onClose?.();
      }
    },
    {
      id: 'global-collaboration',
      title: 'Global Collaboration',
      description: 'Connect with international researchers',
      icon: GlobeAltIcon,
      color: 'from-sage-500 to-earth-500',
      bgColor: 'bg-sage-50',
      textColor: 'text-sage-700',
      action: () => {
        navigate('/connections');
        onClose?.();
      }
    },
    {
      id: 'data-analysis',
      title: 'Data Analysis',
      description: 'Share and discuss research data',
      icon: ChartBarIcon,
      color: 'from-earth-500 to-sage-500',
      bgColor: 'bg-earth-50',
      textColor: 'text-earth-700',
      action: () => {
        navigate('/research');
        onClose?.();
      }
    },
    {
      id: 'bookmark-research',
      title: 'Bookmark Research',
      description: 'Save interesting research for later',
      icon: BookmarkIcon,
      color: 'from-warm-500 to-primary-500',
      bgColor: 'bg-warm-50',
      textColor: 'text-warm-700',
      action: () => {
        navigate('/profile');
        onClose?.();
      }
    },
    {
      id: 'share-findings',
      title: 'Share Findings',
      description: 'Share your research with the community',
      icon: ShareIcon,
      color: 'from-primary-500 to-warm-500',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-700',
      action: () => {
        navigate('/');
        onClose?.();
      }
    },
    {
      id: 'research-ideas',
      title: 'Research Ideas',
      description: 'Brainstorm and discuss new research directions',
      icon: LightBulbIcon,
      color: 'from-warm-500 to-sage-500',
      bgColor: 'bg-warm-50',
      textColor: 'text-warm-700',
      action: () => {
        navigate('/groups');
        onClose?.();
      }
    },
    {
      id: 'research-settings',
      title: 'Research Settings',
      description: 'Configure your research preferences',
      icon: CogIcon,
      color: 'from-neutral-500 to-warm-500',
      bgColor: 'bg-neutral-50',
      textColor: 'text-neutral-700',
      action: () => {
        navigate('/settings');
        onClose?.();
      }
    }
  ];

  const handleActionClick = (action) => {
    action.action();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 ${className}`}>
      <div className="bg-white rounded-2xl shadow-2xl border border-white/20 w-full max-w-2xl max-h-[80vh] overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-gradient-to-r from-primary-50/90 to-sage-50/90 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-sage-600 rounded-lg flex items-center justify-center shadow-md">
              <LightBulbIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-sage-600 bg-clip-text text-transparent">
                Quick Actions
              </h2>
              <p className="text-xs text-neutral-600">Choose your next research activity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-white/70 rounded-xl transition-all duration-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* Featured Actions */}
          <div className="mb-4">
            <h3 className="text-base font-semibold text-neutral-900 mb-3">Featured Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.slice(0, 3).map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleActionClick(action)}
                    className={`group relative p-4 rounded-xl border border-neutral-200 hover:border-primary-200 transition-all duration-200 transform hover:scale-105 ${action.bgColor} hover:shadow-md`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className={`font-medium text-sm ${action.textColor} group-hover:text-neutral-900 transition-colors duration-200`}>
                          {action.title}
                        </h4>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {action.description}
                        </p>
                      </div>
                      <ChevronRightIcon className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600 transition-colors duration-200" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* All Actions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-neutral-900">All Actions</h3>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                {isExpanded ? 'Show Less' : 'Show All'}
              </button>
            </div>
            
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 transition-all duration-300 ${
              isExpanded ? 'max-h-none' : 'max-h-64 overflow-hidden'
            }`}>
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleActionClick(action)}
                    className={`group relative p-3 rounded-lg border border-neutral-200 hover:border-primary-200 transition-all duration-200 transform hover:scale-105 bg-white hover:shadow-sm ${action.bgColor} hover:bg-opacity-80`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 bg-gradient-to-r ${action.color} rounded-md flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className={`font-medium text-xs ${action.textColor} group-hover:text-neutral-900 transition-colors duration-200`}>
                          {action.title}
                        </h4>
                        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <h3 className="text-base font-semibold text-neutral-900 mb-3">Recent Activity</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 p-2 bg-neutral-50 rounded-lg">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                  <BeakerIcon className="h-3 w-3 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-neutral-900">Started new experiment</p>
                  <p className="text-xs text-neutral-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-neutral-50 rounded-lg">
                <div className="w-6 h-6 bg-sage-100 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="h-3 w-3 text-sage-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-neutral-900">Connected with Dr. Smith</p>
                  <p className="text-xs text-neutral-500">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-neutral-50 rounded-lg">
                <div className="w-6 h-6 bg-earth-100 rounded-full flex items-center justify-center">
                  <DocumentTextIcon className="h-3 w-3 text-earth-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-neutral-900">Published research paper</p>
                  <p className="text-xs text-neutral-500">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-600">
              Need help? <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">View tutorials</a>
            </p>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick action button for the navbar
export function QuickActionButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="hidden md:flex items-center space-x-1.5 bg-gradient-to-r from-primary-500 to-sage-500 text-white px-2.5 py-1 rounded-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 shadow-md"
    >
      <LightBulbIcon className="h-3 w-3" />
      <span className="font-medium text-xs">Quick Actions</span>
    </button>
  );
}

// Mobile quick action button
export function MobileQuickActionButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden fixed bottom-20 left-4 w-14 h-14 bg-gradient-to-r from-primary-500 to-sage-500 text-white rounded-full shadow-lg transform hover:scale-110 active:scale-95 transition-all duration-200 z-40"
      title="Quick Actions"
    >
      <LightBulbIcon className="h-6 w-6 mx-auto" />
    </button>
  );
} 