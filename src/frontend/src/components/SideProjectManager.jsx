import React, { useState } from 'react';
import { PlusIcon, TrashIcon, LinkIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import SkillTagManager from './SkillTagManager';

const SideProjectManager = ({ projects, onProjectsChange }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    technologies: []
  });

  const handleAddProject = () => {
    if (formData.title.trim()) {
      if (editingIndex !== null) {
        // Update existing project
        const updatedProjects = [...projects];
        updatedProjects[editingIndex] = { ...formData };
        onProjectsChange(updatedProjects);
        setEditingIndex(null);
      } else {
        // Add new project
        onProjectsChange([...projects, { ...formData }]);
      }
      setFormData({ title: '', description: '', url: '', technologies: [] });
      setShowForm(false);
    }
  };

  const handleEditProject = (index) => {
    setFormData({ ...projects[index] });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDeleteProject = (index) => {
    if (confirm('Are you sure you want to delete this project?')) {
      const updatedProjects = projects.filter((_, i) => i !== index);
      onProjectsChange(updatedProjects);
    }
  };

  const handleCancel = () => {
    setFormData({ title: '', description: '', url: '', technologies: [] });
    setEditingIndex(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Projects List */}
      {projects.length > 0 && (
        <div className="space-y-3">
          {projects.map((project, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{project.title}</h4>
                  {project.description && (
                    <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                  )}
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm mb-2"
                    >
                      <LinkIcon className="h-4 w-4 mr-1" />
                      View Project
                    </a>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
                        >
                          <CodeBracketIcon className="h-3 w-3 mr-1" />
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEditProject(index)}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProject(index)}
                    className="text-red-600 hover:text-red-800 p-1 rounded transition-colors duration-200"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingIndex !== null ? 'Edit Project' : 'Add Side Project'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="e.g., DIY Bio Kit, Data Visualization Tool"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Brief description of your project..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project URL
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="https://github.com/username/project"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Technologies Used
              </label>
              <SkillTagManager
                tags={formData.technologies}
                onTagsChange={(technologies) => setFormData({ ...formData, technologies })}
                placeholder="Add technologies..."
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleAddProject}
                disabled={!formData.title.trim()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                {editingIndex !== null ? 'Update Project' : 'Add Project'}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all duration-200 flex items-center justify-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Side Project
        </button>
      )}
    </div>
  );
};

export default SideProjectManager; 