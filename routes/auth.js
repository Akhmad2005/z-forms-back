const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
	if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered' });
  } catch (error) {
		if (error?.code && error.code === 11000) {
			res.status(500).json({ message: 'Email was already registrated!' });
		} else {
			res.status(500).json({ message: 'Error registering user', error });
		}
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, isDeleted: false });
    
    if (user && user.status === 'blocked') {
      return res.status(403).json({ message: 'User is blocked' });
    }
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

		user.lastLoginDate = new Date();
    await user.save();

    const token = jwt.sign(
      { _id: user._id, status: user.status, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1w' }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: '', error });
  }
});

module.exports = router;
