import { useState, useRef } from 'react';
import { 
  PaperAirplaneIcon, 
  PhotoIcon, 
  VideoCameraIcon, 
  DocumentIcon, 
  XMarkIcon, 
  TagIcon, 
  GlobeAltIcon, 
  UserGroupIcon, 
  LockClosedIcon,
  BeakerIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../store/auth';
import axios from 'axios';
import UserAvatar from './UserAvatar';

export default function CreateResearchPost({ onPostCreated }) {
  const { user, token } = useAuth();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [mediaType, setMediaType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Research-specific fields
  const [researchType, setResearchType] = useState('results');
  const [methodology, setMethodology] = useState('');
  const [results, setResults] = useState('');
  const [conclusions, setConclusions] = useState('');
  const [citations, setCitations] = useState([]);
  const [doi, setDoi] = useState('');
  const [preprintUrl, setPreprintUrl] = useState('');
  const [openAccess, setOpenAccess] = useState(true);
  const [funding, setFunding] = useState('');
  const [conflictsOfInterest, setConflictsOfInterest] = useState('');
  const [collaborationStatus, setCollaborationStatus] = useState('open');
  
  // Citation form
  const [citationForm, setCitationForm] = useState({
    title: '',
    authors: '',
    journal: '',
    year: '',
    doi: '',
    url: ''
  });
  
  const fileInputRef = useRef(null);

  const researchTypes = [
    { value: 'experiment', label: 'Experiment', icon: BeakerIcon },
    { value: 'survey', label: 'Survey', icon: DocumentIcon },
    { value: 'review', label: 'Review', icon: DocumentIcon },
    { value: 'case_study', label: 'Case Study', icon: DocumentIcon },
    { value: 'theoretical', label: 'Theoretical', icon: DocumentIcon },
    { value: 'methodology', label: 'Methodology', icon: DocumentIcon },
    { value: 'results', label: 'Results', icon: DocumentIcon },
    { value: 'discussion', label: 'Discussion', icon: DocumentIcon }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && media.length === 0) {
      alert('Please add some content or media to your research post.');
      return;
    }

    if (!token) {
      alert('Please log in to create a research post.');
      return;
    }

    setIsSubmitting(true);
    try {
      // First upload any media files
      let mediaUrls = [];
      if (media.length > 0) {
        const formData = new FormData();
        media.forEach(file => formData.append('media', file));
        
        const uploadResponse = await axios.post('/api/research/upload/media', formData, {
          headers: { 
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        });
        
        mediaUrls = uploadResponse.data.urls;
      }

      const postData = {
        content: content.trim(),
        tags,
        visibility,
        researchType,
        methodology: methodology.trim(),
        results: results.trim(),
        conclusions: conclusions.trim(),
        citations,
        doi: doi.trim(),
        preprintUrl: preprintUrl.trim(),
        openAccess,
        funding: funding.trim(),
        conflictsOfInterest: conflictsOfInterest.trim(),
        collaborationStatus
      };

      if (mediaUrls.length > 0) {
        postData.media = mediaUrls;
        postData.mediaType = mediaType;
      }

      const response = await axios.post('/api/research', postData);
      
      // Reset form
      setContent('');
      setMedia([]);
      setMediaType(null);
      setTags([]);
      setTagInput('');
      setVisibility('public');
      setUploadProgress(0);
      setResearchType('results');
      setMethodology('');
      setResults('');
      setConclusions('');
      setCitations([]);
      setDoi('');
      setPreprintUrl('');
      setOpenAccess(true);
      setFunding('');
      setConflictsOfInterest('');
      setCollaborationStatus('open');
      
      if (onPostCreated) {
        onPostCreated(response.data);
      }
      
      alert('Research post created successfully!');
      
    } catch (err) {
      console.error('Failed to create research post:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          `Failed to create research post (${err.response?.status || 'Unknown error'}). Please try again.`;
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

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

    const file = validFiles[0];
    const fileType = file.type.startsWith('image/') ? 'image' : 
                    file.type.startsWith('video/') ? 'video' : 'document';
    
    setMedia([file]);
    setMediaType(fileType);
    
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

  const addCitation = () => {
    if (citationForm.title && citationForm.authors) {
      setCitations([...citations, { ...citationForm }]);
      setCitationForm({
        title: '',
        authors: '',
        journal: '',
        year: '',
        doi: '',
        url: ''
      });
    }
  };

  const removeCitation = (index) => {
    setCitations(citations.filter((_, i) => i !== index));
  };

  const visibilityOptions = {
    public: { icon: GlobeAltIcon, label: 'Public' },
    connections: { icon: UserGroupIcon, label: 'Connections' },
    private: { icon: LockClosedIcon, label: 'Private' }
  };

  const collaborationOptions = {
    open: { icon: GlobeAltIcon, label: 'Open to All' },
    invite_only: { icon: UserGroupIcon, label: 'Invite Only' },
    closed: { icon: LockClosedIcon, label: 'Closed' }
  };

  return (
    <div id="create-research-post" className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6 transform transition-all duration-300 hover:shadow-2xl">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <UserAvatar user={user} size="md" />
          </div>
          
          <div className="flex-1">
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                Share Your Research
              </h3>
              <p className="text-sm text-gray-600">
                Share your latest findings, methodologies, and discoveries with the scientific community
              </p>
            </div>

            {/* Research Type Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Research Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {researchTypes.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setResearchType(value)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 ${
                      researchType === value
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'bg-white/70 text-gray-600 hover:bg-blue-50 border border-gray-200'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Visibility and Collaboration Selectors */}
            <div className="flex items-center space-x-4 mb-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Visibility:</span>
                <div className="flex items-center space-x-2 mt-1">
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
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Collaboration:</span>
                <div className="flex items-center space-x-2 mt-1">
                  {Object.entries(collaborationOptions).map(([key, { icon: Icon, label }]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCollaborationStatus(key)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                        collaborationStatus === key 
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' 
                          : 'bg-white/70 text-gray-600 hover:bg-green-50 border border-gray-200'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="mb-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe your research findings, methodology, or share your latest discoveries..."
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white/70 backdrop-blur-sm placeholder-gray-500 text-gray-900 text-lg leading-relaxed shadow-sm"
                rows="4"
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

            {/* Research Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Methodology</label>
                <textarea
                  value={methodology}
                  onChange={(e) => setMethodology(e.target.value)}
                  placeholder="Describe your research methodology..."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white/70 backdrop-blur-sm placeholder-gray-500 text-gray-900 text-sm"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Results</label>
                <textarea
                  value={results}
                  onChange={(e) => setResults(e.target.value)}
                  placeholder="Share your key findings and results..."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white/70 backdrop-blur-sm placeholder-gray-500 text-gray-900 text-sm"
                  rows="3"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Conclusions</label>
              <textarea
                value={conclusions}
                onChange={(e) => setConclusions(e.target.value)}
                placeholder="What are the implications of your research?"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white/70 backdrop-blur-sm placeholder-gray-500 text-gray-900 text-sm"
                rows="3"
              />
            </div>

            {/* Citations */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <LinkIcon className="h-4 w-4 mr-2" />
                Citations
              </label>
              <div className="space-y-3">
                {citations.map((citation, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{citation.title}</p>
                      <p className="text-xs text-gray-600">{citation.authors} ({citation.year})</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCitation(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Paper title"
                    value={citationForm.title}
                    onChange={(e) => setCitationForm({...citationForm, title: e.target.value})}
                    className="p-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Authors"
                    value={citationForm.authors}
                    onChange={(e) => setCitationForm({...citationForm, authors: e.target.value})}
                    className="p-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Journal/Conference"
                    value={citationForm.journal}
                    onChange={(e) => setCitationForm({...citationForm, journal: e.target.value})}
                    className="p-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Year"
                    value={citationForm.year}
                    onChange={(e) => setCitationForm({...citationForm, year: e.target.value})}
                    className="p-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="DOI"
                    value={citationForm.doi}
                    onChange={(e) => setCitationForm({...citationForm, doi: e.target.value})}
                    className="p-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="URL"
                    value={citationForm.url}
                    onChange={(e) => setCitationForm({...citationForm, url: e.target.value})}
                    className="p-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={addCitation}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                >
                  Add Citation
                </button>
              </div>
            </div>

            {/* Publication Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">DOI</label>
                <input
                  type="text"
                  value={doi}
                  onChange={(e) => setDoi(e.target.value)}
                  placeholder="Digital Object Identifier"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm placeholder-gray-500 text-gray-900 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preprint URL</label>
                <input
                  type="url"
                  value={preprintUrl}
                  onChange={(e) => setPreprintUrl(e.target.value)}
                  placeholder="Link to preprint (arXiv, bioRxiv, etc.)"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm placeholder-gray-500 text-gray-900 text-sm"
                />
              </div>
            </div>

            {/* Funding and Conflicts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Funding Sources</label>
                <textarea
                  value={funding}
                  onChange={(e) => setFunding(e.target.value)}
                  placeholder="Funding acknowledgments..."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white/70 backdrop-blur-sm placeholder-gray-500 text-gray-900 text-sm"
                  rows="2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conflicts of Interest</label>
                <textarea
                  value={conflictsOfInterest}
                  onChange={(e) => setConflictsOfInterest(e.target.value)}
                  placeholder="Declare any conflicts of interest..."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white/70 backdrop-blur-sm placeholder-gray-500 text-gray-900 text-sm"
                  rows="2"
                />
              </div>
            </div>

            {/* Open Access Toggle */}
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={openAccess}
                  onChange={(e) => setOpenAccess(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Open Access Research</span>
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
              </label>
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
                <div className="flex items-center">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleTagAdd()}
                    placeholder="Add tags (max 5)"
                    className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm placeholder-gray-500 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={handleTagAdd}
                    className="ml-2 p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <TagIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Media Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Media</label>
              <div className="flex items-center space-x-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleMediaUpload}
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <PhotoIcon className="h-4 w-4" />
                  <span>Upload Media</span>
                </button>
                
                {media.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{media[0].name}</span>
                    <button
                      type="button"
                      onClick={removeMedia}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Uploading... {uploadProgress}%</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-5 w-5" />
                    <span>Share Research</span>
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