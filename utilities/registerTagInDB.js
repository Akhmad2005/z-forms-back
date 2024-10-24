const Tag = require('../models/Tag');

const registerTagInDB = async (tag) => {
  let newTag = new Tag({name: tag.name});
  let savedTag = await newTag.save(); 
  return savedTag._id
}

module.exports = registerTagInDB