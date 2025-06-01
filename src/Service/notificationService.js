const { JournalSante, Notification, Patient } = require('../models');
const { Op } = require('sequelize');

async function checkIfPatientSubmittedIndicatorsToday(patientId) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const journal = await JournalSante.findOne({
    where: {
      PatientId: patientId,
      createdAt: {
        [Op.between]: [todayStart, todayEnd]
      }
    }
  });

  return !!journal;
}

async function envoyerNotification(patientId, message, type = 'rappel') {
  try {
    const notification = await Notification.create({
      message,
      type,
      PatientId: patientId,
      isRead: false,
    });

    return { success: true, notification };
  } catch (error) {
    console.error('Erreur lors de l’envoi de la notification :', error);
    return { success: false, message: 'Échec de la création de la notification.' };
  }
}

async function genererRappelsAutomatiques() {
  const patients = await Patient.findAll({ include: [Prescription] });

  for (const patient of patients) {
    const aSoumis = await checkIfPatientSubmittedIndicatorsToday(patient.id);

    if (!aSoumis) {
      await envoyerNotification(patient.id, 'Veuillez soumettre vos indicateurs de santé aujourd\'hui.', 'rappel');
    }
  }
}

module.exports = { envoyerNotification, genererRappelsAutomatiques };


