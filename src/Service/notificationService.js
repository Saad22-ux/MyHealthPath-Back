const { JournalSante, Notification, Patient, Patient_Medecin_Link, Medecin } = require('../models');
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

async function genererAlertesPourMedecins() {
  try {
  const liens = await Patient_Medecin_Link.findAll({
    where: { state: 'Danger' },
    include: [Patient, Medecin],
  });

  for (const lien of liens) {
    const existe = await Notification.findOne({
      where: {
        PatientId: lien.PatientIdt,
        MedecinId: lien.MedecinId,
        type: 'alerte',
        isRead: false,
      },
    });

    if (!existe) {
      await Notification.create({
        message: `Alerte : Le patient ID ${lien.PatientId} est en état de danger.`,
        type: 'alerte',
        PatientId: lien.PatientId,
        MedecinId: lien.MedecinId,
        isRead: false,
      });
    }
  }

  return { success: true, message: 'Alertes générées.' };
  } catch (error) {
    console.error('Erreur génération alertes danger :', error);
    return { success: false, message: 'Erreur lors de la génération des alertes.' };
  }
}

module.exports = { envoyerNotification, genererRappelsAutomatiques, genererAlertesPourMedecins };


