import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const AuctionList = ({ tasks, setTasks, setEditingTask }) => {
const { user } = useAuth();
const [showModal, setShowModal] = useState(false);
const [bidAmount, setBidAmount] = useState('');
const [taskIdToBid, setTaskIdToBid] = useState(null);
const [tooltipMessage, setTooltipMessage] = useState('');

const openBidModal = (taskId) => {
  setTaskIdToBid(taskId);
  setShowModal(true);
  setTooltipMessage(''); 
};

const closeBidModal = () => {
  setShowModal(false);
  setBidAmount('');
  setTooltipMessage('');
};

const handleBidSubmit = async (e) => {
  e.preventDefault();
  console.log("checking");
  if (isNaN(bidAmount) || parseFloat(bidAmount) < 0) {
    alert('Bid amount must be a positive number');
    return;
  }
  
  try {
    const response = await axiosInstance.put(`/api/auction/${taskIdToBid}`, {
      taskId: taskIdToBid,
      offeredAmount: bidAmount,
    }, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    
    // Update the task list after submitting the bid
    setTasks(tasks.map((task) => {
      if (task.id === taskIdToBid) {
        return {
          ...task,
          bids: { ...task.bids, [user.id]: bidAmount },  // Add the new bid to the task's bids
        };
      }
      return task;
    }));

    closeBidModal();  // Close the modal after successful submission
  } catch (error) {
    console.error('Error placing bid:', error);
    setTooltipMessage(`Invalid value, must be higher than the current highest Offered Amount `);
  }
};

const handleCancelBid = async (taskId) => {
  try {
    // Send DELETE request to cancel the bid
    const response = await axiosInstance.delete(`/api/auction/${taskId}/cancelBid`, {
      data: { userId: user.id },  // Send userId in the body
      headers: { Authorization: `Bearer ${user.token}` },
    });

    // Update the task list after canceling the bid
    setTasks(tasks.map((task) => {
      if (task.id === taskId) {
        const updatedBids = { ...task.bids };
        delete updatedBids[user.id];  // Remove the user's bid from the task
        return {
          ...task,
          bids: updatedBids,
        };
      }
      return task;
    }));
  } catch (error) {
    console.error('Error canceling bid:', error);
    alert("handle Cancel bid: " + error);
  }
};

return (
  <div>
    {tasks.map((task) => (
      <div key={task.id} className="bg-gray-100 p-6 mb-4 rounded-lg shadow flex flex-wrap gap-6">
      {/* Left Side: Task Information */}
      <div className="flex-1 w-full sm:w-1/2 pr-4 bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        <h2 className="font-bold text-3xl text-gray-800 mb-4">{task.title}</h2>
        <p className="text-gray-700 mb-4">{task.description}</p>
        
        <div className="mb-2">
          <p className="font-semibold text-lg text-green-600">Initial Offer: <span className="font-bold">${task.startingPrice}</span></p>
        </div>
    
        <p className="text-sm text-gray-600 mb-2">Owner ID: <span className="text-gray-800 font-medium">{task.userId}</span></p>
        
        <p className="text-sm text-gray-500">
          <span className="font-semibold">Closing Date:</span> {new Date(task.deadline).toLocaleDateString()}
        </p>
        
        <div className="mt-4 flex">
          {/* Check if the user already placed a bid */}
          {task.bids[user.id] ? (
            <>
              <button
                onClick={() => openBidModal(task.id)}
                className="mr-2 bg-orange-500 text-white px-4 py-2 flex rounded hover:bg-orange-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                </svg>
    
                Raise Bid Amount
              </button>
              {/* Cancel Bid button */}
              <button 
                onClick={() => handleCancelBid(task.id)}
                className="bg-red-500 text-white px-4 py-2 flex rounded hover:bg-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 flex items-center justify-center">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
    
                Cancel Bid
              </button>
            </>
          ) : (
            // If no bid from the user, show "Place Bid"
            <button
              onClick={() => openBidModal(task.id)}
              className="mr-2 bg-pink-500 text-white px-4 py-2 flex rounded hover:bg-pink-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
    
              Place Bid
            </button>
          )}
        </div>
      </div>
    
      {/* Right Side: Bids Table */}
      <div className="w-full sm:w-1/2">
        <h3 className="font-semibold text-lg mb-2">Bids:</h3>
        <table className="min-w-full table-auto border-collapse shadow-lg rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">User ID</th>
              <th className="border px-4 py-2 text-left">Offered Amount</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(task.bids).map(([userId, offeredAmount], index) => (
              <tr
                key={userId}
                className={`${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                } hover:bg-pink-300 transition-colors duration-300`}
              >
                <td className="border px-4 py-2">{userId}</td>
                <td className="border px-4 py-2">${offeredAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    ))}

    {/* Modal for placing a bid */}
    {showModal && (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
          <h3 className="text-lg font-bold text-center mb-4">Place Your Bid</h3>
          <form onSubmit={handleBidSubmit}>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-semibold">Bid Amount</label>
              <input
                type="number"
                min="0"
                step="any"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded"
                required
              />
            </div>
            {tooltipMessage && (
                <div className="text-red-500 text-sm mb-4">{tooltipMessage}</div>
            )}
            <div className="flex justify-around">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Submit Bid
              </button>
              <button
                type="button"
                onClick={closeBidModal}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);
};

export default AuctionList;