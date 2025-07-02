import React, { useState, useEffect } from 'react';
import { Project, TimerState } from '../types';
import { formatTime } from '../utils/storage';
import { Minimize2, Volume2, VolumeX } from 'lucide-react';

interface ZenModeProps {
  timerState: TimerState;
  currentProject: Project | null;
  onExit: () => void;
}

const ambientSounds = [
  { name: 'Rain', emoji: '🌧️', src: 'rain' },
  { name: 'Forest', emoji: '🌲', src: 'forest' },
  { name: 'Ocean', emoji: '🌊', src: 'ocean' },
  { name: 'Coffee Shop', emoji: '☕', src: 'cafe' },
];

export const ZenMode: React.FC<ZenModeProps> = ({
  timerState,
  currentProject,
  onExit,
}) => {
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const { currentTime, mode } = timerState;
  
  const getModeGradient = () => {
    switch (mode) {
      case 'focus': return 'from-purple-900/80 via-purple-800/60 to-pink-900/80';
      case 'shortBreak': return 'from-green-900/80 via-teal-800/60 to-green-900/80';
      case 'longBreak': return 'from-blue-900/80 via-indigo-800/60 to-blue-900/80';
      default: return 'from-purple-900/80 via-purple-800/60 to-pink-900/80';
    }
  };

  const getModeText = () => {
    switch (mode) {
      case 'focus': return 'Focus Deep, Code Deep';
      case 'shortBreak': return 'Recharge Your Mind';
      case 'longBreak': return 'Step Back, Think Big';
      default: return 'Focus Deep, Code Deep';
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-gradient-to-br ${getModeGradient()} flex items-center justify-center transition-all duration-1000`}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Project Name */}
        {currentProject && (
          <div className="flex items-center justify-center gap-3 mb-8">
            <div
              className="w-4 h-4 rounded-full animate-pulse"
              style={{ backgroundColor: currentProject.color }}
            />
            <span className="text-white/70 text-xl font-light">{currentProject.name}</span>
          </div>
        )}

        {/* Mode Message */}
        <h1 className="text-4xl md:text-6xl font-light text-white mb-12 animate-fade-in">
          {getModeText()}
        </h1>

        {/* Timer */}
        <div className="text-8xl md:text-9xl font-extralight text-white mb-8 tabular-nums">
          {formatTime(currentTime)}
        </div>

        {/* Session Status */}
        {timerState.isRunning && (
          <div className="text-white/60 text-lg font-light">
            {timerState.isPaused ? 'Paused' : 'In Progress'}
          </div>
        )}
      </div>

      {/* Controls Overlay */}
      <div className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-500 ${
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Top Controls */}
        <div className="absolute top-6 right-6 flex items-center gap-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
          <button
            onClick={onExit}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <Minimize2 className="w-6 h-6" />
          </button>
        </div>

        {/* Ambient Sounds */}
        {soundEnabled && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
              {ambientSounds.map((sound) => (
                <button
                  key={sound.src}
                  onClick={() => setSelectedSound(selectedSound === sound.src ? null : sound.src)}
                  className={`p-3 rounded-full text-2xl transition-all ${
                    selectedSound === sound.src
                      ? 'bg-white/20 scale-110'
                      : 'hover:bg-white/10 hover:scale-105'
                  }`}
                  title={sound.name}
                >
                  {sound.emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-6 left-6 text-white/50 text-sm">
          Move mouse to show controls
        </div>
      </div>
    </div>
  );
};