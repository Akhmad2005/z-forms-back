const express = require('express');
const {Template} = require('../models/Template');
const router = express.Router();
const authMiddleware = require('../utilities/authMiddleware');
const {
  templateDetailRouterMiddleware, 
  templateDeleteRouterMiddleware, 
  templateEditRouterMiddleware
} = require('../utilities/templateMiddlewares');
const registerTagInDB = require('../utilities/registerTagInDB');
const Topic = require('../models/Topic');
const Tag = require('../models/Tag');
const User = require('../models/User');
const Form = require('../models/Form');
const formatDate = require('../utilities/formatDate');

router.get('/', authMiddleware, async (req, res) => {
  const acceptLanguage = req.headers['accept-language'];
  const user = req.user;
  try {
    let templates = await Template.find({isDeleted: false});
    let sentTemplates = await Promise.all(
      templates.map(async (template) => {
        let templateObject = template.toObject();

        const topic = await Topic.findById(templateObject.topicId);
        templateObject.topic = topic?.toObject()?.name?.[acceptLanguage] || '';

        const user = await User.findById(templateObject.userId);
        templateObject.user = `${user?.toObject().name || ''} ( ${user.toObject().email} )`

        const tags = await Tag.find({ _id: { $in: templateObject.tags } });
        templateObject.tags = tags;

        delete templateObject.questions;
        delete templateObject.isDeleted;
        return templateObject;
      })
    );
    if (user?.role == 'admin') {
      res.json(sentTemplates);
    } else {
      res.json(sentTemplates.filter(t => t.userId == user._id));
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching templates', error });
  }
});

router.get('/:_id', templateDetailRouterMiddleware, async (req, res) => {
  const acceptLanguage = req.headers['accept-language'];
  const { _id } = req.params;
  const {mode} = req.query
  let template = await Template.findById(_id);
  try {
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    let sentTemplate = template.toObject();
    delete sentTemplate.isDeleted;
    if (mode == 'readonly') {
      const topic = await Topic.findById(template.topicId);
      sentTemplate.topic = topic?.name?.[acceptLanguage] || '';
      const tags = await Tag.find({ _id: { $in: template.tags } });
      sentTemplate.tags = tags;
      res.json(sentTemplate);
    } else {
      res.json(sentTemplate);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error: ', error });
  }
});

router.get('/:_id/forms', authMiddleware, async (req, res) => {
  const {_id: templateId} = req.params;
  let template = await Template.findById(templateId);
  if (!template) {
    res.status(404).json({error: 'Template not found'});
  }
  try {
    let forms = await Form.find({templateId});
    let sentForms = await Promise.all(
      forms.map(async (form) => {
        let formObject = form.toObject();
        const template = await Template.findById(formObject.templateId);
        const user = await User.findById(formObject.userId);
        formObject.user = `${user?.toObject()?.name || ''} ( ${user?.toObject()?.email || ''} )`
        formObject.templateTitle = template?.toObject()?.title || ''
        formObject.createdDate = formatDate(formObject?.createdDate);
        delete formObject.isDeleted 
        return formObject;
      })
    );
    res.json(sentForms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching forms', error });
  }
})

router.post('/create', authMiddleware, async (req, res) => {
  const { form } = req.body;

  if (!form) {
    return res.status(400).json({ message: 'Missing form' });
  }

  form.userId = req.user._id;

  const requiredFields = Object.keys(Template.schema.paths).filter(
    key => Template.schema.paths[key].isRequired
  );

  const missingFields = requiredFields.filter(field => !form[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: 'Required fields are missing',
      missingFields,
    });
  }
  
  if (form?.tags?.length) {
    const tagPromises = form.tags.map(async(tag) => {
      if (tag._id === 'new') {
        const _id = await registerTagInDB(tag);
        return _id 
      } else {
        return tag
      }
    })
    form.tags = await Promise.all(tagPromises);
  }

  if (form?.questions?.length) {
    form.questions = form.questions.map((question) => {
      let { _id, ...rest } = question 
      return rest
    })
  }

  try {
    let template = new Template(form);
    await template.save();
    res.json({ message: 'Created successfully'});
  } catch (error) {
    console.error('Error creating:', error);
    res.status(500).json({ message: 'Error creating', error });
  }
});

router.patch('/:_id', authMiddleware, templateEditRouterMiddleware, async (req, res) => {
  const { _id } = req.params;
  const { form } = req.body;
  
  if (!form) {
    return res.status(400).json({ message: 'Missing form' });
  }
  
  if (form?.tags?.length) {
    const tagPromises = form.tags.map(async(tag) => {
      if (tag._id === 'new') {
        const _id = await registerTagInDB(tag);
        return _id 
      } else {
        return tag
      }
    })
    form.tags = await Promise.all(tagPromises);
  }

  if (form?.questions?.length) {
    form.questions = form.questions.map((question) => {
      let { _id, ...rest } = question 
      return rest
    })
  }

  try {
    const updatedTemplate = await Template.findByIdAndUpdate(_id, {$set: form}, {new: true});
    if (!updatedTemplate) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json({ message: 'Template edited successfully', data: updatedTemplate });
  } catch (error) {
    console.error('Error editing template:', error);
    res.status(500).json({ message: 'Error editing template', error });
  }
});

router.delete('/:_id', authMiddleware, templateDeleteRouterMiddleware, async (req, res) => {
  const { _id } = req.params;
  try {
    await Template.findByIdAndUpdate(_id, {$set: {isDeleted: true}});
    res.json({ message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting template', error });
  }
});

router.get('/list/latest', async (req, res) => {
  const acceptLanguage = req.headers['accept-language'];
  const { limit } = req.query
  const limitNumber = parseInt(limit);

  try {
    let query = Template
      .find({isDeleted: false, accessControl: 'public'})
      .sort({ createdAt: -1 })
      .limit(limitNumber);
    if (!isNaN(limitNumber)) {
      query = query.limit(limitNumber);
    }
    let templates = await query;
    let sentTemplates = await Promise.all(
      templates.map(async (template) => {
        let templateObject = template.toObject();
        templateObject.createdAt = formatDate(template.createdAt);
        const topic = await Topic.findById(templateObject.topicId);
        templateObject.topic = topic?.toObject()?.name?.[acceptLanguage] || '';

        const user = await User.findById(templateObject.userId);
        templateObject.user = `${user?.toObject().name || ''} ( ${user.toObject().email} )`

        const tags = await Tag.find({ _id: { $in: templateObject.tags } });
        templateObject.tags = tags;

        delete templateObject.questions;
        delete templateObject.isDeleted;
        return templateObject;
      })
    );
    res.json(sentTemplates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching templates', error });
  }
});

router.get('/list/popular', async (req, res) => {
  const acceptLanguage = req.headers['accept-language'];
  const { limit } = req.query
  const limitNumber = Number.isNaN(parseInt(limit)) ? 10 : parseInt(limit);

  try {
    const templates = await Form.aggregate([
      {
        // Группировать по templateId и подсчитывать количество форм на шаблон
        $group: {
          _id: '$templateId',
          formCount: { $sum: 1 }
        }
      },
      {
        // Присоединять (найти) соответствующие детали шаблона
        $lookup: {
          from: 'templates', // Название коллекции «Шаблон»
          localField: '_id',
          foreignField: '_id',
          as: 'templateDetails'
        }
      },
      {
        // Раскручиваем массив, чтобы получить первый шаблон (он должен быть только один)
        $unwind: '$templateDetails',
      },
      {
        $match: {
          'templateDetails.accessControl': 'public'
        },
      },
      {
        // Сортировать по formCount (популярность)
        $sort: { formCount: -1}
      },
      {
        // Ограничьте количество результатов (например, 10 наиболее популярными шаблонами)
        $limit: limitNumber,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'templateDetails.userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: {
          path: '$userDetails',
        }
      },
      {
        $lookup: {
          from: 'topics',
          localField: 'templateDetails.topicId',
          foreignField: '_id',
          as: 'topicDetail'
        }
      },
      {
        $unwind: {
          path: '$topicDetail',
        }
      },
      {
        $lookup: {
          from: 'tags',
          localField: 'templateDetails.tags',
          foreignField: '_id',
          as: 'tags'
        }
      },
      {
        // При желании проецируйте требуемые поля
        $project: {
          formCount: 1,
          _id: '$_id',
          title: '$templateDetails.title',
          userId: '$templateDetails.userId',
          description: '$templateDetails.description',
          user: {
            $concat: [
              { $ifNull: ['$userDetails.name', ''] },
              ' (',
              { $ifNull: ['$userDetails.email', ''] },
              ')'
            ]
          },
          topic: `$topicDetail.name.${acceptLanguage}`,
          tags: 1
        }
      }
    ]);
    return res.status(200).json(templates);
  } catch (err) {
    console.error('Error fetching popular templates:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
