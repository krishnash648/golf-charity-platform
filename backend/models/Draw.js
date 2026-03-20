const mongoose = require('mongoose');

const drawSchema = new mongoose.Schema(
  {
    numbers: {
      type: [Number],
      required: true
    },
    month: String,
    year: Number,
    results: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        matchCount: Number,
        matchedNumbers: [Number]
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Draw', drawSchema);