const express = require('express');
const router = express.Router();
const { createPatient,getPatients,suspendrePatient,activerPatient,getPatientDetails } = require('../Service/patientService');

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

router.get('/get-patients',async (req,res)=>{
  const medecinId = req.session.user.id;
  const result = await getPatients(medecinId);

  if(result.success){
    res.status(200).json({message: result.message, data: result.data});
  }
  else{
    res.status(404).json({message: result.message});
  }
});

router.post('/get-patients/:id/suspendre',async (req,res)=>{
  const patientId = req.params.id;
  const result = await suspendrePatient(patientId);

  if (result.success) {
    res.status(200).json({ message: result.message });
  } else {
    res.status(400).json({ message: result.message });
  }
});

router.post('/get-patients/:id/activate',async (req,res)=>{
  const patientId = req.params.id;
  const result = await activerPatient(patientId);

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

module.exports = router;
