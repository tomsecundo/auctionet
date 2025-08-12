const express = require('express');
const {
  getAuction,
  addBid,
  cancelBid,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET all tasks not owned by logged-in user
// POST create a new task
router.route('/').get(protect, getAuction);
router.route('/:id').put(protect, addBid);
router.route('/:taskId/cancelBid').delete(protect, cancelBid);
module.exports = router;