const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const authRoutes = require('./Controllers/authRoutes'); 
const registerRoutes = require('./Controllers/registerRoutes');
const adminRoutes = require('./Controllers/adminRoutes');
const sequelize = require('./config/database');
const cors = require('cors');


const app = express();
app.use(express.json());

//Enable cors for all routes 
app.use(cors({
  origin: 'http://localhost:4200', // Angular app URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Allow cookies to be sent from Angular to Express
}));


const sessionStore = new MySQLStore({
  host: 'localhost',
  user: 'saad',
  password: 'kirmizi',
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
  origin: 'http://localhost:4200', 
  credentials: true
}));


app.use(authRoutes);
app.use(registerRoutes);
app.use(adminRoutes);


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
