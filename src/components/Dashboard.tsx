import React, { useMemo } from 'react';
import { Session, Project } from '../types';
import { formatTime, generateHeatmapData } from '../utils/storage';
import { Clock, Calendar, TrendingUp, Download, GitBranch } from 'lucide-react';

interface DashboardProps {
  sessions: Session[];
  projects: Project[];
}

export const Dashboard: React.FC<DashboardProps> = ({ sessions, projects }) => {
  const heatmapData = useMemo(() => generateHeatmapData(sessions), [sessions]);
  
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const todaySessions = sessions.filter(s => s.startTime.toDateString() === today);
    const weekSessions = sessions.filter(s => s.startTime >= thisWeek);
    
    return {
      todayTime: todaySessions.reduce((acc, s) => acc + s.duration, 0),
      todaySessions: todaySessions.length,
      weekTime: weekSessions.reduce((acc, s) => acc + s.duration, 0),
      totalTime: sessions.reduce((acc, s) => acc + s.duration, 0),
      totalSessions: sessions.length,
      avgSessionTime: sessions.length > 0 ? sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length : 0,
    };
  }, [sessions]);

  const projectStats = useMemo(() => {
    return projects.map(project => {
      const projectSessions = sessions.filter(s => s.projectId === project.id);
      const totalTime = projectSessions.reduce((acc, s) => acc + s.duration, 0);
      return {
        ...project,
        sessions: projectSessions.length,
        totalTime,
        percentage: stats.totalTime > 0 ? (totalTime / stats.totalTime) * 100 : 0,
      };
    }).sort((a, b) => b.totalTime - a.totalTime);
  }, [projects, sessions, stats.totalTime]);

  const getHeatmapIntensity = (time: number) => {
    const maxTime = Math.max(...heatmapData.map(d => d.totalTime));
    if (time === 0) return 'bg-gray-800';
    const intensity = Math.ceil((time / maxTime) * 4);
    switch (intensity) {
      case 1: return 'bg-green-900';
      case 2: return 'bg-green-700';
      case 3: return 'bg-green-500';
      case 4: return 'bg-green-400';
      default: return 'bg-gray-800';
    }
  };

  const exportData = () => {
    const data = {
      sessions,
      projects,
      stats,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kiny-timer-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Group heatmap data by weeks
  const weeks = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <button
          onClick={exportData}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span className="text-white/80 text-sm font-medium">Today</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatTime(stats.todayTime)}</div>
          <div className="text-white/60 text-sm">{stats.todaySessions} sessions</div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-green-400" />
            <span className="text-white/80 text-sm font-medium">This Week</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatTime(stats.weekTime)}</div>
          <div className="text-white/60 text-sm">7 days</div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-white/80 text-sm font-medium">Total Time</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatTime(stats.totalTime)}</div>
          <div className="text-white/60 text-sm">{stats.totalSessions} sessions</div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-white/80 text-sm font-medium">Avg Session</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatTime(Math.round(stats.avgSessionTime))}</div>
          <div className="text-white/60 text-sm">per session</div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Activity Heatmap</h3>
        <div className="overflow-x-auto">
          <div className="inline-flex flex-col gap-1 min-w-full">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`w-3 h-3 rounded-sm ${getHeatmapIntensity(day.totalTime)}`}
                    title={`${day.date}: ${formatTime(day.totalTime)} (${day.sessions} sessions)`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-white/60">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-800" />
              <div className="w-3 h-3 rounded-sm bg-green-900" />
              <div className="w-3 h-3 rounded-sm bg-green-700" />
              <div className="w-3 h-3 rounded-sm bg-green-500" />
              <div className="w-3 h-3 rounded-sm bg-green-400" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Project Stats */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Project Breakdown</h3>
        <div className="space-y-4">
          {projectStats.map((project) => (
            <div key={project.id} className="flex items-center gap-4">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium truncate">{project.name}</span>
                    {project.gitRepo && (
                      <GitBranch className="w-3 h-3 text-white/40" />
                    )}
                  </div>
                  <span className="text-white/80 text-sm">{formatTime(project.totalTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/10 rounded-full h-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${project.percentage}%`,
                        backgroundColor: project.color,
                      }}
                    />
                  </div>
                  <span className="text-white/60 text-xs">
                    {project.percentage.toFixed(0)}% • {project.sessions} sessions
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Sessions</h3>
        <div className="space-y-3">
          {sessions.slice(-10).reverse().map((session) => {
            const project = projects.find(p => p.id === session.projectId);
            return (
              <div key={session.id} className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project?.color || '#6B7280' }}
                  />
                  <div>
                    <div className="text-white text-sm">{project?.name || 'Unknown Project'}</div>
                    <div className="text-white/60 text-xs">
                      {session.startTime.toLocaleDateString()} {session.startTime.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="text-white/80 text-sm font-medium">
                  {formatTime(session.duration)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};