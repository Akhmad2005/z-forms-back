const express = require('express');
const User = require('../models/User');
const Form = require('../models/Form');
const {Template} = require('../models/Template');
const router = express.Router();
const formatDate = require('../utilities/formatDate')
const authMiddleware = require('../utilities/authMiddleware')

router.get('/', authMiddleware, async (req, res) => {
  try {
    let users = await User.find({isDeleted: false});
		let sentUsers = users.map(user => {
      let userObject = user.toObject();
      delete userObject.password;
			userObject.registrationDate = formatDate(userObject?.registrationDate)
			userObject.lastLoginDate = formatDate(userObject?.lastLoginDate)
			
      return userObject;
    });
    res.json(sentUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

router.post('/block', authMiddleware, async (req, res) => {
  const { userId } = req.body;

  try {
    await User.updateOne({ _id: userId, isDeleted: false }, { $set: { status: 'blocked' } });
    res.json({ message: 'User blocked' });
  } catch (error) {
    res.status(500).json({ message: 'Error blocking user', error });
  }
});

router.post('/unblock', authMiddleware, async (req, res) => {
  const { userId } = req.body;

  try {
    await User.updateOne({ _id: userId, isDeleted: false }, { $set: { status: 'unblock' } });
    res.json({ message: 'User unblock' });
  } catch (error) {
    res.status(500).json({ message: 'Error unblock user', error });
  }
});

router.post('/delete', authMiddleware, async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findOne({ _id: userId, isDeleted: false });

    if (!user) {
      return res.status(404).json({ message: 'User not found or already deleted' });
    }

    const newEmail = `${user.email}_deleted_${Date.now()}`;

    await User.updateOne(
      { _id: userId },
      { 
        $set: { 
          isDeleted: true, 
          email: newEmail 
        }
      }
    );

    await Form.updateMany(
      { userId: userId }, 
      { $set: { isDeleted: true } }
    );
    await Template.updateMany(
      { userId: userId }, 
      { $set: { isDeleted: true } }
    );

    res.json({ message: 'User and all related data deleted and email updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

router.patch('/edit', authMiddleware, async (req, res) => {
  const { userId, form } = req.body;

  if (!userId || !form) {
    return res.status(400).json({ message: 'Missing userId or form data' });
  }

  try {
    await User.findOneAndUpdate({_id: userId, isDeleted: false}, { $set: { ...form } })
    res.json({ message: 'User edited successfully' });
  } catch (error) {
    console.error('Error editing user:', error);
    res.status(500).json({ message: 'Error editing user', error });
  }
});

module.exports = router;
