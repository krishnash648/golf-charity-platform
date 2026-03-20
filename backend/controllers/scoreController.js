const Score = require('../models/Score');
const User = require('../models/User');

// ➕ Add score (MAX 5 LOGIC + VALIDATION)
const addScore = async (req, res) => {
  try {
    const { score } = req.body;
    const userId = req.user._id;

    // ✅ Validate score
    if (!score || score < 1 || score > 45) {
      return res.status(400).json({
        success: false,
        message: 'Score must be between 1 and 45'
      });
    }

    // 🔢 Get user's current score count
    const scoreCount = await Score.getUserScoreCount(userId);

    // ❗ If already 5 → delete oldest score
    if (scoreCount >= 5) {
      await Score.deleteOldestScore(userId);
    }

    // ✅ Create new score
    const newScore = await Score.create({
      userId,
      score,
      date: new Date()
    });

    // 🔄 Get updated scores (latest first)
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

// 📊 Get logged-in user's scores (LATEST FIRST)
const getScores = async (req, res) => {
  try {
    const userId = req.user._id;

    // 🔥 Ensure max 5 + sorted latest first
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

// 🏆 Get global leaderboard
const getGlobalLeaderboard = async (req, res) => {
  try {
    // Get all scores with user info, sorted by score (highest first), limited to 10
    const leaderboard = await Score.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $sort: { score: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          score: 1,
          'userId.name': 1,
          'userId.email': 1,
          'userId._id': 1,
          createdAt: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leaderboard'
    });
  }
};

module.exports = {
  addScore,
  getScores,
  getGlobalLeaderboard
};