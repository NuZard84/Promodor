import React, { useRef, useEffect } from 'react';  // Add useRef and useEffect
import { Plus, Circle } from 'lucide-react';

const NotesInput = ({ 
  showInput, 
  setShowInput, 
  newNote, 
  setNewNote, 
  addNote, 
  handleKeyPress, 
  isClickThrough,
  selectedColor,
  setSelectedColor,
  colors  // Add colors to props
}) => {
  // Add textarea ref
  const textareaRef = useRef(null);

  // Add keyboard handler
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      if (newNote.trim()) {
        addNote();
      }
    } else if (e.key === 'Escape') {
      setShowInput(false);
      setNewNote('');
    }
  };

  // Add effect to handle focus
  useEffect(() => {
    if (showInput && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showInput, selectedColor]); // Re-run when showInput or selectedColor changes

  // Add a guard clause
  if (!colors || !Array.isArray(colors)) {
    return null; // Or some fallback UI
  }

  if (!showInput) {
    return (
      <div style={{ pointerEvents: isClickThrough ? 'none' : 'auto' }}>
        <button
          onClick={() => setShowInput(true)}
          className="jetbrains-mono-200 w-full p-1 text-xs rounded-md bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-opacity-60 hover:text-opacity-100 transition-all flex items-center justify-center space-x-2"
          style={{
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Plus size={14} />
          <span>Add Note</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2" style={{ pointerEvents: isClickThrough ? 'none' : 'auto' }}>
      <textarea
        ref={textareaRef}  // Add ref
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        onKeyDown={handleKeyDown} // Changed from handleKeyPress to handleKeyDown
        placeholder="Type your note... (Press Enter to save, Shift+Enter for new line)"
        className="w-full p-2 text-xs rounded-lg resize-none"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: `1px solid ${selectedColor}40`,
          color: 'white',
          backdropFilter: 'blur(10px)',
          outline: 'none',
          minHeight: '60px'
        }}
        autoFocus
      />
      
      {/* Color Selection */}
      <div className="flex items-center space-x-2 ">
        {colors.map(({ id, color, label }) => (
          <button
            key={id}
            onClick={() => setSelectedColor(color)}
            className="group relative"
            title={label}
          >
            <Circle
              size={20}
              fill={color}
              stroke={selectedColor === color ? color : 'transparent'}
              className={`transition-transform ${
                selectedColor === color ? 'scale-100' : 'scale-90 hover:scale-95'
              }`}
            />
            {/* {selectedColor === color && (
              <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white text-opacity-60 whitespace-nowrap">
                {label}
              </span>
            )} */}
          </button>
        ))}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={addNote}
          className="px-3 py-1 text-xs rounded transition-all"
          style={{
            backgroundColor: `${selectedColor}20`,
            color: selectedColor,
            border: `1px solid ${selectedColor}40`,
          }}
        >
          Save
        </button>
        <button
          onClick={() => {
            setShowInput(false);
            setNewNote('');
          }}
          className="px-3 py-1 text-xs rounded bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-opacity-60 hover:text-opacity-100 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default NotesInput;