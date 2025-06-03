const validator = require('validator');
const Medecin = require('../models/Medecin');

module.exports = function validateAll(medecinDTO){
    const {fullName,email,password,specialite, telephone, adress, numeroIdentification, cin } = medecinDTO;
    const errors = {};

    const cleanName = validator.blacklist(fullName,' -')
    if(!validator.isAlpha(cleanName)){
        errors.fullName = 'Name field takes only alphabet letters!';
    }

    if(!validator.isEmail(email)){
        errors.email = 'Invalid email format!';
    }

    if(!validator.isStrongPassword(password,{
        minLength: 8,
        minUppercase: 1,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 0
    })) {
        errors.password = 'You need a stronger password!';
    }
    
    if(validator.isEmpty(specialite)){
        errors.specialite = 'Speciality required!';
    }

    if(validator.isEmpty(telephone)){
        errors.telephone = 'Telephone required!';
    }else if (!validator.isNumeric(telephone)) {
        errors.telephone = 'Le téléphone doit contenir uniquement des chiffres !';
    }else if (!validator.isLength(telephone, { min: 10, max: 15 })) {
        errors.telephone = 'Le numéro de téléphone doit contenir entre 10 et 15 chiffres.';
    }

    if(validator.isEmpty(adress)){
        errors.adress = 'Adresse required!';
    }

    if(validator.isEmpty(numeroIdentification)){
        errors.numeroIdentification = 'numeroIdentification required!';
    }

    if (validator.isEmpty(cin)) {
        errors.cin = 'CIN requis.';
    }


    return errors;
}
