import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../store/auth';
import CreateResearchPost from '../components/CreateResearchPost';
import ResearchPostCard from '../components/ResearchPostCard';
import { 
  TagIcon, 
  FunnelIcon, 
  DocumentIcon, 
  BeakerIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

export default function ResearchFeed() {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [researchType, setResearchType] = useState('');
  const [factCheckStatus, setFactCheckStatus] = useState('');
  const [openAccess, setOpenAccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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
  }, [filter, selectedTags, researchType, factCheckStatus, openAccess, searchQuery]);

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
      const response = await axios.get('/api/research/tags/popular');
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
        ...(selectedTags.length && { tags: selectedTags.join(',') }),
        ...(researchType && { researchType }),
        ...(factCheckStatus && { factCheckStatus }),
        ...(openAccess && { openAccess }),
        ...(searchQuery && { search: searchQuery })
      };

      const response = await axios.get('/api/research', {
        params
      });
      const newPosts = response.data.posts;
      
      setPosts(prevPosts => reset ? newPosts : [...prevPosts, ...newPosts]);
      setHasMore(newPosts.length === 10);
    } catch (err) {
      console.error('Failed to fetch research posts:', err);
      setError('Failed to load research posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
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

  const clearFilters = () => {
    setSelectedTags([]);
    setResearchType('');
    setFactCheckStatus('');
    setOpenAccess('');
    setSearchQuery('');
    setFilter('all');
  };

  const researchTypes = [
    { value: 'experiment', label: 'Experiment', icon: BeakerIcon },
    { value: 'survey', label: 'Survey', icon: DocumentIcon },
    { value: 'review', label: 'Review', icon: DocumentIcon },
    { value: 'case_study', label: 'Case Study', icon: DocumentIcon },
    { value: 'theoretical', label: 'Theoretical', icon: DocumentIcon },
    { value: 'methodology', label: 'Methodology', icon: DocumentIcon },
    { value: 'results', label: 'Results', icon: DocumentIcon },
    { value: 'discussion', label: 'Discussion', icon: DocumentIcon }
  ];

  const factCheckStatuses = [
    { value: 'pending', label: 'Pending Review', icon: ExclamationTriangleIcon },
    { value: 'verified', label: 'Verified', icon: CheckCircleIcon },
    { value: 'flagged', label: 'Flagged', icon: ExclamationTriangleIcon },
    { value: 'disputed', label: 'Disputed', icon: ExclamationTriangleIcon }
  ];

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-xl mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-white" />
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-6 mb-6 border border-teal-200/50 shadow-science">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 gradient-science rounded-full flex items-center justify-center">
                <BeakerIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-science bg-clip-text text-transparent">
                  Research Feed
                </h1>
                <p className="text-navy-600">Discover and share cutting-edge research</p>
              </div>
            </div>
          </div>

          {/* Create Research Post */}
          {user && <CreateResearchPost onPostCreated={handlePostCreated} />}
          
          {/* Advanced Filters */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="rounded-xl border-navy-200 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/80 backdrop-blur-sm shadow-science px-4 py-2 font-medium"
                >
                  <option value="all">All Research</option>
                  {user && (
                    <>
                      <option value="following">Following</option>
                      <option value="connections">Connections</option>
                    </>
                  )}
                </select>
                
                <select
                  value={researchType}
                  onChange={(e) => setResearchType(e.target.value)}
                  className="rounded-xl border-navy-200 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/80 backdrop-blur-sm shadow-science px-4 py-2 font-medium"
                >
                  <option value="">All Types</option>
                  <option value="experiment">Experiment</option>
                  <option value="survey">Survey</option>
                  <option value="review">Review</option>
                  <option value="case_study">Case Study</option>
                  <option value="theoretical">Theoretical</option>
                </select>

                <select
                  value={factCheckStatus}
                  onChange={(e) => setFactCheckStatus(e.target.value)}
                  className="rounded-xl border-navy-200 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/80 backdrop-blur-sm shadow-science px-4 py-2 font-medium"
                >
                  <option value="">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending Review</option>
                  <option value="flagged">Flagged</option>
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
                  <span>More Filters</span>
                  {selectedTags.length > 0 && (
                    <span className="ml-1 bg-white/30 text-white rounded-full px-2 py-1 text-xs font-bold">
                      {selectedTags.length}
                    </span>
                  )}
                </button>
              </div>

              {(selectedTags.length > 0 || researchType || factCheckStatus || openAccess || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-navy-500 hover:text-rose-600 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-navy-400" />
              <input
                type="text"
                placeholder="Search research posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-navy-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/80 backdrop-blur-sm shadow-science"
              />
            </div>

            {/* Tags Filter */}
            {showFilters && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-science border border-navy-200 p-6 mb-4 transform transition-all duration-300">
                <h3 className="text-sm font-semibold text-navy-700 mb-3 flex items-center">
                  <TagIcon className="h-5 w-5 mr-2 text-teal-600" />
                  Filter by Research Areas
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

          {/* Research Posts */}
          <div className="space-y-6">
            {posts.map((post, index) => (
              <div key={post.id} ref={index === posts.length - 1 ? lastPostRef : null}>
                <ResearchPostCard
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
                <p className="text-navy-500">No more research posts to load</p>
              </div>
            )}
            
            {!loading && posts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BeakerIcon className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">No research posts yet</h3>
                <p className="text-navy-600 mb-4">Be the first to share your research findings!</p>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="gradient-science text-white px-6 py-2 rounded-lg font-medium hover:shadow-science-lg transition-all duration-200 transform hover:scale-105 shadow-science"
                >
                  Create Research Post
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Research Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Research Insights</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-teal-50 rounded-lg">
                <div className="text-2xl font-bold text-teal-600">{posts.length}</div>
                <div className="text-sm text-navy-600">Research Posts</div>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">0</div>
                <div className="text-sm text-navy-600">Verified</div>
              </div>
            </div>
          </div>

          {/* Research Categories */}
          <div className="card">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Research Areas</h3>
            <div className="space-y-2">
              {['experiment', 'survey', 'review', 'case_study', 'theoretical'].map(type => (
                <button
                  key={type}
                  onClick={() => setResearchType(type)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    researchType === type
                      ? 'bg-teal-100 text-teal-700 border border-teal-200'
                      : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Popular Research Tags */}
          <div className="card">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Trending Research</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.slice(0, 8).map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-navy-100 text-navy-600 border border-navy-200 hover:bg-navy-200 transition-all duration-200"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          {user && (
            <div className="card">
              <h3 className="text-lg font-semibold text-navy-900 mb-4">Research Actions</h3>
              <div className="space-y-3">
                <button className="w-full btn-primary text-left">
                  <BeakerIcon className="h-4 w-4 mr-2 inline" />
                  Share Research
                </button>
                <button className="w-full btn-outline text-left">
                  <CheckCircleIcon className="h-4 w-4 mr-2 inline" />
                  Fact Check
                </button>
                <button className="w-full btn-outline text-left">
                  <UserGroupIcon className="h-4 w-4 mr-2 inline" />
                  Find Collaborators
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 