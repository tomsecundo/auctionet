import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import AuctionList from '../components/AuctionList';
import { useAuth } from '../context/AuthContext';

const Auction  = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await axiosInstance.get('/api/auction', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTasks(response.data);
      } catch (error) {
        alert("get auction items: "  + error);
      }
    };

    fetchAuction();
  }, [user]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Happy bidding!</h1>
      <AuctionList tasks={tasks} setTasks={setTasks} setEditingTask={setEditingTask} />
    </div>
  );
};
export default Auction;
