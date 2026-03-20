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

// ✅ Index for fast queries
scoreSchema.index({ userId: 1, createdAt: -1 });


// ✅ Get latest 5 scores (PRD compliant)
scoreSchema.statics.getUserScores = function(userId) {
  return this.find({ userId })
    .sort({ createdAt: -1 }) // latest first
    .limit(5);
};


// ✅ Get score count
scoreSchema.statics.getUserScoreCount = function(userId) {
  return this.countDocuments({ userId });
};


// ✅ Delete oldest score (PRD logic)
scoreSchema.statics.deleteOldestScore = function(userId) {
  return this.findOneAndDelete({ userId })
    .sort({ createdAt: 1 }); // oldest first
};


module.exports = mongoose.model('Score', scoreSchema);