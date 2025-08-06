import React from 'react';

const StatsCard = ({ 
  completedTasks, 
  cycle, 
  settings, 
  tasks, 
  colors, 
  modeInfo, 
  isDarkMode 
}) => {
  return (
    <div
      className="rounded-3xl shadow-2xl p-6 border"
      style={{
        background: colors.cardBg,
        borderColor: colors.border,
        boxShadow: isDarkMode
          ? '0 25px 50px rgba(0, 0, 0, 0.2)'
          : '0 25px 50px rgba(0, 0, 0, 0.05)'
      }}
    >
      <h3 className="text-xl font-bold mb-4" style={{ color: colors.text }}>
        Session Stats
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            Focus Sessions
          </span>
          <span className="text-lg font-bold" style={{ color: colors.focus }}>
            {completedTasks}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            Current Cycle
          </span>
          <span className="text-lg font-bold" style={{ color: modeInfo.color }}>
            {cycle}/{settings.longBreakAfter}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            Tasks Done
          </span>
          <span className="text-lg font-bold text-green-400">
            {tasks.filter(task => task.completed).length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard; 