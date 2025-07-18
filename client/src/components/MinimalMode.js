import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw, MousePointer, MousePointerClick } from 'lucide-react';

const MinimalMode = ({ 
  minutes, 
  seconds, 
  isActive, 
  mode, 
  cycle, 
  totalCycles,
  isClickThrough,
  toggleTimer,
  resetTimer,
  toggleClickThrough
}) => {
  // Color scheme
  const colors = {
    jet: '#3A3A3A',
    isabelline: '#F2EDEA',
    fawn: '#FFB875',
    black: '#000000',
    chiliRed: '#E14429'
  };

  // Get mode display info
  const getModeInfo = () => {
    switch (mode) {
      case 'focus':
        return { text: 'FOCUS TIME', color: colors.chiliRed, bgColor: 'bg-chili-red', accentColor: '#E14429' };
      case 'shortBreak':
        return { text: 'SHORT BREAK', color: colors.fawn, bgColor: 'bg-fawn', accentColor: '#FFB875' };
      case 'longBreak':
        return { text: 'LONG BREAK', color: colors.fawn, bgColor: 'bg-fawn-dark', accentColor: '#E6A866' };
      default:
        return { text: 'FOCUS TIME', color: colors.chiliRed, bgColor: 'bg-chili-red', accentColor: '#E14429' };
    }
  };
  
  const modeInfo = getModeInfo();
  
  // Listen for click-through toggle from global shortcut
  useEffect(() => {
    const handleClickThroughChange = (e) => {
      toggleClickThrough();
    };
    
    window.addEventListener('click-through-changed', handleClickThroughChange);
    
    return () => {
      window.removeEventListener('click-through-changed', handleClickThroughChange);
    };
  }, [toggleClickThrough]);

  return (
    <div className="electron-drag w-full h-full flex items-center justify-center">
      <div 
        className={`bg-black bg-opacity-80 backdrop-blur-lg rounded-lg p-4 text-white shadow-xl border border-gray-800 transition-all duration-300 w-full h-full ${
          isClickThrough ? 'pointer-events-none' : 'pointer-events-auto'
        }`}
        style={{ cursor: isClickThrough ? 'default' : 'move' }}
      >
        {/* Timer Display */}
        <div className="flex flex-col items-center justify-center h-full">
          {/* Timer Label & Toggle Click-through */}
          <div className="flex items-center justify-between w-full mb-2">
            <div className="text-xs font-medium text-gray-300 uppercase">
              {modeInfo.text}
            </div>
            <button 
              onClick={toggleClickThrough}
              className={`p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors electron-no-drag ${
                isClickThrough ? 'text-blue-400' : ''
              }`}
              title={isClickThrough ? "Enable interactions" : "Enable click-through"}
            >
              {isClickThrough ? <MousePointer size={14} /> : <MousePointerClick size={14} />}
            </button>
          </div>
          
          {/* Timer Counter */}
          <div className="text-4xl font-bold mb-2" style={{ color: modeInfo.accentColor }}>
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </div>
          
          <div className="text-xs text-gray-400 mb-3">
            Cycle {cycle} / {totalCycles}
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-center space-x-3 electron-no-drag">
            <button
              onClick={resetTimer}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw size={16} />
            </button>
            
            <button
              onClick={toggleTimer}
              className="p-3 rounded-full text-white transition-colors"
              style={{ backgroundColor: isActive ? '#e74c3c' : '#2ecc71' }}
              title={isActive ? "Pause" : "Start"}
            >
              {isActive ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
          </div>
          
          {/* Keyboard shortcut */}
          <div className="text-center mt-2">
            <div className="text-[10px] text-gray-500">
              Ctrl+Alt+C: Toggle Click-through
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalMode; 