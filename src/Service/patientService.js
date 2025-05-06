const { User, Medecin, Patient, Medicament, Indicateur, Patient_Medecin_Link } = require('../models');
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

    return { success: true, message: 'Patient access to this doctor has been suspended' };
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

    return { success: true, message: 'Patient access to this doctor has been activated' };
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



module.exports = { createPatient,
                  getPatients,
                  suspendrePatient,
                  activerPatient,
                  getPatientDetails };
