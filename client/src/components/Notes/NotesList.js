import React from 'react';
import { Edit3, Trash2, Save, X } from 'lucide-react';

const NotesList = ({ 
  notes, 
  editingId, 
  editingText, 
  setEditingText, 
  startEditing, 
  saveEdit, 
  cancelEdit, 
  deleteNote, 
  handleKeyPress, 
  isClickThrough 
}) => {
  if (notes.length === 0) {
    return (
      <div className="text-center text-white text-opacity-40 text-sm mt-8">
        No notes yet
      </div>
    );
  }

  return (
    <div 
      className="flex-1 overflow-y-auto space-y-2 custom-scrollbar"
      style={{ pointerEvents: isClickThrough ? 'none' : 'auto' }}
    >
      {notes.map((note) => (
        <div
          key={note.id}
          className="p-3 rounded-lg transition-all"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {editingId === note.id ? (
            <div className="space-y-2">
              <textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full p-2 text-sm rounded resize-none"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  outline: 'none',
                  minHeight: '40px'
                }}
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  onClick={saveEdit}
                  className="p-1 rounded bg-green-500 bg-opacity-20 hover:bg-opacity-30 text-green-300 transition-all"
                >
                  <Save size={12} />
                </button>
                <button
                  onClick={cancelEdit}
                  className="p-1 rounded bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-opacity-60 hover:text-opacity-100 transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ) : (
            <div className="group">
              <div className="flex justify-between items-start">
                <p className="text-white text-sm flex-1 leading-relaxed">
                  {note.text}
                </p>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <button
                    onClick={() => startEditing(note)}
                    className="p-1 rounded bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-opacity-60 hover:text-opacity-100 transition-all"
                  >
                    <Edit3 size={10} />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1 rounded bg-red-500 bg-opacity-20 hover:bg-opacity-30 text-red-400 hover:text-red-300 transition-all"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotesList; 