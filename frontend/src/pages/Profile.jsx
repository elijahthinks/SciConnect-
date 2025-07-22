import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { UserGroupIcon, AcademicCapIcon, BriefcaseIcon, BuildingLibraryIcon, LinkIcon, ChatBubbleLeftRightIcon, CodeBracketIcon, BeakerIcon } from '@heroicons/react/24/outline';
import AvatarUpload from '../components/AvatarUpload';
import FollowButton from '../components/FollowButton';
import UserAvatar from '../components/UserAvatar';
import UserBadge from '../components/UserBadge';
import SkillTagManager from '../components/SkillTagManager';
import SideProjectManager from '../components/SideProjectManager';
import useOnlineStatusStore from '../store/onlineStatus';
import axios from 'axios';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser, token, login } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    name: '',
    bio: '',
    institution: '',
    position: '',
    department: '',
    userType: 'academic',
    badges: [],
    skillTags: [],
    sideProjects: [],
    education: [],
    publications: [],
    researchInterests: [],
    socialLinks: {}
  });
  const [followStats, setFollowStats] = useState({ followerCount: 0, followingCount: 0, isFollowing: false });
  const { fetchUserStatus, isUserOnline, getFormattedLastActive } = useOnlineStatusStore();

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

  useEffect(() => {
    if (profile?.id) {
      fetchUserStatus(profile.id);
    }
  }, [profile?.id, fetchUserStatus]);

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
      // Construct full name from firstName and lastName
      const fullName = data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : data.username;
      setProfile({ ...data, name: fullName });
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        name: fullName,
        bio: data.bio || '',
        institution: data.institution || '',
        position: data.position || '',
        department: data.department || '',
        userType: data.userType || 'academic',
        badges: data.badges || [],
        skillTags: data.skillTags || [],
        sideProjects: data.sideProjects || [],
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
      const response = await axios.put('/api/profile', {
        ...formData,
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      setProfile(response.data);
      // Fetch latest user info from backend
      const meRes = await axios.get('/api/auth/me');
      if (login && meRes.data && meRes.data.user) {
        login(meRes.data.user, token);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleAvatarUpload = (avatarPath) => {
    setProfile({ ...profile, avatar: avatarPath });
  };

  const startConversation = async () => {
    if (!profile || !currentUser) return;
    
    try {
      const response = await axios.post('/api/chat/conversations', {
        participantId: profile.id
      });
      
      // Navigate to messages page
      navigate('/chat');
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation. Please try again.');
    }
  };

  const getUserTypeLabel = (userType) => {
    const labels = {
      'academic': 'Academic',
      'hobbyist': 'Hobbyist',
      'independent': 'Independent',
      'student': 'Student',
      'professional': 'Professional'
    };
    return labels[userType] || userType;
  };

  const getUserTypeDescription = (userType) => {
    const descriptions = {
      'academic': 'University researcher or faculty member',
      'hobbyist': 'Science enthusiast pursuing knowledge for fun',
      'independent': 'Self-directed researcher or practitioner',
      'student': 'Currently studying or in training',
      'professional': 'Industry or applied science professional'
    };
    return descriptions[userType] || '';
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
        <div className="bg-white rounded-2xl shadow-2xl border border-white/30 overflow-hidden">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-20"></div>
          </div>

          {/* Profile Header */}
          <div className="relative px-8 pb-6">
            {/* Avatar - positioned to overlap cover */}
            <div className="flex justify-center sm:justify-start -mt-16 mb-4">
              <div className="relative">
                {isOwnProfile ? (
                  <AvatarUpload
                    onUploadComplete={handleAvatarUpload}
                    currentAvatar={profile.avatar}
                  />
                ) : (
                  <img
                    src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || profile.username)}&background=random`}
                    alt={profile.name || profile.username}
                    className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-2xl"
                  />
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="text-center sm:text-left">
              {/* Name and Email */}
              <div className="mb-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {profile.name || `${profile.firstName} ${profile.lastName}` || profile.username}
                </h1>
                {profile.email && isOwnProfile && (
                  <p className="text-gray-600 mb-3">{profile.email}</p>
                )}
                {!isOwnProfile && (
                  <div className="flex items-center justify-center sm:justify-start space-x-2 mb-3">
                    <UserAvatar user={profile} size="sm" showOnlineStatus={true} />
                    <span className={`text-sm font-medium ${isUserOnline(profile.id) ? 'text-green-600' : 'text-gray-500'}`}>
                      {isUserOnline(profile.id) ? '🟢 Online' : `⚪ Last seen ${getFormattedLastActive(profile.id)}`}
                    </span>
                  </div>
                )}
              </div>

              {/* User Type Badge */}
              <div className="flex justify-center sm:justify-start mb-4">
                <UserBadge
                  type={profile.userType}
                  label={getUserTypeLabel(profile.userType)}
                  description={getUserTypeDescription(profile.userType)}
                />
              </div>

              {/* Work Info */}
              {(profile.position || profile.institution) && (
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mb-4">
                  {profile.position && (
                    <div className="flex items-center bg-blue-50 rounded-lg px-3 py-1.5 border border-blue-200">
                      <BriefcaseIcon className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">{profile.position}</span>
                    </div>
                  )}
                  {profile.institution && (
                    <div className="flex items-center bg-purple-50 rounded-lg px-3 py-1.5 border border-purple-200">
                      <BuildingLibraryIcon className="h-4 w-4 mr-2 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">{profile.institution}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Stats and Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4">
                {/* Stats */}
                <div className="flex items-center space-x-6">
                  <Link to="/connections" className="group">
                    <div className="text-center bg-gray-50 rounded-lg px-4 py-2 hover:bg-gray-100 transition-all duration-200">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {followStats.followerCount}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">Followers</div>
                    </div>
                  </Link>
                  <Link to="/connections" className="group">
                    <div className="text-center bg-gray-50 rounded-lg px-4 py-2 hover:bg-gray-100 transition-all duration-200">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {followStats.followingCount}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">Following</div>
                    </div>
                  </Link>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {!isOwnProfile && (
                    <>
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
                      <button
                        onClick={startConversation}
                        className="inline-flex items-center px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium shadow-lg"
                      >
                        <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                        Message
                      </button>
                    </>
                  )}
                  
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
                    >
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-8 pb-8">
            {/* Bio */}
            {profile.bio ? (
              <div className="mb-8">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed text-lg">{profile.bio}</p>
                </div>
              </div>
            ) : isOwnProfile && (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-xl p-6 border-2 border-dashed border-blue-300/50">
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

            {/* Skill Tags */}
            {profile.skillTags && profile.skillTags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center">
                  <CodeBracketIcon className="h-6 w-6 mr-2 text-blue-600" />
                  Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-3">
                  {profile.skillTags.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200 shadow-sm transition-all duration-200 hover:from-blue-200 hover:to-purple-200 hover:scale-105"
                    >
                      <CodeBracketIcon className="h-4 w-4 mr-2" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Side Projects */}
            {profile.sideProjects && profile.sideProjects.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center">
                  <BeakerIcon className="h-6 w-6 mr-2 text-blue-600" />
                  Side Projects & Experiments
                </h3>
                <div className="space-y-4">
                  {profile.sideProjects.map((project, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm border-l-4 border-l-green-500">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg mb-2">{project.title}</h4>
                          {project.description && (
                            <p className="text-gray-600 mb-3">{project.description}</p>
                          )}
                          {project.url && (
                            <a
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm mb-3"
                            >
                              <LinkIcon className="h-4 w-4 mr-1" />
                              View Project
                            </a>
                          )}
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {project.technologies.map((tech, techIndex) => (
                                <span
                                  key={techIndex}
                                  className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
                                >
                                  <CodeBracketIcon className="h-3 w-3 mr-1" />
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interests */}
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
                    <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm border-l-4 border-l-blue-500">
                      <div className="font-semibold text-gray-900 text-lg mb-1">{edu.degree} in {edu.field}</div>
                      <div className="text-blue-600 font-medium mb-1">{edu.institution}</div>
                      <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full inline-block">{edu.year}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Work & Projects */}
            {profile.publications && profile.publications.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  Publications & Research
                </h3>
                <div className="space-y-4">
                  {profile.publications.map((pub, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm border-l-4 border-l-green-500">
                      <div className="font-semibold text-gray-900 text-lg mb-2">{pub.title}</div>
                      <div className="text-gray-600 mb-2">{pub.journal} ({pub.year})</div>
                      {pub.doi && (
                        <div className="text-sm text-blue-600 font-medium mb-2">
                          DOI: {pub.doi}
                        </div>
                      )}
                      {pub.authors && pub.authors.length > 0 && (
                        <div className="text-sm text-gray-500">
                          Contributors: {pub.authors.join(', ')}
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
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-sm"
                    >
                      {platform}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State for New Users */}
            {isOwnProfile && !profile.bio && (!profile.researchInterests || profile.researchInterests.length === 0) && 
             (!profile.education || profile.education.length === 0) && (!profile.publications || profile.publications.length === 0) && 
             (!profile.skillTags || profile.skillTags.length === 0) && (!profile.sideProjects || profile.sideProjects.length === 0) && (
              <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-xl p-8 border border-gray-200 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserGroupIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Complete your profile
                </h3>
                <p className="text-gray-600 mb-4">
                  Share a bit about yourself and your interests with the community
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                Edit Profile
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={e => setFormData({ ...formData, firstName: e.target.value, name: `${e.target.value} ${formData.lastName}` })}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={e => setFormData({ ...formData, lastName: e.target.value, name: `${formData.firstName} ${e.target.value}` })}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
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
                    placeholder="Tell people about yourself and what you're working on..."
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    I identify as a...
                  </label>
                  <select
                    name="userType"
                    value={formData.userType}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="academic">Academic Researcher</option>
                    <option value="hobbyist">Hobbyist</option>
                    <option value="independent">Independent Researcher</option>
                    <option value="student">Student</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Organization
                    </label>
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleInputChange}
                      placeholder="Where do you work or study?"
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      placeholder="What's your role or title?"
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                    placeholder="Which department or field?"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Skills & Expertise
                  </label>
                  <SkillTagManager
                    tags={formData.skillTags}
                    onTagsChange={(skillTags) => setFormData({ ...formData, skillTags })}
                    placeholder="Add your skills and expertise..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Side Projects & Experiments
                  </label>
                  <SideProjectManager
                    projects={formData.sideProjects}
                    onProjectsChange={(sideProjects) => setFormData({ ...formData, sideProjects })}
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
                    placeholder="What are you interested in? AI, Biology, Physics..."
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg font-medium"
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