const Indicateur = require('../models/Indicateur');
const Patient = require('../models/Patient');

async function ajouterIndicateur(indicateurDTO, patientId){
    try{
        const patient = Patient.findByPk(patientId);

        if(!patient){
            return ({ success: false, message: 'Patient not found' });
        }

        const indicateur = Indicateur.create({
            type: indicateurDTO.type,
            valeur: indicateurDTO.valeur,
            date_mesure: indicateurDTO.date_mesure,
            PatientId: patientId
        });

        return ({ success: true, data: indicateur });
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