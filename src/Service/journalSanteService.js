const Sequelize = require('sequelize');
const { JournalSante, Prescription, SuiviMedicament, SuiviIndicateur, Indicateur, Patient, Patient_Medecin_Link } = require('../models');
const { verifierEtNotifierEtatDanger } = require('./notificationService');

async function updatePatientStateForDoctor(patientId, medecinId, etatGlobal) {
   if (!medecinId) return;
  try {
    await Patient_Medecin_Link.update(
      { state: etatGlobal },
      {
        where: {
          id_patient: patientId,
          id_medecin: medecinId,
        },
      }
    );
  } catch (error) {
    console.error('Erreur mise à jour état patient_medecin_link:', error);
  }
}

async function createJournalSante(patientId, data) {
  try {
    const { date, medicaments, indicateurs, prescriptionId } = data;

    const prescription = await Prescription.findByPk(prescriptionId);
    if (!prescription) {
      return { success: false, message: "Prescription not found." };
    }
    const medecinId = prescription.MedecinId;

    const todayDate = new Date(date || new Date());
    const formattedDate = todayDate.toISOString().split('T')[0];

    let existingJournal = await JournalSante.findOne({
      where: {
        PatientId: patientId,
        PrescriptionId: prescriptionId,
        date: formattedDate
      }
    });

    if (existingJournal) {
      return await upsertJournalSante(patientId, data);
    }

    const aMedicaments = Array.isArray(medicaments) && medicaments.length > 0;
    const aIndicateurs = Array.isArray(indicateurs) && indicateurs.length > 0;

    let pris = false;

    if (aMedicaments && aIndicateurs) {
      pris = true;
    }

    const journal = await JournalSante.create({
      PatientId: patientId,
      date: formattedDate,
      PrescriptionId: prescriptionId,
      pris
    });

    if (pris) {
      const suivisMeds = medicaments.map(med => ({
        MedicamentId: med.medicamentId,
        pris: med.pris,
        JournalSanteId: journal.id
      }));
      await SuiviMedicament.bulkCreate(suivisMeds);

      const seuilsIndicateurs = {
        'Glycémie à jeun': { dangerMin: 0, normalMin: 70, normalMax: 100, dangerMax: 125 },
        'Glycémie postprandiale': { dangerMin: 0, normalMin: 70, normalMax: 140, dangerMax: 200 },
        'HbA1c': { dangerMin: 0, normalMin: 4, normalMax: 5.7, dangerMax: 6.4 },
        'Poids': { dangerMin: 0, normalMin: 50, normalMax: 100, dangerMax: 150 },
        'IMC': { dangerMin: 0, normalMin: 18.5, normalMax: 24.9, dangerMax: 30 },
        'Tension artérielle': { dangerMin: 0, normalMin: 90, normalMax: 120, dangerMax: 140 },
        'Cholestérol total': { dangerMin: 0, normalMin: 125, normalMax: 200, dangerMax: 240 },
        'LDL': { dangerMin: 0, normalMin: 50, normalMax: 100, dangerMax: 130 },
        'HDL': { dangerMin: 40, normalMin: 40, normalMax: 60, dangerMax: 100 },
        'Triglycérides': { dangerMin: 0, normalMin: 50, normalMax: 150, dangerMax: 200 },
        'Albuminurie': { dangerMin: 0, normalMin: 0, normalMax: 30, dangerMax: 300 },
        'Créatinine': { dangerMin: 0, normalMin: 0.6, normalMax: 1.3, dangerMax: 2.0 },
        'Fréquence cardiaque': { dangerMin: 0, normalMin: 60, normalMax: 100, dangerMax: 120 },
        'Électrolytes (Na, K)': { dangerMin: 0, normalMin: 135, normalMax: 145, dangerMax: 155 },
      };

      const idsIndicateurs = indicateurs.map(ind => ind.indicateurId);
      const indicateursDB = await Indicateur.findAll({
        where: { id: idsIndicateurs },
        attributes: ['id', 'nom']
      });

      const mapIdToNom = {};
      indicateursDB.forEach(ind => {
        mapIdToNom[ind.id] = ind.nom;
      });

      const suivisInd = indicateurs.map(ind => ({
        IndicateurId: ind.indicateurId,
        mesure: ind.mesure !== undefined && ind.mesure !== null ? ind.mesure : false,
        valeur: ind.valeur,
        JournalSanteId: journal.id
      }));
      await SuiviIndicateur.bulkCreate(suivisInd);

      let etatGlobal = 'Good';
      for (const ind of indicateurs) {
        const nomInd = mapIdToNom[ind.indicateurId];
        if (!nomInd || !seuilsIndicateurs[nomInd]) continue;

        const seuils = seuilsIndicateurs[nomInd];
        const valeur = parseFloat(ind.valeur);

        if (valeur < seuils.dangerMin || valeur > seuils.dangerMax) {
          etatGlobal = 'Danger';
          break;
        } else if (valeur < seuils.normalMin || valeur > seuils.normalMax) {
          if (etatGlobal !== 'Danger') etatGlobal = 'Normal';
        }
      }

      if (etatGlobal !== 'Good') {
        await updatePatientStateForDoctor(patientId, medecinId, etatGlobal);
      }
    }

    await verifierEtNotifierEtatDanger(patientId);

    return {
      success: true,
      message: pris
        ? 'Health journal successfully recorded.'
        : 'Partial journal: missing indicators or medications, nothing recorded.'
    };

  } catch (error) {
    console.error('Error creating health journal:', error);
    return { success: false, message: 'Server error.' };
  }
}

