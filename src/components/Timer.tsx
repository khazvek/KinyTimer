import React from 'react';
import { Project, TimerState } from '../types';
import { Play, Pause, Square, RotateCcw, Timer as TimerIcon } from 'lucide-react';
import { formatTime } from '../utils/storage';

interface TimerProps {
  timerState: TimerState;
  currentProject: Project | null;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
}

export const Timer: React.FC<TimerProps> = ({
  timerState,
  currentProject,
  onStart,
  onPause,
  onStop,
  onReset,
}) => {
  const { isRunning, isPaused, currentTime, mode, cycle } = timerState;
  
  const progress = mode === 'focus' 
    ? ((25 * 60 - currentTime) / (25 * 60)) * 100
    : mode === 'shortBreak'
    ? ((5 * 60 - currentTime) / (5 * 60)) * 100
    : ((15 * 60 - currentTime) / (15 * 60)) * 100;

  const getModeColor = () => {
    switch (mode) {
      case 'focus': return 'from-purple-500 to-pink-500';
      case 'shortBreak': return 'from-green-500 to-teal-500';
      case 'longBreak': return 'from-blue-500 to-indigo-500';
      default: return 'from-purple-500 to-pink-500';
    }
  };

  const getModeText = () => {
    switch (mode) {
      case 'focus': return 'Focus Time';
      case 'shortBreak': return 'Short Break';
      case 'longBreak': return 'Long Break';
      default: return 'Focus Time';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
      <div className="text-center">
        {/* Project Info */}
        {currentProject && (
          <div className="flex items-center justify-center gap-3 mb-6">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: currentProject.color }}
            />
            <span className="text-white/80 text-lg">{currentProject.name}</span>
          </div>
        )}

        {/* Mode and Cycle */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <TimerIcon className="w-5 h-5 text-white/60" />
          <span className="text-white/80 text-sm font-medium">
            {getModeText()} • Cycle {cycle}
          </span>
        </div>

        {/* Timer Display */}
        <div className="relative mb-8">
          <div className="relative w-64 h-64 mx-auto">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="3"
              />
              {/* Progress Circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={mode === 'focus' ? '#8B5CF6' : mode === 'shortBreak' ? '#10B981' : '#3B82F6'} />
                  <stop offset="100%" stopColor={mode === 'focus' ? '#EC4899' : mode === 'shortBreak' ? '#14B8A6' : '#6366F1'} />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Time Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`text-6xl font-bold bg-gradient-to-r ${getModeColor()} bg-clip-text text-transparent`}>
                {formatTime(currentTime)}
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        {isRunning && (
          <div className="mb-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getModeColor()} text-white text-sm font-medium`}>
              {isPaused ? (
                <>
                  <Pause className="w-4 h-4" />
                  Paused
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Running
                </>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isRunning || isPaused ? (
            <button
              onClick={onStart}
              disabled={!currentProject}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Play className="w-5 h-5" />
              Start
            </button>
          ) : (
            <button
              onClick={onPause}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              <Pause className="w-5 h-5" />
              Pause
            </button>
          )}
          
          <button
            onClick={onStop}
            disabled={!isRunning && !isPaused}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Square className="w-5 h-5" />
            Stop
          </button>
          
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>
        </div>

        {!currentProject && (
          <p className="text-white/60 text-sm mt-4">
            Select a project to start tracking time
          </p>
        )}
      </div>
    </div>
  );
};