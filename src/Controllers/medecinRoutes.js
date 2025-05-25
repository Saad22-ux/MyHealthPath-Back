const express = require('express');
const router = express.Router();
const { Medecin } = require('../models');
const { getMedecinProfile } = require('../Service/medecinService');

router.get('/profileMedecin', async (req, res) => {
    const userId = req.session.user.id; 
    const medecin = await Medecin.findOne({ where: { UserId: userId } });
  
    if (!medecin) {
      return res.status(404).json({ message: "Médecin non trouvé pour cet utilisateur." });
    }
  
    const medecinId = medecin.id;
  const result = await getMedecinProfile(medecinId);

  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(404).json({ message: result.message });
  }
});

module.exports = router;