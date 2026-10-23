import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

const SkillTagManager = ({ tags, onTagsChange, placeholder = "Add skills..." }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // Common skill suggestions
  const commonSkills = [
    'Python', 'JavaScript', 'React', 'Node.js', 'Data Science', 'Machine Learning',
    'AI', 'Statistics', 'Biology', 'Chemistry', 'Physics', 'Mathematics',
    'R', 'SQL', 'Git', 'Docker', 'AWS', 'Azure', 'Google Cloud',
    'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib',
    'Bioinformatics', 'Genomics', 'Proteomics', 'Metabolomics', 'Microbiology',
    'Neuroscience', 'Psychology', 'Sociology', 'Economics', 'Philosophy',
    'Computer Science', 'Engineering', 'Medicine', 'Public Health',
    'Climate Science', 'Astronomy', 'Geology', 'Oceanography',
    'DIY Biology', 'Citizen Science', 'Open Source', 'Data Visualization',
    'Scientific Writing', 'Grant Writing', 'Peer Review', 'Teaching',
    'Mentoring', 'Collaboration', 'Leadership', 'Project Management'
  ];

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = commonSkills.filter(skill =>
        skill.toLowerCase().includes(inputValue.toLowerCase()) &&
        !tags.includes(skill)
      );
      setSuggestions(filtered.slice(0, 8));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, tags]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const addTag = (tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    addTag(suggestion);
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-white/80 backdrop-blur-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm font-medium rounded-full border border-blue-200 shadow-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={tags.length === 0 ? placeholder : "Add more..."}
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-sm"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4 text-gray-400" />
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillTagManager; 