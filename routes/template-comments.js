const express = require('express');
const router = express.Router();
const authMiddleware = require('../utilities/authMiddleware');
const TemplateComment = require('../models/TemplateComment');
const formatDate = require('../utilities/formatDate');
const User = require('../models/User');

router.get('/:templateId', async (req, res) => {
  const { templateId } = req.params;
  try {
    let comments = await TemplateComment.find({templateId});
    let sentComment = await Promise.all(
      comments.map(async (c) => {
        let user = await User.findById(c.userId)
        return ({
          user: `${user.name} ( ${user.email} )`,
          ...c.toObject(),
          createdDate: formatDate(c.createdDate)
        })
      })
    )
    res.json(sentComment || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error });
  }
});

router.post('/create', authMiddleware, async (req, res) => {
  const { content, templateId } = req.body;
  const user = req.user;
  
  if (!content) {
    return res.status(400).json({ message: 'Missing content' });
  }
  if (!templateId) {
    return res.status(400).json({ message: 'Missing template id' });
  }

  try {
    let comment = await TemplateComment.create({
      content,
      userId: user._id,
      templateId,
    });
    res.status(201).json(comment)
  } catch (error) {
    res.status(500).json({ message: 'Error editing template reaction', error });
  }
});

module.exports = router;
