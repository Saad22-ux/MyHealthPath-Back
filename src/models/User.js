const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true, // Ensures valid email format
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
    timestamps: false, // Disable the createdAt and modifiedAt columns from the table
    tableName: 'User', // Table name in MySQL
});


User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});


module.exports = User;
