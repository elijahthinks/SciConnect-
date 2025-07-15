import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../store/auth';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import { TagIcon, FunnelIcon, DocumentIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function Feed() {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all'); // all, following, connections
  const [selectedTags, setSelectedTags] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const observer = useRef();

  const lastPostRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    fetchPosts(true);
  }, [filter, selectedTags]);

  useEffect(() => {
    if (page > 1) {
      fetchPosts(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPopularTags();
  }, []);

  const fetchPopularTags = async () => {
    try {
      const response = await axios.get('/api/posts/tags/popular');
      setPopularTags(response.data || []);
    } catch (err) {
      console.error('Failed to fetch popular tags:', err);
    }
  };

  const fetchPosts = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }
      
      const params = {
        page: reset ? 1 : page,
        filter,
        ...(selectedTags.length && { tags: selectedTags.join(',') })
      };

      const response = await axios.get('/api/posts', {
        params
      });
      const newPosts = response.data;
      
      setPosts(prevPosts => reset ? newPosts : [...prevPosts, ...newPosts]);
      setHasMore(newPosts.length === 10); // Assuming 10 posts per page
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    console.log('New post created:', newPost);
    console.log('Adding to posts array. Current posts count:', posts.length);
    setPosts([newPost, ...posts]);
    // Refresh tags if the new post has tags
    if (newPost.tags?.length > 0) {
      fetchPopularTags();
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-xl mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 text-center mb-2">Something went wrong</h3>
          <p className="text-red-700 text-center mb-4">{error}</p>
          <button
            onClick={() => fetchPosts(true)}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Welcome Header */}
      {user && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6 border border-blue-200/50 shadow-lg">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome back, {user.firstName || user.name || user.username}!
          </h1>
          <p className="text-gray-600">
            Share your latest work, connect with fellow scientists and technologists, and discover new ideas
          </p>
          {user.institution && (
            <p className="text-sm text-gray-500 mt-2">
              {user.institution} {user.position && `• ${user.position}`}
            </p>
          )}
        </div>
      )}

      {/* Create Post */}
      {user && <CreatePost onPostCreated={handlePostCreated} />}
      
      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm shadow-sm px-4 py-2 font-medium"
            >
              <option value="all">All Posts</option>
              {user && (
                <>
                  <option value="following">Following</option>
                  <option value="connections">Connections</option>
                </>
              )}
            </select>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-sm ${
                showFilters || selectedTags.length > 0
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-blue-50 border border-gray-200'
              }`}
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filter</span>
              {selectedTags.length > 0 && (
                <span className="ml-1 bg-white/30 text-white rounded-full px-2 py-1 text-xs font-bold">
                  {selectedTags.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tags Filter */}
        {showFilters && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-4 transform transition-all duration-300">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <TagIcon className="h-5 w-5 mr-2 text-blue-600" />
              Filter by Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 transform hover:scale-105 ${
                    selectedTags.includes(tag)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 hover:from-blue-100 hover:to-purple-100 border border-blue-200 shadow-sm'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Posts Feed */}
      <div className="space-y-6">
        {loading && posts.length === 0 ? (
          <div className="animate-pulse space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg w-1/4"></div>
                  <div className="h-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg w-1/6"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg w-full"></div>
                <div className="h-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg w-3/4"></div>
                <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl"></div>
              </div>
            </div>
            {[1, 2].map(i => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg w-1/4"></div>
                    <div className="h-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg w-1/6"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg w-full"></div>
                  <div className="h-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <DocumentIcon className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                No posts yet
              </h3>
              <p className="text-gray-600 text-lg">
                {user ? 'Be the first to share something amazing!' : 'Sign in to see posts from the scientific community.'}
              </p>
              {user && (
                <div className="mt-6">
                  <p className="text-gray-500 text-sm">
                    Share your research, insights, or connect with fellow scientists
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {posts.map((post, index) => (
              <div
                key={post.id}
                ref={index === posts.length - 1 ? lastPostRef : null}
              >
                <PostCard
                  post={post}
                  onDelete={handlePostDeleted}
                  onUpdate={handlePostUpdated}
                />
              </div>
            ))}
            {loading && (
              <div className="animate-pulse space-y-6">
                {[1, 2].map(i => (
                  <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg w-1/4"></div>
                        <div className="h-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg w-1/6"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg w-full"></div>
                      <div className="h-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 