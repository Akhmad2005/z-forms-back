const express = require('express');
const Tag = require('../models/Tag');
const {Template} = require('../models/Template');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let tags = await Tag.find();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
  }
});

router.get('/popular', async (req, res) => {
  try {
    const tags = await Template.aggregate([
      {
        $match: {
          'accessControl': 'public'
        },
      },
      {
        $unwind: '$tags'
      },
      {
        $group: {
          _id: '$tags',
          tagCount: { $sum: 1 }
        }
      },
      {
        $sort: { tagCount: -1 }
      },
      {
        $lookup: {
          from: 'tags',
          localField: '_id',
          foreignField: '_id',
          as: 'tagDetails'
        }
      },
      {
        $unwind: '$tagDetails'
      },
      {
        $project: {
          _id: 1,
          name: '$tagDetails.name',
          tagCount: 1
        }
      }
    ]);
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
  }
});



module.exports = router;
