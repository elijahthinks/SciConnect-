import { useState, useRef } from 'react';
import { PaperAirplaneIcon, PhotoIcon, VideoCameraIcon, DocumentIcon, XMarkIcon, TagIcon, GlobeAltIcon, UserGroupIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../store/auth';
import axios from 'axios';
import UserAvatar from './UserAvatar';

export default function CreatePost({ onPostCreated }) {
  const { user, token } = useAuth();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [mediaType, setMediaType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && media.length === 0) {
      alert('Please add some content or media to your post.');
      return;
    }

    if (!token) {
      alert('Please log in to create a post.');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Creating post with:', { content, media, mediaType, tags, visibility });
      console.log('User token available:', !!token);
      
      // First upload any media files
      let mediaUrls = [];
      if (media.length > 0) {
        console.log('Uploading media files...');
        const formData = new FormData();
        media.forEach(file => formData.append('media', file));
        
        const uploadResponse = await axios.post('/api/posts/upload/media', formData, {
          headers: { 
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        });
        
        mediaUrls = uploadResponse.data.urls;
        console.log('Media uploaded successfully:', mediaUrls);
      }

      // Then create the post with media URLs
      console.log('Creating post with data:', {
        content: content.trim(),
        media: mediaUrls,
        mediaType,
        tags,
        visibility
      });

      const postData = {
        content: content.trim(),
        tags,
        visibility
      };

      // Only add media fields if there's actually media
      if (mediaUrls.length > 0) {
        postData.media = mediaUrls;
        postData.mediaType = mediaType;
      }

      const response = await axios.post('/api/posts', postData);

      console.log('Post created successfully:', response.data);
      
      // Reset form
      setContent('');
      setMedia([]);
      setMediaType(null);
      setTags([]);
      setTagInput('');
      setVisibility('public');
      setUploadProgress(0);
      
      // Notify parent component
      if (onPostCreated) {
        onPostCreated(response.data);
      }
      
      // Success feedback
      alert('Post created successfully!');
      
    } catch (err) {
      console.error('Failed to create post:', err);
      console.error('Error details:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          `Failed to create post (${err.response?.status || 'Unknown error'}). Please try again.`;
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || 
                         file.type.startsWith('video/') ||
                         file.type === 'application/pdf' ||
                         file.type === 'application/msword' ||
                         file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit
      
      if (!isValidType) alert(`Invalid file type: ${file.name}`);
      if (!isValidSize) alert(`File too large: ${file.name}`);
      
      return isValidType && isValidSize;
    });

    if (!validFiles.length) return;

    const file = validFiles[0]; // For now, handle one file at a time
    const fileType = file.type.startsWith('image/') ? 'image' : 
                    file.type.startsWith('video/') ? 'video' : 'document';
    
    setMedia([file]);
    setMediaType(fileType);
    
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTagAdd = (e) => {
    if (e) e.preventDefault();
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const removeMedia = () => {
    setMedia([]);
    setMediaType(null);
    setUploadProgress(0);
  };

  const visibilityOptions = {
    public: { icon: GlobeAltIcon, label: 'Public' },
    connections: { icon: UserGroupIcon, label: 'Connections' },
    private: { icon: LockClosedIcon, label: 'Private' }
  };

  return (
    <div className="bg-white rounded-xl shadow-soft border border-neutral-200 p-4 mb-4 transform transition-all duration-300 hover:shadow-large">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <UserAvatar user={user} size="sm" />
          </div>
          
          <div className="flex-1">
            {/* Header */}
            <div className="mb-3">
              <h3 className="text-base font-semibold text-neutral-900 mb-1">
                Share your thoughts
              </h3>
              <p className="text-xs text-neutral-600">
                What's on your mind? Share with the community
              </p>
            </div>

            {/* Visibility Selector */}
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xs font-medium text-neutral-700">Visibility:</span>
              {Object.entries(visibilityOptions).map(([key, { icon: Icon, label }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setVisibility(key)}
                  className={`flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 transform hover:scale-105 ${
                    visibility === key 
                      ? 'bg-primary-600 text-white shadow-medium' 
                      : 'bg-white text-neutral-600 hover:bg-primary-50 border border-neutral-200'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Content Input */}
            <div className="mb-3">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind? Share your latest work, ideas, or discoveries..."
                className="w-full p-4 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none bg-white placeholder-neutral-500 text-neutral-900 text-lg leading-relaxed shadow-soft"
                rows="4"
              />
              <div className="mt-2 flex justify-between items-center">
                <div className="text-xs text-neutral-500">
                  {content.length > 0 && (
                    <span className={content.length > 1800 ? 'text-error-500' : 'text-neutral-500'}>
                      {content.length}/2000 characters
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Tags Input */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map(tag => (
                  <span 
                    key={tag}
                    className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center border border-primary-200 shadow-soft"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-error-600 transition-colors duration-200"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              {tags.length < 5 && (
                <div className="flex items-center">
                  <div className="relative flex-1">
                    <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleTagAdd(e);
                        }
                      }}
                      placeholder="Add tags (e.g., research, ai, quantum)..."
                      className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleTagAdd}
                    className="ml-2 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-all duration-200 transform hover:scale-105 shadow-soft"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
            
            {/* Media Preview */}
            {media.length > 0 && (
              <div className="mb-4 relative">
                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
                  {mediaType === 'image' && (
                    <img 
                      src={URL.createObjectURL(media[0])} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg shadow-soft"
                    />
                  )}
                  {mediaType === 'video' && (
                    <video 
                      src={URL.createObjectURL(media[0])} 
                      className="w-full h-48 object-cover rounded-lg shadow-soft"
                      controls
                    />
                  )}
                  {mediaType === 'document' && (
                    <div className="w-full p-4 bg-white rounded-lg flex items-center border border-neutral-200">
                      <DocumentIcon className="h-8 w-8 text-primary-500 mr-3" />
                      <span className="text-neutral-700 truncate font-medium">{media[0].name}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={removeMedia}
                    className="absolute top-2 right-2 bg-error-500 text-white rounded-full p-1 hover:bg-error-600 transition-colors duration-200 shadow-medium"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500 transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleMediaUpload}
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-3 py-2 text-neutral-600 hover:text-primary-600 bg-white hover:bg-primary-50 rounded-lg border border-neutral-200 transition-all duration-200 transform hover:scale-105"
                  title="Add image"
                >
                  <PhotoIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-3 py-2 text-neutral-600 hover:text-primary-600 bg-white hover:bg-primary-50 rounded-lg border border-neutral-200 transition-all duration-200 transform hover:scale-105"
                  title="Add video"
                >
                  <VideoCameraIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-3 py-2 text-neutral-600 hover:text-primary-600 bg-white hover:bg-primary-50 rounded-lg border border-neutral-200 transition-all duration-200 transform hover:scale-105"
                  title="Add document"
                >
                  <DocumentIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Document</span>
                </button>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || (!content.trim() && media.length === 0) || content.length > 2000}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 transform hover:scale-105 shadow-medium"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Publishing...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                    Share Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 