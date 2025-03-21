// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const db = require('./Config/db');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const tutorRoutes = require('./routes/tutorRoutes');

const app = express();
const port = 5000;

app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/tutors', tutorRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});