import { useState, useEffect } from 'react';
import { 
  FlagIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ChatBubbleLeftIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../store/auth';
import axios from 'axios';
import UserAvatar from './UserAvatar';

const factCheckTypes = [
  { value: 'correction', label: 'Correction', icon: ExclamationTriangleIcon, color: 'text-red-600' },
  { value: 'clarification', label: 'Clarification', icon: ChatBubbleLeftIcon, color: 'text-blue-600' },
  { value: 'citation', label: 'Citation Needed', icon: FlagIcon, color: 'text-orange-600' },
  { value: 'methodology_concern', label: 'Methodology Concern', icon: ExclamationTriangleIcon, color: 'text-yellow-600' },
  { value: 'result_question', label: 'Question Results', icon: ChatBubbleLeftIcon, color: 'text-purple-600' },
  { value: 'general_note', label: 'General Note', icon: ChatBubbleLeftIcon, color: 'text-gray-600' }
];

const severityLevels = [
  { value: 'low', label: 'Low', color: 'text-green-600', bg: 'bg-green-100' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  { value: 'high', label: 'High', color: 'text-orange-600', bg: 'bg-orange-100' },
  { value: 'critical', label: 'Critical', color: 'text-red-600', bg: 'bg-red-100' }
];

export default function FactCheckSection({ researchPostId }) {
  const { user, token } = useAuth();
  const [factChecks, setFactChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [type, setType] = useState('general_note');
  const [content, setContent] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [evidence, setEvidence] = useState('');
  const [citations, setCitations] = useState([]);
  const [citationForm, setCitationForm] = useState({
    title: '',
    authors: '',
    journal: '',
    year: '',
    doi: '',
    url: ''
  });

  useEffect(() => {
    fetchFactChecks();
  }, [researchPostId]);

  const fetchFactChecks = async () => {
    try {
      const response = await axios.get(`/api/research/${researchPostId}/fact-checks`);
      setFactChecks(response.data);
    } catch (error) {
      console.error('Failed to fetch fact checks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('Please provide fact-check content.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`/api/research/${researchPostId}/fact-checks`, {
        type,
        content: content.trim(),
        severity,
        evidence: evidence.trim(),
        citations
      });

      setFactChecks([response.data, ...factChecks]);
      
      // Reset form
      setType('general_note');
      setContent('');
      setSeverity('medium');
      setEvidence('');
      setCitations([]);
      setShowForm(false);
      
      alert('Fact check submitted successfully!');
    } catch (error) {
      console.error('Failed to submit fact check:', error);
      alert('Failed to submit fact check. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (factCheckId, vote) => {
    try {
      const response = await axios.post(`/api/research/fact-checks/${factCheckId}/vote`, { vote });
      
      // Update the fact check with new vote score
      setFactChecks(factChecks.map(fc => 
        fc.id === factCheckId 
          ? { ...fc, voteScore: response.data.voteScore }
          : fc
      ));
    } catch (error) {
      console.error('Failed to vote on fact check:', error);
      alert('Failed to vote. Please try again.');
    }
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getTypeConfig = (type) => {
    return factCheckTypes.find(t => t.value === type) || factCheckTypes[5];
  };

  const getSeverityConfig = (severity) => {
    return severityLevels.find(s => s.value === severity) || severityLevels[1];
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FlagIcon className="h-5 w-5 mr-2 text-orange-600" />
          Community Fact Checks
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
        >
          {showForm ? 'Cancel' : 'Add Fact Check'}
        </button>
      </div>

      {/* Fact Check Form */}
      {showForm && (
        <div className="bg-orange-50 rounded-xl p-4 mb-6 border border-orange-200">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Type and Severity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                  >
                    {factCheckTypes.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                  >
                    {severityLevels.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fact Check Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Explain the issue, provide corrections, or ask for clarification..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none bg-white"
                  rows="4"
                  required
                />
              </div>

              {/* Evidence */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supporting Evidence</label>
                <textarea
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  placeholder="Provide links, references, or additional context..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none bg-white"
                  rows="3"
                />
              </div>

              {/* Citations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Citations</label>
                <div className="space-y-3">
                  {citations.map((citation, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-white rounded-lg border">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{citation.title}</p>
                        <p className="text-xs text-gray-600">{citation.authors} ({citation.year})</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCitation(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
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
                  </div>
                  <button
                    type="button"
                    onClick={addCitation}
                    className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200 transition-colors"
                  >
                    Add Citation
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {submitting ? 'Submitting...' : 'Submit Fact Check'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Fact Checks List */}
      <div className="space-y-4">
        {factChecks.length === 0 ? (
          <div className="text-center py-8">
            <FlagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No fact checks yet. Be the first to add one!</p>
          </div>
        ) : (
          factChecks.map((factCheck) => {
            const typeConfig = getTypeConfig(factCheck.type);
            const severityConfig = getSeverityConfig(factCheck.severity);
            
            return (
              <div key={factCheck.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <UserAvatar user={factCheck.author} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {factCheck.author?.name || 'Unknown User'}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <ClockIcon className="h-3 w-3" />
                        <span>{formatDate(factCheck.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${severityConfig.bg} ${severityConfig.color}`}>
                      {severityConfig.label}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700`}>
                      {typeConfig.label}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-3">
                  <p className="text-sm text-gray-900">{factCheck.content}</p>
                </div>

                {/* Evidence */}
                {factCheck.evidence && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-1">Supporting Evidence:</p>
                    <p className="text-sm text-gray-600">{factCheck.evidence}</p>
                  </div>
                )}

                {/* Citations */}
                {factCheck.citations && factCheck.citations.length > 0 && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-medium text-blue-700 mb-1">Citations:</p>
                    <div className="space-y-1">
                      {factCheck.citations.map((citation, index) => (
                        <div key={index} className="text-xs text-blue-600">
                          <p className="font-medium">{citation.title}</p>
                          <p>{citation.authors} ({citation.year})</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vote Score */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleVote(factCheck.id, 'up')}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      >
                        <ChevronUpIcon className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-medium text-gray-900">{factCheck.voteScore}</span>
                      <button
                        onClick={() => handleVote(factCheck.id, 'down')}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <ChevronDownIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {factCheck.status === 'pending' && 'Pending Review'}
                    {factCheck.status === 'approved' && 'Approved'}
                    {factCheck.status === 'rejected' && 'Rejected'}
                    {factCheck.status === 'resolved' && 'Resolved'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 