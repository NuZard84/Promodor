export const getModeInfo = (mode, colors) => {
  switch (mode) {
    case 'focus':
      return {
        text: 'FOCUS',
        color: colors.focus,
        bgGradient: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 107, 107, 0.05))'
      };
    case 'shortBreak':
      return {
        text: 'SHORT BREAK',
        color: colors.shortBreak,
        bgGradient: 'linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(78, 205, 196, 0.05))'
      };
    case 'longBreak':
      return {
        text: 'LONG BREAK',
        color: colors.longBreak,
        bgGradient: 'linear-gradient(135deg, rgba(69, 183, 209, 0.1), rgba(69, 183, 209, 0.05))'
      };
    default:
      return {
        text: 'FOCUS',
        color: colors.focus,
        bgGradient: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 107, 107, 0.05))'
      };
  }
};

export const calculateProgress = (totalTime, minutes, seconds) => {
  return ((totalTime * 60 - (minutes * 60 + seconds)) / (totalTime * 60)) * 100;
};

export const formatTime = (minutes, seconds) => {
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const getTotalTime = (mode, settings) => {
  switch (mode) {
    case 'focus':
      return settings.focusTime;
    case 'shortBreak':
      return settings.shortBreakTime;
    case 'longBreak':
      return settings.longBreakTime;
    default:
      return settings.focusTime;
  }
}; 