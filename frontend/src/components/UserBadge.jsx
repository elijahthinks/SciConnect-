import React from 'react';
import { 
  AcademicCapIcon, 
  BeakerIcon, 
  UserIcon, 
  StarIcon,
  HeartIcon,
  LightBulbIcon,
  GlobeAltIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

const UserBadge = ({ type, label, description }) => {
  const getBadgeConfig = (badgeType) => {
    const configs = {
      'hobbyist': {
        icon: HeartIcon,
        bgColor: 'bg-gradient-to-r from-pink-100 to-red-100',
        textColor: 'text-pink-700',
        borderColor: 'border-pink-200',
        iconColor: 'text-pink-600'
      },
      'independent': {
        icon: UserIcon,
        bgColor: 'bg-gradient-to-r from-green-100 to-emerald-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        iconColor: 'text-green-600'
      },
      'academic': {
        icon: AcademicCapIcon,
        bgColor: 'bg-gradient-to-r from-blue-100 to-indigo-100',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-600'
      },
      'student': {
        icon: AcademicCapIcon,
        bgColor: 'bg-gradient-to-r from-purple-100 to-violet-100',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-200',
        iconColor: 'text-purple-600'
      },
      'professional': {
        icon: StarIcon,
        bgColor: 'bg-gradient-to-r from-yellow-100 to-orange-100',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-600'
      },
      'citizen-scientist': {
        icon: BeakerIcon,
        bgColor: 'bg-gradient-to-r from-cyan-100 to-teal-100',
        textColor: 'text-cyan-700',
        borderColor: 'border-cyan-200',
        iconColor: 'text-cyan-600'
      },
      'open-source': {
        icon: CodeBracketIcon,
        bgColor: 'bg-gradient-to-r from-gray-100 to-slate-100',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-200',
        iconColor: 'text-gray-600'
      },
      'innovator': {
        icon: LightBulbIcon,
        bgColor: 'bg-gradient-to-r from-amber-100 to-yellow-100',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
        iconColor: 'text-amber-600'
      },
      'global': {
        icon: GlobeAltIcon,
        bgColor: 'bg-gradient-to-r from-indigo-100 to-purple-100',
        textColor: 'text-indigo-700',
        borderColor: 'border-indigo-200',
        iconColor: 'text-indigo-600'
      }
    };
    
    return configs[badgeType] || configs['academic'];
  };

  const config = getBadgeConfig(type);
  const IconComponent = config.icon;

  return (
    <div className="group relative">
      <div className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-full border shadow-sm
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        transition-all duration-200 hover:scale-105 hover:shadow-md
      `}>
        <IconComponent className={`h-4 w-4 ${config.iconColor}`} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      
      {/* Tooltip */}
      {description && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {description}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default UserBadge; 