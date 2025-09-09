import { useState, useEffect, useCallback } from 'react';

const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [completedTasks, setCompletedTasks] = useState(0);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('promodor_tasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      setTasks(parsedTasks);
      setCompletedTasks(parsedTasks.filter(task => task.completed).length);
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('promodor_tasks', JSON.stringify(tasks));
    setCompletedTasks(tasks.filter(task => task.completed).length);
  }, [tasks]);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'promodor_tasks' && e.newValue) {
        const updatedTasks = JSON.parse(e.newValue);
        setTasks(updatedTasks);
        setCompletedTasks(updatedTasks.filter(task => task.completed).length);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addTask = useCallback(() => {
    if (newTask.trim() && tasks.length < 10) { // Increased limit to 10
      const task = {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
        type: 'task', // Mark as task type
        createdAt: new Date().toISOString()
      };
      setTasks(prev => [...prev, task]);
      setNewTask('');
    }
  }, [newTask, tasks.length]);

  const toggleTask = useCallback((id) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, completed: !task.completed }
        : task
    ));
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const updateCompletedTasks = useCallback((count) => {
    setCompletedTasks(count);
  }, []);

  return {
    tasks,
    newTask,
    setNewTask,
    completedTasks,
    addTask,
    toggleTask,
    deleteTask,
    updateCompletedTasks
  };
};

export default useTasks; 