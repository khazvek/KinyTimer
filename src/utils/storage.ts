import { Project, Session, DayStats } from '../types';

const STORAGE_KEYS = {
  projects: 'kiny-timer-projects',
  sessions: 'kiny-timer-sessions',
  currentProject: 'kiny-timer-current-project',
  settings: 'kiny-timer-settings',
};

export const storage = {
  getProjects(): Project[] {
    const stored = localStorage.getItem(STORAGE_KEYS.projects);
    return stored ? JSON.parse(stored) : [];
  },

  saveProjects(projects: Project[]): void {
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
  },

  getSessions(): Session[] {
    const stored = localStorage.getItem(STORAGE_KEYS.sessions);
    return stored ? JSON.parse(stored).map((s: any) => ({
      ...s,
      startTime: new Date(s.startTime),
      endTime: s.endTime ? new Date(s.endTime) : undefined,
    })) : [];
  },

  saveSessions(sessions: Session[]): void {
    localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(sessions));
  },

  getCurrentProject(): string | null {
    return localStorage.getItem(STORAGE_KEYS.currentProject);
  },

  setCurrentProject(projectId: string): void {
    localStorage.setItem(STORAGE_KEYS.currentProject, projectId);
  },

  getSettings() {
    const stored = localStorage.getItem(STORAGE_KEYS.settings);
    return stored ? JSON.parse(stored) : {
      pomodoroTime: 25,
      shortBreakTime: 5,
      longBreakTime: 15,
      enableSounds: true,
      autoStartBreaks: false,
    };
  },

  saveSettings(settings: any): void {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  }
};

export const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const generateHeatmapData = (sessions: Session[]): DayStats[] => {
  const last365Days = Array.from({ length: 365 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (364 - i));
    return {
      date: date.toISOString().split('T')[0],
      totalTime: 0,
      sessions: 0,
      projects: [] as string[],
    };
  });

  sessions.forEach(session => {
    const dateStr = session.startTime.toISOString().split('T')[0];
    const dayData = last365Days.find(day => day.date === dateStr);
    if (dayData) {
      dayData.totalTime += session.duration;
      dayData.sessions += 1;
      if (!dayData.projects.includes(session.projectId)) {
        dayData.projects.push(session.projectId);
      }
    }
  });

  return last365Days;
};