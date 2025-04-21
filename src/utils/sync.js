const path = require('path');
const sequelize = require('../config/database')
const User = require(path.resolve(__dirname, '../models/User'));
const Medecin = require(path.resolve(__dirname, '../models/Medecin'));
const Patient = require(path.resolve(__dirname, '../models/Patient'));


sequelize.sync({ alter: true }) 
  .then(() => console.log("tables created"))
  .catch(err => console.error("❌ Database sync error:", err))
  .finally(() => sequelize.close());
