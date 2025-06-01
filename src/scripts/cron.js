const cron = require('node-cron');
const { genererRappelsAutomatiques } = require('./Service/notificationService');

cron.schedule('0 8 * * *', async () => {
  console.log("Vérification quotidienne des indicateurs...");
  await genererRappelsAutomatiques();
});