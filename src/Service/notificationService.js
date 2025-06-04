const { JournalSante, Notification, Patient, Patient_Medecin_Link, Medecin, SuiviIndicateur, SuiviMedicament } = require('../models');
const { Op } = require('sequelize');

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return [start, end];
}

async function checkIfPatientSubmittedIndicatorsToday(patientId) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const journal = await JournalSante.findOne({
    where: {
      PatientId: patientId,
      createdAt: { [Op.between]: [todayStart, todayEnd] }
    }
  });

  return journal;
}

async function checkIfMissingIndicatorValues(journalId) {
  const indicateurs = await SuiviIndicateur.findAll({
    where: {
      JournalSanteId: journalId,
      [Op.or]: [
        { valeur: null },
        { valeur: '' }
      ]
    }
  });

  return indicateurs.length > 0;
}

async function envoyerNotification(patientId, message, type = 'rappel') {
  try {
    return await Notification.create({
      message,
      type,
      isRead: false,
      PatientId: patientId
    });
  } catch (error) {
    console.error('Erreur envoi notif:', error);
    return null;
  }
}

async function genererRappelsAutomatiques() {
  const patients = await Patient.findAll();

  const [todayStart, todayEnd] = getTodayRange();

  for (const patient of patients) {
    const journal = await JournalSante.findOne({
      where: {
        PatientId: patient.id,
        date: {
          [Op.between]: [todayStart, todayEnd]
        }
      },
      include: [SuiviIndicateur, SuiviMedicament]
    });

    if (!journal) {
      await envoyerNotification(patient.id, 'Veuillez remplir votre journal de santé aujourd\'hui.', 'rappel');
      continue;
    }

    const indicateurs = journal.SuiviIndicateur || [];
    const indicateursManquants = indicateurs.some(ind => !ind.valeur || ind.valeur.trim() === '');
    if (indicateursManquants) {
      await envoyerNotification(patient.id, 'Vous avez oublié d’entrer certains indicateurs de santé aujourd’hui.', 'rappel');
    }

    const meds = journal.SuiviMedicament || [];
    const medsOublies = meds.some(m => m.pris === false);
    if (medsOublies) {
      await envoyerNotification(patient.id, 'N’oubliez pas de prendre vos médicaments prescrits.', 'rappel');
    }
  }
}

/*async function genererAlertesPourMedecins() {
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
        message: Alerte : Le patient ID ${lien.PatientId} est en état de danger.,
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
}*/

module.exports = { envoyerNotification,
  genererRappelsAutomatiques };