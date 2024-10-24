const express = require('express');
const router = express.Router();
const authMiddleware = require('../utilities/authMiddleware');
const TemplateReaction = require('../models/TemplateReaction');

router.get('/:templateId', authMiddleware, async (req, res) => {
  const { templateId } = req.params;
  const user = req.user;
  try {
    let reaction = await TemplateReaction.findOne({userId: user._id, templateId: templateId});
    if (!reaction) {
      return res.json({reaction: null});
    } else {
      res.json({reaction: reaction.type});
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reaction', error });
  }
});

router.patch('/:templateId', authMiddleware, async (req, res) => {
  const { templateId } = req.params;
  const { reaction: reactionFromClient } = req.body;
  const user = req.user;
  
  if (!reactionFromClient) {
    return res.status(400).json({ message: 'Missing reaction' });
  }

  try {
    let reaction = await TemplateReaction.findOne({userId: user._id, templateId: templateId});
    if (!reaction) {
      let newTemplateReaction = await TemplateReaction.create({
        userId: user._id,
        templateId: templateId,
        type: reactionFromClient,
      })
      res.json({reaction: newTemplateReaction.type});
    } else if (reaction.type == reactionFromClient) {
      await TemplateReaction.findOneAndDelete({userId: user._id, templateId: templateId});
      res.json({reaction: null});
    } else {
      reaction.type = reactionFromClient;
      await reaction.save();
      res.json({reaction: reaction.type});
    }
  } catch (error) {
    res.status(500).json({ message: 'Error editing template reaction', error });
  }
});

module.exports = router;
