import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { UserGroupIcon, AcademicCapIcon, BriefcaseIcon, BuildingLibraryIcon, LinkIcon } from '@heroicons/react/24/outline';
import AvatarUpload from '../components/AvatarUpload';
import FollowButton from '../components/FollowButton';
import axios from 'axios';

const Profile = () => {
  const { id: userId } = useParams();
  const { user: currentUser, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    institution: '',
    position: '',
    department: '',
    education: [],
    publications: [],
    researchInterests: [],
    socialLinks: {}
  });
  const [followStats, setFollowStats] = useState({ followerCount: 0, followingCount: 0, isFollowing: false });

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
    }
  }, [userId, currentUser]);

  useEffect(() => {
    if (currentUser && userId && userId !== currentUser.id.toString()) {
      fetchFollowStats();
    }
  }, [userId, currentUser]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profileId = userId || currentUser?.id;
      
      if (!profileId) {
        setError('No user ID provided');
        return;
      }

      const response = await axios.get(`/api/profile/${profileId}`);
      
      const data = response.data;
      setProfile(data);
      setFormData({
        name: data.name || '',
        bio: data.bio || '',
        institution: data.institution || '',
        position: data.position || '',
        department: data.department || '',
        education: data.education || [],
        publications: data.publications || [],
        researchInterests: data.researchInterests || [],
        socialLinks: data.socialLinks || {}
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 404) {
        setError('User not found');
      } else {
        setError('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowStats = async () => {
    try {
      const response = await axios.get(`/api/social/status/${userId}`);
      setFollowStats(response.data);
    } catch (error) {
      console.error('Error fetching follow stats:', error);
      setFollowStats({ followerCount: 0, followingCount: 0, isFollowing: false });
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleArrayInput = (field, value) => {
    setFormData({
      ...formData,
      [field]: value.split(',').map(item => item.trim()).filter(item => item.length > 0)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('/api/profile', formData);
      setProfile(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleAvatarUpload = (avatarPath) => {
    setProfile({ ...profile, avatar: avatarPath });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-blue-200 to-purple-200 rounded-t-2xl"></div>
              <div className="p-8 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserGroupIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {error || 'Profile not found'}
              </h3>
              <p className="text-gray-500 mb-6">
                {error === 'User not found' ? 'This user does not exist.' : 'Unable to load profile information.'}
              </p>
              {error !== 'User not found' && (
                <button
                  onClick={fetchProfile}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.id === profile.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
          {/* Profile Header */}
          <div className="relative h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-sm"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-20"></div>
            
            <div className="absolute -bottom-16 left-8 z-10">
              {isOwnProfile ? (
                <div className="relative">
                  <AvatarUpload
                    onUploadComplete={handleAvatarUpload}
                    currentAvatar={profile.avatar}
                  />
                  <div className="absolute inset-0 rounded-full border-4 border-white/50 pointer-events-none"></div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`}
                    alt={profile.name}
                    className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-2xl"
                  />
                  <div className="absolute inset-0 rounded-full border-4 border-white/50 pointer-events-none"></div>
                </div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-20 px-8 pb-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {profile.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-3">
                  {profile.position && (
                    <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/50">
                      <BriefcaseIcon className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">{profile.position}</span>
                    </div>
                  )}
                  {profile.institution && (
                    <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/50">
                      <BuildingLibraryIcon className="h-4 w-4 mr-2 text-purple-600" />
                      <span className="text-sm font-medium">{profile.institution}</span>
                    </div>
                  )}
                </div>
                {profile.email && isOwnProfile && (
                  <div className="text-sm text-gray-500 font-medium bg-white/50 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/50 inline-block">
                    {profile.email}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4">
                  <Link to="/connections" className="text-center group">
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 hover:bg-white/90 transition-all duration-200 transform hover:scale-105">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {followStats.followerCount}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">Followers</div>
                    </div>
                  </Link>
                  <Link to="/connections" className="text-center group">
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 hover:bg-white/90 transition-all duration-200 transform hover:scale-105">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {followStats.followingCount}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">Following</div>
                    </div>
                  </Link>
                </div>
                
                {!isOwnProfile && (
                  <FollowButton
                    userId={profile.id}
                    onFollowChange={(isFollowing) => {
                      setFollowStats(prev => ({
                        ...prev,
                        isFollowing,
                        followerCount: isFollowing ? prev.followerCount + 1 : prev.followerCount - 1
                      }));
                    }}
                  />
                )}
                
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio ? (
              <div className="mb-8">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-sm">
                  <p className="text-gray-700 leading-relaxed text-lg">{profile.bio}</p>
                </div>
              </div>
            ) : isOwnProfile && (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm rounded-xl p-6 border-2 border-dashed border-blue-300/50">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <UserGroupIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-gray-600 mb-3">Add a bio to tell people about yourself</p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm font-medium"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Research Interests */}
            {profile.researchInterests && profile.researchInterests.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  Research Interests
                </h3>
                <div className="flex flex-wrap gap-3">
                  {profile.researchInterests.map((interest, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200 shadow-sm transition-all duration-200 hover:from-blue-200 hover:to-purple-200 hover:scale-105"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {profile.education && profile.education.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center">
                  <AcademicCapIcon className="h-6 w-6 mr-2 text-blue-600" />
                  Education
                </h3>
                <div className="space-y-4">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-sm border-l-4 border-l-blue-500">
                      <div className="font-semibold text-gray-900 text-lg mb-1">{edu.degree} in {edu.field}</div>
                      <div className="text-blue-600 font-medium mb-1">{edu.institution}</div>
                      <div className="text-sm text-gray-500 bg-gray-100/70 px-3 py-1 rounded-full inline-block">{edu.year}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Publications */}
            {profile.publications && profile.publications.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  Publications
                </h3>
                <div className="space-y-4">
                  {profile.publications.map((pub, index) => (
                    <div key={index} className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-sm border-l-4 border-l-green-500">
                      <div className="font-semibold text-gray-900 text-lg mb-2">{pub.title}</div>
                      <div className="text-gray-600 mb-2">{pub.journal} ({pub.year})</div>
                      {pub.doi && (
                        <div className="text-sm text-blue-600 font-medium mb-2">
                          DOI: {pub.doi}
                        </div>
                      )}
                      {pub.authors && pub.authors.length > 0 && (
                        <div className="text-sm text-gray-500">
                          Authors: {pub.authors.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center">
                  <LinkIcon className="h-6 w-6 mr-2 text-blue-600" />
                  Links
                </h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(profile.socialLinks).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/70 backdrop-blur-sm text-gray-700 border border-white/50 hover:bg-white/90 transition-all duration-200 transform hover:scale-105 shadow-sm"
                    >
                      {platform}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State for New Users */}
            {isOwnProfile && !profile.bio && (!profile.researchInterests || profile.researchInterests.length === 0) && 
             (!profile.education || profile.education.length === 0) && (!profile.publications || profile.publications.length === 0) && (
              <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm rounded-xl p-8 border border-white/50 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserGroupIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Complete Your Profile
                </h3>
                <p className="text-gray-600 mb-6">
                  Add information about yourself to help others discover and connect with you.
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                Edit Profile
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Tell people about yourself..."
                    className="w-full bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Institution
                    </label>
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleInputChange}
                      placeholder="University or Organization"
                      className="w-full bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Position
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      placeholder="Your role or title"
                      className="w-full bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="Department or Field"
                    className="w-full bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Research Interests (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.researchInterests.join(', ')}
                    onChange={(e) => handleArrayInput('researchInterests', e.target.value)}
                    placeholder="Machine Learning, Data Science, Biology..."
                    className="w-full bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 