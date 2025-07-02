import React, { useState, useEffect } from 'react';
import { Project } from './types';
import { storage } from './utils/storage';
import { useTimer } from './hooks/useTimer';
import { Timer } from './components/Timer';
import { ProjectSelector } from './components/ProjectSelector';
import { Dashboard } from './components/Dashboard';
import { ZenMode } from './components/ZenMode';
import { Timer as TimerIcon, BarChart3, Maximize2, Keyboard } from 'lucide-react';

type View = 'timer' | 'dashboard';

function App() {
  const [view, setView] = useState<View>('timer');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isZenMode, setIsZenMode] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const { timerState, currentSession, sessions, startTimer, pauseTimer, stopTimer, resetTimer } = useTimer(currentProject);

  useEffect(() => {
    const storedProjects = storage.getProjects();
    setProjects(storedProjects);
    
    const currentProjectId = storage.getCurrentProject();
    if (currentProjectId) {
      const project = storedProjects.find(p => p.id === currentProjectId);
      if (project) setCurrentProject(project);
    }

    // Add default project if none exist
    if (storedProjects.length === 0) {
      const defaultProject: Project = {
        id: '1',
        name: 'Default Project',
        color: '#8B5CF6',
        totalTime: 0,
      };
      setProjects([defaultProject]);
      setCurrentProject(defaultProject);
      storage.saveProjects([defaultProject]);
      storage.setCurrentProject(defaultProject.id);
    }
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case ' ':
            e.preventDefault();
            if (timerState.isRunning && !timerState.isPaused) {
              pauseTimer();
            } else {
              startTimer();
            }
            break;
          case 's':
            e.preventDefault();
            stopTimer();
            break;
          case 'r':
            e.preventDefault();
            resetTimer();
            break;
          case 'z':
            e.preventDefault();
            setIsZenMode(!isZenMode);
            break;
          case 'd':
            e.preventDefault();
            setView(view === 'timer' ? 'dashboard' : 'timer');
            break;
        }
      }

      if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [timerState, isZenMode, view, startTimer, pauseTimer, stopTimer, resetTimer]);

  const handleProjectChange = (project: Project) => {
    setCurrentProject(project);
    storage.setCurrentProject(project.id);
  };

  const handleAddProject = (projectData: Omit<Project, 'id' | 'totalTime'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      totalTime: 0,
    };
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    storage.saveProjects(updatedProjects);
  };

  if (isZenMode) {
    return (
      <ZenMode
        timerState={timerState}
        currentProject={currentProject}
        onExit={() => setIsZenMode(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
              <TimerIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">KinyTimer</h1>
              <p className="text-white/60 text-sm">Le timer qui booste tes sessions de dev</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Navigation */}
            <div className="flex bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-1">
              <button
                onClick={() => setView('timer')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  view === 'timer'
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <TimerIcon className="w-4 h-4" />
                Timer
              </button>
              <button
                onClick={() => setView('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  view === 'dashboard'
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsZenMode(true)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                title="Zen Mode (Ctrl+Z)"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowShortcuts(!showShortcuts)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                title="Keyboard Shortcuts"
              >
                <Keyboard className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Keyboard Shortcuts Modal */}
        {showShortcuts && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-white mb-4">Keyboard Shortcuts</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/80">
                  <span>Start/Pause Timer</span>
                  <kbd className="px-2 py-1 bg-white/20 rounded">Ctrl+Space</kbd>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Stop Timer</span>
                  <kbd className="px-2 py-1 bg-white/20 rounded">Ctrl+S</kbd>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Reset Timer</span>
                  <kbd className="px-2 py-1 bg-white/20 rounded">Ctrl+R</kbd>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Zen Mode</span>
                  <kbd className="px-2 py-1 bg-white/20 rounded">Ctrl+Z</kbd>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Toggle Dashboard</span>
                  <kbd className="px-2 py-1 bg-white/20 rounded">Ctrl+D</kbd>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Exit Zen Mode</span>
                  <kbd className="px-2 py-1 bg-white/20 rounded">Escape</kbd>
                </div>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="w-full mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {view === 'timer' ? (
            <>
              {/* Timer Section */}
              <div className="lg:col-span-3">
                <Timer
                  timerState={timerState}
                  currentProject={currentProject}
                  onStart={startTimer}
                  onPause={pauseTimer}
                  onStop={stopTimer}
                  onReset={resetTimer}
                />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <ProjectSelector
                  projects={projects}
                  currentProject={currentProject}
                  onProjectChange={handleProjectChange}
                  onAddProject={handleAddProject}
                />

                {/* Quick Stats */}
                {currentProject && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Quick Stats</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Today</span>
                        <span className="text-white">
                          {Math.floor(sessions.filter(s => 
                            s.projectId === currentProject.id && 
                            s.startTime.toDateString() === new Date().toDateString()
                          ).reduce((acc, s) => acc + s.duration, 0) / 60)}m
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Total</span>
                        <span className="text-white">
                          {Math.floor(sessions.filter(s => s.projectId === currentProject.id)
                            .reduce((acc, s) => acc + s.duration, 0) / 3600)}h
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Sessions</span>
                        <span className="text-white">
                          {sessions.filter(s => s.projectId === currentProject.id).length}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="lg:col-span-4">
              <Dashboard sessions={sessions} projects={projects} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;