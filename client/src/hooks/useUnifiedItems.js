import { useState, useEffect, useCallback } from 'react';

const useUnifiedItems = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#FF6B47');
  const [showConfetti, setShowConfetti] = useState(false);

  const colors = [
    { id: 'high', color: '#FF6B47', label: 'High Priority' },
    { id: 'medium', color: '#FFB443', label: 'Medium Priority' },
    { id: 'low', color: '#4ECDC4', label: 'Low Priority' },
    { id: 'neutral', color: '#8F9DAF', label: 'No Priority' }
  ];

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('promodor_tasks');
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    
    // Only load tasks, add default color if not present
    const tasksWithColor = tasks.map(task => ({ 
      ...task, 
      type: 'task', 
      color: task.color || '#FF6B47' 
    }));
    
    setItems(tasksWithColor.sort((a, b) => new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id)));
  }, []);

  // Save tasks to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('promodor_tasks', JSON.stringify(items));
  }, [items]);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'promodor_tasks') {
        const savedTasks = localStorage.getItem('promodor_tasks');
        const tasks = savedTasks ? JSON.parse(savedTasks) : [];
        
        const tasksWithColor = tasks.map(task => ({ 
          ...task, 
          type: 'task', 
          color: task.color || '#FF6B47' 
        }));
        
        setItems(tasksWithColor.sort((a, b) => new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id)));
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
        type: 'task',
        completed: false,
        createdAt: new Date().toISOString()
      };
      setItems(prev => [item, ...prev]);
      setNewItem('');
      setShowInput(false);
      setSelectedColor(colors[0].color);
    }
  }, [newItem, selectedColor]);

  const deleteItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const deleteAllItems = useCallback(() => {
    setItems([]);
  }, []);

  const toggleTask = useCallback((id) => {
    setItems(prev => {
      const updatedItems = prev.map(item => {
        if (item.id === id && item.type === 'task') {
          const wasCompleted = item.completed;
          const newCompleted = !item.completed;
          
          // Show confetti when task is completed (not when uncompleted)
          if (!wasCompleted && newCompleted) {
            setShowConfetti(true);
            // Hide confetti after 3 seconds
            setTimeout(() => setShowConfetti(false), 3000);
          }
          
          return { ...item, completed: newCompleted };
        }
        return item;
      });
      return updatedItems;
    });
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

  // All items are tasks now
  const tasks = items;
  const completedTasks = tasks.filter(task => task.completed).length;

  return {
    items,
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
    colors,
    addItem,
    startEditing,
    saveEdit,
    cancelEdit,
    deleteItem,
    deleteAllItems,
    toggleTask,
    handleKeyPress,
    showConfetti,
    setShowConfetti
  };
};

export default useUnifiedItems;
