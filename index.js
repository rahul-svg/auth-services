const express = require('express');
const dotenv = require('dotenv');
require('dotenv').config();
const connectDB = require('./config/db');
const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI
const app = express();
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');

//  Middlewares
app.use(express.json());
app.use('/auth-services',authRoutes);
app.use(cookieParser());

// DB Connect
 connectDB(mongoURI);
 
app.listen(PORT,() => {
    console.log(`App is running at ${PORT}`)
})