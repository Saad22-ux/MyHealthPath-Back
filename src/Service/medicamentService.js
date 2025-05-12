const { Medicament, Patient } = require('../models');

async function ajouterMedicament(medicamentDTO, patientId) {
  try {
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return { success: false, message: 'Patient not found' };
    }

    
    const medicament = await Medicament.create({
      name: medicamentDTO.name,
      dose: medicamentDTO.dose,
      frequency: medicamentDTO.frequency,
      duree: medicamentDTO.duree,
      PatientId: patientId
    });

    return { success: true, data: medicament };

  } catch (error) {
    console.error('Error adding medication:', error);
    return { success: false, message: 'Server error' };
  }
}

async function supprimerMedicament(medicamentId){
  try{
    const medicament = await Medicament.findByPk(medicamentId);

    if(!medicament){
      return { success: false, message: 'Medication not found'};
    }

    await medicament.destroy();

    return { success: true, message: 'Medication removed successfully', data: medicament };
  } catch(error){
    console.error('Error removing medication');
    return { success: false, message: 'Server error'};
  }
}

module.exports = { ajouterMedicament, supprimerMedicament };
