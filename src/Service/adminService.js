const { User } = require('../models');
const { Op } = require('sequelize');


async function createAdminUser(userData) {
  try {
    const newUser = await User.create({
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        cin: userData.cin,
        role: 'admin', 
        isApproved: true,
    });
    return newUser;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

async function getAllUsers() {
  try {
    const users = await User.findAll({
      where: {
        role: {
          [Op.not]: 'admin'
        }
      },
      attributes: { exclude: ['password'] }
    });

    return { success: true, users };
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    return { success: false, message: "Erreur serveur" };
  }
}

async function desactiverCompteUtilisateur(userId) {
  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return { success: false, message: "Utilisateur non trouvé" };
    }

    if (user.role === 'admin') {
      return { success: false, message: "Impossible de désactiver un compte admin" };
    }

    user.isApproved = !user.isApproved;
    await user.save();

    const status = user.isApproved ? "activé" : "désactivé";

    return { success: true, message: `Compte utilisateur ${status} avec succès`, user };

  } catch (error) {
    console.error("Erreur lors de la désactivation du compte :", error);
    return { success: false, message: "Erreur serveur" };
  }
}

module.exports = {
  createAdminUser,
  getAllUsers,
  desactiverCompteUtilisateur
};
