const express = require('express');
const router = express.Router();
const { Medecin } = require('../models');

const { createPrescription, 
        updatePrescription,
        getPrescriptionDetails,
        getIndicateursParSpecialite, 
        desactiverPrescription,
        activerPrescription } = require('../Service/prescriptionService');


router.post('/add-prescription/:patientId', async (req, res) => {
  const userId = req.session.user.id; 
      
    const medecin = await Medecin.findOne({ where: { UserId: userId } });
  
    if (!medecin) {
      return res.status(404).json({ message: "Médecin non trouvé pour cet utilisateur." });
    }
    const medecinId = medecin.id; 

  const { patientId } = req.params;
  const prescriptionDTO = req.body;

  const result = await createPrescription(medecinId, patientId, prescriptionDTO);
  res.status(result.success ? 201 : 400).json(result);
});


router.put('/modify-perscription/:prescriptionId', async (req, res) => {
  const { prescriptionId } = req.params;
  const updatedData = req.body;

  const result = await updatePrescription(prescriptionId, updatedData);
  res.status(result.success ? 200 : 400).json(result);
});


router.get('/get-details/:prescriptionId', async (req, res) => {
  const { prescriptionId } = req.params;

  const result = await getPrescriptionDetails(prescriptionId);
  res.status(result.success ? 200 : 404).json(result);
});


router.put('/desactiver-prescription/:id', async (req, res) => {
  const { id } = req.params;

  const result = await desactiverPrescription(id);

  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(404).json(result);
  }
});

router.put('/activer-prescription/:id', async (req, res) => {
  const { id } = req.params;

  const result = await activerPrescription(id);

  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(404).json(result);
  }
});

router.get('/indicateurs-par-specialite/:medecinId', getIndicateursParSpecialite);

module.exports = router;
