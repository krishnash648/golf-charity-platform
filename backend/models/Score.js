const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [1, 'Score must be at least 1'],
      max: [45, 'Score cannot exceed 45']
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for efficient queries
scoreSchema.index({ userId: 1, date: -1 });

// Static method to get user's scores sorted by date (latest first)
scoreSchema.statics.getUserScores = function(userId) {
  return this.find({ userId })
    .sort({ date: -1 })
    .populate('userId', 'name email');
};

// Static method to get user's score count
scoreSchema.statics.getUserScoreCount = function(userId) {
  return this.countDocuments({ userId });
};

// Static method to delete oldest score for a user
scoreSchema.statics.deleteOldestScore = function(userId) {
  return this.findOneAndDelete({ userId })
    .sort({ date: 1 }); // Sort by date ascending to get oldest
};

module.exports = mongoose.model('Score', scoreSchema);
