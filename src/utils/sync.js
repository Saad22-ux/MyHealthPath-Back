const { sequelize } = require('../models'); 

sequelize.sync({ alter: true }) 
  .then(() => console.log("✅ Tables created or updated"))
  .catch(err => console.error("❌ Database sync error:", err))
  .finally(() => sequelize.close());
