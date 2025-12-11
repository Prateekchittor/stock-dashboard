// server/index.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const passport = require('passport');

const authRoutes = require('./routes/auth');            // Google endpoints + email login
const subscriptionsRoutes = require('./routes/subscriptions');
const priceGenerator = require('./utils/priceGenerator');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in .env');
  process.exit(1);
}

// Connect to MongoDB (no deprecated options)
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.use(cors());
app.use(express.json());
app.use(express.static('client')); // serve frontend from client folder

// Initialize passport (no sessions)
app.use(passport.initialize());

// Configure Google strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');
const { sign, verify } = require('./utils/jwt');

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
  console.warn('Google OAuth env vars not fully set (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_CALLBACK_URL). Google sign-in will not work until they are configured.');
}

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || ''
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile?.emails?.[0]?.value;
    if (!email) return done(new Error('No email provided by Google'));

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = new User({ email: email.toLowerCase(), subscriptions: [] });
      await user.save();
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
}));

// Initialize Socket.IO
const io = new Server(server, {
  cors: { origin: true, methods: ["GET", "POST"] }
});
app.set('io', io);

// Socket.IO authentication middleware using JWT sent in handshake auth.token
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: token required'));
    }
    const payload = verify(token); // throws on invalid
    socket.userId = payload.sub;
    return next();
  } catch (err) {
    console.error('Socket auth error:', err.message || err);
    return next(new Error('Authentication error: invalid token'));
  }
});

// On connection: join user room and ticker rooms based on DB subscriptions
io.on('connection', async (socket) => {
  console.log(`Socket connected: id=${socket.id} user=${socket.userId}`);
  try {
    // join a per-user room
    socket.join('user:' + socket.userId);

    // load user's subscriptions and join ticker rooms
    const user = await User.findById(socket.userId).lean();
    if (user && Array.isArray(user.subscriptions)) {
      user.subscriptions.forEach(t => {
        if (t) socket.join('ticker:' + t);
      });
    }
  } catch (err) {
    console.error('Error on socket connection while loading subscriptions:', err);
  }

  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: id=${socket.id} reason=${reason}`);
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api', subscriptionsRoutes);

// Start price generator that emits to 'ticker:<TICKER>' rooms
priceGenerator(io);

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (http://localhost:${PORT})`);
});
