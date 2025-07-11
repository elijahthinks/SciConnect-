import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChatBubbleLeftIcon, TrashIcon, ArrowUturnLeftIcon, PaperAirplaneIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../store/auth';
import axios from 'axios';
import ReactionButton from './ReactionButton';

function CommentForm({ postId, parentId = null, onCommentAdded, onCancel = null }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/comments', {
        postId,
        content: content.trim(),
        parentId
      });

      setContent('');
      onCommentAdded(response.data);
      if (onCancel) onCancel();
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-lg transition-all duration-300 hover:shadow-xl">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-sm border border-white/50">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-10 h-10 rounded-full object-cover" 
                />
              ) : (
                <span className="text-sm text-blue-600 font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={parentId ? "Write a thoughtful reply..." : "Share your thoughts..."}
              className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm placeholder-gray-500 text-gray-900 min-h-[80px]"
              rows="3"
            />
            <div className="mt-3 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                {content.length > 0 && (
                  <span className={content.length > 500 ? 'text-red-500' : 'text-gray-500'}>
                    {content.length}/500
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500 transition-all duration-200 transform hover:scale-105"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!content.trim() || isSubmitting || content.length > 500}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Posting...
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                      {parentId ? 'Reply' : 'Comment'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function Comment({ comment, onCommentAdded, onCommentDeleted, isReply = false }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const { user, token } = useAuth();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    setIsDeleting(true);
    try {
      await axios.delete(`/api/comments/${comment.id}`);
      onCommentDeleted(comment.id);
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert('Failed to delete comment. Please try again.');
    } finally {
      setIsDeleting(false);
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

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <div className={`${isReply ? 'ml-6 pl-6 border-l-2 border-gradient-to-b from-blue-200 to-purple-200' : ''}`}>
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white/70 group">
        <div className="flex space-x-3">
          <Link to={`/profile/${comment.author.id}`} className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-sm border border-white/50 transition-all duration-200 hover:shadow-md hover:scale-105">
              {comment.author?.avatar ? (
                <img 
                  src={comment.author.avatar} 
                  alt={comment.author.name} 
                  className="w-10 h-10 rounded-full object-cover" 
                />
              ) : (
                <span className="text-sm text-blue-600 font-bold">
                  {comment.author?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Link 
                to={`/profile/${comment.author.id}`}
                className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200"
              >
                {comment.author.name}
              </Link>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-3 bg-gray-50/50 rounded-lg p-3 border border-gray-100">
              {comment.content}
            </p>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200 transform hover:scale-105 ${
                  isLiked 
                    ? 'text-red-600 bg-red-50 border border-red-200' 
                    : 'text-gray-500 hover:text-red-600 bg-white/50 border border-gray-200 hover:bg-red-50'
                }`}
              >
                {isLiked ? (
                  <HeartIconSolid className="h-4 w-4" />
                ) : (
                  <HeartIcon className="h-4 w-4" />
                )}
                <span>{likeCount}</span>
              </button>
              
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center space-x-1 text-xs font-medium text-gray-500 hover:text-blue-600 px-3 py-1.5 rounded-full bg-white/50 border border-gray-200 hover:bg-blue-50 transition-all duration-200 transform hover:scale-105"
              >
                <ArrowUturnLeftIcon className="h-4 w-4" />
                <span>Reply</span>
              </button>
              
              {user && comment.author.id === user.id && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center space-x-1 text-xs font-medium text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-full bg-white/50 border border-gray-200 hover:bg-red-50 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                </button>
              )}
            </div>

            {showReplyForm && (
              <div className="mt-4">
                <CommentForm
                  postId={comment.postId}
                  parentId={comment.id}
                  onCommentAdded={onCommentAdded}
                  onCancel={() => setShowReplyForm(false)}
                />
              </div>
            )}

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 space-y-3">
                {comment.replies.map(reply => (
                  <Comment
                    key={reply.id}
                    comment={reply}
                    onCommentAdded={onCommentAdded}
                    onCommentDeleted={onCommentDeleted}
                    isReply={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/comments/post/${postId}`);
      setComments(response.data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAdded = (newComment) => {
    if (newComment.parentId) {
      // Handle reply
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === newComment.parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newComment]
            };
          }
          return comment;
        })
      );
    } else {
      // Handle new top-level comment
      setComments([newComment, ...comments]);
    }
  };

  const handleCommentDeleted = (commentId) => {
    setComments(prevComments => 
      prevComments.filter(comment => comment.id !== commentId)
        .map(comment => ({
          ...comment,
          replies: comment.replies?.filter(reply => reply.id !== commentId) || []
        }))
    );
  };

  if (loading) {
    return (
      <div className="mt-6 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
            <div className="flex space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <ChatBubbleLeftIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Comments ({comments.length})
          </h3>
        </div>
        {user && (
          <button
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
            {showCommentForm ? 'Cancel' : 'Add Comment'}
          </button>
        )}
      </div>

      {/* Comment Form */}
      {user && showCommentForm && (
        <div className="mb-6">
          <CommentForm
            postId={postId}
            onCommentAdded={(comment) => {
              handleCommentAdded(comment);
              setShowCommentForm(false);
            }}
            onCancel={() => setShowCommentForm(false)}
          />
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
            <ChatBubbleLeftIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
            <p className="text-gray-500 mb-4">Be the first to share your thoughts!</p>
            {user && !showCommentForm && (
              <button
                onClick={() => setShowCommentForm(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
                Start the conversation
              </button>
            )}
          </div>
        ) : (
          comments.map(comment => (
            <Comment
              key={comment.id}
              comment={comment}
              onCommentAdded={handleCommentAdded}
              onCommentDeleted={handleCommentDeleted}
            />
          ))
        )}
      </div>
    </div>
  );
} 