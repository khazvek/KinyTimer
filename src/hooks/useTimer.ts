import { useState, useEffect, useCallback } from 'react';
import { TimerState, Session, Project } from '../types';
import { storage } from '../utils/storage';

export const useTimer = (currentProject: Project | null) => {
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    currentTime: 25 * 60, // 25 minutes default
    mode: 'focus',
    cycle: 1,
  });

  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    setSessions(storage.getSessions());
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerState.isRunning && !timerState.isPaused && timerState.currentTime > 0) {
      interval = setInterval(() => {
        setTimerState(prev => ({
          ...prev,
          currentTime: prev.currentTime - 1,
        }));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerState.isRunning, timerState.isPaused, timerState.currentTime]);

  useEffect(() => {
    if (timerState.currentTime === 0 && timerState.isRunning) {
      handleTimerComplete();
    }
  }, [timerState.currentTime, timerState.isRunning]);

  const handleTimerComplete = useCallback(() => {
    // Complete current session
    if (currentSession && currentProject) {
      const completedSession: Session = {
        ...currentSession,
        endTime: new Date(),
        duration: Math.floor((new Date().getTime() - currentSession.startTime.getTime()) / 1000),
      };
      
      const updatedSessions = [...sessions, completedSession];
      setSessions(updatedSessions);
      storage.saveSessions(updatedSessions);
      setCurrentSession(null);
    }

    // Move to next phase
    setTimerState(prev => {
      if (prev.mode === 'focus') {
        if (prev.cycle % 4 === 0) {
          return {
            ...prev,
            mode: 'longBreak',
            currentTime: 15 * 60,
            isRunning: false,
          };
        } else {
          return {
            ...prev,
            mode: 'shortBreak',
            currentTime: 5 * 60,
            isRunning: false,
          };
        }
      } else {
        return {
          ...prev,
          mode: 'focus',
          currentTime: 25 * 60,
          cycle: prev.cycle + 1,
          isRunning: false,
        };
      }
    });
  }, [currentSession, currentProject, sessions]);

  const startTimer = useCallback(() => {
    if (!currentProject) return;

    if (!currentSession && timerState.mode === 'focus') {
      const newSession: Session = {
        id: Date.now().toString(),
        projectId: currentProject.id,
        startTime: new Date(),
        duration: 0,
        type: 'work',
      };
      setCurrentSession(newSession);
    }

    setTimerState(prev => ({ ...prev, isRunning: true, isPaused: false }));
  }, [currentProject, currentSession, timerState.mode]);

  const pauseTimer = useCallback(() => {
    setTimerState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const stopTimer = useCallback(() => {
    if (currentSession && currentProject) {
      const completedSession: Session = {
        ...currentSession,
        endTime: new Date(),
        duration: Math.floor((new Date().getTime() - currentSession.startTime.getTime()) / 1000),
      };
      
      const updatedSessions = [...sessions, completedSession];
      setSessions(updatedSessions);
      storage.saveSessions(updatedSessions);
    }

    setCurrentSession(null);
    setTimerState({
      isRunning: false,
      isPaused: false,
      currentTime: 25 * 60,
      mode: 'focus',
      cycle: 1,
    });
  }, [currentSession, currentProject, sessions]);

  const resetTimer = useCallback(() => {
    stopTimer();
    setTimerState(prev => ({
      ...prev,
      currentTime: prev.mode === 'focus' ? 25 * 60 : prev.mode === 'shortBreak' ? 5 * 60 : 15 * 60,
    }));
  }, [stopTimer]);

  return {
    timerState,
    currentSession,
    sessions,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
  };
};