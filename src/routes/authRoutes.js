const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');


router.post('/login', async (req, res) => {
  return auth.logUser(req,res);
});


router.post('/logout', (req, res) => {
  return auth.logoutUser(req,res);
});


module.exports = router;
