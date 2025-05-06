const express = require('express');
const router = express.Router();
const { createJournalSante } = require('../Service/journalSanteService');

router.post('/journal/:patientId', async (req, res) => {
  const patientId = req.params.patientId;
  const result = await createJournalSante(patientId, req.body);
  res.status(result.success ? 201 : 500).json(result);
});

module.exports = router;
