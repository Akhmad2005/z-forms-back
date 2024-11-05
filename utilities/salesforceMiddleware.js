const jwt = require('jsonwebtoken');
const User = require('../models/User');

const salesforceMiddleware = (req, res, next) => {
  const token = req.headers['salesforce-token'];
  const instance_url = req.headers['salesforce-instance_url'];
  if (!token) {
    return res.status(400).json({errorCode: 'TOKEN_NOT_FOUND'});
  } else if (!instance_url) {
    return res.status(400).json({errorCode: 'INSTANCE_URL_NOT_FOUND'});
  } else {
    req.salesforce = {
      token,
      instance_url,
    };
    next();
  }
};

module.exports = salesforceMiddleware
