const Task = require('../models/Task');

const verifyTaskOwnership = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this task' });
    }

    // Attach task to request so controller can skip re-fetch
    req.task = task;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { verifyTaskOwnership };