const { Medecin, User} = require('../models');
const bcrypt = require('bcrypt');

async function createMedecin(medecinDTO){
    try {
        const existingUser = await User.findOne({ where: { email: medecinDTO.email } });
        if (existingUser) {
            return { success: false, message: 'Email already in use!' };
        }


        const newUser = await User.create({
            fullName: medecinDTO.fullName,
            email: medecinDTO.email,
            password: medecinDTO.password,
            role: 'medecin'
        });

        const newMedecin = await Medecin.create({
            specialite: medecinDTO.specialite,
            UserId: newUser.id
        });

        return {
            success: true,
            message: 'Médecin registered successfully!',
            medecin: newMedecin};

    } catch (err) {
        console.error('Error in register middleware:', err);
        return { success: false, message: err};
    }
}

module.exports = createMedecin;