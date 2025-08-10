const express = require('express');
const {
  getAuction,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET all tasks not owned by logged-in user
// POST create a new task
router.route('/').get(protect, getAuction);

module.exports = router;