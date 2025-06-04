const express = require('express');
const session = require('express-session');
const path = require('path');
const MySQLStore = require('express-mysql-session')(session);
const authRoutes = require('./Controllers/authRoutes'); 
const registerRoutes = require('./Controllers/registerRoutes');
const adminRoutes = require('./Controllers/adminRoutes');
const patientRoutes = require('./Controllers/patientRoutes');
const medicamentRoutes = require('./Controllers/medicamentRoutes');
const indicateurRoutes = require('./Controllers/indicateurRoutes');
const prescriptionRoutes = require('./Controllers/prescriptionRoutes');
const journalSanteRoutes = require('./Controllers/journalSanteRoutes');
const medecinRoutes = require('./Controllers/medecinRoutes');
const sequelize = require('./config/database');
const cors = require('cors');
const cron = require('node-cron');
const { genererRappelsAutomatiques } = require('./Service/notificationService');



const app = express();
app.use(express.json());




const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

app.use(session({
  key: 'connect.sid',
  secret: 'your_secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(cors({
  origin: 'http://localhost:4200', 
  credentials: true
}));


app.use(authRoutes);
app.use(registerRoutes);
app.use(adminRoutes);
app.use(patientRoutes);
app.use(medicamentRoutes);
app.use(indicateurRoutes);
app.use(prescriptionRoutes);
app.use(journalSanteRoutes);
app.use(medecinRoutes);
app.use('/uploads/photos', express.static('uploads/photos'));

cron.schedule('0 20 * * *', async () => {
  console.log('[CRON] Génération automatique des rappels en cours...');
  try {
    await genererRappelsAutomatiques();
    console.log('[CRON] Rappels générés avec succès.');
  } catch (error) {
    console.error('[CRON] Échec de la génération des rappels :', error);
  }
});

sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected.');
    app.listen(3000, () => {
      console.log('🚀 Server is running on http://localhost:3000');
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err);
  });