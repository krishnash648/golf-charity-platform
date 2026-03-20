const Score = require('../models/Score');

// Add score for logged-in user
const addScore = async (req, res) => {
  try {
    const { score } = req.body;
    const userId = req.user._id;

    // Validate score
    if (!score || score < 1 || score > 45) {
      return res.status(400).json({
        success: false,
        message: 'Score must be between 1 and 45'
      });
    }

    // Check user's current score count
    const scoreCount = await Score.getUserScoreCount(userId);

    // If user already has 5 scores, delete the oldest one
    if (scoreCount >= 5) {
      await Score.deleteOldestScore(userId);
    }

    // Create new score
    const newScore = await Score.create({
      userId,
      score
    });

    // Get updated scores list
    const scores = await Score.getUserScores(userId);

    res.status(201).json({
      success: true,
      message: 'Score added successfully',
      data: {
        score: newScore,
        allScores: scores
      }
    });

  } catch (error) {
    console.error('Add score error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add score'
    });
  }
};

// Get logged-in user's scores
const getScores = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's scores sorted by date (latest first)
    const scores = await Score.getUserScores(userId);

    res.status(200).json({
      success: true,
      message: 'Scores retrieved successfully',
      data: {
        scores,
        count: scores.length
      }
    });

  } catch (error) {
    console.error('Get scores error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve scores'
    });
  }
};

module.exports = {
  addScore,
  getScores
};
