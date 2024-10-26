// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://192.168.29.5:8081', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));
app.use(express.json());

// Create and connect MySQL database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Import and use routes
const userRoutes = require('./routes/users');
const serviceRoutes = require('./routes/services');
const reviewRoutes = require('./routes/reviews');
const reportRoutes = require('./routes/reports');

app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to the Neighborhood Service API');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
