const { User, JournalSante, Notification, Patient, Patient_Medecin_Link, Medecin, SuiviIndicateur, SuiviMedicament, Prescription } = require('../models');
const { Op } = require('sequelize');

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

async function checkIfMedicamentsNotTaken(journalId) {
  const nonPris = await SuiviMedicament.findAll({
    where: {
      JournalSanteId: journalId,
      pris: false
    }
  });

  return nonPris.length > 0;
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
  const patients = await Patient.findAll();

  for (const patient of patients) {
    const journal = await checkIfPatientSubmittedIndicatorsToday(patient.id);

    if (!journal) {
      await envoyerNotification(patient.id, 'Veuillez soumettre vos indicateurs de santé et predre vos médicaments aujourd\'hui.', 'rappel');
    } else {

      let medecinNom = null;
      let prescriptionDesc = null;

      if (journal.PrescriptionId) {
        const journalWithPrescription = await JournalSante.findByPk(journal.id, {
          include: {
            model: Prescription,
            include: {
              model: Medecin,
              include: {
                model: User,
                attributes: ['fullName']
              }
            }
          }
        });
        const prescription = journalWithPrescription?.Prescription;
        if (prescription) {
          medecinNom = prescription.Medecin?.User?.fullName || null;
          prescriptionDesc = prescription.description || null;
        }
      }
      const indicateursManquants = await checkIfMissingIndicatorValues(journal.id);
      if (indicateursManquants) {
        let message = 'Vous avez oublié de saisir certaines valeurs d’indicateurs aujourd’hui.';
        if (medecinNom || prescriptionDesc) {
          message += ' (';
          if (medecinNom) message += `Prescrit par Dr. ${medecinNom}`;
          if (medecinNom && prescriptionDesc) message += ' - ';
          if (prescriptionDesc) message += `Description : ${prescriptionDesc}`;
          message += ')';
        }
        await envoyerNotification(patient.id, message, 'rappel');
      }

      const medicamentsNonPris = await checkIfMedicamentsNotTaken(journal.id);
      if (medicamentsNonPris) {
        let message = 'N’oubliez pas de prendre vos médicaments prescrits.';
        if (medecinNom || prescriptionDesc) {
          message += ' (';
          if (medecinNom) message += `Prescrit par Dr. ${medecinNom}`;
          if (medecinNom && prescriptionDesc) message += ' - ';
          if (prescriptionDesc) message += `Description : ${prescriptionDesc}`;
          message += ')';
        }
        await envoyerNotification(patient.id, message, 'rappel');
      }
    }
  }
}




module.exports = { envoyerNotification, 
                   genererRappelsAutomatiques, 
                  checkIfPatientSubmittedIndicatorsToday,
                checkIfMissingIndicatorValues,
              checkIfMedicamentsNotTaken };


