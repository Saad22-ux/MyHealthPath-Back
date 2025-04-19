const express = require('express');
const User = require('../models/User');
const Medecin = require('../models/Medecin');

async function getPendingMedecins(){
  try {
    const pendingMedecins = await Medecin.findAll({
      
        include: {
            model: User,
            attributes: ['fullName','email'],
            where: {
                isApproved: false,
                role: 'medecin'
            }
        }
    });

    return {success: true, data: pendingMedecins};
  } catch (error) {
    console.error('Error fetching pending medecins:', error);
    return { success: false, message: 'Server error' };
  }
}

async function approveMedecin(userId){
    try{

        const user = await User.findByPk(userId);
        if (!user || user.role !== 'medecin') {
        return { success: false, message: 'Médecin not found' };
        }

        user.isApproved = true;
        await user.save();

        return { success:true, message: 'Médecin approved', id: user.id };
    }
    catch (error) {
        console.error('Error approving médecin:', error);
        return { success:false, message: 'Server error' };
    }
}

module.exports = { getPendingMedecins, approveMedecin };
