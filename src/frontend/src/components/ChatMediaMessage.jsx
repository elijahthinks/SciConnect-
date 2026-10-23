import { useState } from 'react';
import { DocumentIcon, PlayIcon } from '@heroicons/react/24/outline';

export default function ChatMediaMessage({ type, url, messageType }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const getFileNameFromUrl = (url) => {
    return url.split('/').pop();
  };

  if (type === 'image') {
    return (
      <div className="relative max-w-sm">
        {!isImageLoaded && (
          <div className="w-full h-48 bg-gray-200 animate-pulse rounded-lg" />
        )}
        <img
          src={url}
          alt="Message attachment"
          className={`w-full rounded-lg ${isImageLoaded ? 'block' : 'hidden'}`}
          onLoad={handleImageLoad}
        />
      </div>
    );
  }

  if (type === 'video') {
    return (
      <div className="relative max-w-sm">
        <video
          className="w-full rounded-lg"
          controls
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
        >
          <source src={url} type={messageType} />
          Your browser does not support the video tag.
        </video>
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              className="bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-75 transition-opacity"
              onClick={() => {
                const video = document.querySelector('video');
                video?.play();
              }}
            >
              <PlayIcon className="w-8 h-8 text-white" />
            </button>
          </div>
        )}
      </div>
    );
  }

  if (type === 'document') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <DocumentIcon className="w-8 h-8 text-gray-500" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {getFileNameFromUrl(url)}
          </p>
          <p className="text-xs text-gray-500">Click to open</p>
        </div>
      </a>
    );
  }

  return null;
} 