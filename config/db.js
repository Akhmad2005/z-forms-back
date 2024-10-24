const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
    // await mongoose.connection.collection('templates').dropIndex('allowedUsers_1');
    // const indexes = await mongoose.connection.collection('templates').indexInformation();
    // console.log('Indexes on templates collection:', indexes);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
