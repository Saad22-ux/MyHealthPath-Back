const { User, Medecin, Patient, Prescription, Medicament, Indicateur, Patient_Medecin_Link, SuiviMedicament, SuiviIndicateur, JournalSante } = require('../models');
const { sendPatientCredentials } = require('../utils/sendMail');
const validatePatient = require('../formValidator/patientFormValidator'); 
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { userInfo } = require('os');

async function createPatient(patientDTO, medecinId) {
  try {
    const errors = validatePatient(patientDTO);
    if (Object.keys(errors).length > 0) {
      return { success: false, message: 'Validation failed', errors };
    }

    const existingUser = await User.findOne({ where: { email: patientDTO.email }, include: Patient });
    
    if (existingUser) {
      const existingPatient = existingUser.Patient;

      if (!existingPatient) {
        return { success: false, message: 'This user exists but is not registered as a patient!' };
      }

      
      const existingLink = await Patient_Medecin_Link.findOne({
        where: {
          id_patient: existingPatient.id,
          id_medecin: medecinId,
        },
      });

      if (existingLink) {
        return { success: false, message: 'Patient already linked to this doctor!' };
      }

      
      await Patient_Medecin_Link.create({
        id_patient: existingPatient.id,
        id_medecin: medecinId,
        isSubscribed: true,
      });

      return {
        success: true,
        message: 'Existing patient linked to doctor successfully',
        patient: { id: existingUser.id, email: existingUser.email },
      };
    }

    
    const generatedPassword = crypto.randomBytes(6).toString('hex');

    const newUser = await User.create({
      fullName: patientDTO.fullName,
      email: patientDTO.email,
      password: generatedPassword,
      role: 'patient',
      isApproved: true,
    });

    const newPatient = await Patient.create({
      date_naissance: patientDTO.date_naissance,
      genre: patientDTO.genre,
      UserId: newUser.id,
    });

    await Patient_Medecin_Link.create({
      id_patient: newPatient.id,
      id_medecin: medecinId,
      isSubscribed: true,
    });

    await sendPatientCredentials(newUser.email, newUser.fullName, generatedPassword);

    return {
      success: true,
      message: 'Patient created and linked successfully',
      patient: { id: newUser.id, email: newUser.email },
    };
  } catch (err) {
    console.error('Error creating patient:', err);
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
            attributes: ['isSubscribed'], 
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
          model: Prescription
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

const getPatientStatistics = async (patientId) => {
  try {
    const suiviMedicamentStats = await SuiviMedicament.findAll({
      where: { '$JournalSante.PatientId$': patientId },
      include: [
        {
          model: Medicament,
          attributes: ['name', 'dose', 'frequency'],
        },
        {
          model: JournalSante,
          where: { PatientId: patientId },
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
          where: { PatientId: patientId },
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
    };
  } catch (error) {
    console.error('Erreur dans la récupération des statistiques :', error);
    throw new Error('Erreur lors de la récupération des statistiques.');
  }
};

async function updatePatientProfile(patientId, updatedFields) {
  try {
    const patient = await Patient.findByPk(patientId);

    if (!patient) {
      return { success: false, message: 'Patient non trouvé' };
    }

    const user = await User.findByPk(patient.UserId);

    await patient.update(updatedFields);
    if(user){
      await user.update(updatedFields);
    }

    return {
      success: true,
      message: 'Profil du patient mis à jour avec succès',
      patient: patient,
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil du patient :', error);
    return { success: false, message: 'Erreur serveur' };
  }
}

async function getPatientDashboard(patientId) {
  try {
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return { success: false, message: 'Patient non trouvé' };
    }

    const prescriptions = await Prescription.findAll({
      where: { PatientId: patientId, isActive: true },
      include: [
        {
          model: Medicament,
          as: 'medicaments'
        }
      ]
    });

    const indicateurs = await Indicateur.findAll({
      where: { PatientId: patientId },
    });

    const suiviIndicateurs = await SuiviIndicateur.findAll({
      include: [
        {
          model: JournalSante,
          where: { PatientId: patientId },
          attributes: ["date"] 
        },
        {
          model: Indicateur
        }
      ],
       order: [[{ model: JournalSante }, 'date', 'DESC']],
      limit: 5
    });


    const suiviMedicaments = await SuiviMedicament.findAll({
      include: [
        {
          model: JournalSante,
          where: { PatientId: patientId },
          attributes: ["date"]
        },
        {
          model: Medicament
        }
      ],
       order: [[{ model: JournalSante }, 'date', 'DESC']],
      limit: 5
    });


    return {
      success: true,
      dashboard: {
        patient: {
          id: patient.id,
          nom: patient.nom,
          prenom: patient.prenom
        },
        prescriptions,
        indicateurs,
        suiviRecents: {
          indicateurs: suiviIndicateurs,
          medicaments: suiviMedicaments
        }
      }
    };

  } catch (error) {
    console.error('Erreur lors de la récupération du dashboard du patient :', error);
    return { success: false, message: 'Erreur serveur' };
  }
}




module.exports = { createPatient,
                  getPatients,
                  suspendrePatient,
                  activerPatient,
                  getPatientDetails,
                  getPatientStatistics,
                  updatePatientProfile,
                  getPatientDashboard
                };
