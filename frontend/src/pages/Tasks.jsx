import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { useAuth } from '../context/AuthContext';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false); // Manage visibility of TaskForm

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get('/api/tasks', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        console.log("response data: " + response.data);
        setTasks(response.data);
      } catch (error) {
        alert('Failed to fetch tasks.');
      }
    };

    fetchTasks();
  }, [user]);

  const toggleTaskForm = () => setShowTaskForm(!showTaskForm); // Toggle TaskForm visibility

  return (
    <div className="container mx-auto p-6">
      {/* Button to show TaskForm */}
      <button
        onClick={toggleTaskForm}
        className="bg-pink-500 text-white p-2 rounded mb-4"
      >
        {showTaskForm ? 'Cancel' : 'Auction an item'}
      </button>

      {/* Conditionally render TaskForm based on showTaskForm state */}
      {showTaskForm && (
        <TaskForm
          tasks={tasks}
          setTasks={setTasks}
          editingTask={editingTask}
          setEditingTask={setEditingTask}
        />
      )}

      {/* TaskList Component */}
      <TaskList tasks={tasks} setTasks={setTasks} setEditingTask={setEditingTask} />
    </div>
  );
};

export default Tasks;