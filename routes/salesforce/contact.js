const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../../utilities/authMiddleware')
const salesforceMiddleware = require('../../utilities/salesforceMiddleware')
const User = require('../../models/User')

router.post('/', authMiddleware, salesforceMiddleware, async (req, res) => {
  const { FirstName, LastName, Email } = req.body;
  const { token: salesforce_token, instance_url: salesforce_instance_url } = req.salesforce;
  const userId = req.user._id;

  try {
    const response = await axios.post(
        `${salesforce_instance_url}/services/data/v62.0/sobjects/Contact`,
        {
          FirstName,
          LastName,
          Email,
          User_Object_Id__c: userId
        },
        {
          headers: {
            Authorization: `Bearer ${salesforce_token}`,
            'Content-Type': 'application/json'
          }
        }
    );

    const accountId = response.data.id;

    await User.findByIdAndUpdate(userId, { salesforceAccountId: accountId });

    res.status(201).json({ message: 'Contact created and AccountId saved' });
  } catch (error) {
      res.status(500).json({ error: 'Failed to create contact in Salesforce', ...error?.response?.data?.[0] });
  }
});

router.get('/:AccountId', authMiddleware, salesforceMiddleware, async (req, res) => {
  const { token: salesforce_token, instance_url: salesforce_instance_url } = req.salesforce;
  const { AccountId } = req.params;

  try {
    const response = await axios.get(
      `${salesforce_instance_url}/services/data/v62.0/sobjects/Contact/${AccountId}`,
      {
        headers: {
          Authorization: `Bearer ${salesforce_token}`
        }
      }
    );

    res.status(200).json(response.data);
} catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact details', ...error?.response?.data?.[0] });
}
});

router.patch('/:AccountId', authMiddleware, salesforceMiddleware, async (req, res) => {
  const { token: salesforce_token, instance_url: salesforce_instance_url } = req.salesforce;
  const { AccountId } = req.params;
  const updateData = req.body;

  try {
    await axios.patch(
      `${salesforce_instance_url}/services/data/v62.0/sobjects/Contact/${AccountId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${salesforce_token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({ message: 'Contact updated successfully' });
} catch (error) {
    res.status(500).json({ error: 'Failed to update contact', ...error?.response?.data?.[0] });
}
});

router.delete('/:AccountId', authMiddleware, salesforceMiddleware, async (req, res) => {
  const { token: salesforce_token, instance_url: salesforce_instance_url } = req.salesforce;
  const { AccountId } = req.params;
  const userId = req.user._id;

  try {
    await axios.delete(
      `${salesforce_instance_url}/services/data/v62.0/sobjects/Contact/${AccountId}`,
      {
        headers: {
          Authorization: `Bearer ${salesforce_token}`
        }
      }
    );

    await User.findByIdAndUpdate(userId, { $unset: { salesforceAccountId: "" } });
    res.status(200).json({ message: 'Contact deleted and AccountId removed from user record' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact', ...error?.response?.data?.[0] });
  }
});

module.exports = router;
