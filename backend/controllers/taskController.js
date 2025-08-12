const Task = require('../models/Task');

const getAuction = async (req, res) => {
    try {
        const tasks = await Task.find({ userId: { $ne: req.user.id }});
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
  };

const getTasks = async (req,res) => {
    try {
        const tasks = await Task.find({ userId: req.user.id });
        
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addTask = async (req,res) => {
    
    const { title, description, startingPrice, deadline } = req.body;
        try {
            
            const task = await Task.create({ userId: req.user.id, title, description, startingPrice, deadline });
            
            res.status(201).json(task);
        } catch (error) {
            console.error('Error creating task:', error);
            res.status(500).json({ message: error.message });
        }
};

const updateTask = async (req,res) => {
    const { title, description, startingPrice, completed, deadline } = req.body;
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        task.title = title || task.title;
        task.description = description || task.description;
        task.startingPrice = startingPrice || task.startingPrice;
        task.completed = completed ?? task.completed;
        task.deadline = deadline || task.deadline;
        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const deleteTask = async (req,res) => {
    try {
        console.log("req params: " + req.params.id);
        const task = await Task.findById(req.params.id);
        
        if (!task) return res.status(404).json({ message: 'Task not found' });
        await task.remove();
        res.json({ message: 'Task deleted' });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: error.message });
    }
};

const addBid = async (req, res) => {
    const { taskId, offeredAmount } = req.body;
  
    try {
      const task = await Task.findById(taskId);

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
  
      if (isNaN(offeredAmount) || parseFloat(offeredAmount) <= 0) {
        return res.status(400).json({ message: 'Offered amount must be a positive number' });
      }
      //alert(req.user.id);
      // Add the bid to the bids map (keyed by userId)
      task.bids.set(req.user.id.toString(), offeredAmount);

      await task.save();
      res.status(200).json({ message: 'Bid added successfully', task });
    } catch (error) {
      console.error('Error adding bid:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  const cancelBid = async (req, res) => {
    const { taskId } = req.params; // Extract taskId from URL
    const { userId } = req.body;  // Extract userId from the request body
    
    try {
      // Find the task by its ID
      
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      console.log(task.bids.has(userId));
      // Check if the user has placed a bid
      if (task.bids.has(userId)) {
        // Remove the user's bid from the task
        console.log("here");
        task.bids.delete(userId);
  
        // Save the updated task
        await task.save();
  
        return res.status(200).json({ message: 'Bid canceled successfully', task });
      } else {
        return res.status(400).json({ message: 'No bid found to cancel' });
      }
    } catch (error) {
      console.error('Error canceling bid:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };

module.exports = { getAuction, getTasks, addTask, updateTask, deleteTask, addBid, cancelBid };