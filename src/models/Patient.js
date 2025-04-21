const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Medecin = require('./Medecin');

const Patient = sequelize.define('Patient', {
  date_naissance: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  genre: {
    type: DataTypes.ENUM('homme', 'femme'),
    allowNull: false,
  }
}, {
  timestamps: false,
  tableName: 'Patient',
});


Patient.belongsTo(User, {
  foreignKey: {
    name: 'UserId',
    type: DataTypes.INTEGER,
    allowNull: false
  },
  onDelete: 'CASCADE'
});

Patient.belongsTo(Medecin, {
  foreignKey: {
    name: 'MedecinId',
    type: DataTypes.INTEGER,
    allowNull: false
  },
  onDelete: 'SET NULL'
});

module.exports = Patient;
