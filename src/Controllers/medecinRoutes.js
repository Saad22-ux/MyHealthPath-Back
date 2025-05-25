const express = require('express');
const router = express.Router();
const { getMedecinProfile } = require('../Service/medecinService');

router.get('/:id/profile', async (req, res) => {
  const { id } = req.params;
  const result = await getMedecinProfile(id);

  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(404).json({ message: result.message });
  }
});

module.exports = router;