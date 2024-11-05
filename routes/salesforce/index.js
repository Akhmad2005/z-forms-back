const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../../utilities/authMiddleware')

const salesforceContactRoutes = require('./contact')

router.post('/connect', authMiddleware, async (req, res) => {
  try {
    const response = await axios.post('https://login.salesforce.com/services/oauth2/token', null, {
      params: {
        grant_type: 'password',
        client_id: process.env.SALESFORCE_CLIENT_ID,
        client_secret: process.env.SALESFORCE_CLIENT_SECRET,
        username: process.env.SALESFORCE_USERNAME,
        password: process.env.SALESFORCE_PASSWORD + process.env.SALESFORCE_SECURITY_TOKEN,
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error connecting to salesforce', error });
  }
});

router.use('/contact', salesforceContactRoutes);

module.exports = router;
