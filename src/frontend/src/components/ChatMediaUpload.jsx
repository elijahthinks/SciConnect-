import { useState, useRef } from 'react';
import { PhotoIcon, PaperClipIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function ChatMediaUpload({ onUploadComplete, onUploadError }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('chatMedia', selectedFile);

    try {
      // Upload file
      const response = await axios.post('/api/chat/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      // Track progress
      const { uploadId } = response.data;
      const eventSource = new EventSource(`/api/chat/media/progress/${uploadId}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setUploadProgress(data.progress);

        if (data.progress === 100) {
          eventSource.close();
          setIsUploading(false);
          onUploadComplete(response.data);
          resetUpload();
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setIsUploading(false);
        onUploadError('Upload failed');
        resetUpload();
      };
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      onUploadError(error.response?.data?.message || 'Upload failed');
      resetUpload();
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const getFileTypeFromMime = (type) => {
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    return 'document';
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      />

      {!selectedFile && (
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleImageClick}
            className="text-gray-500 hover:text-gray-700"
          >
            <PhotoIcon className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={handleFileClick}
            className="text-gray-500 hover:text-gray-700"
          >
            <PaperClipIcon className="w-6 h-6" />
          </button>
        </div>
      )}

      {selectedFile && (
        <div className="relative p-2 bg-gray-100 rounded-lg">
          {/* Preview */}
          {previewUrl ? (
            <div className="relative w-32 h-32">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ) : (
            <div className="flex items-center space-x-2 p-2">
              <PaperClipIcon className="w-6 h-6 text-gray-500" />
              <span className="text-sm text-gray-700 truncate">
                {selectedFile.name}
              </span>
            </div>
          )}

          {/* Progress bar */}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <div className="w-full max-w-[80%] bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-500 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Remove button */}
          {!isUploading && (
            <button
              onClick={resetUpload}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}

          {/* Upload button */}
          {!isUploading && (
            <button
              onClick={handleUpload}
              className="mt-2 w-full bg-blue-500 text-white rounded-lg py-1 px-3 text-sm hover:bg-blue-600"
            >
              Send {getFileTypeFromMime(selectedFile.type)}
            </button>
          )}
        </div>
      )}
    </div>
  );
} 