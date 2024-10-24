const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Template } = require('../models/Template');
const Form = require('../models/Form');

const detailRouterMiddleware = async (req, res, next) => {
  const { _id: templateId } = req.params
  const token = req.headers.authorization?.split(' ')[1];
  let user = {}
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return
    } else {

      const userDB = await User.findById(decoded._id);
      
      if (userDB && userDB.role != decoded.role) {
        return res.status(401).json();
      }
      
      if (userDB && userDB.status == 'blocked') {
        return res.status(401).json({ message: 'User is blocked' });
      }
      user = decoded;
    }
  });
  const {f} = req.query

  const template = await Template.findById(templateId);
  let allowedUsers = template?.allowedUsers || []

  let form = await Form.findById(f);

  if (form && form.templateId != templateId && template.isDeleted) {
    res.status(404).json({error: 'Template deleted'})
  }

  if (template.accessControl == 'private') {
    if (user && (user._id == template.userId || user.role == 'admin' || allowedUsers.find(u => u._id == user._id))) {
      next();
    } else {
      res.status(405).json({ error: 'Not allowed'})
    }
  } else {
    next();
  }
};

const editRouterMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { _id } = req.params
  const user = req.user;

  const template = await Template.findById(_id);
  
  if (template.isDeleted) {
    res.status(404).json({error: 'Template deleted'})
  } else if (user._id != template.userId && user.role != 'admin') {
    res.status(405).json({ error: 'Not allowed'})
  } else {
    next();
  }
};

module.exports = {
  templateDetailRouterMiddleware: detailRouterMiddleware,
  templateEditRouterMiddleware: editRouterMiddleware,
  templateDeleteRouterMiddleware: editRouterMiddleware,
}
