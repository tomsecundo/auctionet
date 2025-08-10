import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const AuctionList = ({ tasks, setTasks, setEditingTask }) => {
  const { user } = useAuth();

  const handleDelete = async (taskId) => {
    try {
      await axiosInstance.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div>
      {tasks.map((task) => (
        <div key={task._id} className="bg-gray-100 p-4 mb-4 rounded shadow">
          <h2 className="font-bold">{task.title}</h2>
          <p>{task.description}</p>
          <p>Highest Offer: $ {task.startingPrice}</p>
          <p className="text-sm text-gray-500">Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
          <div className="mt-2">
            <button
              onClick={() => setEditingTask(task)}
              className="mr-2 bg-orange-500 text-white px-4 py-2 rounded"
            >
              Raise Bid
            </button>
            <button
              onClick={() => handleDelete(task._id)}
              className="bg-pink-500 text-white px-4 py-2 rounded"
            >
              Cancel Bid
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuctionList;