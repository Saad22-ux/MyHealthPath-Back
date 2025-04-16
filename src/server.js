const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const authRoutes = require('./Controllers/authRoutes'); 
const registerRoutes = require('./Controllers/registerRoutes');
const sequelize = require('./config/database');
const cors = require('cors');


const app = express();
app.use(express.json());


const sessionStore = new MySQLStore({
  host: 'localhost',
  user: 'myHealthPathUser',
  password: 'SaadAli1234',
  database: 'myhealthpath'
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
  origin: 'http://localhost:4200', // Angular dev URL
  credentials: true
}));


app.use(authRoutes);
app.use(registerRoutes);


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
