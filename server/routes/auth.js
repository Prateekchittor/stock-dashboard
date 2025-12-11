// server/routes/auth.js
const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User');
const { sign, verify } = require('../utils/jwt');

/**
 * GET /api/auth/google
 * Starts Google OAuth flow (passport configured in server/index.js)
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * GET /api/auth/google/callback
 * Handles Google's callback, issues JWT and redirects to frontend with token in fragment
 */
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/' }),
  (req, res) => {
    try {
      if (!req.user) return res.redirect('/?error=oauth_failed');
      const token = sign(req.user);
      const base = process.env.APP_BASE_URL ? process.env.APP_BASE_URL.replace(/\/$/, '') : '';
      const redirectTo = `${base}/dashboard.html#token=${token}`;
      res.redirect(redirectTo);
    } catch (err) {
      console.error('Google callback error:', err);
      res.redirect('/?error=oauth_error');
    }
  }
);

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 * Returns { id, email, subscriptions }
 */
router.get('/me', async (req, res) => {
  try {
    const auth = req.header('authorization') || '';
    const token = auth.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const payload = verify(token);
    const user = await User.findById(payload.sub).lean();
    if (!user) return res.status(401).json({ error: 'User not found' });

    return res.json({ id: user._id, email: user.email, subscriptions: user.subscriptions });
  } catch (err) {
    console.error('Auth me error:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
