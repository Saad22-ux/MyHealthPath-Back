const { Prescription, Medicament, Patient, Medecin, Indicateur } = require('../models');

async function createPrescription(medecinId, patientId, prescriptionDTO) {
  try {
    const { description, medicaments, indicateurs } = prescriptionDTO;

    if (!Array.isArray(medicaments) && !Array.isArray(indicateurs)) {
      return { success: false, message: 'Données invalides.' };
    }

    if ((medicaments.length === 0) && (indicateurs.length === 0)) {
      return {
        success: false,
        message: 'La prescription doit contenir au moins un médicament ou un indicateur.'
      };
    }

    const patient = await Patient.findByPk(patientId);
    if (!patient) return { success: false, message: 'Patient not found' };

    const medecin = await Medecin.findByPk(medecinId);
    if (!medecin) return { success: false, message: 'Medecin not found' };

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
  
      return { success: true, message: 'Prescription updated successfully', data: prescription };
  
    } catch (err) {
      console.error('Error updating prescription:', err);
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
      console.error('Error fetching prescription:', error);
      return { success: false, message: 'Server error' };
    }
}

async function getIndicateursParSpecialite(req, res) {
  try {
    const userId = req.session.user.id; 
    
    const medecin = await Medecin.findOne({ where: { UserId: userId } });

    if (!medecin) {
      return res.status(404).json({ error: 'Médecin non trouvé' });
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
    console.error('Erreur lors de la récupération des indicateurs :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function desactiverPrescription(prescriptionId) {
  try {
    const prescription = await Prescription.findByPk(prescriptionId);

    if (!prescription) {
      return { success: false, message: 'Prescription non trouvée' };
    }

    prescription.isActive = false;
    await prescription.save();

    return { success: true, message: 'Statut de la prescription mis à jour avec succès', data: prescription };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de la prescription :', error);
    return { success: false, message: 'Erreur serveur' };
  }
}

async function activerPrescription(prescriptionId) {
  try {
    const prescription = await Prescription.findByPk(prescriptionId);

    if (!prescription) {
      return { success: false, message: 'Prescription non trouvée' };
    }

    prescription.isActive = true;
    await prescription.save();

    return { success: true, message: 'Statut de la prescription mis à jour avec succès', data: prescription };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de la prescription :', error);
    return { success: false, message: 'Erreur serveur' };
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
  
