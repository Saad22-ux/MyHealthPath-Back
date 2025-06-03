const { Prescription, Medicament, Patient, Medecin, Indicateur } = require('../models');

async function createPrescription(medecinId, patientId, prescriptionDTO) {
  try {
    const { description, medicaments, indicateurs } = prescriptionDTO;

    if (!Array.isArray(medicaments) && !Array.isArray(indicateurs)) {
      return { success: false, message: 'Invalid data format.' };
    }

    if ((medicaments.length === 0) && (indicateurs.length === 0)) {
      return {
        success: false,
        message: 'A prescription must contain at least one medication or indicator.'
      };
    }

    const patient = await Patient.findByPk(patientId);
    if (!patient) return { success: false, message: 'Patient not found' };

    const medecin = await Medecin.findByPk(medecinId);
    if (!medecin) return { success: false, message: 'Doctor not found' };

    const prescription = await Prescription.create({
      description,
      date: new Date().toISOString().split('T')[0],
      MedecinId: medecinId,
      PatientId: patientId,
    });

  if (Array.isArray(medicaments) && medicaments.length > 0) {
    const medicamentPromises = medicaments.map(med => Medicament.create({
      name: med.name,
      dose: med.dose,
      frequency: med.frequency,
      duree: med.duree,
      PatientId: patientId,
      PrescriptionId: prescription.id
    }));
    await Promise.all(medicamentPromises);
  }

  if (Array.isArray(indicateurs) && indicateurs.length > 0) {
    const indicateurPromises = indicateurs.map(ind => Indicateur.create({
      nom: ind,
      PatientId: patientId,
      PrescriptionId: prescription.id
    }));
    await Promise.all(indicateurPromises);
  }

    return {
      success: true,
      message: 'Prescription created successfully with medications and indicators',
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
      if (!prescription) return { success: false, message: 'Perscription not found' };
  
      
      if (updatedData.description) {
        prescription.description = updatedData.description;
        await prescription.save();
      }

      if (updatedData.date) {
        prescription.date = updatedData.date;
      }

      await prescription.save();
  
      if (Array.isArray(updatedData.medicaments)) {
        await Medicament.destroy({ where: { PrescriptionId: prescriptionId } });
  
        const newMeds = updatedData.medicaments.map(med => ({
          ...med,
          PatientId: prescription.PatientId,
          PrescriptionId: prescription.id
        }));
        await Medicament.bulkCreate(newMeds);
      }

      if (Array.isArray(updatedData.indicateurs)) {
      await Indicateur.destroy({ where: { PrescriptionId: prescriptionId } });

      const newIndicateurs = updatedData.indicateurs.map(nom => ({
        nom,
        PatientId: prescription.PatientId,
        PrescriptionId: prescription.id
      }));
      await Indicateur.bulkCreate(newIndicateurs);
    }
  
      return { success: true, message: 'Perscription updated successfully', data: prescription };
  
    } catch (err) {
      console.error('Error updating perscription:', err);
      return { success: false, message: 'Server error' };
    }
}

async function getPrescriptionDetails(prescriptionId) {
    try {
      const prescription = await Prescription.findByPk(prescriptionId, {
        include: [{ model: Medicament, as: 'medicaments' }, { model: Indicateur, as: 'indicateurs'}]
      });
  
      if (!prescription) {
        return { success: false, message: 'Prescription not found' };
      }
  
      return {
        success: true,
        prescription
      };
  
    } catch (error) {
      console.error('Error fetching perscription:', error);
      return { success: false, message: 'Server error' };
    }
}

async function getIndicateursParSpecialite(req, res) {
  try {
    const userId = req.session.user.id; 
    
    const medecin = await Medecin.findOne({ where: { UserId: userId } });

    if (!medecin) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }

    const indicateursParSpecialite = {
      'Diabète': [
        'Glycémie à jeun',
        'Glycémie postprandiale',
        'HbA1c',
        'Poids',
        'IMC',
        'Tension artérielle',
        'Cholestérol total',
        'LDL',
        'HDL',
        'Triglycérides',
        'Albuminurie',
        'Créatinine'
      ],
      'Hypertension': [
        'Tension artérielle',
        'Fréquence cardiaque',
        'Poids',
        'IMC',
        'Cholestérol total',
        'LDL',
        'HDL',
        'Triglycérides',
        'Créatinine',
        'Électrolytes (Na, K)'
      ],
      'Cholesterol': [
        'Cholestérol total',
        'LDL',
        'HDL',
        'Triglycérides',
        'Poids',
        'IMC',
        'Glycémie à jeun',
        'HbA1c',
        'Tension artérielle'
      ]
    };

    const indicateurs = indicateursParSpecialite[medecin.specialite] || [];

    res.status(200).json({ indicateurs });
  } catch (error) {
    console.error('Error fetching indicators by specialty:', error);
    res.status(500).json({ error: 'Server error while fetching indicators.' });
  }
}

async function desactiverPrescription(prescriptionId) {
  try {
    const prescription = await Prescription.findByPk(prescriptionId);

    if (!prescription) {
      return { success: false, message: 'Prescription not found.' };
    }

    prescription.isActive = false;
    await prescription.save();

    return { success: true, message: 'Prescription status successfully updated to inactive.', data: prescription };
  } catch (error) {
    console.error('Error deactivating prescription:', error);
    return { success: false, message: 'Server error while deactivating prescription.' };
  }
}

async function activerPrescription(prescriptionId) {
  try {
    const prescription = await Prescription.findByPk(prescriptionId);

    if (!prescription) {
      return { success: false, message: 'Prescription not found.' };
    }

    prescription.isActive = true;
    await prescription.save();

    return { success: true, message: 'Prescription status successfully updated to active.', data: prescription };
  } catch (error) {
    console.error('Error activating prescription:', error);
    return { success: false, message: 'Server error while activating prescription.' };
  }
}
  
  module.exports = {
    createPrescription,
    updatePrescription,
    getPrescriptionDetails,
    getIndicateursParSpecialite,
    desactiverPrescription,
    activerPrescription
  };
  
