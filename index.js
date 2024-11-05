const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const templateRoutes = require('./routes/templates');
const templateReactionsRoutes = require('./routes/template-reactions');
const templateCommentsRoutes = require('./routes/template-comments');
const topicRoutes = require('./routes/topics');
const tagsRoutes = require('./routes/tags');
const formsRoutes = require('./routes/forms');
const searchRoutes = require('./routes/search');
const salesforceRoutes = require('./routes/salesforce/index');

const app = express();
connectDB();

app.use(cors({
  origin: 'https://z-forms.vercel.app',
  credentials: true,
}));
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/template-reactions', templateReactionsRoutes);
app.use('/api/template-comments', templateCommentsRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/forms', formsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/salesforce', salesforceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app