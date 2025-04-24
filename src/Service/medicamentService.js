const Medicament = require('../models/Medicament');
const Patient = require('../models/Patient');

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
      PatientId: patientId
    });

    return { success: true, data: medicament };

  } catch (error) {
    console.error('Error adding medication:', error);
    return { success: false, message: 'Server error' };
  }
}

module.exports = { ajouterMedicament };
