import { useState, useCallback } from 'react';

const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [completedTasks, setCompletedTasks] = useState(0);

  const addTask = useCallback(() => {
    if (newTask.trim() && tasks.length < 5) {
      const task = {
        id: Date.now(),
        text: newTask.trim(),
        completed: false
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