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
        bgColor: 'bg-gradient-to-r from-earth-100 to-earth-200',
        textColor: 'text-earth-700',
        borderColor: 'border-earth-200',
        iconColor: 'text-earth-600'
      },
      'independent': {
        icon: UserIcon,
        bgColor: 'bg-gradient-to-r from-sage-100 to-sage-200',
        textColor: 'text-sage-700',
        borderColor: 'border-sage-200',
        iconColor: 'text-sage-600'
      },
      'academic': {
        icon: AcademicCapIcon,
        bgColor: 'bg-gradient-to-r from-primary-100 to-primary-200',
        textColor: 'text-primary-700',
        borderColor: 'border-primary-200',
        iconColor: 'text-primary-600'
      },
      'student': {
        icon: AcademicCapIcon,
        bgColor: 'bg-gradient-to-r from-neutral-100 to-neutral-200',
        textColor: 'text-neutral-700',
        borderColor: 'border-neutral-200',
        iconColor: 'text-neutral-600'
      },
      'professional': {
        icon: StarIcon,
        bgColor: 'bg-gradient-to-r from-warm-100 to-warm-200',
        textColor: 'text-warm-700',
        borderColor: 'border-warm-200',
        iconColor: 'text-warm-600'
      },
      'citizen-scientist': {
        icon: BeakerIcon,
        bgColor: 'bg-gradient-to-r from-sage-100 to-primary-100',
        textColor: 'text-sage-700',
        borderColor: 'border-sage-200',
        iconColor: 'text-sage-600'
      },
      'open-source': {
        icon: CodeBracketIcon,
        bgColor: 'bg-gradient-to-r from-neutral-100 to-warm-100',
        textColor: 'text-neutral-700',
        borderColor: 'border-neutral-200',
        iconColor: 'text-neutral-600'
      },
      'innovator': {
        icon: LightBulbIcon,
        bgColor: 'bg-gradient-to-r from-earth-100 to-earth-200',
        textColor: 'text-earth-700',
        borderColor: 'border-earth-200',
        iconColor: 'text-earth-600'
      },
      'global': {
        icon: GlobeAltIcon,
        bgColor: 'bg-gradient-to-r from-primary-100 to-sage-100',
        textColor: 'text-primary-700',
        borderColor: 'border-primary-200',
        iconColor: 'text-primary-600'
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