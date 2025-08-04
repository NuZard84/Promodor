import React from 'react';
import { X } from 'lucide-react';

const SettingsModal = ({ 
  showSettings, 
  setShowSettings, 
  settings, 
  setSettings, 
  colors 
}) => {
  const settingFields = [
    { key: 'focusTime', label: 'Focus Time', suffix: 'minutes' },
    { key: 'shortBreakTime', label: 'Short Break', suffix: 'minutes' },
    { key: 'longBreakTime', label: 'Long Break', suffix: 'minutes' },
    { key: 'longBreakAfter', label: 'Long Break After', suffix: 'cycles' }
  ];

  const handleSave = () => {
    setShowSettings(false);
  };

  if (!showSettings) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="w-full max-w-md rounded-3xl shadow-2xl border p-8 backdrop-blur-xl"
        style={{
          background: colors.cardBg,
          borderColor: colors.border
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
            Settings
          </h2>
          <button
            onClick={() => setShowSettings(false)}
            className="w-10 h-10 rounded-2xl transition-all duration-300 flex items-center justify-center"
            style={{
              background: colors.inputBg,
              border: `1px solid ${colors.inputBorder}`,
              color: colors.text
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {settingFields.map(({ key, label, suffix }) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                {label}
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="1"
                  max={key === 'longBreakAfter' ? 10 : 60}
                  value={settings[key]}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    [key]: parseInt(e.target.value) || 1
                  }))}
                  className="flex-1 px-4 py-3 rounded-2xl border focus:outline-none"
                  style={{
                    background: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.text
                  }}
                />
                <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                  {suffix}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-3 mt-8">
          <button
            onClick={() => setShowSettings(false)}
            className="flex-1 px-6 py-3 rounded-2xl font-medium transition-all duration-300"
            style={{
              background: colors.inputBg,
              border: `1px solid ${colors.inputBorder}`,
              color: colors.text
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all duration-300 shadow-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 