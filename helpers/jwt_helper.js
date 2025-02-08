const JWT = require('jsonwebtoken')
const createError = require('http-errors')
//const client = require('./init_redis')
require('dotenv').config();

module.exports = {
  signAccessToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {}
      const secret = process.env.ACCESS_TOKEN_SECRET
      const options = {
        expiresIn: '1h',
        issuer: 'pickurpage.com',
        audience: userId,
      }
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err.message)
          reject(createError.InternalServerError())
          return
        }
        resolve(token)
      })
    })
  },




  
  verifyAccessToken: (req, res, next) => {
    if (!req.headers['authorization']) return next(createError.Unauthorized())
    const authHeader = req.headers['authorization']
    const bearerToken = authHeader.split(' ')
    const token = bearerToken[1]
    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        const message =
          err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
        return next(createError.Unauthorized(message))
      }
      req.payload = payload
      next()
    })
  },


 signRefreshToken: (userId) => {
  return new Promise((resolve, reject) => {
    if (!process.env.REFRESH_TOKEN_SECRET) {
      console.error("❌ REFRESH_TOKEN_SECRET is not defined in .env file");
      return reject(createError.InternalServerError("Missing secret key"));
    }

    const payload = {};
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const options = {
      expiresIn: "1y",
      issuer: "pickurpage.com",
      audience: userId.toString(), // Ensure it's a string
    };

    JWT.sign(payload, secret, options, (err, token) => {
      if (err) {
        console.error("❌ Error signing refresh token:", err.message);
        return reject(createError.InternalServerError());
      }
      resolve(token);
    });
  });
},
  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      JWT.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, payload) => {
          if (err) return reject(createError.Unauthorized())
          const userId = payload.aud
          // client.GET(userId, (err, result) => {
          //   if (err) {
          //     console.log(err.message)
          //     reject(createError.InternalServerError())
          //     return
          //   }
          //   if (refreshToken === result) return resolve(userId)
          //   reject(createError.Unauthorized())
          // })
        }
      )
    })
  },
}
