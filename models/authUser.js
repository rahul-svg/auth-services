const { default: mongoose } = require("mongoose");
const moongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new moongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: [true, "Please enter an email"],
    lowercase: true,
    validator: [isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please Enter Password"],
    minlength: [6, "Minimum password length is 6 characters"],
  },
});

// fire a function before doc saved to db
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.post("save", function (doc, next) {
  console.log(doc);
  next();
});

// static method to login user

userSchema.statics.login = async function (email, password) {
  try {
    const user = await this.findOne({ email });
    if (user) {
      const auth = await bcrypt.compare(password, user.password);
      if (auth) {
        return user;
      }
      throw Error('incorrect password');
    }
    throw Error('incorrect email');
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model("user", userSchema);

module.exports = User;
