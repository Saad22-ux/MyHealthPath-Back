const express = require('express');
const router = express.Router();
const { getPendingMedecins, approveMedecin } = require('../Service/approvingMedecinsService');
const { User, Medecin } = require('../models');
const { createAdminUser }  = require('../Service/adminService');

router.post('/create-admin', async (req, res) => {
    const adminDTO = req.body;
  
    try {
      const admin = await createAdminUser(adminDTO);
      res.status(201).json(admin);
    } catch (error) {
      console.error('Failed to create admin:', error);
      res.status(500).json({ message: 'Failed to create admin' });
    }
  });

router.get('/pending-medecins', async (req, res) => {
    const result = await getPendingMedecins();

    if(result.success){
        res.status(200).json(result.data);
    }
    else{
        res.status(500).json({message: result.message});
    }
});

router.post('/approve-medecin/:id', async (req, res) => {
    const result = await approveMedecin(req.params.id);

    if(result.success){
        res.status(200).json({message: result.message, id: result.id});
    }

    else{
        res.status(404).json({message: result.message});
    }

  });

module.exports = router;
