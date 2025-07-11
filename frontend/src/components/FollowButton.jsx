import { useState, useEffect } from 'react';
import { UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../store/auth';
import axios from 'axios';

export default function FollowButton({ userId, onFollowChange }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && userId !== user.id) {
      fetchFollowStatus();
    } else {
      setLoading(false);
    }
  }, [userId, user]);

  const fetchFollowStatus = async () => {
    try {
      const response = await axios.get(`/api/social/status/${userId}`);
      setIsFollowing(response.data.isFollowing);
    } catch (err) {
      console.error('Failed to fetch follow status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user || loading) return;

    try {
      setLoading(true);
      if (isFollowing) {
        await axios.delete(`/api/social/unfollow/${userId}`);
        setIsFollowing(false);
      } else {
        await axios.post(`/api/social/follow/${userId}`, {});
        setIsFollowing(true);
      }
      
      if (onFollowChange) {
        onFollowChange(!isFollowing);
      }
    } catch (err) {
      console.error('Failed to update follow status:', err);
      alert(err.response?.data?.message || 'Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  if (!user || userId === user.id) {
    return null;
  }

  return (
    <button
      onClick={handleFollow}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={loading}
      className={`
        inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg
        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${isFollowing
          ? 'border border-white/20 bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 hover:shadow-xl'
          : 'border border-transparent bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-2xl'}
      `}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : isFollowing ? (
        <>
          {isHovered ? (
            <UserMinusIcon className="h-5 w-5 mr-2" />
          ) : (
            <UserPlusIcon className="h-5 w-5 mr-2" />
          )}
          {isHovered ? 'Unfollow' : 'Following'}
        </>
      ) : (
        <>
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Follow
        </>
      )}
    </button>
  );
} 