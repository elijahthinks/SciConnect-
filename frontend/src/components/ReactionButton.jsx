import { useState, useEffect, useRef } from 'react';
import { HeartIcon, HandThumbUpIcon, SparklesIcon, LightBulbIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, HandThumbUpIcon as HandThumbUpSolidIcon, SparklesIcon as SparklesSolidIcon, LightBulbIcon as LightBulbSolidIcon, QuestionMarkCircleIcon as QuestionMarkCircleSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../store/auth';
import axios from 'axios';

const REACTION_TYPES = {
  like: {
    icon: HandThumbUpIcon,
    solidIcon: HandThumbUpSolidIcon,
    label: 'Like',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    hoverColor: 'hover:bg-blue-100'
  },
  heart: {
    icon: HeartIcon,
    solidIcon: HeartSolidIcon,
    label: 'Love',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    hoverColor: 'hover:bg-red-100'
  },
  celebrate: {
    icon: SparklesIcon,
    solidIcon: SparklesSolidIcon,
    label: 'Celebrate',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    hoverColor: 'hover:bg-yellow-100'
  },
  insightful: {
    icon: LightBulbIcon,
    solidIcon: LightBulbSolidIcon,
    label: 'Insightful',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    hoverColor: 'hover:bg-green-100'
  },
  curious: {
    icon: QuestionMarkCircleIcon,
    solidIcon: QuestionMarkCircleSolidIcon,
    label: 'Curious',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    hoverColor: 'hover:bg-purple-100'
  }
};

export default function ReactionButton({ targetType, targetId }) {
  const [reactions, setReactions] = useState({});
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userReaction, setUserReaction] = useState(null);
  const { user, token } = useAuth();
  const pickerRef = useRef(null);

  // Debug logging
  console.log('ReactionButton rendered:', { targetType, targetId, user: user?.id });

  useEffect(() => {
    fetchReactions();
  }, [targetId]);

  useEffect(() => {
    // Close reaction picker when clicking outside
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowReactionPicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchReactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/reactions/${targetType}/${targetId}`);
      console.log('Fetched reactions:', response.data);
      setReactions(response.data);
      
      // Find user's reaction
      setUserReaction(null);
      if (user) {
        Object.entries(response.data).forEach(([type, users]) => {
          console.log('Checking reaction type:', type, 'users:', users);
          if (users.some(r => r.user.id === user.id)) {
            console.log('Found user reaction:', type);
            setUserReaction(type);
          }
        });
      }
    } catch (err) {
      console.error('Failed to fetch reactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (type) => {
    if (!user) return;

    try {
      console.log('Adding reaction:', type, 'to', targetType, targetId);
      const response = await axios.post(`/api/reactions/${targetType}/${targetId}`, {
        type
      });
      console.log('Reaction response:', response.data);
      
      await fetchReactions();
    } catch (err) {
      console.error('Failed to add reaction:', err);
      console.error('Error details:', err.response?.data);
    }
    
    setShowReactionPicker(false);
  };

  const getTotalReactions = () => {
    return Object.values(reactions).reduce((total, users) => total + users.length, 0);
  };

  const getReactionSummary = () => {
    const total = getTotalReactions();
    if (total === 0) return '';

    const types = Object.entries(reactions)
      .filter(([_, users]) => users.length > 0)
      .map(([type, users]) => ({
        type,
        count: users.length
      }))
      .sort((a, b) => b.count - a.count);

    if (types.length === 1) {
      return `${types[0].count} ${REACTION_TYPES[types[0].type].label}`;
    }

    return `${total} reactions`;
  };

  const renderReactionIcon = () => {
    if (!userReaction) {
      return <HandThumbUpIcon className="h-5 w-5" />;
    }
    const ReactionIcon = REACTION_TYPES[userReaction].solidIcon;
    return <ReactionIcon className={`h-5 w-5 ${REACTION_TYPES[userReaction].color}`} />;
  };

  if (loading) {
    return (
      <div className="animate-pulse h-8 w-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg shadow-sm"></div>
    );
  }

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => user && setShowReactionPicker(!showReactionPicker)}
        onMouseEnter={() => user && setShowReactionPicker(true)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-sm ${
          user ? 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md' : 'cursor-not-allowed opacity-50'
        } ${userReaction ? 
          `${REACTION_TYPES[userReaction].color} ${REACTION_TYPES[userReaction].bgColor} shadow-md` : 
          'text-gray-500 bg-white/70 hover:bg-blue-50 border border-gray-200'
        }`}
      >
        {renderReactionIcon()}
        <span>{getReactionSummary() || 'React'}</span>
      </button>

      {showReactionPicker && (
        <div
          className="absolute bottom-full left-0 mb-3 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-4 flex space-x-3 z-20 transform transition-all duration-300 animate-in slide-in-from-bottom-2"
          onMouseLeave={() => setShowReactionPicker(false)}
        >
          {Object.entries(REACTION_TYPES).map(([type, { icon: Icon, label, color, bgColor, hoverColor }]) => (
            <button
              key={type}
              onClick={() => handleReaction(type)}
              className={`relative p-3 rounded-full transition-all duration-200 transform hover:scale-110 group ${bgColor} ${hoverColor} shadow-lg hover:shadow-xl`}
              title={label}
            >
              <Icon className={`h-6 w-6 ${color}`} />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs font-medium text-white bg-gray-800/90 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg">
                {label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 