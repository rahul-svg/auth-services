const Joi = require('@hapi/joi')

const authRegisterSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(2).required(),
  username:Joi.string().min(6).required(),
})


const authLoginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(2).required(),
})

module.exports = {
  authRegisterSchema,authLoginSchema
}
