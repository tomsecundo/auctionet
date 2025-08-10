// const express = require('express');
// const { getTasks, addTask, updateTask, deleteTask } = require('../controllers/taskController');
// const { protect } = require('../middleware/authMiddleware');
// const router = express.Router();

// router.route('/').get(protect, getTasks).post(protect, addTask);
// router.route('/:id').put(protect, updateTask).delete(protect, deleteTask);

// module.exports = router;

const express = require('express');
const {
  getAuction,
  getTasks,
  addTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { verifyTaskOwnership } = require('../middleware/taskOwnership');

const router = express.Router();

// GET all tasks for the logged-in user
// POST create a new task
router
  .route('/')
  .get(protect, getTasks)
  .post(protect, addTask);

// PUT update a specific task
// DELETE remove a specific task
router
  .route('/:id')
  .put(protect, updateTask)
  .delete(protect, deleteTask);

module.exports = router;