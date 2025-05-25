const { Medecin, User} = require('../models');
const bcrypt = require('bcrypt');

async function createMedecin(medecinDTO){
    try {
        const existingUser = await User.findOne({ where: { email: medecinDTO.email } });
        if (existingUser) {
            return { success: false, message: 'Email already in use!' };
        }


        const newUser = await User.create({
            fullName: medecinDTO.fullName,
            email: medecinDTO.email,
            password: medecinDTO.password,
            role: 'medecin'
        });

        const newMedecin = await Medecin.create({
            specialite: medecinDTO.specialite,
            UserId: newUser.id
        });

        return {
            success: true,
            message: 'Médecin registered successfully!',
            medecin: newMedecin};

    } catch (err) {
        console.error('Error in register middleware:', err);
        return { success: false, message: err};
    }
}

async function getMedecinProfile(medecinId) {
  try {
    const medecin = await Medecin.findByPk(medecinId, {
      attributes: ['id', 'specialite', 'UserId']
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
    if (updatedData.fullName) medecin.User.fullName = updatedData.fullName;
    if (updatedData.email) medecin.User.email = updatedData.email;

    await medecin.save();
    await medecin.User.save();
    
    return { success: true, message: "Profil mis à jour avec succès" };

}catch (error) {
    console.error("Erreur lors de la mise à jour du profil du médecin :", error);
    return { success: false, message: "Erreur serveur" };
  }
}

module.exports = { createMedecin, getMedecinProfile, updateMedecinProfile };