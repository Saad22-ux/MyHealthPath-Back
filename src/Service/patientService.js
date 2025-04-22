const User = require('../models/User');
const Medecin = require('../models/Medecin');
const Patient = require('../models/Patient');
const { sendPatientCredentials } = require('../utils/sendMail');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

async function createPatient(patientDTO,medecinId) {
  try {
    const existingUser = await User.findOne({ where: { email: patientDTO.email } });
    if (existingUser) {
      return { success: false, message: 'Email already in use!' };
    }

    const generatedPassword = crypto.randomBytes(6).toString('hex');

    
    const newUser = await User.create({
      fullName: patientDTO.fullName,
      email: patientDTO.email,
      password: generatedPassword,
      role: 'patient',
      isApproved: true
    });
    const newPatient = await Patient.create({
      date_naissance: patientDTO.date_naissance,
      genre: patientDTO.genre,
      UserId: newUser.id,
      MedecinId: medecinId
    });

    
    await sendPatientCredentials(newUser.email, newUser.fullName, generatedPassword);

    return {
      success: true,
      message: 'Patient created and credentials sent successfully',
      patient: { id: newUser.id, email: newUser.email }
    };

  } catch (err) {
    console.error('Error creating patient:', err);
    return { success: false, message: 'Server error' };
  }
}

async function getPatients(medecinId){
  try {

    const Patients = await Patient.findAll({
      where: {
        MedecinId: medecinId
      },
        include: {
            model: Medecin,
        }
    });

    return {success: true, data: Patients};
  } catch (error) {
    console.error('Error fetching patients:', error);
    return { success: false, message: 'Server error' };
  }
}

async function suspendrePatient(patientId) {
  try {

    const patient = await Patient.findByPk(patientId, {
      include: {
        model: User
      }
    });

    if (!patient || !patient.User) {
      return { success: false, message: 'Patient not found' };
    }

    await patient.User.update({ isApproved: false });
    return { success: true, message: 'Patient suspended successfully' };
  } catch (error) {
    console.error('Error suspending patient:', error);
    return { success: false, message: 'Server error' };
  }
}

async function activerPatient(patientId) {
  try {

    const patient = await Patient.findByPk(patientId, {
      include: {
        model: User
      }
    });

    if (!patient || !patient.User) {
      return { success: false, message: 'Patient not found' };
    }

    await patient.User.update({ isApproved: true });
    return { success: true, message: 'Patient activated successfully' };
  } catch (error) {
    console.error('Error activating patient:', error);
    return { success: false, message: 'Server error' };
  }
}


module.exports = { createPatient,getPatients,suspendrePatient,activerPatient };
