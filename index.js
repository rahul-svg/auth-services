const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const morgan = require('morgan')
const createError = require('http-errors')
require('dotenv').config()
//const { verifyAccessToken } = require('./helpers/jwt_helper')
require('./helpers/init_redis')
require('./helpers/init_mongodb')
const PORT = process.env.PORT || 5000;


//  Middlewares
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