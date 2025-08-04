import { useState, useEffect, useCallback } from 'react';

const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [showInput, setShowInput] = useState(false);

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('overlay-notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('overlay-notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = useCallback(() => {
    if (newNote.trim()) {
      const note = {
        id: Date.now(),
        text: newNote.trim(),
        createdAt: new Date().toISOString()
      };
      setNotes([note, ...notes]);
      setNewNote('');
      setShowInput(false);
    }
  }, [newNote, notes]);

  const deleteNote = useCallback((id) => {
    setNotes(notes.filter(note => note.id !== id));
  }, [notes]);

  const startEditing = useCallback((note) => {
    setEditingId(note.id);
    setEditingText(note.text);
  }, []);

  const saveEdit = useCallback(() => {
    if (editingText.trim()) {
      setNotes(notes.map(note => 
        note.id === editingId 
          ? { ...note, text: editingText.trim() }
          : note
      ));
    }
    setEditingId(null);
    setEditingText('');
  }, [editingText, editingId, notes]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingText('');
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingId) {
        saveEdit();
      } else {
        addNote();
      }
    } else if (e.key === 'Escape') {
      if (editingId) {
        cancelEdit();
      } else {
        setShowInput(false);
        setNewNote('');
      }
    }
  }, [editingId, saveEdit, addNote, cancelEdit]);

  return {
    notes,
    newNote,
    setNewNote,
    editingId,
    editingText,
    setEditingText,
    showInput,
    setShowInput,
    addNote,
    deleteNote,
    startEditing,
    saveEdit,
    cancelEdit,
    handleKeyPress
  };
};

export default useNotes; 