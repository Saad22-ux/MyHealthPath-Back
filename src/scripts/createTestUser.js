const sequelize = require('../config/database');
const User = require('../models/User');

async function testCreateUser() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to database.");

    const newUser = await User.create({
      email: 'ali@gmail.com',
      password: 'ali2003'
    });

    console.log("🎉 User created:", newUser.toJSON());
  } catch (error) {
    console.error("❌ Error creating user:", error);
  } finally {
    await sequelize.close();
  }
}

testCreateUser();
