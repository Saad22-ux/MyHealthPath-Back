const path = require('path');
const sequelize = require('../config/database')
const User = require(path.resolve(__dirname, '../models/User'));


sequelize.sync({ alter: true }) // Automatically alters the schema
  .then(() => console.log("✅ User table created"))
  .catch(err => console.error("❌ Database sync error:", err))
  .finally(() => sequelize.close());
