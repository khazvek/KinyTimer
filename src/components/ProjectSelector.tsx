import React, { useState } from 'react';
import { Project } from '../types';
import { Plus, GitBranch, Folder } from 'lucide-react';

interface ProjectSelectorProps {
  projects: Project[];
  currentProject: Project | null;
  onProjectChange: (project: Project) => void;
  onAddProject: (project: Omit<Project, 'id' | 'totalTime'>) => void;
}

const colors = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#C026D3', '#EC4899'
];

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  currentProject,
  onProjectChange,
  onAddProject,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    color: colors[0],
    gitRepo: '',
    branch: 'main',
  });

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.name.trim()) {
      onAddProject(newProject);
      setNewProject({ name: '', color: colors[0], gitRepo: '', branch: 'main' });
      setShowAddForm(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Projects</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddProject} className="mb-4 p-4 bg-black/20 rounded-lg">
          <div className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="Project name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Git repository (optional)"
                value={newProject.gitRepo}
                onChange={(e) => setNewProject({ ...newProject, gitRepo: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Branch"
                value={newProject.branch}
                onChange={(e) => setNewProject({ ...newProject, branch: e.target.value })}
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex gap-1">
                {colors.slice(0, 8).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewProject({ ...newProject, color })}
                    className={`w-6 h-6 rounded-full border-2 ${
                      newProject.color === color ? 'border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Add Project
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => onProjectChange(project)}
            className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
              currentProject?.id === project.id
                ? 'bg-white/20 border border-white/30'
                : 'bg-white/5 hover:bg-white/10 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-white/60" />
                  <span className="text-white font-medium truncate">{project.name}</span>
                </div>
                {project.gitRepo && (
                  <div className="flex items-center gap-2 mt-1">
                    <GitBranch className="w-3 h-3 text-white/40" />
                    <span className="text-xs text-white/60 truncate">{project.branch}</span>
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};