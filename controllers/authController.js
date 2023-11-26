const User = require('../models/authUser')

// controller actions
module.exports.signup_get = (req, res) => {
  res.json({
    message: "sign up get",
  });
  }
  
  module.exports.login_get = (req, res) => {
    res.json({
      message: "login get",
    });
  }
  
  module.exports.signup_post =  async(req, res) => {
   const {email,password} = req.body;
   try{
      const user = await User.create({email,password})
      res.status(201).json(user)
   }catch(err){
    console.log(err)
   }
  }
  
  module.exports.login_post =  (req, res) => {
    res.json({
      message: "login post"
    });
  }