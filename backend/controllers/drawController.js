const Draw = require('../models/Draw');
const Score = require('../models/Score');
const User = require('../models/User');

// 🎲 Generate 5 random numbers
const generateNumbers = () => {
  const numbers = new Set();

  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }

  return Array.from(numbers);
};


// 🎯 Run draw
const runDraw = async (req, res) => {
  try {
    const numbers = generateNumbers();

    const users = await User.find();
    let results = [];

    for (let user of users) {
      const scores = await Score.getUserScores(user._id);

      const userNumbers = scores.map(s => s.score);

      // 🔥 match logic
      const matched = userNumbers.filter(n => numbers.includes(n));

      const matchCount = matched.length;

      if (matchCount >= 3) {
        results.push({
          userId: user._id,
          matchCount,
          matchedNumbers: matched
        });
      }
    }

    const draw = await Draw.create({
      numbers,
      month: new Date().toLocaleString('default', { month: 'long' }),
      year: new Date().getFullYear(),
      results
    });

    res.status(200).json({
      success: true,
      message: "Draw executed",
      data: draw
    });

  } catch (error) {
    console.error("Draw error:", error);
    res.status(500).json({
      success: false,
      message: "Draw failed"
    });
  }
};

// 📜 Get draw history
const getDrawHistory = async (req, res) => {
  try {
    const draws = await Draw.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: draws
    });
  } catch (error) {
    console.error("Draw history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch draw history"
    });
  }
};

module.exports = {
  runDraw,
  getDrawHistory
};