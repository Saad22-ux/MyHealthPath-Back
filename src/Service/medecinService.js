const { Medecin, User} = require('../models');
const bcrypt = require('bcrypt');

async function createMedecin(medecinDTO) {
  try {
    const existingUser = await User.findOne({ where: { email: medecinDTO.email } });
    if (existingUser) {
      return { success: false, message: 'Email déjà utilisé.' };
    }

    const newUser = await User.create({
      fullName: medecinDTO.fullName,
      email: medecinDTO.email,
      password: medecinDTO.password,
      telephone: medecinDTO.telephone,
      adress: medecinDTO.adress,
      role: 'medecin',
      isApproved: false 
    });

    const newMedecin = await Medecin.create({
      specialite: medecinDTO.specialite,
      numeroIdentification: medecinDTO.numeroIdentification,
      UserId: newUser.id
    });

    return {
      success: true,
      message: 'Médecin enregistré avec succès.',
      medecin: newMedecin
    };

  } catch (err) {
    console.error('Erreur lors de l\'enregistrement du médecin :', err);
    return { success: false, message: 'Erreur serveur.' };
  }
}

async function getMedecinProfile(medecinId) {
  try {
    const medecin = await Medecin.findByPk(medecinId, {
      attributes: ['id', 'specialite', 'numeroIdentification', 'UserId']
    });

    if (!medecin) {
      return { success: false, message: 'Médecin introuvable.' };
    }

    const user = await User.findByPk(medecin.UserId, {
      attributes: ['id', 'fullName', 'email']
    });

    return {
      success: true,
      data: {
        id: medecin.id,
        specialite: medecin.specialite,
        numeroIdentification: medecin.numeroIdentification,
        UserId: medecin.UserId,
        fullName: user?.fullName,
        email: user?.email
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du profil médecin :', error);
    return { success: false, message: 'Erreur serveur.' };
  }
}

async function updateMedecinProfile(medecinId, updatedData){
  try {
    const medecin = await Medecin.findByPk(medecinId, {
      include: [{ model: User }]
    });

    if (!medecin) {
      return { success: false, message: "Médecin non trouvé" };
    }

    if (updatedData.specialite) medecin.specialite = updatedData.specialite;
    if (updatedData.numeroIdentification) medecin.numeroIdentification = updatedData.numeroIdentification;

    if (updatedData.fullName) medecin.User.fullName = updatedData.fullName;
    if (updatedData.email) medecin.User.email = updatedData.email;
     if (updatedData.telephone) medecin.User.telephone = updatedData.telephone;
    if (updatedData.adress) medecin.User.adress = updatedData.adress;

    await medecin.save();
    await medecin.User.save();
    
    return { success: true, message: "Profil mis à jour avec succès" };

}catch (error) {
    console.error("Erreur lors de la mise à jour du profil du médecin :", error);
    return { success: false, message: "Erreur serveur" };
  }
}

module.exports = { createMedecin, getMedecinProfile, updateMedecinProfile };