const express = require('express');
const router = express.Router();
const { ajouterMedicament,supprimerMedicament } = require('../Service/medicamentService');

router.post('/get-patients/:id/medicaments', async (req, res) => {
  const patientId = req.params.id;
  const medicamentDTO = req.body;

  const result = await ajouterMedicament(medicamentDTO, patientId);

  if (result.success) {
    res.status(201).json(result.data);
  } else {
    res.status(400).json({ message: result.message });
  }
});

router.delete('/medicaments/:medicamentId', async (req,res)=>{
  const medicamentId = req.params.medicamentId;

  const result = await supprimerMedicament(medicamentId);

  if(result.success){
    res.status(200).json({ message: result.message });
  }
  else{
    res.status(404).json({ message: result.message });
  }
});

module.exports = router;
