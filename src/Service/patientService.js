const { User, Medecin, Patient, Prescription, Medicament, Indicateur, Patient_Medecin_Link, SuiviMedicament, SuiviIndicateur, JournalSante } = require('../models');
const { sendPatientCredentials } = require('../utils/sendMail');
const validatePatient = require('../formValidator/patientFormValidator'); 
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { userInfo } = require('os');
const fs = require('fs');

async function createPatient(patientDTO, medecinId) {
  try {
    let existingUser = null;

    if (patientDTO.email) {
      existingUser = await User.findOne({ where: { email: patientDTO.email }, include: Patient });
    }

    if (!existingUser && patientDTO.cin) {
      existingUser = await User.findOne({ where: { cin: patientDTO.cin }, include: Patient });
    }

    if (existingUser) {
      const existingPatient = existingUser.Patient;

      if (!existingPatient) {
        return {
          success: false,
          message: "This user exists but is not registered as a patient.",
        };
      }

      const link = await Patient_Medecin_Link.findOne({
        where: {
          id_patient: existingPatient.id,
          id_medecin: medecinId,
        },
      });

      if (link) {
        return {
          success: true,
          message: 'This patient is already linked to you.',
          patient: { id: existingUser.id, email: existingUser.email },
        };
      }

      await Patient_Medecin_Link.create({
        id_patient: existingPatient.id,
        id_medecin: medecinId,
        isSubscribed: true,
      });

      return {
        success: true,
        message: 'Existing patient found. Link created with the doctor.',
        patient: { id: existingUser.id, email: existingUser.email },
      };
    }

    const errors = validatePatient(patientDTO);
    if (Object.keys(errors).length > 0) {
      return { success: false, message: 'Validation failed.', errors };
    }

    const generatedPassword = crypto.randomBytes(6).toString('hex');

    const newUser = await User.create({
      fullName: patientDTO.fullName,
      email: patientDTO.email,
      password: generatedPassword,
      telephone: patientDTO.telephone,
      adress: patientDTO.adress,
      cin: patientDTO.cin,
      role: 'patient',
      isApproved: true,
    });

    const newPatient = await Patient.create({
      date_naissance: patientDTO.date_naissance,
      genre: patientDTO.genre,
      UserId: newUser.id,
      taille: patientDTO.taille,
      poids: patientDTO.poids
    });

    await Patient_Medecin_Link.create({
      id_patient: newPatient.id,
      id_medecin: medecinId,
      isSubscribed: true,
    });

    await sendPatientCredentials(newUser.email, newUser.fullName, generatedPassword);

    return {
      success: true,
      message: 'New patient created and linked to the doctor.',
      patient: { id: newUser.id, email: newUser.email },
    };

  } catch (err) {
    console.error('Error while creating patient:', err);
    return { success: false, message: 'Server error' };
  }
}

async function getPatients(medecinId){
  try {

    const patients = await Patient.findAll({
      include: [
        {
          model: Medecin,
          where: { id: medecinId }, 
          through: {
            attributes: ['isSubscribed', 'state'], 
          },
        },
        {
          model: User,
          attributes: ['fullName', 'email'],
        },
      ],
    });
    
    return {success: true, data: patients, message: 'Patients fetched successfully'};
  } catch (error) {
    console.error('Error fetching patients:', error);
    return { success: false, message: 'Server error' };
  }
}

async function suspendrePatient(patientId, medecinId) {
  try {

    const patient = await Patient.findByPk(patientId, {
      include: {
        model: User
      }
    });

    if (!patient || !patient.User) {
      return { success: false, message: 'Patient not found' };
    }

    const link = await Patient_Medecin_Link.findOne({
      where: {
        id_patient: patientId,
        id_medecin: medecinId
      }
    });

    if (!link) {
      return { success: false, message: 'Link between this patient and doctor not found' };
    }

    await link.update({ isSubscribed: false });

    return { success: true, message: 'Patient access to this doctor has been suspended', data: link.isSubscribed };
  } catch (error) {
    console.error('Error suspending patient:', error);
    return { success: false, message: 'Server error' };
  }
}

async function activerPatient(patientId, medecinId) {
  try {

    const patient = await Patient.findByPk(patientId, {
      include: {
        model: User
      }
    });

    if (!patient || !patient.User) {
      return { success: false, message: 'Patient not found' };
    }

    const link = await Patient_Medecin_Link.findOne({
      where: {
        id_patient: patientId,
        id_medecin: medecinId
      }
    });

    if (!link) {
      return { success: false, message: 'Link between this patient and doctor not found' };
    }

    await link.update({ isSubscribed: true });

    return { success: true, message: 'Patient access to this doctor has been activated', data: link };
  } catch (error) {
    console.error('Error activating patient:', error);
    return { success: false, message: 'Server error' };
  }
}

