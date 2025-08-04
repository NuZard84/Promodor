import React from 'react';
import { Plus } from 'lucide-react';

const NotesInput = ({ 
  showInput, 
  setShowInput, 
  newNote, 
  setNewNote, 
  addNote, 
  handleKeyPress, 
  isClickThrough 
}) => {
  if (!showInput) {
    return (
      <div style={{ pointerEvents: isClickThrough ? 'none' : 'auto' }}>
        <button
          onClick={() => setShowInput(true)}
          className="w-full p-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-opacity-60 hover:text-opacity-100 transition-all flex items-center justify-center space-x-2 text-sm"
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
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Type your note..."
        className="w-full p-2 text-sm rounded-lg resize-none"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
          backdropFilter: 'blur(10px)',
          outline: 'none',
          minHeight: '60px'
        }}
        autoFocus
      />
      <div className="flex space-x-2">
        <button
          onClick={addNote}
          className="px-3 py-1 text-xs rounded bg-green-500 bg-opacity-20 hover:bg-opacity-30 text-green-300 transition-all"
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