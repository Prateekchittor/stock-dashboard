// server/utils/jwt.js
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error('Missing JWT_SECRET in .env');
  process.exit(1);
}

function sign(user) {
  // Accept either mongoose doc or plain object with _id/email
  const id = user._id ? user._id.toString() : user.id;
  const payload = { sub: id, email: user.email };
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

function verify(token) {
  return jwt.verify(token, secret);
}

module.exports = { sign, verify };
