const express = require('express');
const { User, Medecin } = require('../models');

async function getPendingMedecins(){
  try {
    const pendingMedecins = await Medecin.findAll({
      
        include: {
            model: User,
            attributes: ['fullName','email', 'adress'],
            where: {
                isApproved: false,
                role: 'medecin'
            }
        }
    });

    return {success: true, data: pendingMedecins};
  } catch (error) {
    console.error('Error fetching pending doctors:', error);
    return { success: false, message: 'Server error' };
  }
}

async function approveMedecin(userId){
    try{

        const user = await User.findByPk(userId);
        if (!user || user.role !== 'medecin') {
        return { success: false, message: 'Doctor not found' };
        }

        user.isApproved = true;
        await user.save();

        return { success:true, message: 'Doctor approved', id: user.id };
    }
    catch (error) {
        console.error('Error approving Doctor:', error);
        return { success:false, message: 'Server error' };
    }
}

module.exports = { getPendingMedecins, approveMedecin };
