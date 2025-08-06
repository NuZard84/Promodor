import React from 'react';

const ProgressCard = ({ 
  completedTasks, 
  tasks, 
  colors, 
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
      <h3 className="text-xl font-bold mb-6" style={{ color: colors.text }}>
        Today's Progress
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div
          className="text-center p-4 rounded-2xl border"
          style={{
            background: 'rgba(34, 197, 94, 0.1)',
            borderColor: 'rgba(34, 197, 94, 0.2)'
          }}
        >
          <div className="text-3xl font-bold text-green-400 mb-1">
            {completedTasks}
          </div>
          <div className="text-sm font-medium text-green-400">Completed</div>
        </div>
        <div
          className="text-center p-4 rounded-2xl border"
          style={{
            background: 'rgba(249, 115, 22, 0.1)',
            borderColor: 'rgba(249, 115, 22, 0.2)'
          }}
        >
          <div className="text-3xl font-bold text-orange-400 mb-1">
            {tasks.filter(task => !task.completed).length}
          </div>
          <div className="text-sm font-medium text-orange-400">Remaining</div>
        </div>
      </div>
    </div>
  );
};

export default ProgressCard; 