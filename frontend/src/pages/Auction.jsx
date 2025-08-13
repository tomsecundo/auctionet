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
   
    <div className="container mx-auto p-6 flex flex-col items-center justify-start h-screen">
        <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg mb-6">
          The Auction Starts Here – Ready, Set, Bid!
        </h1>
        <AuctionList
          tasks={tasks}
          setTasks={setTasks}
          setEditingTask={setEditingTask}
        />
    </div>
  );
};
export default Auction;
