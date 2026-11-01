const jwt = require('jsonwebtoken');
const config = require('../config');
const storage = require('../storage');

// Fallback guest user for seamless demo without requiring sign-in
const GUEST_USER = {
  id: 'guest_user_1',
  name: 'Cinema Explorer',
  email: 'explorer@cinemind.ai',
  status: 'active'
};

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = GUEST_USER;
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token || token === 'guest_token') {
    req.user = GUEST_USER;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = storage.findUserById(decoded.userId);
    req.user = user || GUEST_USER;
    next();
  } catch (err) {
    // Graceful fallback to guest user so the demo never fails with 401
    req.user = GUEST_USER;
    next();
  }
};
