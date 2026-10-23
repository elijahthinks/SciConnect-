import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { MagnifyingGlassIcon, HashtagIcon, UserGroupIcon, DocumentTextIcon, BriefcaseIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';
import PostCard from '../components/PostCard';
import UserList from '../components/UserList';
import FollowButton from '../components/FollowButton';
import axios from 'axios';
import UserAvatar from '../components/UserAvatar';

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
          params: { limit: 20 }
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
          params: { q: searchQuery, limit: 20 }
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-6 mb-6 border border-teal-200/50 shadow-science">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 gradient-science rounded-full flex items-center justify-center">
                <MagnifyingGlassIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-science bg-clip-text text-transparent">
          Explore
        </h1>
                <p className="text-navy-600">Discover research, researchers, and trending topics</p>
              </div>
            </div>
      </div>

      {/* Search Bar */}
          <div className="relative mb-6">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-navy-400" />
          <input
            type="text"
              placeholder="Search posts, researchers, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-navy-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/80 backdrop-blur-sm shadow-science text-lg"
            />
          </div>

      {/* Tabs */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-navy-100 p-1 rounded-xl">
              {[
                { id: 'posts', label: 'Posts', icon: DocumentTextIcon },
                { id: 'researchers', label: 'Researchers', icon: UserGroupIcon },
                { id: 'trending', label: 'Trending', icon: HashtagIcon }
              ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-1 ${
                  activeTab === tab.id
                        ? 'bg-white text-navy-900 shadow-science'
                        : 'text-navy-600 hover:text-navy-900 hover:bg-white/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
            </div>
      </div>

      {/* Content */}
          <div className="space-y-6">
          {activeTab === 'posts' && (
              <>
                {searchLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  </div>
                ) : (
                posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onDelete={handlePostDeleted}
                    onUpdate={handlePostUpdated}
                  />
                ))
                )}
                {posts.length === 0 && !searchLoading && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DocumentTextIcon className="h-8 w-8 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-navy-900 mb-2">No posts found</h3>
                    <p className="text-navy-600">Try adjusting your search terms</p>
                </div>
              )}
              </>
          )}

            {activeTab === 'researchers' && (
              <>
                {searchLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {users.map(user => (
                      <div key={user.id} className="card-hover">
                        <div className="flex items-center space-x-4">
                          <UserAvatar user={user} size="lg" showOnlineStatus={true} />
                          <div className="flex-1">
                            <h3 className="font-semibold text-navy-900">{user.name || `${user.firstName} ${user.lastName}`}</h3>
                            <p className="text-sm text-navy-600">{user.institution}</p>
                            <p className="text-xs text-navy-500">{user.position}</p>
                            </div>
                          <FollowButton userId={user.id} />
                        </div>
                          </div>
                    ))}
                  </div>
                )}
                {users.length === 0 && !searchLoading && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserGroupIcon className="h-8 w-8 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-navy-900 mb-2">No researchers found</h3>
                    <p className="text-navy-600">Try adjusting your search terms</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'trending' && (
              <div className="space-y-6">
                <div className="card">
                  <h3 className="text-lg font-semibold text-navy-900 mb-4">Trending Posts</h3>
                  <div className="space-y-4">
                    {trendingPosts.map(post => (
                      <div key={post.id} className="border-b border-navy-100 pb-4 last:border-b-0">
                        <h4 className="font-medium text-navy-900 mb-1">{post.content?.slice(0, 100)}...</h4>
                        <div className="flex items-center space-x-4 text-sm text-navy-500">
                          <span>{post.author?.name}</span>
                          <span>•</span>
                          <span>{post.likes?.length || 0} likes</span>
                          <span>•</span>
                          <span>{post.comments || 0} comments</span>
              </div>
            </div>
                    ))}
                  </div>
                </div>
              </div>
              )}
            </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Trending Topics */}
          <div className="card">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Trending Topics</h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.slice(0, 10).map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-navy-100 text-navy-600 border border-navy-200 hover:bg-navy-200 transition-all duration-200"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

          {/* Top Researchers */}
          <div className="card">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Top Researchers</h3>
              <div className="space-y-3">
              {users.slice(0, 5).map(user => (
                <div key={user.id} className="flex items-center space-x-3">
                  <UserAvatar user={user} size="sm" showOnlineStatus={true} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-900 truncate">
                      {user.name || `${user.firstName} ${user.lastName}`}
                        </p>
                    <p className="text-xs text-navy-500 truncate">{user.institution}</p>
                      </div>
                  <FollowButton userId={user.id} />
                  </div>
                ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Platform Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-teal-50 rounded-lg">
                <div className="text-2xl font-bold text-teal-600">{posts.length}</div>
                <div className="text-sm text-navy-600">Posts</div>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{users.length}</div>
                <div className="text-sm text-navy-600">Researchers</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {user && (
            <div className="card">
              <h3 className="text-lg font-semibold text-navy-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full btn-primary text-left">
                  <DocumentTextIcon className="h-4 w-4 mr-2 inline" />
                  Create Post
                </button>
                <button className="w-full btn-outline text-left">
                  <UserGroupIcon className="h-4 w-4 mr-2 inline" />
                  Find Researchers
                </button>
                <button className="w-full btn-outline text-left">
                  <HashtagIcon className="h-4 w-4 mr-2 inline" />
                  Browse Topics
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 