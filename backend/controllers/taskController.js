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
            //alert("post data: " + req.body.startingPrice);
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

module.exports = { getAuction, getTasks, addTask, updateTask, deleteTask };