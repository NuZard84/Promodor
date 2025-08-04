import { useState, useMemo } from 'react';

const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const colors = useMemo(() => ({
    focus: '#FF6B6B',
    shortBreak: '#4ECDC4',
    longBreak: '#45B7D1',
    background: isDarkMode ? '#1A1A1F' : '#F8F9FA',
    cardBg: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#212529',
    textSecondary: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#6C757D',
    border: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#E9ECEF',
    headerBg: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.9)',
    inputBg: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#F8F9FA',
    inputBorder: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#DEE2E6'
  }), [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return {
    isDarkMode,
    colors,
    toggleTheme
  };
};

export default useTheme; 