const User = require("../models/authUser");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const { authSchema } = require("../helpers/validation_schema");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../helpers/jwt_helper");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../mailTrap/mail");
//const client = require('../helpers/init_redis')

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", password: "" };
  // incorrect email
  if (err.message === "incorrect email") {
    errors.email = "That email is not registered";
  }

  // incorrect password
  if (err.message === "incorrect password") {
    errors.password = "That password is incorrect";
  }

  // duplicate email error
  if (err.code === 11000) {
    errors.email = "that email is already registered";
    return errors;
  }

  // validation errors
  if (err.message.includes("user validation failed")) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "net ninja secret", {
    expiresIn: maxAge,
  });
};

// controller actions
module.exports = {
  register: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(createError.BadRequest("Email and password are required"));
      }

      const result = await authSchema.validateAsync(req.body);

      const doesExist = await User.findOne({ email: result.email });
      if (doesExist) {
        return next(
          createError.Conflict(`${result.email} is already registered`)
        );
      }

      const user = new User(result);
      const verificationToken = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      user.verificationToken = verificationToken;

      const savedUser = await user.save();
      await sendVerificationEmail(result.email, verificationToken);

      const accessToken = await signAccessToken(savedUser.id);
      const refreshToken = await signRefreshToken(savedUser.id);

      res.cookie("token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.status(201).json({
        message: "User signed up successfully",
        status: true,
        user: savedUser,
        accessToken,
        refreshToken,
        verificationToken,
        verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      return next(error); 
    }
  },

  login: async (req, res, next) => {
    try {
      const result = await authSchema.validateAsync(req.body);
      const user = await User.findOne({ email: result.email }).exec();
      if (!user) throw createError.NotFound("User not registered");

      const isMatch = await user.isValidPassword(result.password);
      if (!isMatch)
        throw createError.Unauthorized("Username/password not valid");

      const accessToken = await signAccessToken(user.id);
      const refreshToken = await signRefreshToken(user.id);

      return res.status(201).json({
        message: "User signed in successfully",
        status: true,
        user: user,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      if (error.isJoi === true)
        return next(createError.BadRequest("Invalid Username/Password"));
      next(error);
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw createError.BadRequest();
      const userId = await verifyRefreshToken(refreshToken);

      const accessToken = await signAccessToken(userId);
      const refToken = await signRefreshToken(userId);
      res.send({ accessToken: accessToken, refreshToken: refToken });
    } catch (error) {
      next(error);
    }
  },

  logout: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw createError.BadRequest();
      const userId = await verifyRefreshToken(refreshToken);
      client.DEL(userId, (err, val) => {
        if (err) {
          console.log(err.message);
          throw createError.InternalServerError();
        }
        res.sendStatus(204);
      });
    } catch (error) {
      next(error);
    }
  },

  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;

      if (!email) {
        return next(new Error("Email is required")); // Passing error to next middleware
      }

      const user = await User.findOne({ email });

      if (!user) return res.status(404).json({ status:false, message: "User not found" });

      // Generate a reset token (In a real-world app, store in DB)
      const resetToken = Math.random().toString(36).substring(2, 12);
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpiresAt = Date.now() + 3600000; // Token valid for 1 hour
      await user.save();

      await sendPasswordResetEmail(email, resetToken);

      res.status(200).json({status:true, message: "Password reset email sent successfully"});

    } catch (error) {
      next(error); // Passing error to next middleware
    }
  },

  verifyEmail: async (req, res, next) => {
    try {
      const { email, verificationToken } = req.body;
      const user = await User.findOne({email,verificationToken });
      console.log(email,verificationToken,user)

      if (!user) {
        return next(createError.BadRequest("Invalid verification token"));
      }

      if (user.verificationTokenExpiresAt < Date.now()) {
        return next(createError.BadRequest("Verification token expired"));
      }

      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpiresAt = undefined;
      await user.save();

      return res.status(200).json({ status:true,message: "Email verified successfully!" });
    } catch (error) {
      return next(error);
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      const { token, password } = req.body;
      const user = await User.findOne({ resetPasswordToken: token });

      if (!user) {
        return res.status(400).json({status:false,message: "Invalid or expired token"});
      }

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiresAt = undefined;

      // Save updated user to database
      await user.save();

      return res.status(200).json({status:true, message: "Password Reset successfully!"});

    } catch (error) {
      return next(error);
    }
  }
};
