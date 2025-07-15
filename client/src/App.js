import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work' or 'break'

  useEffect(() => {
    let interval = null;
    
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer completed
            clearInterval(interval);
            setIsActive(false);
            
            // Switch between work and break modes
            if (mode === 'work') {
              setMode('break');
              setMinutes(5); // Short break
            } else {
              setMode('work');
              setMinutes(25); // Work time
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (!isActive && (seconds !== 0 || minutes !== 0)) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes, mode]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'work') {
      setMinutes(25);
    } else {
      setMinutes(5);
    }
    setSeconds(0);
  };

  const switchMode = () => {
    setIsActive(false);
    if (mode === 'work') {
      setMode('break');
      setMinutes(5);
    } else {
      setMode('work');
      setMinutes(25);
    }
    setSeconds(0);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Promodor Timer</h1>
        <div className="timer">
          <div className="time">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </div>
          <div className="mode">
            {mode === 'work' ? 'Work Time' : 'Break Time'}
          </div>
          <div className="controls">
            <button onClick={toggleTimer}>
              {isActive ? 'Pause' : 'Start'}
            </button>
            <button onClick={resetTimer}>
              Reset
            </button>
            <button onClick={switchMode}>
              Switch to {mode === 'work' ? 'Break' : 'Work'}
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
