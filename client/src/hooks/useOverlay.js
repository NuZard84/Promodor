import { useState, useEffect, useCallback } from 'react';

const useOverlay = () => {
  const [isClickThrough, setIsClickThrough] = useState(false);

  const toggleClickThrough = useCallback(() => {
    const newState = !isClickThrough;
    setIsClickThrough(newState);
    if (window.electronAPI) {
      window.electronAPI.toggleClickThrough(newState);
    }
  }, [isClickThrough]);

  const closeOverlay = useCallback(() => {
    if (window.electronAPI) {
      window.electronAPI.closeNotesOverlay();
    }
  }, []);

  const openMainWindow = useCallback(() => {
    if (window.electronAPI) {
      window.electronAPI.openMainWindow();
    }
  }, []);

  // Global shortcut handler
  useEffect(() => {
    window.toggleClickThroughFromShortcut = toggleClickThrough;
    return () => {
      delete window.toggleClickThroughFromShortcut;
    };
  }, [toggleClickThrough]);

  return {
    isClickThrough,
    toggleClickThrough,
    closeOverlay,
    openMainWindow
  };
};

export default useOverlay; 