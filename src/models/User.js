const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true, 
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'medecin', 'patient'),
    allowNull: false,
    defaultValue: 'medecin'   
  }
}, {
    timestamps: false, 
    tableName: 'User', 
});


User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});


module.exports = User;
