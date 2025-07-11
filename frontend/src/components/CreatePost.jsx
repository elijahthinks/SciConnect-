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

      const response = await axios.post('/api/posts', {
        content: content.trim(),
        media: mediaUrls,
        mediaType,
        tags,
        visibility
      });

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
    e.preventDefault();
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
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6 transform transition-all duration-300 hover:shadow-2xl">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <UserAvatar user={user} size="md" />
          </div>
          
          <div className="flex-1">
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                Share your thoughts
              </h3>
              <p className="text-sm text-gray-600">
                Connect with the scientific community
              </p>
            </div>

            {/* Visibility Selector */}
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm font-medium text-gray-700">Visibility:</span>
              {Object.entries(visibilityOptions).map(([key, { icon: Icon, label }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setVisibility(key)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    visibility === key 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                      : 'bg-white/70 text-gray-600 hover:bg-blue-50 border border-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Content Input */}
            <div className="mb-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind? Share your research, insights, or thoughts..."
                className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm placeholder-gray-500 text-gray-900 min-h-[120px]"
                rows="4"
                maxLength="2000"
              />
              <div className="mt-2 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {content.length > 0 && (
                    <span className={content.length > 1800 ? 'text-red-500' : 'text-gray-500'}>
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
                    className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center border border-blue-200 shadow-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-red-600 transition-colors duration-200"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              {tags.length < 5 && (
                <form onSubmit={handleTagAdd} className="flex items-center">
                  <div className="relative flex-1">
                    <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add tags (e.g., research, ai, quantum)..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="ml-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-sm"
                  >
                    Add
                  </button>
                </form>
              )}
            </div>
            
            {/* Media Preview */}
            {media.length > 0 && (
              <div className="mb-4 relative">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  {mediaType === 'image' && (
                    <img 
                      src={URL.createObjectURL(media[0])} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg shadow-sm"
                    />
                  )}
                  {mediaType === 'video' && (
                    <video 
                      src={URL.createObjectURL(media[0])} 
                      className="w-full h-48 object-cover rounded-lg shadow-sm"
                      controls
                    />
                  )}
                  {mediaType === 'document' && (
                    <div className="w-full p-4 bg-white rounded-lg flex items-center border border-gray-200">
                      <DocumentIcon className="h-8 w-8 text-blue-500 mr-3" />
                      <span className="text-gray-700 truncate font-medium">{media[0].name}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={removeMedia}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200 shadow-lg"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
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
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 bg-white/70 hover:bg-blue-50 rounded-lg border border-gray-200 transition-all duration-200 transform hover:scale-105"
                  title="Add image"
                >
                  <PhotoIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-purple-600 bg-white/70 hover:bg-purple-50 rounded-lg border border-gray-200 transition-all duration-200 transform hover:scale-105"
                  title="Add video"
                >
                  <VideoCameraIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-green-600 bg-white/70 hover:bg-green-50 rounded-lg border border-gray-200 transition-all duration-200 transform hover:scale-105"
                  title="Add document"
                >
                  <DocumentIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Document</span>
                </button>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || (!content.trim() && media.length === 0) || content.length > 2000}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 transform hover:scale-105 shadow-lg"
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