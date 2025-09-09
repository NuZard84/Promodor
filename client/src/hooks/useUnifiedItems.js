import { useState, useEffect, useCallback } from 'react';

const useUnifiedItems = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#FF6B47');
  const [itemType, setItemType] = useState('note'); // 'note' or 'task'

  const colors = [
    { id: 'high', color: '#FF6B47', label: 'High Priority' },
    { id: 'medium', color: '#FFB443', label: 'Medium Priority' },
    { id: 'low', color: '#4ECDC4', label: 'Low Priority' },
    { id: 'neutral', color: '#8F9DAF', label: 'No Priority' }
  ];

  // Load items from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('overlay-notes');
    const savedTasks = localStorage.getItem('promodor_tasks');
    
    const notes = savedNotes ? JSON.parse(savedNotes) : [];
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    
    // Combine notes and tasks into unified items
    const unifiedItems = [
      ...notes.map(note => ({ ...note, type: 'note' })),
      ...tasks.map(task => ({ ...task, type: 'task', color: '#FF6B47' })) // Default color for tasks
    ].sort((a, b) => new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id));
    
    setItems(unifiedItems);
  }, []);

  // Save items to localStorage whenever items change
  useEffect(() => {
    const notes = items.filter(item => item.type === 'note');
    const tasks = items.filter(item => item.type === 'task');
    
    localStorage.setItem('overlay-notes', JSON.stringify(notes));
    localStorage.setItem('promodor_tasks', JSON.stringify(tasks));
  }, [items]);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'overlay-notes' || e.key === 'promodor_tasks') {
        const savedNotes = localStorage.getItem('overlay-notes');
        const savedTasks = localStorage.getItem('promodor_tasks');
        
        const notes = savedNotes ? JSON.parse(savedNotes) : [];
        const tasks = savedTasks ? JSON.parse(savedTasks) : [];
        
        const unifiedItems = [
          ...notes.map(note => ({ ...note, type: 'note' })),
          ...tasks.map(task => ({ ...task, type: 'task', color: '#FF6B47' }))
        ].sort((a, b) => new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id));
        
        setItems(unifiedItems);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addItem = useCallback(() => {
    if (newItem.trim()) {
      const item = {
        id: Date.now(),
        text: newItem.trim(),
        color: selectedColor,
        type: itemType,
        completed: itemType === 'task' ? false : undefined,
        createdAt: new Date().toISOString()
      };
      setItems(prev => [item, ...prev]);
      setNewItem('');
      setShowInput(false);
      setSelectedColor(colors[0].color);
    }
  }, [newItem, selectedColor, itemType]);

  const deleteItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const deleteAllItems = useCallback(() => {
    setItems([]);
  }, []);

  const toggleTask = useCallback((id) => {
    setItems(prev => prev.map(item => 
      item.id === id && item.type === 'task'
        ? { ...item, completed: !item.completed }
        : item
    ));
  }, []);

  const startEditing = useCallback((item) => {
    setEditingId(item.id);
    setEditingText(item.text);
  }, []);

  const saveEdit = useCallback(() => {
    if (editingText.trim()) {
      setItems(prev => prev.map(item => 
        item.id === editingId 
          ? { ...item, text: editingText.trim() }
          : item
      ));
    }
    setEditingId(null);
    setEditingText('');
  }, [editingText, editingId]);

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
        addItem();
      }
    } else if (e.key === 'Escape') {
      if (editingId) {
        cancelEdit();
      } else {
        setShowInput(false);
        setNewItem('');
      }
    }
  }, [editingId, saveEdit, addItem, cancelEdit]);

  // Filter items by type
  const notes = items.filter(item => item.type === 'note');
  const tasks = items.filter(item => item.type === 'task');
  const completedTasks = tasks.filter(task => task.completed).length;

  return {
    items,
    notes,
    tasks,
    completedTasks,
    newItem,
    setNewItem,
    editingId,
    editingText,
    setEditingText,
    showInput,
    setShowInput,
    selectedColor,
    setSelectedColor,
    itemType,
    setItemType,
    colors,
    addItem,
    startEditing,
    saveEdit,
    cancelEdit,
    deleteItem,
    deleteAllItems,
    toggleTask,
    handleKeyPress
  };
};

export default useUnifiedItems;
