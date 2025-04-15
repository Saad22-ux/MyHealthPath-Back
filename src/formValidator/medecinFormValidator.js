const validator = require('validator');
const Medecin = require('../models/Medecin');

module.exports = function validateAll(medecinDTO){
    const {fullName,email,password,specialite} = medecinDTO;
    const errors = [];

    const cleanName = validator.blacklist(fullName,' -')
    if(!validator.isAlpha(cleanName)){
        errors.push('Name field takes only alphabet lettres!');
    }

    if(!validator.isEmail(email)){
        errors.push('Invalid email format!');
    }

    if(!validator.isStrongPassword(password,{
        minLength: 8,
        minUppercase: 1,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 0
    })) {
        errors.push('You need a stronger password!');
    }
    
    if(validator.isEmpty(specialite)){
        errors.push('Speciality required!');
    }

    return errors;
}