async function getPatientDetails(patientId) {
  try {
    const patient = await Patient.findOne({
      where: { id: patientId },
      include: [
        {
          model: User
        },
        {
          model: Prescription,
          include: [
        {
          model: Medecin,
          include: [User] 
        }
          ]
        },
        {
          model: Medecin
        },
        {
          model: Medicament, 
        },
        {
          model: Indicateur, 
        }
      ]
    });

    if (!patient) return { success: false, message: "Patient not found" };

    return { success: true, data: patient };
  } catch (err) {
    console.error("Error fetching patient details:", err);
    return { success: false, message: "Server error" };
  }
}

const getPatientStatistics = async (patientId, prescriptionId) => {
  try {
    const patient = await Patient.findByPk(patientId, {
      include: [
        {
          model: User,
          attributes: ['fullName']  
        }
      ]
    });

    const fullName = patient?.User?.fullName || 'Unknown';

    const suiviMedicamentStats = await SuiviMedicament.findAll({
      where: { '$JournalSante.PatientId$': patientId },
      include: [
        {
          model: Medicament,
          attributes: ['name', 'dose', 'frequency'],
        },
        {
          model: JournalSante,
          where: { PatientId: patientId, PrescriptionId: prescriptionId},
          attributes: ['date'],
        },
      ],
    });

    
    const suiviIndicateurStats = await SuiviIndicateur.findAll({
      where: { '$JournalSante.PatientId$': patientId },
      include: [
        {
          model: Indicateur,
        },
        {
          model: JournalSante,
          where: { PatientId: patientId ,PrescriptionId: prescriptionId},
          attributes: ['date'],
        },
      ],
    });

    const medicamentsPris = suiviMedicamentStats.filter(item => item.pris === true).length;
    const indicateursMesures = suiviIndicateurStats.filter(item => item.mesure === true).length;

    return {
      medicamentsPris,
      indicateursMesures,
      suiviMedicamentStats,
      suiviIndicateurStats,
      patient: {
        id: patient?.id,
        fullName: fullName
      }
    };
  } catch (error) {
    console.error('Error retrieving statistics:', error);
    throw new Error('Error retrieving statistics.');
  }
};

async function updatePatientProfileParMedecin(patientId, updatedFields) {
  try {
    const patient = await Patient.findByPk(patientId);

    if (!patient) {
      return { success: false, message: 'Patient not found' };
    }

    const user = await User.findByPk(patient.UserId);

    const patientFields = {};
    const userFields = {};

    if ('genre' in updatedFields) patientFields.genre = updatedFields.genre;
    if ('date_naissance' in updatedFields) patientFields.date_naissance = updatedFields.date_naissance;
    if ('taille' in updatedFields) patientFields.taille = updatedFields.taille;
    if ('poids' in updatedFields) patientFields.poids = updatedFields.poids;
    if ('photo' in updatedFields) patientFields.photo = updatedFields.photo;

    if ('fullName' in updatedFields) userFields.fullName = updatedFields.fullName;
    if ('email' in updatedFields) userFields.email = updatedFields.email;
    if ('cin' in updatedFields) patientFields.cin = updatedFields.cin;
    if ('telephone' in updatedFields) userFields.telephone = updatedFields.telephone;
    if ('adress' in updatedFields) userFields.adress = updatedFields.adress;
    if ('password' in updatedFields && updatedFields.password.trim()) {
      const hashedPassword = await bcrypt.hash(updatedFields.password, 10);
      userFields.password = hashedPassword;
    }

    const updatedPatient = await patient.update(patientFields);

    let updatedUser = null;
    if (user) {
      updatedUser = await user.update(userFields);
    }

    return {
      success: true,
      message: 'Patient profile updated successfully',
      patient: updatedPatient,
      user: updatedUser,
    };
  } catch (error) {
    console.error('Error updating patient profile :', error);
    return { success: false, message: 'Server error' };
  }
}

