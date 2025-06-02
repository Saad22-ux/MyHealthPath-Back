const express = require('express');
const router = express.Router();
const { createJournalSante, upsertJournalSante } = require('../Service/journalSanteService');

router.post('/journal/:patientId', async (req, res) => {
  const patientId = req.params.patientId;
  const result = await createJournalSante(patientId, req.body);
  res.status(result.success ? 201 : 500).json(result);
});

router.put('/journal/:patientId', async (req, res) => {
  const { patientId } = req.params;
  const journalData = req.body;

  const result = await upsertJournalSante(patientId, journalData);
  res.status(result.success ? 200 : 500).json(result);
});

module.exports = router;
