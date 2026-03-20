const express = require('express');
const router = express.Router();
const { runDraw, getDrawHistory } = require('../controllers/drawController');

router.get('/', getDrawHistory);
router.post('/run', runDraw);

module.exports = router;