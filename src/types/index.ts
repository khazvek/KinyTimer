export interface Project {
  id: string;
  name: string;
  color: string;
  gitRepo?: string;
  branch?: string;
  totalTime: number;
}

export interface Session {
  id: string;
  projectId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  type: 'work' | 'break' | 'pomodoro';
  notes?: string;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  currentTime: number;
  mode: 'focus' | 'shortBreak' | 'longBreak';
  cycle: number;
}

export interface DayStats {
  date: string;
  totalTime: number;
  sessions: number;
  projects: string[];
}