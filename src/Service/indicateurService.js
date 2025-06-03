const { Indicateur, Patient, Prescription } = require('../models');

async function ajouterIndicateur(indicateurDTO, patientId, prescriptionId){
    try {
        const patient = await Patient.findByPk(patientId);
        const prescription = await Prescription.findByPk(prescriptionId);

        if (!patient || !prescription || prescription.PatientId !== patientId) {
            return { success: false, message: 'Patient or Perscription not found or mismatch' };
        }

        const today = new Date().toISOString().slice(0, 10);

        const existing = await Indicateur.findOne({
            where: {
                nom: indicateurDTO.nom,
                PatientId: patientId,
                PrescriptionId: prescriptionId,
                date_mesure: today
            }
        });

        if (existing) {
            return { success: false, message: 'Mesure already submitted today' };
        }

        const indicateur = await Indicateur.create({
            nom: indicateurDTO.nom,
            valeur: indicateurDTO.valeur,
            date_mesure: today,
            PatientId: patientId,
            PrescriptionId: prescriptionId
        });

        return { success: true, data: indicateur };
    } catch (error) {
        console.error('Error adding indicator:', error);
        return { success: false, message: 'Server error' };
    }
}

async function supprimerIndicateur(indicateurId) {
    try{
        const indicateur = await Indicateur.findByPk(indicateurId);
    
        if(!indicateur){
          return { success: false, message: 'Indicator not found'};
        }
    
        await indicateur.destroy();
    
        return { success: true, message: 'Indicator removed successfully'};
      } catch(error){
        console.error('Error removing indicator');
        return { success: false, message: 'Server error'};
      }
}

module.exports = { ajouterIndicateur, supprimerIndicateur};