const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/auth');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // adjust path if needed

// ✅ LOGIN ROUTE
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(email,password);
  try {
    // 1. Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email ' });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // 3. Store user info in session (don't store password)
    req.session.user = {
      id: user.id,
      email: user.email,
    };

    res.json({ message: 'Logged in successfully', user: req.session.user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ LOGOUT ROUTE
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// ✅ CHECK SESSION
router.get('/me', (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.json({ authenticated: false });
  }
});

router.get('/dashboard', isAuthenticated, (req, res) => {
    res.json({ message: `Welcome ${req.session.user.email}!` });
});


module.exports = router;
