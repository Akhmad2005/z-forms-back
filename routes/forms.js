const express = require('express');
const Form = require('../models/Form');
const router = express.Router();
const authMiddleware = require('../utilities/authMiddleware');
const {formDeleteRouterMiddleware, formDetailRouterMiddleware, formEditRouterMiddleware} = require('../utilities/formMiddlewares')
const formatDate = require('../utilities/formatDate');
const {Template} = require('../models/Template');
const User = require('../models/User');

router.get('/', authMiddleware, async (req, res) => {
  const user = req.user;
  try {
    const forms = await Form.find({ isDeleted: false }).lean();
    
    const sentForms = await Promise.all(
      forms.map(async (form) => {
        const [template, userDetails] = await Promise.all([
          Template.findById(form.templateId).lean(),
          User.findById(form.userId).lean(),
        ]);

        return {
          ...form,
          user: `${userDetails?.name || ''} (${userDetails?.email || ''})`,
          templateTitle: template?.title || '',
          createdDate: formatDate(form?.createdDate),
        };
      })
    );

    res.json(user?.role === 'admin' ? sentForms : sentForms.filter(f => f.userId.toString() === user._id.toString()));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
  }
});

router.get('/:_id', authMiddleware, formDetailRouterMiddleware, async (req, res) => {
  const { _id } = req.params;
  try {
    let form = await Form.findById(_id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    let sentForm = form.toObject();
    delete sentForm.isDeleted;
    res.json(sentForm);
  } catch (error) {
    res.status(500).json({ message: 'Error: ', error });
  }
});

router.post('/create', authMiddleware, async (req, res) => {

  const { form } = req.body;
  
  if (!form) {
    return res.status(400).json({ message: 'Missing form' });
  }

  form.userId = req.user._id;

  const requiredFields = Object.keys(Form.schema.paths).filter(
    key => Form.schema.paths[key].isRequired
  );

  const missingFields = requiredFields.filter(field => !form[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: 'Required fields are missing',
      missingFields,
    });
  }
  
  try {
    let dbForm = new Form(form);
    await dbForm.save();
    res.json({ message: 'Created successfully'});
  } catch (error) {
    console.error('Error creating:', error);
    res.status(500).json({ message: 'Error creating', error });
  }
});

router.patch('/:_id', authMiddleware, formEditRouterMiddleware, async (req, res) => {
  const { _id } = req.params;
  const { form } = req.body;
  
  if (!form) {
    return res.status(400).json({ message: 'Missing form' });
  }

  try {
    const updatedForm = await Form.findByIdAndUpdate(_id, {$set: form}, {new: true});
    if (!updatedForm) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.json({ message: 'Form edited successfully', data: updatedForm });
  } catch (error) {
    console.error('Error editing form:', error);
    res.status(500).json({ message: 'Error editing form', error });
  }
});

router.delete('/:_id', authMiddleware, formDeleteRouterMiddleware,  async (req, res) => {
  const { _id } = req.params;
  try {
    await Form.findByIdAndUpdate(_id, {$set: {isDeleted: true}});
    res.json({ message: 'Form deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting form', error });
  }
});

module.exports = router;
