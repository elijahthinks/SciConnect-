import { useState, useEffect } from 'react';
import { useAuth } from '../store/auth';
import { MagnifyingGlassIcon, HashtagIcon, UserGroupIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import PostCard from '../components/PostCard';
import UserList from '../components/UserList';
import FollowButton from '../components/FollowButton';
import axios from 'axios';

export default function Explore() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    fetchExploreData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(() => {
        searchContent();
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      // Reset to default content when search is cleared
      fetchExploreData();
    }
  }, [searchQuery]);

  const fetchExploreData = async () => {
    try {
      setLoading(true);
      const [postsRes, usersRes, tagsRes] = await Promise.all([
        axios.get('/api/posts', {
          params: { filter: 'all', limit: 20 }
        }),
        axios.get('/api/social/suggestions', {
          params: { limit: 10 }
        }),
        axios.get('/api/posts/tags/popular')
      ]);

      setPosts(postsRes.data);
      setUsers(usersRes.data.users || []);
      setPopularTags(tagsRes.data || []);
      
      // Get trending posts (posts with most likes/comments recently)
      const trending = postsRes.data
        .filter(post => post.likes?.length > 0 || post.comments > 0)
        .sort((a, b) => (b.likes?.length || 0) + b.comments - ((a.likes?.length || 0) + a.comments))
        .slice(0, 5);
      setTrendingPosts(trending);
    } catch (error) {
      console.error('Error fetching explore data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchContent = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const [postsRes, usersRes] = await Promise.all([
        axios.get('/api/posts', {
          params: { search: searchQuery, limit: 20 }
        }),
        axios.get('/api/social/suggestions', {
          params: { q: searchQuery, limit: 10 }
        })
      ]);

      setPosts(postsRes.data);
      setUsers(usersRes.data.users || []);
    } catch (error) {
      console.error('Error searching content:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleTagClick = (tag) => {
    setSearchQuery(`#${tag}`);
    setActiveTab('posts');
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
    setTrendingPosts(trendingPosts.filter(post => post.id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(post => post.id === updatedPost.id ? updatedPost : post));
    setTrendingPosts(trendingPosts.map(post => post.id === updatedPost.id ? updatedPost : post));
  };

  const tabs = [
    { id: 'posts', label: 'Posts', icon: DocumentTextIcon },
    { id: 'users', label: 'People', icon: UserGroupIcon },
    { id: 'tags', label: 'Tags', icon: HashtagIcon }
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <MagnifyingGlassIcon className="h-7 w-7 mr-2" />
          Explore
        </h1>
        <p className="text-gray-600">Discover new content, people, and trending topics</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search posts, people, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
          />
          {searchLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
            </div>
          )}
        </div>
      </div>

      {/* Trending Section (only show when not searching) */}
      {!searchQuery && trendingPosts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🔥 Trending Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingPosts.map(post => (
              <div key={post.id} className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <img
                    src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.name}&background=random`}
                    alt={post.author?.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-900">{post.author?.name}</span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">{post.content}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>{post.likes?.length || 0} likes</span>
                  <span>{post.comments || 0} comments</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'posts' && (
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onDelete={handlePostDeleted}
                    onUpdate={handlePostUpdated}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-white shadow rounded-lg">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No posts found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery ? 'Try a different search term' : 'No posts available to explore'}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <UserList
              users={users}
              emptyMessage={searchQuery ? "No users found matching your search." : "No users to discover right now."}
              onFollowChange={fetchExploreData}
              showFollowButton={true}
            />
          )}

          {activeTab === 'tags' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Tags</h3>
              {popularTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {popularTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-700 transition-colors"
                    >
                      <HashtagIcon className="h-4 w-4 mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No popular tags yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Popular Tags Widget */}
          {activeTab !== 'tags' && popularTags.length > 0 && (
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-md font-medium text-gray-900 mb-3">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.slice(0, 10).map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-700 transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Users Widget */}
          {activeTab !== 'users' && users.length > 0 && (
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-md font-medium text-gray-900 mb-3">People to Follow</h3>
              <div className="space-y-3">
                {users.slice(0, 5).map(person => (
                  <div key={person.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img
                        src={person.avatar || `https://ui-avatars.com/api/?name=${person.name}&background=random`}
                        alt={person.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{person.name}</p>
                        <p className="text-xs text-gray-500">{person.position}</p>
                      </div>
                    </div>
                    {user && user.id !== person.id && (
                      <FollowButton 
                        userId={person.id} 
                        onFollowChange={fetchExploreData}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 