// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String },                 // hashed password for email signups
  subscriptions: { type: [String], default: [] }, // list of subscribed tickers
  isVerified: { type: Boolean, default: false },  // optional (for email verification)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
