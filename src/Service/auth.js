const bcrypt = require('bcrypt');
const User = require('../models/User');

  
  async function logUser(req,res){
    const { email, password } = req.body;


      try {
        
        
        const user = await User.findOne({ where: { email } });
    
        if (!user) {
          return res.status(401).json({ message: 'Invalid email or password ' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isApproved) {
          return res.status(403).json({ message: 'Account not approved yet! Wait for admin approval.' });
        }

        
    
        req.session.user = {
          id: user.id,
          email: user.email,
          role: user.role
        };
        
        res.status(200).json({ message: 'Logged in successfully', role: user.role});
      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    }
    
  function logoutUser(req,res){
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  }


  module.exports = {
    logUser,
    logoutUser
  };
  