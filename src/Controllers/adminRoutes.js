const express = require('express');
const router = express.Router();
const { getPendingMedecins, approveMedecin, disapproveMedecin } = require('../Service/approvingMedecinsService');
const { User, Medecin } = require('../models');
const { createAdminUser, desactiverCompteUtilisateur, getAllUsers, getGlobalUserCounts, getUserRegistrationPerMonth }  = require('../Service/adminService');

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

router.delete('/admin/medecins/:userId', async (req, res) => {
  const { userId } = req.params;
  const result = await disapproveMedecin(userId);
  res.status(result.success ? 200 : 500).json(result);
});

router.get('/admin/utilisateurs', async (req, res) => {
  const result = await getAllUsers();

  if (result.success) {
    res.status(200).json(result.users);
  } else {
    res.status(500).json({ message: result.message });
  }
});

router.put('/admin/users/:id/desactiver', async (req, res) => {
  const userId = req.params.id;

  const result = await desactiverCompteUtilisateur(userId);

  if (result.success) {
    res.status(200).json({ message: result.message });
  } else {
    res.status(400).json({ message: result.message });
  }
});

router.get('/admin/stats/global', async (req, res) => {
  const result = await getGlobalUserCounts();
  res.status(result.success ? 200 : 500).json(result);
});

router.get('/admin/stats/monthly', async (req, res) => {
  const result = await getUserRegistrationPerMonth();
  res.status(result.success ? 200 : 500).json(result);
});

module.exports = router;
