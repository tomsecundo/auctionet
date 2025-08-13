import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { useAuth } from '../context/AuthContext';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false); // Manage visibility of TaskForm
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get('/api/tasks', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        console.log("response data: " + response.data);
        setTasks(response.data);
      } catch (error) {
        navigate('/');
        alert('Failed to fetch tasks.');
      }
    };

    fetchTasks();
  }, [user]);

  useEffect(() => {
    if (editingTask) {
      setShowTaskForm(true);
    } else {
      setShowTaskForm(false);
    }
  }, [editingTask]);
  
  const toggleTaskForm = () => setShowTaskForm(!showTaskForm); // Toggle TaskForm visibility

  return (
    <div className="container mx-auto p-6 flex flex-col items-center justify-start h-screen">
        <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg mb-6">
          Got something valuable? Sell it at our auction and make a great deal! Click the button below!
        </h1>
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