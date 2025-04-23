const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Patient = require('./Patient');

const Medicament = sequelize.define('Medicament',{
    name: {
        type: DataTypes.STRING,
        allowNull: false
    } ,
    dose: {
        type: DataTypes.STRING, allowNull: false
    },
    frequency: {
      type: DataTypes.STRING,
      allowNull: false
    } 
},{
    timestamps: false, 
    tableName: 'Medicament', 
});

Patient.hasMany(Medicament);
Medicament.belongsTo(Patient, {
    foreignKey: {
      name: 'PatientId',
      allowNull: false
    },
    onDelete: 'CASCADE'
  });
module.exports = Medicament;