import { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon, CheckIcon, ArrowPathIcon, CameraIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../store/auth';
import axios from 'axios';

export default function AvatarUpload({ currentAvatar, onAvatarUpdate }) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, GIF, etc.)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const response = await axios.post('/api/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (onAvatarUpdate) {
        onAvatarUpdate(response.data.avatar);
      }

      // Reset state
      setSelectedFile(null);
      setPreview(null);
      
      alert('Profile picture updated successfully!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      alert(error.response?.data?.message || 'Failed to upload avatar. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Current Avatar with Upload Button */}
      <div className="flex items-center space-x-6">
        <div className="relative group">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg border-2 border-white/50 overflow-hidden">
            {currentAvatar ? (
              <img 
                src={currentAvatar} 
                alt={user?.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl text-blue-600 font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
          
          {/* Upload button overlay */}
          <button
            onClick={triggerFileInput}
            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 text-white"
            title="Change profile picture"
          >
            <CameraIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <button
              onClick={triggerFileInput}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              <PhotoIcon className="h-4 w-4 mr-2" />
              Choose Photo
            </button>
            <div className="text-sm text-gray-500">
              JPG, PNG or GIF. Max 5MB.
            </div>
          </div>
        </div>
      </div>

      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Area - Only show if no file selected */}
      {!selectedFile && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={triggerFileInput}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
            dragOver 
              ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <PhotoIcon className="mx-auto h-8 w-8 text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-600 mb-1">
            Drop your image here, or click to browse
          </p>
          <p className="text-xs text-gray-500">
            Supports JPG, PNG, GIF up to 5MB
          </p>
        </div>
      )}

      {/* Preview and Upload Controls */}
      {selectedFile && (
        <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center space-x-4">
            {/* Preview */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
                {preview && (
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
            
            {/* File Info and Controls */}
            <div className="flex-1 min-w-0">
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
                >
                  {uploading ? (
                    <>
                      <ArrowPathIcon className="h-3 w-3 mr-1 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-3 w-3 mr-1" />
                      Upload
                    </>
                  )}
                </button>
                
                <button
                  onClick={cancelUpload}
                  disabled={uploading}
                  className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <XMarkIcon className="h-3 w-3 mr-1" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 