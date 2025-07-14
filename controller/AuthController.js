const UserModel = require("../models/user");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const signup = async (req, res) => {
  try {
    const { firstname, lastname, email,age,contactnumber, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
      return res
        .status(409)
        .json({
          message: "User already exists, login instead",
          success: false,
        });
    }
    const usermodel = new UserModel({ firstname,lastname, email,age,contactnumber, password });
    usermodel.password = await bcrypt.hash(password, 10);
    await usermodel.save();
    res.status(201).json({ message: "signup successful", success: true });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(403).json({
        message: "User not found. Please sign up.",
        success: false,
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(403).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    const jwtToken = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    // Login successful
    res.status(200).json({
      message: "Login successful",
      success: true,
      jwtToken,
      email,
      name:user.name
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
const verify= async (req, res) => {
  console.log("inside the verify thing")
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ valid: false, message: 'Invalid token' });
  }
};



module.exports = {
  signup,
  login,
  verify,
};
