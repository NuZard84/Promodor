import { useState, useEffect, useCallback } from 'react';

const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#FF6B47'); // Default color

  const colors = [
    { id: 'high', color: '#FF6B47', label: 'High Priority' },
    { id: 'medium', color: '#FFB443', label: 'Medium Priority' },
    { id: 'low', color: '#4ECDC4', label: 'Low Priority' },
    { id: 'neutral', color: '#8F9DAF', label: 'No Priority' }
  ];

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

  // Listen for task changes from main app
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'promodor_tasks' && e.newValue) {
        // Tasks are handled separately, but we can sync them if needed
        const updatedTasks = JSON.parse(e.newValue);
        // You can add logic here to sync tasks with notes if needed
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addNote = useCallback(() => {
    if (newNote.trim()) {
      const note = {
        id: Date.now(),
        text: newNote.trim(),
        color: selectedColor,
        createdAt: new Date().toISOString()
      };
      setNotes([note, ...notes]);
      setNewNote('');
      setShowInput(false);
      setSelectedColor(colors[0].color); // Reset to default color
    }
  }, [newNote, notes, selectedColor]);

  const deleteNote = useCallback((id) => {
    setNotes(notes.filter(note => note.id !== id));
  }, [notes]);

  const deleteAllNotes = useCallback(() => {
    setNotes([]);
  }, []);

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
    selectedColor,
    setSelectedColor,
    colors,  // Make sure to include colors in the return
    addNote,
    startEditing,
    saveEdit,
    cancelEdit,
    deleteNote,
    deleteAllNotes
  };
};

export default useNotes;