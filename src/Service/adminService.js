const { User } = require('../models');

async function createAdminUser(userData) {
  try {
    const newUser = await User.create({
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        role: 'admin', 
        isApproved: true,
    });
    return newUser;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

module.exports = {
  createAdminUser,
};
