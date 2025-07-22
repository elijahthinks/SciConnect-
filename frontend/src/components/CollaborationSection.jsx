import { useState, useEffect } from 'react';
import { 
  UserPlusIcon, 
  UserGroupIcon, 
  CheckCircleIcon, 
  XMarkIcon,
  ClockIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../store/auth';
import axios from 'axios';
import UserAvatar from './UserAvatar';

const collaborationRoles = [
  { value: 'lead', label: 'Lead Researcher', icon: AcademicCapIcon, color: 'text-primary-600' },
  { value: 'co_author', label: 'Co-Author', icon: UserIcon, color: 'text-sage-600' },
  { value: 'contributor', label: 'Contributor', icon: UserGroupIcon, color: 'text-sage-600' },
  { value: 'reviewer', label: 'Reviewer', icon: CheckCircleIcon, color: 'text-warm-600' },
  { value: 'advisor', label: 'Advisor', icon: BriefcaseIcon, color: 'text-neutral-600' }
];

const collaborationStatuses = {
  invited: { label: 'Invited', color: 'text-warm-600', bg: 'bg-warm-100' },
  accepted: { label: 'Accepted', color: 'text-sage-600', bg: 'bg-sage-100' },
  declined: { label: 'Declined', color: 'text-earth-600', bg: 'bg-earth-100' },
  pending: { label: 'Pending', color: 'text-primary-600', bg: 'bg-primary-100' }
};

export default function CollaborationSection({ researchPostId }) {
  const { user, token } = useAuth();
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  
  // Invite form state
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState('contributor');
  const [contribution, setContribution] = useState('');
  const [expertise, setExpertise] = useState([]);
  const [expertiseInput, setExpertiseInput] = useState('');

  useEffect(() => {
    fetchCollaborations();
  }, [researchPostId]);

  const fetchCollaborations = async () => {
    try {
      const response = await axios.get(`/api/research/${researchPostId}/collaborations`);
      setCollaborations(response.data);
    } catch (error) {
      console.error('Failed to fetch collaborations:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await axios.get(`/api/users/search?q=${encodeURIComponent(query)}`);
      setSearchResults(response.data.filter(u => u.id !== user.id));
    } catch (error) {
      console.error('Failed to search users:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      alert('Please select a user to invite.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`/api/research/${researchPostId}/collaborations`, {
        userId: selectedUser.id,
        role,
        contribution: contribution.trim(),
        expertise
      });

      setCollaborations([response.data, ...collaborations]);
      
      // Reset form
      setSelectedUser(null);
      setRole('contributor');
      setContribution('');
      setExpertise([]);
      setSearchQuery('');
      setSearchResults([]);
      setShowInviteForm(false);
      
      alert('Collaboration invitation sent successfully!');
    } catch (error) {
      console.error('Failed to send invitation:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResponse = async (collaborationId, status) => {
    try {
      const response = await axios.put(`/api/research/collaborations/${collaborationId}/respond`, { status });
      
      setCollaborations(collaborations.map(c => 
        c.id === collaborationId ? response.data : c
      ));
      
      alert(`Collaboration ${status} successfully!`);
    } catch (error) {
      console.error('Failed to respond to collaboration:', error);
      alert('Failed to respond. Please try again.');
    }
  };

  const addExpertise = () => {
    const expertiseItem = expertiseInput.trim();
    if (expertiseItem && !expertise.includes(expertiseItem)) {
      setExpertise([...expertise, expertiseItem]);
      setExpertiseInput('');
    }
  };

  const removeExpertise = (item) => {
    setExpertise(expertise.filter(e => e !== item));
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

  const getRoleConfig = (role) => {
    return collaborationRoles.find(r => r.value === role) || collaborationRoles[2];
  };

  const getStatusConfig = (status) => {
    return collaborationStatuses[status] || collaborationStatuses.invited;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <UserGroupIcon className="h-5 w-5 mr-2 text-green-600" />
          Research Collaborations
        </h3>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
        >
          {showInviteForm ? 'Cancel' : 'Invite Collaborator'}
        </button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200">
          <form onSubmit={handleInvite}>
            <div className="space-y-4">
              {/* User Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search by name, username, or institution..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    </div>
                  )}
                </div>
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        className={`w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                          selectedUser?.id === user.id ? 'bg-green-50 border-green-200' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <UserAvatar user={user} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-600">{user.institution}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected User */}
              {selectedUser && (
                <div className="p-3 bg-green-100 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <UserAvatar user={selectedUser} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.name}</p>
                        <p className="text-xs text-gray-600">{selectedUser.institution}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {collaborationRoles.map(({ value, label, icon: Icon, color }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      className={`flex items-center space-x-2 p-3 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                        role === value
                          ? 'bg-green-500 text-white shadow-lg'
                          : 'bg-white text-gray-600 hover:bg-green-50 border border-gray-200'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contribution */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Contribution</label>
                <textarea
                  value={contribution}
                  onChange={(e) => setContribution(e.target.value)}
                  placeholder="Describe the expected contribution to the research..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none bg-white"
                  rows="3"
                />
              </div>

              {/* Expertise */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Areas of Expertise</label>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {expertise.map((item, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => removeExpertise(item)}
                          className="ml-2 hover:text-red-600 transition-colors"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={expertiseInput}
                      onChange={(e) => setExpertiseInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                      placeholder="Add expertise area"
                      className="flex-1 p-2 border border-gray-200 rounded-lg text-sm"
                    />
                    <button
                      type="button"
                      onClick={addExpertise}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !selectedUser}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {submitting ? 'Sending Invitation...' : 'Send Invitation'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Collaborations List */}
      <div className="space-y-4">
        {collaborations.length === 0 ? (
          <div className="text-center py-8">
            <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No collaborations yet. Invite researchers to collaborate!</p>
          </div>
        ) : (
          collaborations.map((collaboration) => {
            const roleConfig = getRoleConfig(collaboration.role);
            const statusConfig = getStatusConfig(collaboration.status);
            
            return (
              <div key={collaboration.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <UserAvatar user={collaboration.user} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {collaboration.user?.name || 'Unknown User'}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <ClockIcon className="h-3 w-3" />
                        <span>Invited {formatDate(collaboration.invitedAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700`}>
                      {roleConfig.label}
                    </span>
                  </div>
                </div>

                {/* Contribution */}
                {collaboration.contribution && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-1">Expected Contribution:</p>
                    <p className="text-sm text-gray-600">{collaboration.contribution}</p>
                  </div>
                )}

                {/* Expertise */}
                {collaboration.expertise && collaboration.expertise.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Areas of Expertise:</p>
                    <div className="flex flex-wrap gap-1">
                      {collaboration.expertise.map((item, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {collaboration.status === 'invited' && 'Awaiting response'}
                    {collaboration.status === 'accepted' && 'Collaboration active'}
                    {collaboration.status === 'declined' && 'Invitation declined'}
                    {collaboration.status === 'pending' && 'Response pending'}
                  </div>
                  
                  {/* Response buttons for invited users */}
                  {collaboration.status === 'invited' && collaboration.user?.id === user?.id && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleResponse(collaboration.id, 'accepted')}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs hover:bg-green-200 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleResponse(collaboration.id, 'declined')}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs hover:bg-red-200 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 