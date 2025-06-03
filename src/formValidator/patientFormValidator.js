const validator = require('validator');

module.exports = function validatePatient(patientDTO) {
  const { fullName, email, date_naissance, genre } = patientDTO;
  const errors = {};

  const cleanName = validator.blacklist(fullName, ' -');
  if (!validator.isAlpha(cleanName)) {
    errors.fullName = 'Name field takes only alphabet letters!';
  }

  if (!validator.isEmail(email)) {
    errors.email = 'Invalid email format!';
  }

  
  if (!validator.isDate(date_naissance)) {
    errors.date_naissance = 'Invalid birthdate!';
  } else if (new Date(date_naissance) >= new Date()) {
    errors.date_naissance = 'Birthdate must be in the past!';
  }

  if (!['homme', 'femme'].includes(genre)) {
    errors.genre = 'Genre must be either homme or femme!';
  }

  return errors;
};
