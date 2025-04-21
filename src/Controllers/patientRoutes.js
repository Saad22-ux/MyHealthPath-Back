const express = require('express');
const router = express.Router();
const { createPatient } = require('../Service/patientService');

router.post('/create-patient', async (req, res) => {
  const medecinId = req.session.user.id;
  const patientDTO = req.body;

  const result = await createPatient(patientDTO,medecinId);

  if (result.success) {
    res.status(201).json({ message: result.message, patient: result.patient });
  } else {
    res.status(500).json({ message: result.message });
  }
});

module.exports = router;
