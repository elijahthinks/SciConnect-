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
  ExclamationTriangleIcon
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
    <div className="max-w-4xl mx-auto p-6">
      {/* Welcome Header */}
      {user && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6 border border-blue-200/50 shadow-lg">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Research Feed
          </h1>
          <p className="text-gray-600">
            Discover cutting-edge research, share your findings, and collaborate with fellow scientists
          </p>
          {user.institution && (
            <p className="text-sm text-gray-500 mt-2">
              {user.institution} {user.position && `• ${user.position}`}
            </p>
          )}
        </div>
      )}

      {/* Create Research Post */}
      {user && <CreateResearchPost onPostCreated={handlePostCreated} />}
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search research posts, methodologies, results..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm placeholder-gray-500 text-gray-900 shadow-sm"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm shadow-sm px-4 py-2 font-medium"
            >
              <option value="all">All Research</option>
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
                showFilters || selectedTags.length > 0 || researchType || factCheckStatus || openAccess
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-blue-50 border border-gray-200'
              }`}
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filter</span>
              {(selectedTags.length > 0 || researchType || factCheckStatus || openAccess) && (
                <span className="ml-1 bg-white/30 text-white rounded-full px-2 py-1 text-xs font-bold">
                  {[selectedTags.length > 0, researchType, factCheckStatus, openAccess].filter(Boolean).length}
                </span>
              )}
            </button>

            {(selectedTags.length > 0 || researchType || factCheckStatus || openAccess) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors duration-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-4 transform transition-all duration-300">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
              <FunnelIcon className="h-5 w-5 mr-2 text-blue-600" />
              Advanced Filters
            </h3>
            
            {/* Research Type Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Research Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {researchTypes.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setResearchType(researchType === value ? '' : value)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 ${
                      researchType === value
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 hover:from-blue-100 hover:to-purple-100 border border-blue-200 shadow-sm'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fact Check Status Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Fact Check Status</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {factCheckStatuses.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setFactCheckStatus(factCheckStatus === value ? '' : value)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 ${
                      factCheckStatus === value
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 hover:from-blue-100 hover:to-purple-100 border border-blue-200 shadow-sm'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Open Access Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Access Type</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setOpenAccess(openAccess === 'true' ? '' : 'true')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 ${
                    openAccess === 'true'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                      : 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 hover:from-green-100 hover:to-green-200 border border-green-200 shadow-sm'
                  }`}
                >
                  Open Access
                </button>
                <button
                  onClick={() => setOpenAccess(openAccess === 'false' ? '' : 'false')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 ${
                    openAccess === 'false'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                      : 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 hover:from-red-100 hover:to-red-200 border border-red-200 shadow-sm'
                  }`}
                >
                  Paywalled
                </button>
              </div>
            </div>

            {/* Tags Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <TagIcon className="h-4 w-4 mr-2 text-blue-600" />
                Filter by Tags
              </label>
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
          </div>
        )}
      </div>
      
      {/* Research Posts Feed */}
      <div className="space-y-6">
        {loading && posts.length === 0 ? (
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map(i => (
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
                  <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          posts.map((post, index) => (
            <div key={post.id} ref={index === posts.length - 1 ? lastPostRef : null}>
              <ResearchPostCard 
                post={post} 
                onDelete={handlePostDeleted}
                onUpdate={handlePostUpdated}
              />
            </div>
          ))
        )}
        
        {!loading && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <DocumentIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No research posts found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedTags.length > 0 || researchType || factCheckStatus || openAccess
                ? 'Try adjusting your filters or search terms'
                : 'Be the first to share your research!'
              }
            </p>
            {!searchQuery && selectedTags.length === 0 && !researchType && !factCheckStatus && !openAccess && (
              <button
                onClick={() => document.querySelector('#create-research-post')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Share Your Research
              </button>
            )}
          </div>
        )}
        
        {loading && posts.length > 0 && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
} 