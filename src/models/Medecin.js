const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Medecin = sequelize.define('Medecin',{
    specialite: {
        type: DataTypes.STRING,
        allowNull: false
    }  
},{
    timestamps: false, 
    tableName: 'Medecin', 
});

Medecin.belongsTo(User);
module.exports = Medecin;