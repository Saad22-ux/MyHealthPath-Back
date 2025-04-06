const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const authRoutes = require('./routes/authRoutes'); 
const sequelize = require('./config/database');

const app = express();
app.use(express.json());

// Session store config
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

app.use(authRoutes);

// ✅ Start server only after DB is connected
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
