const { signup, login,verify,info } = require('../controller/AuthController');
const ensureAuthenticated = require('../middlewares/auth'); // only import it
const { signupValidation, loginValidation } = require('../middlewares/AuthValidation');
const express = require('express');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const User = require('../models/user'); // Capital U for convention



router.post('/login', loginValidation, login);
router.post('/signup',signupValidation, signup);
router.get('/verify',verify);
const jwt = require('jsonwebtoken');
// router.get('/user/:email',ensureAuthenticated,info);

  router.get('/user/:email', ensureAuthenticated , async (req, res) => {
    try {
      const email = req.params.email;  // ✅ this line was missing
      const user = await User.findOne({ email }); // also changed `User` to lowercase `user`, as per your import
      console.log('Raw user:', user);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      const userWithoutPassword = user.toObject();
      delete userWithoutPassword.password;
      
      res.json({ success: true, user: userWithoutPassword });
  
    } catch (err) {
      console.error('Error fetching user by email:', err.message, err.stack);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  

 
 
module.exports = router;