async function updatePatientProfile(patientId, updatedFields, photoFile) {
  try {
    const patient = await Patient.findByPk(patientId);

    if (!patient) {
      return { success: false, message: 'Patient not found' };
    }

    const user = await User.findByPk(patient.UserId);
    if (!user) return { success: false, message: 'User not found' };

    if (photoFile) {
      const uploadDir = path.join(__dirname, '..', 'uploads', 'photos');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const fileName = `${Date.now()}_${photoFile.originalname}`;
      const finalPath = path.join(uploadDir, fileName);
      fs.writeFileSync(finalPath, photoFile.buffer);

      updatedFields.photo = `uploads/photos/${fileName}`;
    }

    const patientFields = {};
    const userFields = {};

    if ('genre' in updatedFields) patientFields.genre = updatedFields.genre;
    if ('date_naissance' in updatedFields) patientFields.date_naissance = updatedFields.date_naissance;
    if ('taille' in updatedFields) patientFields.taille = updatedFields.taille;
    if ('poids' in updatedFields) patientFields.poids = updatedFields.poids;

    if ('fullName' in updatedFields) userFields.fullName = updatedFields.fullName;
    if ('email' in updatedFields) userFields.email = updatedFields.email;
    if ('cin' in updatedFields) patientFields.cin = updatedFields.cin;
    if ('telephone' in updatedFields) userFields.telephone = updatedFields.telephone;
    if ('adress' in updatedFields) userFields.adress = updatedFields.adress;
    if ('photo' in updatedFields) patientFields.photo = updatedFields.photo;
    if ('password' in updatedFields && updatedFields.password.trim()) {
      const hashedPassword = await bcrypt.hash(updatedFields.password, 10);
      userFields.password = hashedPassword;
    }

    const updatedPatient = await patient.update(patientFields);

    let updatedUser = null;
    if (user) {
      updatedUser = await user.update(userFields);
    }

    return {
      success: true,
      message: 'Patient profile updated successfully',
      patient: updatedPatient,
      user: updatedUser,
    };
  } catch (error) {
    console.error('Error updating patient profile :', error);
    return { success: false, message: 'Server error' };
  }
}

async function getPatientProfile(patientId) {
  try {
    const patient = await Patient.findByPk(patientId, {
      attributes: ['id', 'genre', 'date_naissance', 'taille', 'poids', 'UserId']
    });

    if (!patient) {
      return { success: false, message: 'Patient not found' };
    }

    const user = await User.findByPk(patient.UserId, {
      attributes: ['id', 'fullName', 'email', 'telephone', 'adress', 'photo', 'cin']
    });

    return {
      success: true,
      data: {
        id: patient.id,
        genre: patient.genre,
        date_naissance: patient.date_naissance,
        taille: patient.taille,
        poids: patient.poids,
        photo: patient.photo,
        UserId: patient.UserId,
        fullName: user?.fullName,
        cin: user?.cin,
        email: user?.email,
        telephone: user?.telephone,
        adress: user?.adress
      }
    };
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    return { success: false, message: 'Server error' };
  }
}

async function findPatientByCIN(cin) {
  try {
    if (!cin) {
      return { success: false, message: 'CIN is required.' };
    }

    const patient = await Patient.findOne({
      include: {
        model: User,
        where: { cin },
        attributes: ['id', 'cin', 'fullName', 'email', 'telephone', 'adress']
      }
    });

    if (!patient) {
      return { success: false, message: 'Patient not found.' };
    }

    return {
      success: true,
      patient: {
        id: patient.id,
        genre: patient.genre,
        date_naissance: patient.date_naissance,
        taille: patient.taille,
        poids: patient.poids,
        user: patient.User
      }
    };

  } catch (error) {
    console.error('Error searching patient by CIN:', error);
    return { success: false, message: 'Server error' };
  }
}

async function linkMedecinToPatient(cin, medecinId) {
  try {
    if (!cin || !medecinId) {
      return { success: false, message: 'CIN and medecinId are required.' };
    }

    const user = await User.findOne({ where: { cin } });

    if (!user) {
      return { success: false, message: 'Patient user not found.' };
    }

    const patient = await Patient.findOne({ where: { UserId: user.id } });

    if (!patient) {
      return { success: false, message: 'Patient not found.' };
    }

    const medecin = await Medecin.findByPk(medecinId);
    if (!medecin) {
      return { success: false, message: 'Medecin not found.' };
    }

    const existingLink = await Patient_Medecin_Link.findOne({
      where: {
        id_patient: patient.id,
        id_medecin: medecinId,
      },
    });

    if (existingLink) {
      return { success: false, message: 'Link already exists between this medecin and patient.' };
    }

    await Patient_Medecin_Link.create({
      id_patient: patient.id,
      id_medecin: medecinId,
      isSubscribed: true,
      state: 'Normal',
    });

    return {
      success: true,
      message: 'Medecin linked to patient successfully.',
    };
  } catch (error) {
    console.error('Error linking medecin to patient:', error);
    return { success: false, message: 'Server error.' };
  }
}






module.exports = { createPatient,
                  getPatients,
                  suspendrePatient,
                  activerPatient,
                  getPatientDetails,
                  getPatientStatistics,
                  updatePatientProfileParMedecin,
                  updatePatientProfile,
                  getPatientProfile,
                  findPatientByCIN,
                  linkMedecinToPatient
                };