async function upsertJournalSante(patientId, data) {
  try {
    const { medicaments, date, indicateurs, prescriptionId } = data;

    const todayDate = new Date(date || new Date());
    const formattedDate = todayDate.toISOString().split('T')[0];

    let journal = await JournalSante.findOne({
      where: {
        PatientId: patientId,
        date: formattedDate,
        PrescriptionId: prescriptionId
      }
    });

    const prescription = await Prescription.findByPk(prescriptionId);
    if (!prescription) {
      return { success: false, message: "Prescription not found." };
    }
    const medecinId = prescription.MedecinId;

    const aMedicaments = Array.isArray(medicaments) && medicaments.length > 0;
    const aIndicateurs = Array.isArray(indicateurs) && indicateurs.length > 0;

    if (journal) {
      await journal.update({
        PrescriptionId: prescriptionId
      });

      if (!aMedicaments) {
        await SuiviMedicament.destroy({ where: { JournalSanteId: journal.id } });
      }

      if (!aIndicateurs) {
        await SuiviIndicateur.destroy({ where: { JournalSanteId: journal.id } });
      }

      await Promise.all(medicaments.map(async (med) => {
        const [suiviMed, created] = await SuiviMedicament.findOrCreate({
          where: {
            JournalSanteId: journal.id,
            MedicamentId: med.medicamentId,
          },
          defaults: {
            pris: med.pris,
          },
        });

        if (!created && !suiviMed.pris && med.pris) {
          await suiviMed.update({ pris: true });
        }
      }));

      await Promise.all(indicateurs.map(async (ind) => {
        const [suiviInd, created] = await SuiviIndicateur.findOrCreate({
          where: {
            JournalSanteId: journal.id,
            IndicateurId: ind.indicateurId,
          },
          defaults: {
            mesure: ind.mesure ?? 1,
            valeur: ind.valeur,
          },
        });

        const valeurDejaSaisie =
          suiviInd.valeur !== null &&
          suiviInd.valeur !== undefined &&
          suiviInd.valeur !== '';

        const needUpdateValeur =
          !valeurDejaSaisie &&
          ind.valeur != null &&
          ind.valeur !== '';

        const needUpdateMesure = !suiviInd.mesure && ind.mesure;

        if (!created && (needUpdateValeur || needUpdateMesure)) {
          await suiviInd.update({
            mesure: needUpdateMesure ? (ind.mesure ?? 1) : suiviInd.mesure,
            valeur: needUpdateValeur ? ind.valeur : suiviInd.valeur,
          });
        }
      }));

      const nbMeds = await SuiviMedicament.count({ where: { JournalSanteId: journal.id } });
      const nbIndics = await SuiviIndicateur.count({ where: { JournalSanteId: journal.id } });
      const isPris = nbMeds > 0 && nbIndics > 0;

      await journal.update({ pris: isPris });

      if (aIndicateurs) {
        const seuilsIndicateurs = {
          'Glycémie à jeun': { dangerMin: 0, normalMin: 70, normalMax: 100, dangerMax: 125 },
          'Glycémie postprandiale': { dangerMin: 0, normalMin: 70, normalMax: 140, dangerMax: 200 },
          'HbA1c': { dangerMin: 0, normalMin: 4, normalMax: 5.7, dangerMax: 6.4 },
          'Poids': { dangerMin: 0, normalMin: 50, normalMax: 100, dangerMax: 150 },
          'IMC': { dangerMin: 0, normalMin: 18.5, normalMax: 24.9, dangerMax: 30 },
          'Tension artérielle': { dangerMin: 0, normalMin: 90, normalMax: 120, dangerMax: 140 },
          'Cholestérol total': { dangerMin: 0, normalMin: 125, normalMax: 200, dangerMax: 240 },
          'LDL': { dangerMin: 0, normalMin: 50, normalMax: 100, dangerMax: 130 },
          'HDL': { dangerMin: 40, normalMin: 40, normalMax: 60, dangerMax: 100 },
          'Triglycérides': { dangerMin: 0, normalMin: 50, normalMax: 150, dangerMax: 200 },
          'Albuminurie': { dangerMin: 0, normalMin: 0, normalMax: 30, dangerMax: 300 },
          'Créatinine': { dangerMin: 0, normalMin: 0.6, normalMax: 1.3, dangerMax: 2.0 },
          'Fréquence cardiaque': { dangerMin: 0, normalMin: 60, normalMax: 100, dangerMax: 120 },
          'Électrolytes (Na, K)': { dangerMin: 0, normalMin: 135, normalMax: 145, dangerMax: 155 }
        };

        const idsIndicateurs = indicateurs.map(ind => ind.indicateurId);
        const indicateursDB = await Indicateur.findAll({
          where: { id: idsIndicateurs },
          attributes: ['id', 'nom']
        });

        const mapIdToNom = {};
        indicateursDB.forEach(ind => {
          mapIdToNom[ind.id] = ind.nom;
        });

        let etatGlobal = 'Good';
        for (const ind of indicateurs) {
          const nomInd = mapIdToNom[ind.indicateurId];
          if (!nomInd || !seuilsIndicateurs[nomInd]) continue;

          const seuils = seuilsIndicateurs[nomInd];
          const valeur = parseFloat(ind.valeur);

          if (valeur < seuils.dangerMin || valeur > seuils.dangerMax) {
            etatGlobal = 'Danger';
            break;
          } else if (valeur < seuils.normalMin || valeur > seuils.normalMax) {
            if (etatGlobal !== 'Danger') etatGlobal = 'Normal';
          }
        }

        if (etatGlobal !== 'Good') {
          await updatePatientStateForDoctor(patientId, medecinId, etatGlobal);
        }
      }

      await verifierEtNotifierEtatDanger(patientId);

      return { success: true, message: 'Health journal updated.', journal };
    } else {
      return await createJournalSante(patientId, data);
    }
  } catch (error) {
    console.error('Error in upsertJournalSante:', error);
    return { success: false, message: 'Server error.' };
  }
}




module.exports = { createJournalSante, upsertJournalSante };