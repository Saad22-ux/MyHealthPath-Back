// middleware/auth.js

const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized: Please log in first' });
    }
    next();
  };
  
  module.exports = isAuthenticated;
  