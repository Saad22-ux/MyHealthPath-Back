const express = require('express');
const router = express.Router();
const {logUser, logoutUser} = require('../Service/auth');


router.post('/login', async (req, res) => {
  await logUser(req,res);
});


router.post('/logout', (req, res) => {
  logoutUser(req,res);
});


module.exports = router;
