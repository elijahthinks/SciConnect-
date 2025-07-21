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
        <div className="bg-rose-50/80 backdrop-blur-sm border border-rose-200/50 rounded-2xl p-6 shadow-science">
          <div className="flex items-center justify-center w-16 h-16 gradient-amber rounded-xl mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-rose-800 text-center mb-2">Something went wrong</h3>
          <p className="text-rose-700 text-center mb-4">{error}</p>
          <button
            onClick={() => fetchPosts(true)}
            className="w-full gradient-amber text-white py-3 px-4 rounded-xl font-semibold hover:shadow-science-lg transition-all duration-200 transform hover:scale-105 shadow-science"
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
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-6 mb-6 border border-teal-200/50 shadow-science">
          <h1 className="text-2xl font-bold gradient-science bg-clip-text text-transparent mb-2">
            Welcome back, {user.firstName || user.name || user.username}!
          </h1>
          <p className="text-navy-600">
            Share your latest research, connect with fellow scientists and technologists, and discover new ideas
          </p>
          {user.institution && (
            <p className="text-sm text-navy-500 mt-2">
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
              className="rounded-xl border-navy-200 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/80 backdrop-blur-sm shadow-science px-4 py-2 font-medium"
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
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-science ${
                showFilters || selectedTags.length > 0
                  ? 'gradient-science text-white shadow-science-lg'
                  : 'bg-white/80 backdrop-blur-sm text-navy-600 hover:bg-teal-50 border border-navy-200'
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-science border border-navy-200 p-6 mb-4 transform transition-all duration-300">
            <h3 className="text-sm font-semibold text-navy-700 mb-3 flex items-center">
              <TagIcon className="h-5 w-5 mr-2 text-teal-600" />
              Filter by Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 transform hover:scale-105 ${
                    selectedTags.includes(tag)
                      ? 'bg-teal-100 text-teal-700 border border-teal-200 shadow-sm'
                      : 'bg-navy-100 text-navy-600 border border-navy-200 hover:bg-navy-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {posts.map((post, index) => (
          <div key={post.id} ref={index === posts.length - 1 ? lastPostRef : null}>
            <PostCard
              post={post}
              onDelete={handlePostDeleted}
              onUpdate={handlePostUpdated}
            />
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        )}
        
        {!loading && !hasMore && posts.length > 0 && (
          <div className="text-center py-8">
            <p className="text-navy-500">No more posts to load</p>
          </div>
        )}
        
        {!loading && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentIcon className="h-8 w-8 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">No posts yet</h3>
            <p className="text-navy-600 mb-4">Be the first to share your research or thoughts!</p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="gradient-science text-white px-6 py-2 rounded-lg font-medium hover:shadow-science-lg transition-all duration-200 transform hover:scale-105 shadow-science"
            >
              Create Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 