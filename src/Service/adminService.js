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
    console.error("Error fetching users", error);
    return { success: false, message: "Server Error" };
  }
}

async function desactiverCompteUtilisateur(userId) {
  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (user.role === 'admin') {
      return { success: false, message: "Unable to desactivate an admin" };
    }

    user.isApproved = !user.isApproved;
    await user.save();

    const status = user.isApproved ? "activated" : "disactivated";

    return { success: true, message: `User account ${status} successfully`, user };

  } catch (error) {
    console.error("Error desactivating this account :", error);
    return { success: false, message: "Server error" };
  }
}

module.exports = {
  createAdminUser,
  getAllUsers,
  desactiverCompteUtilisateur
};
