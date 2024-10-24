const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
		const user = await User.findById(decoded._id);
    
		if (user && user.role != decoded.role) {
			return res.status(401).json();
		}

		if (user && user.status == 'blocked') {
      return res.status(401).json({ message: 'User is blocked' });
    }
    req.user = decoded;
    next();
  });
};

module.exports = authMiddleware
