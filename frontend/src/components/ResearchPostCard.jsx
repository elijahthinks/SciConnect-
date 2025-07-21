import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChatBubbleLeftIcon, 
  ShareIcon, 
  TrashIcon, 
  PencilIcon, 
  GlobeAltIcon, 
  UserGroupIcon, 
  LockClosedIcon, 
  TagIcon,
  BeakerIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  AcademicCapIcon,
  EyeIcon,
  FlagIcon,
  UserPlusIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../store/auth';
import axios from 'axios';
import CommentSection from './CommentSection';
import ReactionButton from './ReactionButton';
import UserAvatar from './UserAvatar';
import FactCheckSection from './FactCheckSection';
import CollaborationSection from './CollaborationSection';

const visibilityIcons = {
  public: { icon: GlobeAltIcon, label: 'Public' },
  connections: { icon: UserGroupIcon, label: 'Connections Only' },
  private: { icon: LockClosedIcon, label: 'Private' }
};

const researchTypeIcons = {
  experiment: BeakerIcon,
  survey: DocumentIcon,
  review: DocumentIcon,
  case_study: DocumentIcon,
  theoretical: DocumentIcon,
  methodology: DocumentIcon,
  results: DocumentIcon,
  discussion: DocumentIcon
};

const factCheckStatusConfig = {
  pending: { icon: ExclamationTriangleIcon, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending Review' },
  verified: { icon: CheckCircleIcon, color: 'text-green-600', bg: 'bg-green-100', label: 'Verified' },
  flagged: { icon: FlagIcon, color: 'text-red-600', bg: 'bg-red-100', label: 'Flagged' },
  disputed: { icon: ExclamationTriangleIcon, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Disputed' }
};

export default function ResearchPostCard({ post, onDelete, onUpdate }) {
  const { user, token } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showFactChecks, setShowFactChecks] = useState(false);
  const [showCollaborations, setShowCollaborations] = useState(false);

  const isOwnPost = user && post.author?.id === user.id;
  const VisibilityIcon = visibilityIcons[post.visibility || 'public'].icon;
  const ResearchTypeIcon = researchTypeIcons[post.researchType] || DocumentIcon;
  const factCheckConfig = factCheckStatusConfig[post.factCheckStatus] || factCheckStatusConfig.pending;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this research post?')) return;
    
    setIsDeleting(true);
    try {
      await axios.delete(`/api/research/${post.id}`);
      onDelete(post.id);
    } catch (err) {
      console.error('Failed to delete research post:', err);
      alert('Failed to delete research post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Research by ${post.author?.name}`,
        text: post.content,
        url: window.location.href
      });
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const renderContent = () => {
    if (!post.content) return null;
    
    const maxLength = 300;
    const shouldTruncate = post.content.length > maxLength && !showFullContent;
    
    return (
      <div className="mb-4">
        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
          {shouldTruncate ? `${post.content.slice(0, maxLength)}...` : post.content}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setShowFullContent(true)}
            className="text-blue-600 hover:text-purple-600 text-sm mt-2 font-medium transition-colors duration-200"
          >
            Read more
          </button>
        )}
      </div>
    );
  };

  const renderResearchDetails = () => {
    return (
      <div className="space-y-4 mb-4">
        {/* Research Type Badge */}
        <div className="flex items-center space-x-2">
          <ResearchTypeIcon className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            {post.researchType?.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Methodology */}
        {post.methodology && (
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Methodology</h4>
            <p className="text-sm text-blue-700">{post.methodology}</p>
          </div>
        )}

        {/* Results */}
        {post.results && (
          <div className="bg-green-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-green-800 mb-2">Key Findings</h4>
            <p className="text-sm text-green-700">{post.results}</p>
          </div>
        )}

        {/* Conclusions */}
        {post.conclusions && (
          <div className="bg-purple-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-purple-800 mb-2">Conclusions</h4>
            <p className="text-sm text-purple-700">{post.conclusions}</p>
          </div>
        )}

        {/* Citations */}
        {post.citations && post.citations.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
              <LinkIcon className="h-4 w-4 mr-2" />
              Citations ({post.citations.length})
            </h4>
            <div className="space-y-2">
              {post.citations.slice(0, 3).map((citation, index) => (
                <div key={index} className="text-sm text-gray-700">
                  <p className="font-medium">{citation.title}</p>
                  <p className="text-xs text-gray-600">{citation.authors} ({citation.year})</p>
                </div>
              ))}
              {post.citations.length > 3 && (
                <p className="text-xs text-gray-500">+{post.citations.length - 3} more citations</p>
              )}
            </div>
          </div>
        )}

        {/* Publication Details */}
        {(post.doi || post.preprintUrl) && (
          <div className="bg-yellow-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">Publication Details</h4>
            <div className="space-y-2">
              {post.doi && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-yellow-700">DOI:</span>
                  <a 
                    href={`https://doi.org/${post.doi}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {post.doi}
                  </a>
                </div>
              )}
              {post.preprintUrl && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-yellow-700">Preprint:</span>
                  <a 
                    href={post.preprintUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    View Preprint
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Funding and Conflicts */}
        {(post.funding || post.conflictsOfInterest) && (
          <div className="bg-gray-50 rounded-xl p-4">
            {post.funding && (
              <div className="mb-2">
                <h4 className="text-sm font-semibold text-gray-800 mb-1">Funding</h4>
                <p className="text-sm text-gray-700">{post.funding}</p>
              </div>
            )}
            {post.conflictsOfInterest && (
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-1">Conflicts of Interest</h4>
                <p className="text-sm text-gray-700">{post.conflictsOfInterest}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderMedia = () => {
    if (!post.media || post.media.length === 0) return null;

    return (
      <div className="mt-4">
        {post.mediaType === 'image' && (
          <div className="grid grid-cols-1 gap-2">
            {post.media.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Research media ${index + 1}`}
                className="w-full h-64 object-cover rounded-xl cursor-pointer transition-transform duration-300 hover:scale-[1.02] shadow-lg"
                onClick={() => window.open(url, '_blank')}
              />
            ))}
          </div>
        )}
        {post.mediaType === 'video' && (
          <video
            controls
            className="w-full h-64 object-cover rounded-xl shadow-lg"
            preload="metadata"
          >
            {post.media.map((url, index) => (
              <source key={index} src={url} type="video/mp4" />
            ))}
            Your browser does not support the video tag.
          </video>
        )}
        {post.mediaType === 'document' && (
          <div className="mt-4">
            {post.media.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all duration-300 transform hover:scale-[1.02] border border-blue-200 shadow-sm"
              >
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mr-3 shadow-lg">
                  <DocumentIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    Research Document {index + 1}
                  </p>
                  <p className="text-sm text-gray-600">
                    Click to open
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6 transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Link to={`/profile/${post.author?.id}`} className="flex-shrink-0">
            <UserAvatar 
              user={post.author} 
              size="md" 
              showOnlineStatus={true}
              className="transition-transform duration-300 hover:scale-105"
            />
          </Link>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <Link 
                to={`/profile/${post.author?.id}`}
                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200"
              >
                {post.author?.name || (post.author?.firstName && post.author?.lastName 
                  ? `${post.author.firstName} ${post.author.lastName}` 
                  : post.author?.username || 'Unknown User')}
              </Link>
              {post.author?.isVerified && (
                <CheckCircleIcon className="h-4 w-4 text-blue-500" />
              )}
              <span className="text-gray-400">·</span>
              <span className="text-sm text-gray-500 font-medium">{formatDate(post.createdAt)}</span>
              <span className="text-gray-400">·</span>
              <div className="flex items-center text-gray-500" title={visibilityIcons[post.visibility || 'public'].label}>
                <VisibilityIcon className="h-4 w-4" />
              </div>
            </div>
            {post.author?.institution && (
              <p className="text-sm text-gray-600 mt-1">{post.author.institution} {post.author.position && `• ${post.author.position}`}</p>
            )}
          </div>
        </div>
        
        {isOwnPost && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdate && onUpdate(post)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Fact Check Status */}
      {post.factCheckStatus && (
        <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg mb-4 ${factCheckConfig.bg}`}>
          <factCheckConfig.icon className={`h-4 w-4 ${factCheckConfig.color}`} />
          <span className={`text-sm font-medium ${factCheckConfig.color}`}>
            {factCheckConfig.label}
          </span>
          {post.factCheckScore > 0 && (
            <span className="text-xs text-gray-600">
              Score: {Math.round(post.factCheckScore * 100)}%
            </span>
          )}
        </div>
      )}

      {/* Open Access Badge */}
      {post.openAccess && (
        <div className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg mb-4 bg-green-100">
          <CheckCircleIcon className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-600">Open Access</span>
        </div>
      )}

      {/* Post Content */}
      {renderContent()}
      {renderResearchDetails()}
      {renderMedia()}

      {/* Post Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200 shadow-sm transition-all duration-200 hover:from-blue-200 hover:to-purple-200 hover:scale-105"
            >
              <TagIcon className="h-3 w-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
        <div className="flex items-center space-x-1">
          <EyeIcon className="h-4 w-4" />
          <span>{post.views || 0} views</span>
        </div>
        <div className="flex items-center space-x-1">
          <ChatBubbleLeftIcon className="h-4 w-4" />
          <span>{post.comments || 0} comments</span>
        </div>
        <div className="flex items-center space-x-1">
          <ShareIcon className="h-4 w-4" />
          <span>{post.shares || 0} shares</span>
        </div>
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gradient-to-r from-blue-100 to-purple-100">
        <div className="flex items-center space-x-6">
          <ReactionButton key={`reaction-${post.id}`} targetType="research" targetId={post.id} />

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 bg-white/70 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 border border-gray-200"
          >
            <ChatBubbleLeftIcon className="h-5 w-5" />
            <span className="font-medium">Comment</span>
          </button>

          <button
            onClick={() => setShowFactChecks(!showFactChecks)}
            className="flex items-center space-x-2 text-gray-500 hover:text-orange-600 bg-white/70 hover:bg-orange-50 px-3 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 border border-gray-200"
          >
            <FlagIcon className="h-5 w-5" />
            <span className="font-medium">Fact Check</span>
          </button>

          <button
            onClick={() => setShowCollaborations(!showCollaborations)}
            className="flex items-center space-x-2 text-gray-500 hover:text-green-600 bg-white/70 hover:bg-green-50 px-3 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 border border-gray-200"
          >
            <UserPlusIcon className="h-5 w-5" />
            <span className="font-medium">Collaborate</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 bg-white/70 hover:bg-purple-50 px-3 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 border border-gray-200"
          >
            <ShareIcon className="h-5 w-5" />
            <span className="font-medium">Share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-6 border-t border-gradient-to-r from-blue-100 to-purple-100 pt-6">
          <CommentSection postId={post.id} />
        </div>
      )}

      {/* Fact Check Section */}
      {showFactChecks && (
        <div className="mt-6 border-t border-gradient-to-r from-blue-100 to-purple-100 pt-6">
          <FactCheckSection researchPostId={post.id} />
        </div>
      )}

      {/* Collaboration Section */}
      {showCollaborations && (
        <div className="mt-6 border-t border-gradient-to-r from-blue-100 to-purple-100 pt-6">
          <CollaborationSection researchPostId={post.id} />
        </div>
      )}
    </div>
  );
} 