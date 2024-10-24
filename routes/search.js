const express = require('express');
const {Template} = require('../models/Template');
const TemplateComment = require('../models/TemplateComment');
const formatDate = require('../utilities/formatDate');
const router = express.Router();

router.get('/', async (req, res) => {
	try {
		const acceptLanguage = req.headers['accept-language'];
		const { tagId, search } = req.query;
	
		let searchQuery = { isDeleted: false, accessControl: 'public' };
	
		if (tagId) {
			searchQuery.tags = tagId;
		}

		if (search) {
      searchQuery.$or = [
        { title: { $regex: search, $options: 'i' } },                 
        { description: { $regex: search, $options: 'i' } },           
        { 'questions.title': { $regex: search, $options: 'i' } },     
        { 'questions.description': { $regex: search, $options: 'i' } }
      ];

      const matchingComments = await TemplateComment.find({ content: { $regex: search, $options: 'i' } });
      const matchingTemplateIds = matchingComments.map(comment => comment.templateId);

      if (matchingTemplateIds.length > 0) {
        searchQuery.$or.push({ _id: { $in: matchingTemplateIds } });
      }
    }

		let templates = await Template.find(searchQuery)
      .populate('userId')
      .populate('topicId')
      .sort({ createdAt: -1 })
			.lean();

		templates = templates.map(template => {
			let t = {...template}
			t.createdAt = formatDate(template.createdAt);
			t.userId = template.userId._id 
			t.user = `${template.userId.name} (${template.userId.email})` 
			t.topicId = template.topicId._id
			t.topic = template.topicId.name[acceptLanguage]

			return t;
		});
		
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
  }
});

module.exports = router;
