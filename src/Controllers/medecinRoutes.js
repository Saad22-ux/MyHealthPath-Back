const express = require('express');
const router = express.Router();
const { Medecin } = require('../models');
const upload = require('../middlewares/uploadPhoto');
const { getMedecinProfile, updateMedecinProfile, getMoyennesIndicateursParMedecin  } = require('../Service/medecinService');

router.get('/profileMedecin', async (req, res) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Utilisateur non authentifié.' });
    }
  
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

router.put('/profileMedecin/update', upload.single('photo'), async (req,res)=>{
  if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Utilisateur non authentifié.' });
    }
  
    const userId = req.session.user.id;
    
    const medecin = await Medecin.findOne({ where: { UserId: userId } });
  
    if (!medecin) {
      return res.status(404).json({ message: "Médecin non trouvé pour cet utilisateur." });
    }
    const medecinId = medecin.id;
    const updatedData = req.body;

    if (req.file) {
      updatedData.photo = `uploads/photos/${req.file.filename}`;
    }

    const result = await updateMedecinProfile(medecinId, updatedData);

    if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(400).json(result);
  }
});

router.get('/statistiques/indicateurs/moyennes', async (req, res) => {
  try {
    /* ── Vérif session ─────────────────────────────────────────── */
    const user = req.session?.user;
    if (!user) return res.status(401).json({ message: 'Utilisateur non authentifié.' });

    /* ── Trouver le médecin lié à cet user ─────────────────────── */
    const medecin = await Medecin.findOne({ where: { UserId: user.id } });
    if (!medecin)
      return res.status(404).json({ message: 'Médecin non trouvé pour cet utilisateur.' });

    /* ── Calcul des moyennes ───────────────────────────────────── */
    const result = await getMoyennesIndicateursParMedecin(medecin.id);
    return res.status(result.success ? 200 : 500).json(result);
  } catch (err) {
    console.error('Route /statistiques/indicateurs/moyennes :', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});


module.exports = router;