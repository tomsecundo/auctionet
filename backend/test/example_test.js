/* eslint-env mocha */
const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Task = require('../models/Task');

const {
  getAuction,
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  addBid,
  cancelBid
} = require('../controllers/taskController');

const { expect } = chai;

// --- Helpers ---
function mockRes() {
  return {
    status: sinon.stub().returnsThis(),
    json: sinon.spy()
  };
}

function makeTaskDoc(overrides = {}) {
  return {
    _id: new mongoose.Types.ObjectId(),
    userId: new mongoose.Types.ObjectId(),
    title: 'Old Title',
    description: 'Old Desc',
    startingPrice: 100,
    completed: false,
    deadline: new Date(),
    bids: new Map([
      ['userA', '120'],
      ['userB', '150']
    ]),
    save: sinon.stub().resolvesThis(),
    remove: sinon.stub().resolves(),
    ...overrides
  };
}

describe('taskController', function () {
  // Give async tests breathing room
  this.timeout(10000);

  afterEach(() => sinon.restore());

  // ------------------------------------------------------------------
  // getAuction
  // ------------------------------------------------------------------
  describe('getAuction', () => {
    it('returns tasks from other users', async () => {
      const me = new mongoose.Types.ObjectId();
      const tasks = [makeTaskDoc(), makeTaskDoc()];
      const findStub = sinon.stub(Task, 'find').resolves(tasks);

      const req = { user: { id: me } };
      const res = mockRes();

      await getAuction(req, res);

      expect(findStub.calledOnceWith({ userId: { $ne: me } })).to.be.true;
      expect(res.json.calledWith(tasks)).to.be.true;
    });

    it('500 on error', async () => {
      sinon.stub(Task, 'find').rejects(new Error('DB Error'));
      const req = { user: { id: new mongoose.Types.ObjectId() } };
      const res = mockRes();

      await getAuction(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });
  });

  // ------------------------------------------------------------------
  // getTasks
  // ------------------------------------------------------------------
  describe('getTasks', () => {
    it('returns tasks for requesting user', async () => {
      const me = new mongoose.Types.ObjectId();
      const tasks = [makeTaskDoc({ userId: me }), makeTaskDoc({ userId: me })];
      const findStub = sinon.stub(Task, 'find').resolves(tasks);

      const req = { user: { id: me } };
      const res = mockRes();

      await getTasks(req, res);

      expect(findStub.calledOnceWith({ userId: me })).to.be.true;
      expect(res.json.calledWith(tasks)).to.be.true;
    });

    it('500 on error', async () => {
      sinon.stub(Task, 'find').rejects(new Error('DB Error'));
      const req = { user: { id: new mongoose.Types.ObjectId() } };
      const res = mockRes();

      await getTasks(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });
  });

  // ------------------------------------------------------------------
  // addTask
  // ------------------------------------------------------------------
  describe('addTask', () => {
    it('creates a task', async () => {
      const me = new mongoose.Types.ObjectId();
      const body = {
        title: 'New',
        description: 'Desc',
        startingPrice: '200',
        deadline: '2025-12-31'
      };
      const created = { _id: new mongoose.Types.ObjectId(), userId: me, ...body };
      const createStub = sinon.stub(Task, 'create').resolves(created);

      const req = { user: { id: me }, body };
      const res = mockRes();

      await addTask(req, res);

      expect(createStub.calledOnceWith({ userId: me, ...body })).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(created)).to.be.true;
    });

    it('500 on DB error', async () => {
      sinon.stub(Task, 'create').rejects(new Error('DB Error'));

      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: { title: 'X', description: 'Y', startingPrice: '1', deadline: '2025-01-01' }
      };
      const res = mockRes();

      await addTask(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });
  });

  // ------------------------------------------------------------------
  // updateTask
  // ------------------------------------------------------------------
  describe('updateTask', () => {
    it('updates an existing task', async () => {
      const taskId = new mongoose.Types.ObjectId();
      const existing = makeTaskDoc({ completed: true });
      const updated = { ...existing, title: 'Updated', completed: false };
      existing.save.resolves(updated);

      sinon.stub(Task, 'findById').resolves(existing);

      const req = {
        params: { id: taskId.toString() },
        body: { title: 'Updated', completed: false, startingPrice: 250 }
      };
      const res = mockRes();

      await updateTask(req, res);

      expect(existing.title).to.equal('Updated');
      expect(existing.completed).to.equal(false);
      expect(existing.startingPrice).to.equal(250);
      expect(res.json.calledWith(updated)).to.be.true;
      expect(res.status.called).to.be.false;
    });

    it('404 when task not found', async () => {
      sinon.stub(Task, 'findById').resolves(null);

      const req = { params: { id: new mongoose.Types.ObjectId().toString() }, body: {} };
      const res = mockRes();

      await updateTask(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: 'Task not found' })).to.be.true;
    });

    it('500 on error', async () => {
      sinon.stub(Task, 'findById').rejects(new Error('DB Error'));

      const req = { params: { id: new mongoose.Types.ObjectId().toString() }, body: {} };
      const res = mockRes();

      await updateTask(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });
  });

  // ------------------------------------------------------------------
  // deleteTask
  // ------------------------------------------------------------------
  describe('deleteTask', () => {
    it('deletes an existing task', async () => {
      const doc = makeTaskDoc();
      sinon.stub(Task, 'findById').resolves(doc);

      const req = { params: { id: doc._id.toString() } };
      const res = mockRes();

      await deleteTask(req, res);

      expect(Task.findById.calledOnceWith(req.params.id)).to.be.true;
      expect(doc.remove.calledOnce).to.be.true;
      expect(res.json.calledWith({ message: 'Task deleted' })).to.be.true;
    });

    it('404 when task not found', async () => {
      sinon.stub(Task, 'findById').resolves(null);

      const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
      const res = mockRes();

      await deleteTask(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: 'Task not found' })).to.be.true;
    });

    it('500 on error', async () => {
      sinon.stub(Task, 'findById').rejects(new Error('DB Error'));

      const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
      const res = mockRes();

      await deleteTask(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });
  });

  // ------------------------------------------------------------------
  // addBid
  // ------------------------------------------------------------------
  describe('addBid', () => {
    it('400 when offeredAmount is not a number', async () => {
      const task = makeTaskDoc();
      sinon.stub(Task, 'findById').resolves(task);

      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: { taskId: task._id.toString(), offeredAmount: 'abc' }
      };
      const res = mockRes();

      await addBid(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Offered amount must be a positive number' })).to.be.true;
    });

    it('400 when offeredAmount <= 0', async () => {
      const task = makeTaskDoc();
      sinon.stub(Task, 'findById').resolves(task);

      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: { taskId: task._id.toString(), offeredAmount: '0' }
      };
      const res = mockRes();

      await addBid(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Offered amount must be a positive number' })).to.be.true;
    });

    it('404 when offeredAmount < highest bid', async () => {
      const task = makeTaskDoc({
        bids: new Map([
          ['userA', '120'],
          ['userB', '150']
        ])
      });
      sinon.stub(Task, 'findById').resolves(task);

      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: { taskId: task._id.toString(), offeredAmount: '140' } // lower than 150
      };
      const res = mockRes();

      await addBid(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Must be higher!' })).to.be.true;
    });

    it('200 when bid is accepted and saved', async () => {
      const myUserId = new mongoose.Types.ObjectId();
      const task = makeTaskDoc({
        bids: new Map([
          ['userA', '120'],
          ['userB', '150']
        ])
      });
      task.save = sinon.stub().resolves(task); // saving returns updated doc
      sinon.stub(Task, 'findById').resolves(task);

      const offeredAmount = '200';
      const req = {
        user: { id: myUserId },
        body: { taskId: task._id.toString(), offeredAmount }
      };
      const res = mockRes();

      await addBid(req, res);

      const key = myUserId.toString();
      expect(task.bids.get(key)).to.equal(offeredAmount);
      expect(task.save.calledOnce).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Bid added successfully' })).to.be.true;
    });

    it('404 when task not found', async () => {
      sinon.stub(Task, 'findById').resolves(null);

      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: { taskId: new mongoose.Types.ObjectId().toString(), offeredAmount: '100' }
      };
      const res = mockRes();

      await addBid(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: 'Task not found' })).to.be.true;
    });

    it('500 on internal error', async () => {
      sinon.stub(Task, 'findById').rejects(new Error('DB Error'));

      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: { taskId: new mongoose.Types.ObjectId().toString(), offeredAmount: '100' }
      };
      const res = mockRes();

      await addBid(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ message: 'Internal Server Error' })).to.be.true;
    });
  });

  // ------------------------------------------------------------------
  // cancelBid
  // ------------------------------------------------------------------
  describe('cancelBid', () => {
    it('200 when bid exists and is removed', async () => {
      const taskId = new mongoose.Types.ObjectId();
      const targetUserId = new mongoose.Types.ObjectId().toString();
      const task = makeTaskDoc({
        _id: taskId,
        bids: new Map([
          [targetUserId, '300'],
          ['someone', '150']
        ])
      });
      task.save = sinon.stub().resolves(task);
      sinon.stub(Task, 'findById').resolves(task);

      const req = { params: { taskId: taskId.toString() }, body: { userId: targetUserId } };
      const res = mockRes();

      await cancelBid(req, res);

      expect(task.bids.has(targetUserId)).to.be.false;
      expect(task.save.calledOnce).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Bid canceled successfully' })).to.be.true;
    });

    it('400 when no bid to cancel', async () => {
      const taskId = new mongoose.Types.ObjectId();
      const task = makeTaskDoc({
        _id: taskId,
        bids: new Map([['someone', '150']])
      });
      sinon.stub(Task, 'findById').resolves(task);

      const req = { params: { taskId: taskId.toString() }, body: { userId: 'absentUser' } };
      const res = mockRes();

      await cancelBid(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ message: 'No bid found to cancel' })).to.be.true;
    });

    it('404 when task not found', async () => {
      sinon.stub(Task, 'findById').resolves(null);

      const req = { params: { taskId: new mongoose.Types.ObjectId().toString() }, body: { userId: 'x' } };
      const res = mockRes();

      await cancelBid(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: 'Task not found' })).to.be.true;
    });

    it('500 on internal error', async () => {
      sinon.stub(Task, 'findById').rejects(new Error('DB Error'));

      const req = { params: { taskId: new mongoose.Types.ObjectId().toString() }, body: { userId: 'x' } };
      const res = mockRes();

      await cancelBid(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ message: 'Internal Server Error' })).to.be.true;
    });
  });
});
