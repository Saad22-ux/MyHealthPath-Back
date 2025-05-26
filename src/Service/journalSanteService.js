const { JournalSante, SuiviMedicament, SuiviIndicateur, Prescription} = require('../models');

async function createJournalSante(patientId, data) {
  try {
    const { date, medicaments, indicateurs, prescriptionId} = data;

    const journal = await JournalSante.create({
      PatientId: patientId,
      date: date || new Date(),
      PrescriptionId: data.prescriptionId
    });

    if (Array.isArray(medicaments)) {
      const suivisMeds = medicaments.map(med => ({
        MedicamentId: med.medicamentId,
        pris: med.pris,
        JournalSanteId: journal.id
      }));
      await SuiviMedicament.bulkCreate(suivisMeds);
    }

    if (Array.isArray(indicateurs)) {
      const suivisInd = indicateurs.map(ind => ({
        IndicateurId: ind.indicateurId,
        mesure: ind.mesure,
        valeur: ind.valeur,
        JournalSanteId: journal.id
      }));
      await SuiviIndicateur.bulkCreate(suivisInd);
    }

    return { success: true, message: 'Journal de santé enregistré avec succès.' };

  } catch (error) {
    console.error('Erreur lors de la création du journal de santé :', error);
    return { success: false, message: 'Erreur serveur.' };
  }
}

module.exports = { createJournalSante };