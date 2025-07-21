import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChatBubbleLeftIcon, ShareIcon, TrashIcon, PencilIcon, GlobeAltIcon, UserGroupIcon, LockClosedIcon, TagIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../store/auth';
import axios from 'axios';
import CommentSection from './CommentSection';
import ReactionButton from './ReactionButton';
import UserAvatar from './UserAvatar';

const visibilityIcons = {
  public: { icon: GlobeAltIcon, label: 'Public' },
  connections: { icon: UserGroupIcon, label: 'Connections Only' },
  private: { icon: LockClosedIcon, label: 'Private' }
};

export default function PostCard({ post, onDelete, onUpdate }) {
  const { user, token } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const isOwnPost = user && post.author?.id === user.id;
  const VisibilityIcon = visibilityIcons[post.visibility || 'public'].icon;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    setIsDeleting(true);
    try {
      await axios.delete(`/api/posts/${post.id}`);
      onDelete(post.id);
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Post by ${post.author?.name}`,
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
        <p className="text-navy-900 whitespace-pre-wrap leading-relaxed">
          {shouldTruncate ? `${post.content.slice(0, maxLength)}...` : post.content}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setShowFullContent(true)}
            className="text-teal-600 hover:text-teal-700 text-sm mt-2 font-medium transition-colors duration-200"
          >
            Read more
          </button>
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
                alt={`Post media ${index + 1}`}
                className="w-full h-64 object-cover rounded-xl cursor-pointer transition-transform duration-300 hover:scale-[1.02] shadow-science"
                onClick={() => window.open(url, '_blank')}
              />
            ))}
          </div>
        )}
        
        {post.mediaType === 'video' && (
          <div className="grid grid-cols-1 gap-2">
            {post.media.map((url, index) => (
              <video
                key={index}
                src={url}
                controls
                className="w-full h-64 object-cover rounded-xl shadow-science"
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card-hover animate-fadeIn">
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
                className="font-semibold text-navy-900 hover:text-teal-600 transition-colors duration-200"
              >
                {post.author?.name || (post.author?.firstName && post.author?.lastName 
                  ? `${post.author.firstName} ${post.author.lastName}` 
                  : post.author?.username || 'Unknown User')}
              </Link>
              <span className="text-navy-400">·</span>
              <span className="text-sm text-navy-500 font-medium">{formatDate(post.createdAt)}</span>
              <span className="text-navy-400">·</span>
              <div className="flex items-center text-navy-500" title={visibilityIcons[post.visibility || 'public'].label}>
                <VisibilityIcon className="h-4 w-4" />
              </div>
            </div>
            {post.author?.title && (
              <p className="text-sm text-navy-600 mt-1">{post.author.title}</p>
            )}
          </div>
        </div>
        
        {isOwnPost && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdate && onUpdate(post)}
              className="p-2 text-navy-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-navy-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Post Content */}
      {renderContent()}
      {renderMedia()}

      {/* Post Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700 border border-teal-200 shadow-sm transition-all duration-200 hover:bg-teal-200 hover:scale-105"
            >
              <TagIcon className="h-3 w-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-navy-100">
        <div className="flex items-center space-x-6">
          <ReactionButton key={`reaction-${post.id}`} targetType="post" targetId={post.id} />

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-navy-500 hover:text-teal-600 bg-white/70 hover:bg-teal-50 px-3 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 border border-navy-200"
          >
            <ChatBubbleLeftIcon className="h-5 w-5" />
            <span className="font-medium">Comment</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center space-x-2 text-navy-500 hover:text-amber-600 bg-white/70 hover:bg-amber-50 px-3 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 border border-navy-200"
          >
            <ShareIcon className="h-5 w-5" />
            <span className="font-medium">Share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-6 border-t border-navy-100 pt-6">
          <CommentSection postId={post.id} />
        </div>
      )}
    </div>
  );
} 