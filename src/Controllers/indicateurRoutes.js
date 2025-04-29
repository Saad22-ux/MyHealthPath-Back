const express = require('express');
const router = express.Router();
const { ajouterIndicateur, supprimerIndicateur } = require('../Service/indicateurService');

router.post('/get-patients/:id/indicateurs', async (req,res)=>{
    const patientId = req.params.id;
    const indicateurDTO = req.body;

    const result = await ajouterIndicateur(indicateurDTO, patientId);

    if(result.success){
        res.status(201).json(result.data);
    }
    else{
        res.status(400).json({ message: result.message });
    }
});

router.delete('/indicateurs/:indicateurId', async (req,res)=>{
    const indicateurId = req.params.indicateurId;

    const result = await supprimerIndicateur(indicateurId);

    if(result.success){
        res.status(200).json({ message: result.message });
    }
    else{
        res.status(404).json({ message: result.message });
    }
});


module.exports = router;