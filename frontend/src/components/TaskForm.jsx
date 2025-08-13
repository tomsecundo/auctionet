import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import Modal from '../pages/Modal';

const TaskForm = ({ tasks, setTasks, editingTask, setEditingTask }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ title: '', description: '', startingPrice: '', deadline: '' });
  //const [formData, setFormData] = useState({ title: '', description: '', deadline: '' });

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description,
        startingPrice: editingTask.startingPrice,
        deadline: editingTask.deadline,
      });
    } else {
      setFormData({ title: '', description: '', startingPrice: '', deadline: '' });
    }
  }, [editingTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        const response = await axiosInstance.put(`/api/tasks/${editingTask.id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        
        setTasks(tasks.map((task) => (task.id === response.data.id ? response.data : task)));
      } else {
        const response = await axiosInstance.post('/api/tasks', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTasks([...tasks, response.data]);
      }

      setEditingTask(null);
      setFormData({ title: '', description: '', startingPrice: '', deadline: '' });
    } catch (error) {
      setModalMessage("Oh, you forgot something! Try again!");
      setModalOpen(true);
    }
  };
  const closeModal = () => {
    setModalOpen(false); // Close modal
  };
  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">{editingTask ? 'Edit Item Details' : 'Post an item for auction'}</h1>
      <input
        type="text"
        placeholder="Name of item"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="number"
        placeholder="Starting price $"
        value={formData.startingPrice}
        onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <label htmlFor="deadline">Closing Date:</label>
      <input
        type="date"
        value={formData.deadline}
        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <button type="submit" className="w-full bg-pink-600 text-white p-2 rounded">
        {editingTask ? 'Save' : 'Post'}
        
      </button>
      <Modal message={modalMessage} isOpen={isModalOpen} onClose={closeModal} />
    </form>
  );
};

export default TaskForm;
