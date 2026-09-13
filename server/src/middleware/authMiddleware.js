const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the JWT sent in the Authorization header and attaches the user to req.user
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id);

      if (!req.user || !req.user.isActive) {
        res.status(401);
        throw new Error('Not authorized, user not found or disabled');
      }

      return next();
    } catch (error) {
      res.status(401);
      return next(new Error('Not authorized, token invalid or expired'));
    }
  }

  res.status(401);
  return next(new Error('Not authorized, no token provided'));
};

module.exports = { protect };
