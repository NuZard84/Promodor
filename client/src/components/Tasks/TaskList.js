import React from 'react';
import { Plus, X } from 'lucide-react';

const TaskList = ({ 
  tasks, 
  newTask, 
  setNewTask, 
  addTask, 
  toggleTask, 
  deleteTask, 
  colors,
  isDarkMode
}) => {
  return (
    <div
      className="rounded-3xl shadow-2xl p-6 backdrop-blur-xl border"
      style={{
        background: colors.cardBg,
        borderColor: colors.border,
        boxShadow: isDarkMode
          ? '0 25px 50px rgba(0, 0, 0, 0.2)'
          : '0 25px 50px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold" style={{ color: colors.text }}>
          Tasks
        </h3>
        <span
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{
            background: colors.inputBg,
            color: colors.textSecondary
          }}
        >
          {tasks.length}/5
        </span>
      </div>

      {/* Add Task */}
      <div className="flex space-x-3 mb-6">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          placeholder="Add a new task..."
          className="flex-1 px-4 py-3 rounded-2xl border focus:outline-none transition-all duration-300"
          style={{
            background: colors.inputBg,
            borderColor: colors.inputBorder,
            color: colors.text
          }}
          maxLength={50}
        />
        <button
          onClick={addTask}
          disabled={!newTask.trim() || tasks.length >= 5}
          className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-lg disabled:shadow-none"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ background: colors.inputBg }}
            >
              <Plus size={24} style={{ color: colors.textSecondary }} />
            </div>
            <p className="font-medium" style={{ color: colors.textSecondary }}>
              No tasks yet. Add one to get started!
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`group flex items-center space-x-4 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
                task.completed
                  ? 'bg-green-500 bg-opacity-10 border-green-500 border-opacity-30'
                  : ''
              }`}
              style={{
                background: task.completed
                  ? 'rgba(34, 197, 94, 0.1)'
                  : colors.inputBg,
                borderColor: task.completed
                  ? 'rgba(34, 197, 94, 0.3)'
                  : colors.inputBorder
              }}
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="w-5 h-5 rounded-lg appearance-none border-2 checked:border-green-400 checked:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 transition-all duration-200 cursor-pointer"
                  style={{
                    borderColor: task.completed ? '#4ade80' : colors.inputBorder
                  }}
                />
                {task.completed && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <span
                className={`flex-1 font-medium transition-all duration-300 ${
                  task.completed
                    ? 'line-through'
                    : ''
                }`}
                style={{
                  color: task.completed
                    ? colors.textSecondary
                    : colors.text
                }}
              >
                {task.text}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl bg-red-500 bg-opacity-20 hover:bg-opacity-40 text-red-400 hover:text-red-300 transition-all duration-300 flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList; 