// server/routes/subscriptions.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verify } = require('../utils/jwt');

// Helper: get supported tickers from env
const SUPPORTED = (process.env.SUPPORTED_TICKERS || 'GOOG,TSLA,AMZN,META,NVDA').split(',');

// Middleware to authenticate requests expecting Authorization header
async function authMiddleware(req, res, next) {
  try {
    const auth = req.header('authorization') || '';
    const token = auth.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = verify(token);
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// GET /api/supported
router.get('/supported', (req, res) => {
  res.json(SUPPORTED);
});

// GET /api/subscriptions  (Auth)
router.get('/subscriptions', authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user.subscriptions || []);
});

// POST /api/subscribe { ticker }  (Auth)
router.post('/subscribe', authMiddleware, async (req, res) => {
  const { ticker } = req.body;
  if (!ticker || !SUPPORTED.includes(ticker)) return res.status(400).json({ error: 'Invalid ticker' });
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (!user.subscriptions.includes(ticker)) {
    user.subscriptions.push(ticker);
    await user.save();
  }
  // Add the user's connected sockets to the ticker room(s)
  const io = req.app.get('io');
  for (const [id, socket] of io.sockets.sockets) {
    if (socket.userId === req.userId) {
      socket.join('ticker:' + ticker);
    }
  }
  res.json({ subscriptions: user.subscriptions });
});

// POST /api/unsubscribe { ticker }  (Auth)
router.post('/unsubscribe', authMiddleware, async (req, res) => {
  const { ticker } = req.body;
  if (!ticker || !SUPPORTED.includes(ticker)) return res.status(400).json({ error: 'Invalid ticker' });
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.subscriptions = user.subscriptions.filter(t => t !== ticker);
  await user.save();
  // Remove the user's sockets from the ticker room
  const io = req.app.get('io');
  for (const [id, socket] of io.sockets.sockets) {
    if (socket.userId === req.userId) {
      socket.leave('ticker:' + ticker);
    }
  }
  res.json({ subscriptions: user.subscriptions });
});

module.exports = router;
