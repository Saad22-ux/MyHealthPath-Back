const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const db = {};
const files = fs.readdirSync(__dirname).filter(file =>
  file !== 'index.js' && file.endsWith('.js')
);

for (const file of files) {
  const modelDef = require(path.join(__dirname, file));
  const model = modelDef(sequelize, DataTypes);
  db[model.name] = model;
}


Object.values(db).forEach(model => {
  if (model.associate) {
    model.associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;
