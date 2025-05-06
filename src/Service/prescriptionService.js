const { Prescription, Medicament, Patient, Medecin, Indicateur } = require('../models');

async function createPrescription(medecinId, patientId, prescriptionDTO) {
  try {
    const { description, medicaments } = prescriptionDTO;

    const patient = await Patient.findByPk(patientId);
    if (!patient) return { success: false, message: 'Patient not found' };

    const prescription = await Prescription.create({
      description,
      MedecinId: medecinId,
      PatientId: patientId,
    });

    const medicamentPromises = medicaments.map(med => Medicament.create({
      name: med.name,
      dose: med.dose,
      frequency: med.frequency,
      duree: med.duree,
      PatientId: patientId,
      PrescriptionId: prescription.id
    }));
    await Promise.all(medicamentPromises);

    const medecin = await Medecin.findByPk(medecinId);
    if (!medecin) return { success: false, message: 'Medecin not found' };

    const indicateursParSpecialite = {
      'Diabète': ['Glycémie', 'HbA1c'],
      'Hypertension': ['Tension artérielle'],
      'Cholesterol': ['LDL', 'HDL', 'Triglycérides'],
    };

    const indicateurs = indicateursParSpecialite[medecin.specialite] || [];

    const indicateurPromises = indicateurs.map(ind => Indicateur.create({
      nom: ind,
      PatientId: patientId,
      PrescriptionId: prescription.id
    }));
    await Promise.all(indicateurPromises);

    return {
      success: true,
      message: 'Prescription created successfully with medicaments and indicators',
      prescriptionId: prescription.id
    };

  } catch (error) {
    console.error('Error creating prescription:', error);
    return { success: false, message: 'Server error' };
  }
}

async function updatePrescription(prescriptionId, updatedData) {
    try {
      const prescription = await Prescription.findByPk(prescriptionId);
      if (!prescription) return { success: false, message: 'Prescription not found' };
  
      
      if (updatedData.description) {
        prescription.description = updatedData.description;
        await prescription.save();
      }
  
      if (Array.isArray(updatedData.medicaments)) {
        await Medicament.destroy({ where: { PrescriptionId: prescriptionId } });
  
        const newMeds = updatedData.medicaments.map(med => ({
          ...med,
          PatientId: prescription.PatientId,
          PrescriptionId: prescription.id
        }));
        await Medicament.bulkCreate(newMeds);
      }
  
      return { success: true, message: 'Prescription updated successfully' };
  
    } catch (err) {
      console.error('Error updating prescription:', err);
      return { success: false, message: 'Server error' };
    }
}

async function getPrescriptionDetails(prescriptionId) {
    try {
      const prescription = await Prescription.findByPk(prescriptionId, {
        include: [{ model: Medicament, as: 'medicaments' }]
      });
  
      if (!prescription) {
        return { success: false, message: 'Prescription not found' };
      }
  
      return {
        success: true,
        prescription
      };
  
    } catch (error) {
      console.error('Error fetching prescription:', error);
      return { success: false, message: 'Server error' };
    }
}
  
  module.exports = {
    createPrescription,
    updatePrescription,
    getPrescriptionDetails
  };
  
