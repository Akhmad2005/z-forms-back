const jwt = require('jsonwebtoken');
const Form = require('../models/Form');

const editRouterMiddleware = async (req, res, next) => {
  const { _id } = req.params
  const { _id: userId, role } = req.user;

  const form = await Form.findById(_id);
  
  if (form.isDeleted) {
    res.status(404).json({error: 'Form deleted'})
  }

  if (userId != form.userId && role != 'admin') {
    res.status(405).json({ error: 'Not allowed'})
  } else {
    next();
  }
};

module.exports = {
  formDetailRouterMiddleware: editRouterMiddleware,
  formEditRouterMiddleware: editRouterMiddleware,
  formDeleteRouterMiddleware: editRouterMiddleware,
}
