const { User } = require('../models');
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');


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

async function getGlobalUserCounts() {
  try {
    const [totalUsers, totalPatients, totalMedecins] = await Promise.all([
      User.count(),
      User.count({ where: { role: 'patient' } }),
      User.count({ where: { role: 'medecin' } }),
    ]);

    return {
      success: true,
      data: {
        totalUsers,
        totalPatients,
        totalMedecins,
      }
    };
  } catch (err) {
    console.error('Erreur getGlobalUserCounts:', err);
    return { success: false, message: "Erreur serveur" };
  }
}

async function getUserRegistrationPerMonth() {
  try {
    const results = await User.findAll({
      attributes: [
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('createdAt'), '%Y-%m'), 'month'],
        'role',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: {
        role: ['patient', 'medecin']
      },
      group: ['month', 'role'],
      raw: true,
    });

    const monthlyData = {};

    results.forEach(({ month, role, count }) => {
      if (!monthlyData[month]) {
        monthlyData[month] = { month, patients: 0, medecins: 0 };
      }
      if (role === 'patient') {
        monthlyData[month].patients = parseInt(count);
      } else if (role === 'medecin') {
        monthlyData[month].medecins = parseInt(count);
      }
    });

    return {
      success: true,
      data: Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)),
    };
  } catch (err) {
    console.error('Erreur getUserRegistrationPerMonth:', err);
    return { success: false, message: "Erreur serveur" };
  }
}

module.exports = {
  createAdminUser,
  getAllUsers,
  desactiverCompteUtilisateur,
  getGlobalUserCounts,
  getUserRegistrationPerMonth
};
