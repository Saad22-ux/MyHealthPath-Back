const { Medecin, User} = require('../models');
const bcrypt = require('bcrypt');
const fs = require('fs');

async function createMedecin(medecinDTO, photoFile) {
  try {
    const existingUser = await User.findOne({ where: { email: medecinDTO.email } });
    if (existingUser) {
      return { success: false, message: 'Email already in use.' };
    }

    let photoPath = null;
    if (photoFile) {
      const uploadDir = path.join(__dirname, '..', 'uploads', 'photos');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const fileName = `${Date.now()}_${photoFile.originalname}`;
      const finalPath = path.join(uploadDir, fileName);
      fs.writeFileSync(finalPath, photoFile.buffer);
      photoPath = `uploads/photos/${fileName}`;
    }

    const newUser = await User.create({
      fullName: medecinDTO.fullName,
      email: medecinDTO.email,
      password: medecinDTO.password,
      telephone: medecinDTO.telephone,
      adress: medecinDTO.adress,
      cin: medecinDTO.cin,
      photo: photoPath ?? null,
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
      message: 'Doctor successfully registered.',
      medecin: newMedecin
    };

  } catch (err) {
    console.error('Error while registering doctor:', err);
    return { success: false, message: 'Server error.' };
  }
}

async function getMedecinProfile(medecinId) {
  try {
    const medecin = await Medecin.findByPk(medecinId, {
      attributes: ['id', 'specialite', 'numeroIdentification', 'UserId']
    });

    if (!medecin) {
      return { success: false, message: 'Doctor not found.' };
    }

    const user = await User.findByPk(medecin.UserId, {
      attributes: ['id', 'fullName', 'email', 'adress', 'telephone', 'photo', 'cin']
    });

    return {
      success: true,
      data: {
        id: medecin.id,
        specialite: medecin.specialite,
        numeroIdentification: medecin.numeroIdentification,
        UserId: medecin.UserId,
        fullName: user?.fullName,
        adress: user?.adress,
        telephone: user?.telephone,
        email: user?.email,
        photo: user?.photo,
        cin: user?.cin
      }
    };
  } catch (error) {
    console.error('Error while retrieving doctor profile:', error);
    return { success: false, message: 'Server error.' };
  }
}

async function updateMedecinProfile(medecinId, updatedData, photoFile){
  try {
    const medecin = await Medecin.findByPk(medecinId, {
      include: [{ model: User }]
    });

    if (!medecin || !medecin.User) {
      return { success: false, message: "Doctor not found." };
    }

    if (photoFile) {
      const uploadDir = path.join(__dirname, '..', 'uploads', 'photos');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const fileName = `${Date.now()}_${photoFile.originalname}`;
      const finalPath = path.join(uploadDir, fileName);
      fs.writeFileSync(finalPath, photoFile.buffer);
      updatedData.photo = `uploads/photos/${fileName}`;
    }

    const medecinFields = {};
    if (updatedData.specialite) medecinFields.specialite = updatedData.specialite;
    if (updatedData.numeroIdentification) medecinFields.numeroIdentification = updatedData.numeroIdentification;

    const userFields = {};
    if (updatedData.fullName) userFields.fullName = updatedData.fullName;
    if (updatedData.email) userFields.email = updatedData.email;
    if (updatedData.telephone) userFields.telephone = updatedData.telephone;
    if (updatedData.adress) userFields.adress = updatedData.adress;
    if (updatedData.photo) userFields.photo = updatedData.photo;
    if (updatedData.cin) userFields.cin = updatedData.cin;
    if (updatedData.password && updatedData.password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(updatedData.password, 10);
      userFields.password = hashedPassword;
    }

    const updatedMedecin = await medecin.update(medecinFields);
    const updatedUser = await medecin.User.update(userFields);
    
    return {
      success: true,
      message: 'Doctor profile updated successfully.',
      medecin: updatedMedecin,
      user: updatedUser,
    };

}catch (error) {
    console.error("Error while updating doctor profile:", error);
    return { success: false, message: "Erreur serveur" };
  }
}

module.exports = { createMedecin, getMedecinProfile, updateMedecinProfile };