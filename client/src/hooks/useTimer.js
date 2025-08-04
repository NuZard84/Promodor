import { useState, useEffect, useCallback } from 'react';

const useTimer = (initialSettings) => {
  const [minutes, setMinutes] = useState(initialSettings.focusTime);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus');
  const [cycle, setCycle] = useState(1);
  const [settings, setSettings] = useState(initialSettings);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            handleTimerComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes]);

  const handleTimerComplete = useCallback(() => {
    setIsActive(false);

    if (mode === 'focus') {
      if (cycle % settings.longBreakAfter === 0) {
        setMode('longBreak');
        setMinutes(settings.longBreakTime);
      } else {
        setMode('shortBreak');
        setMinutes(settings.shortBreakTime);
      }
    } else {
      setMode('focus');
      setMinutes(settings.focusTime);
      if (mode === 'longBreak') {
        setCycle(1);
      } else {
        setCycle(prev => prev + 1);
      }
    }

    setSeconds(0);
  }, [mode, cycle, settings]);

  const toggleTimer = useCallback(() => {
    setIsActive(!isActive);
  }, [isActive]);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    if (mode === 'focus') {
      setMinutes(settings.focusTime);
    } else if (mode === 'shortBreak') {
      setMinutes(settings.shortBreakTime);
    } else {
      setMinutes(settings.longBreakTime);
    }
    setSeconds(0);
  }, [mode, settings]);

  const setModeAndReset = useCallback((newMode) => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === 'focus') {
      setMinutes(settings.focusTime);
    } else if (newMode === 'shortBreak') {
      setMinutes(settings.shortBreakTime);
    } else {
      setMinutes(settings.longBreakTime);
    }
    setSeconds(0);
  }, [settings]);

  const updateSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    // Reset timer if not active
    if (!isActive) {
      if (mode === 'focus') {
        setMinutes(newSettings.focusTime);
      } else if (mode === 'shortBreak') {
        setMinutes(newSettings.shortBreakTime);
      } else {
        setMinutes(newSettings.longBreakTime);
      }
      setSeconds(0);
    }
  }, [isActive, mode]);

  return {
    minutes,
    seconds,
    isActive,
    mode,
    cycle,
    settings,
    toggleTimer,
    resetTimer,
    setModeAndReset,
    updateSettings,
    setCycle
  };
};

export default useTimer; 