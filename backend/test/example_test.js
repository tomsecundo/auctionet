/* eslint-env mocha */
const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Task = require('../models/Task');

const {
  getAuction,
  updateTask,
  getTasks,
  addTask,
  deleteTask,
  addBid,
  cancelBid
} = require('../controllers/taskController');

const { expect } = chai;

// Simple response mock
function mockRes() {
  return {
    status: sinon.stub().returnsThis(),
    json: sinon.spy()
  };
}

describe('Task controller unit tests', function () {
  // Give async tests breathing room (also set --timeout 10000 in CI just in case)
  this.timeout(10000);

  // Always clean up stubs/spies—even if a test fails
  afterEach(() => sinon.restore());

  // --------------------
  // Add Item
  // --------------------
  describe('AddItem Function Test', () => {
    it('should create a new task successfully', async () => {
      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: { title: 'New Item', description: 'Task description', startingPrice: '100', deadline: '2025-12-31' }
      };

      const createdItem = { _id: new mongoose.Types.ObjectId(), ...req.body, userId: req.user.id };

      const createStub = sinon.stub(Task, 'create').resolves(createdItem);
      const res = mockRes();

      await addTask(req, res);

      expect(createStub.calledOnceWith({ userId: req.user.id, ...req.body })).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(createdItem)).to.be.true;
    });

    it('should return 500 if an error occurs', async () => {
      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: { title: 'New Task', description: 'Task description', startingPrice: '100', deadline: '2025-12-31' }
      };

      sinon.stub(Task, 'create').rejects(new Error('DB Error'));
      const res = mockRes();

      await addTask(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });
  });

  // --------------------
  // Update Task
  // --------------------
  describe('Update Bid Item Function Test', () => {
    it('should update task successfully', async () => {
      const taskId = new mongoose.Types.ObjectId();
      const existingTask = {
        _id: taskId,
        title: 'Old Task',
        description: 'Old Description',
        startingPrice: 100,
        completed: false,
        deadline: new Date(),
        save: sinon.stub().resolvesThis()
      };

      sinon.stub(Task, 'findById').resolves(existingTask);

      const req = {
        params: { id: taskId.toString() },
        body: { title: 'New Task', completed: true }
      };
      const res = mockRes();

      await updateTask(req, res);

      expect(existingTask.title).to.equal('New Task');
      expect(existingTask.completed).to.equal(true);
      expect(res.status.called).to.be.false;
      expect(res.json.calledOnce).to.be.true;
    });

    it('should return 404 if task is not found', async () => {
      sinon.stub(Task, 'findById').resolves(null);

      const req = { params: { id: new mongoose.Types.ObjectId().toString() }, body: {} };
      const res = mockRes();

      await updateTask(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: 'Task not found' })).to.be.true;
    });

    it('should return 500 on error', async () => {
      sinon.stub(Task, 'findById').rejects(new Error('DB Error'));

      const req = { params: { id: new mongoose.Types.ObjectId().toString() }, body: {} };
      const res = mockRes();

      await updateTask(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.called).to.be.true;
    });
  });

  // --------------------
  // Get Tasks
  // --------------------
  describe('Get All Items Function Test', () => {
    it('should return tasks for the given user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const tasks = [
        { _id: new mongoose.Types.ObjectId(), title: 'Item 1', userId },
        { _id: new mongoose.Types.ObjectId(), title: 'Item 2', userId }
      ];

      const findStub = sinon.stub(Task, 'find').resolves(tasks);

      const req = { user: { id: userId } };
      const res = mockRes();

      await getTasks(req, res);

      expect(findStub.calledOnceWith({ userId })).to.be.true;
      expect(res.json.calledWith(tasks)).to.be.true;
      expect(res.status.called).to.be.false;
    });

    it('should return 500 on error', async () => {
      sinon.stub(Task, 'find').rejects(new Error('DB Error'));

      const req = { user: { id: new mongoose.Types.ObjectId() } };
      const res = mockRes();

      await getTasks(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });
  });

  // --------------------
  // Get Auctioned Items
  // --------------------
  describe('Get All Auctioned Items Function Test', () => {
    it('should return tasks for the given user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const tasks = [
        { _id: new mongoose.Types.ObjectId(), title: 'Item 1', userId },
        { _id: new mongoose.Types.ObjectId(), title: 'Item 2', userId }
      ];

      const findStub = sinon.stub(Task, 'find').resolves(tasks);

      const req = { user: { id: userId } };
      const res = mockRes();

      await getAuction(req, res);

      expect(findStub.calledOnceWith({ userId })).to.be.true;
      expect(res.json.calledWith(tasks)).to.be.true;
    });

    it('should return 500 on error', async () => {
      sinon.stub(Task, 'find').rejects(new Error('DB Error'));

      const req = { user: { id: new mongoose.Types.ObjectId() } };
      const res = mockRes();

      await getAuction(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });
  });

  // --------------------
  // Delete Task
  // --------------------
  describe('Delete Item Function Test', () => {
    it('should delete a task successfully', async () => {
      const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
      const task = { remove: sinon.stub().resolves() };

      sinon.stub(Task, 'findById').resolves(task);

      const res = mockRes();
      await deleteTask(req, res);

      expect(Task.findById.calledOnceWith(req.params.id)).to.be.true;
      expect(task.remove.calledOnce).to.be.true;
      expect(res.json.calledWith({ message: 'Task deleted' })).to.be.true;
    });

    it('should return 404 if task is not found', async () => {
      sinon.stub(Task, 'findById').resolves(null);

      const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
      const res = mockRes();

      await deleteTask(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: 'Task not found' })).to.be.true;
    });

    it('should return 500 if an error occurs', async () => {
      sinon.stub(Task, 'findById').rejects(new Error('DB Error'));

      const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
      const res = mockRes();

      await deleteTask(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });
  });

  // --------------------
  // Cancel Bid
  // --------------------
  describe('Delete Bid Function Test', () => {
    it('should delete a bid successfully', async () => {
      const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
      const task = { remove: sinon.stub().resolves() };

      sinon.stub(Task, 'findById').resolves(task);

      const res = mockRes();
      await cancelBid(req, res);

      expect(Task.findById.calledOnceWith(req.params.id)).to.be.true;
      expect(task.remove.calledOnce).to.be.true;
      expect(res.json.calledWith({ message: 'Task deleted' })).to.be.true;
    });

    it('should return 404 if bid is not found', async () => {
      sinon.stub(Task, 'findById').resolves(null);

      const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
      const res = mockRes();

      await cancelBid(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: 'Task not found' })).to.be.true;
    });

    it('should return 500 if an error occurs', async () => {
      sinon.stub(Task, 'findById').rejects(new Error('DB Error'));

      const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
      const res = mockRes();

      await cancelBid(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });
  });

  // --------------------
  // Place Bid
  // --------------------
  describe('Place Bid Function Test', () => {
    it('should create a bid successfully', async () => {
      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: { title: 'New Item', description: 'Task description', startingPrice: '100', deadline: '2025-12-31' }
      };

      const createdItem = { _id: new mongoose.Types.ObjectId(), ...req.body, userId: req.user.id };

      // If addBid checks for existing items/bids, stub findOne to avoid real DB
      sinon.stub(Task, 'findOne').resolves(null);
      sinon.stub(Task, 'create').resolves(createdItem);

      const res = mockRes();
      await addBid(req, res);

      expect(Task.findOne.calledOnce).to.be.true;
      expect(Task.create.calledOnceWith({ userId: req.user.id, ...req.body })).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(createdItem)).to.be.true;
    });

    it('should return 500 if an error occurs', async () => {
      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: { title: 'New Task', description: 'Task description', startingPrice: '100', deadline: '2025-12-31' }
      };

      // Ensure no DB hit before the error path
      sinon.stub(Task, 'findOne').resolves(null);
      sinon.stub(Task, 'create').rejects(new Error('DB Error'));

      const res = mockRes();
      await addBid(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });
  });

  // --------------------
  // Update/Raise Bid (example placeholder—adjust to your controller logic)
  // --------------------
  describe('Update/Raise Bid Function Test', () => {
    it('should update bid/task successfully', async () => {
      const taskId = new mongoose.Types.ObjectId();
      const existingTask = {
        _id: taskId,
        title: 'Old Task',
        description: 'Old Description',
        startingPrice: 100,
        completed: false,
        deadline: new Date(),
        save: sinon.stub().resolvesThis()
      };

      sinon.stub(Task, 'findById').resolves(existingTask);

      const req = {
        params: { id: taskId.toString() },
        body: { userId: new mongoose.Types.ObjectId().toString(), amount: 150 }
      };
      const res = mockRes();

      await updateTask(req, res);

      // Adjust these expectations to match your actual updateTask behavior
      expect(res.status.called).to.be.false;
      expect(res.json.calledOnce).to.be.true;
    });

    it('should return 404 if task is not found', async () => {
      sinon.stub(Task, 'findById').resolves(null);

      const req = { params: { id: new mongoose.Types.ObjectId().toString() }, body: {} };
      const res = mockRes();

      await updateTask(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: 'Task not found' })).to.be.true;
    });

    it('should return 500 on error', async () => {
      sinon.stub(Task, 'findById').rejects(new Error('DB Error'));

      const req = { params: { id: new mongoose.Types.ObjectId().toString() }, body: {} };
      const res = mockRes();

      await updateTask(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.called).to.be.true;
    });
  });
});