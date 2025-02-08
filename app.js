const express = require('express');
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const app = express();
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const morgan = require('morgan')
const createError = require('http-errors')
require('dotenv').config()
require('./helpers/init_mongodb')
const cors = require('cors');
//require('./helpers/init_redis')

//  Middlewares
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(morgan('dev'))
app.use('/auth-services',authRoutes);
app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// Handling 404 Errors

 app.use(async (req, res, next) => {
    next(createError.NotFound())
  })

//  Handling All Errors
  app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send({
      error: {
        status: err.status || 500,
        message: err.message,
      },
    })
  })
 
app.listen(PORT,() => {
    console.log(`App is running at ${PORT}`)
})