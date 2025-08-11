const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [140, 'Title must be at most 140 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description is too long'],
      default: '',
    },
    startingPrice: {
      type: String,
      required: [true, 'Starting price is required'],
      // min: [1, 'Starting price cannot be negative'],
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
    deadline: {
      type: Date,
      validate: {
        validator(value) {
          // allow undefined/null; if present, must be a valid date
          return value instanceof Date && !isNaN(value.valueOf());
        },
        message: 'Deadline must be a valid date',
      },
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
      },
    },
    toObject: { virtuals: true },
  }
);

// Helpful virtuals
TaskSchema.virtual('isOverdue').get(function isOverdue() {
  return Boolean(this.deadline) && !this.completed && new Date() > this.deadline;
});

// Index to speed up common queries (by owner + status + due soon)
TaskSchema.index({ userId: 1, completed: 1, deadline: 1 });

// Optional: normalize string deadlines if clients send them
// TaskSchema.pre('validate', function normalizeDeadline(next) {
//   if (typeof this.deadline === 'string' && this.deadline.trim()) {
//     const d = new Date(this.deadline);
//     if (!isNaN(d.valueOf())) this.deadline = d;
//   }
//   next();
// });

module.exports = mongoose.model('Task', TaskSchema);