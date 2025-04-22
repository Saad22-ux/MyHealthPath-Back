const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Patient = require('./Patient');

const Indicateur = sequelize.define('Indicateur', {
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  valeur: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  date_mesure: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  timestamps: false,
  tableName: 'Indicateur',
});


Patient.hasMany(Indicateur);
Indicateur.belongsTo(Patient, {
  foreignKey: {
    name: 'PatientId',
    allowNull: false
  },
  onDelete: 'CASCADE'
});

module.exports = Indicateur;