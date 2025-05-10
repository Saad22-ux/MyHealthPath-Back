const express = require('express');
const router = express.Router();
const { createPatient,
        getPatients,
        suspendrePatient,
        activerPatient,
        getPatientDetails, 
        getPatientStatistics,
        updatePatientProfile,
        getPatientDashboard } = require('../Service/patientService');
const { Medecin } = require('../models');

router.post('/create-patient', async (req, res) => {
  const userId = req.session.user.id; 
    
  const medecin = await Medecin.findOne({ where: { UserId: userId } });

  if (!medecin) {
    return res.status(404).json({ message: "Médecin non trouvé pour cet utilisateur." });
  }

  const patientDTO = req.body;
  const medecinId = medecin.id;

  const result = await createPatient(patientDTO,medecinId);

  if (result.success) {
    res.status(201).json({ message: result.message, patient: result.patient });
  } else {
    res.status(500).json({ message: result.message });
  }
});

router.get('/get-patients', async (req, res) => {
  const userId = req.session.user.id; 
    
  const medecin = await Medecin.findOne({ where: { UserId: userId } });

  if (!medecin) {
    return res.status(404).json({ message: "Médecin non trouvé pour cet utilisateur." });
  }

  const medecinId = medecin.id;

  const result = await getPatients(medecinId);

  if (result.success) {
    res.status(200).json({ message: result.message, data: result.data });
  } else {
    res.status(404).json({ message: result.message });
  }
});

router.post('/get-patients/:id/suspendre',async (req,res)=>{
  const patientId = req.params.id;
  const userId = req.session.user.id; 
    
  const medecin = await Medecin.findOne({ where: { UserId: userId } });

  if (!medecin) {
    return res.status(404).json({ message: "Médecin non trouvé pour cet utilisateur." });
  }

  const medecinId = medecin.id;

  const result = await suspendrePatient(patientId,medecinId);

  if (result.success) {
    res.status(200).json({ message: result.message });
  } else {
    res.status(400).json({ message: result.message });
  }
});

router.post('/get-patients/:id/activate',async (req,res)=>{
  const patientId = req.params.id;
  const userId = req.session.user.id;

  const medecin = await Medecin.findOne({ where: { UserId: userId } });

  if (!medecin) {
    return res.status(404).json({ message: "Médecin non trouvé pour cet utilisateur." });
  }

  const medecinId = medecin.id;

  const result = await activerPatient(patientId,medecinId);

  if (result.success) {
    res.status(200).json({ message: result.message });
  } else {
    res.status(400).json({ message: result.message });
  }
});


router.get('/get-patients/:id', async (req, res) => {
  const patientId = req.params.id;

  const result = await getPatientDetails(patientId);

  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(404).json({ message: result.message });
  }
});

router.get('/get-patients/:patientId/statistiques', async (req, res) => {
  try {
    const { patientId } = req.params;
    const stats = await getPatientStatistics(patientId);

    res.status(200).json(stats);
  } catch (error) {
    console.error('Erreur lors de l\'appel des statistiques du patient:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques.' });
  }
});

router.put('/get-patients/:id/update', async (req, res) => {
  const { id } = req.params;
  const updatedFields = req.body;

  const result = await updatePatientProfile(id, updatedFields);

  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(400).json(result);
  }
});

router.get('/dashboard/:id', async (req,res) => {
  const { id } = req.params;
  const result = await getPatientDashboard(id);

  if (result.success) {
    res.status(200).json(result.dashboard);
  } else {
    res.status(404).json({ error: result.message });
  }
});

module.exports = router;
