const bcrypt = require('bcrypt');
const moment = require('moment-timezone');
const {
  User, Patient, JournalSante, Prescription, Medecin
} = require('../models');
const {
  checkIfPatientSubmittedIndicatorsToday,
  checkIfMissingIndicatorValues,
  checkIfMedicamentsNotTaken,
  envoyerNotification
} = require('../Service/notificationService');

  
  async function logUser(req,res){
    const { email, password } = req.body;


      try {
        
        
        const user = await User.findOne({ where: { email } });
    
        if (!user) {
          return res.status(401).json({ message: 'Invalid email or password ' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isApproved) {
          return res.status(403).json({ message: 'Account not approved yet!' });
        }

        const patient = await Patient.findOne({where : {userId: user.id}});
    
        req.session.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          patientId: patient ? patient.id : null
        };

        if (user.role === 'patient' && patient) {
      const now = moment().tz('Africa/Casablanca');        

      if (now.hour() >= 20) {

        const journal = await checkIfPatientSubmittedIndicatorsToday(patient.id);

        if (!journal) {
          await envoyerNotification(patient.id,
            'Veuillez soumettre vos indicateurs de santé et prendre vos médicaments aujourd\'hui.',
            'rappel'
          ).catch(e => console.error('Notif error', e));
        } else {
          let medecinNom = null;
          let prescriptionDesc = null;
          if (journal.PrescriptionId) {
            const j = await JournalSante.findByPk(journal.id, {
              include: {
                model: Prescription,
                include: {
                  model: Medecin,
                  include: { model: User, attributes: ['fullName'] }
                }
              }
            });
            if (j?.Prescription) {
              medecinNom = j.Prescription.Medecin?.User?.fullName ?? null;
              prescriptionDesc = j.Prescription.description ?? null;
            }
          }
          const indicateursManquants = await checkIfMissingIndicatorValues(journal.id);
          if (indicateursManquants?.length) {
            let msg = 'Vous avez oublié de saisir certaines valeurs d’indicateurs aujourd’hui.';
            if (medecinNom || prescriptionDesc) msg += ` (Prescrit par Dr. ${medecinNom ?? ''}${medecinNom && prescriptionDesc ? ' - ' : ''}${prescriptionDesc ?? ''})`;
            await envoyerNotification(patient.id, msg, 'rappel');
          }
          const medicamentsNonPris = await checkIfMedicamentsNotTaken(journal.id);
          if (medicamentsNonPris?.length) {
            let msg = 'N’oubliez pas de prendre vos médicaments prescrits.';
            if (medecinNom || prescriptionDesc) msg += ` (Prescrit par Dr. ${medecinNom ?? ''}${medecinNom && prescriptionDesc ? ' - ' : ''}${prescriptionDesc ?? ''})`;
            await envoyerNotification(patient.id, msg, 'rappel');
          }
        }
      }
    }

        
        res.status(200).json({ message: 'Logged in successfully', role: user.role, patientId: patient ? patient.id : null, id: user.id});
      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    }
    
  function logoutUser(req,res){
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  }


  module.exports = {
    logUser,
    logoutUser
  };
  