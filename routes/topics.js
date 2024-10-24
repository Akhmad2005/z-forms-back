const express = require('express');
const Topic = require('../models/Topic');
const router = express.Router();
const authMiddleware = require('../utilities/authMiddleware')

// const topicDatas = [
//   { name: { ru: 'Здоровье', en: 'Health' } },
//   { name: { ru: 'Финансы', en: 'Finance' } },
//   { name: { ru: 'Технологии', en: 'Technology' } },
//   { name: { ru: 'Маркетинг', en: 'Marketing' } },
//   { name: { ru: 'Право', en: 'Law' } },
//   { name: { ru: 'Исследования', en: 'Research' } },
//   { name: { ru: 'Бизнес', en: 'Business' } },
//   { name: { ru: 'Управление проектами', en: 'Project Management' } },
//   { name: { ru: 'Культура', en: 'Culture' } },
//   { name: { ru: 'Спорт', en: 'Sports' } },
//   { name: { ru: 'Развлечения', en: 'Entertainment' } },
//   { name: { ru: 'Психология', en: 'Psychology' } },
//   { name: { ru: 'Экология', en: 'Ecology' } },
//   { name: { ru: 'Социальные науки', en: 'Social Sciences' } },
//   { name: { ru: 'Путешествия', en: 'Travel' } },
//   { name: { ru: 'Недвижимость', en: 'Real Estate' } },
//   { name: { ru: 'Общественное питание', en: 'Hospitality' } },
//   { name: { ru: 'Мода', en: 'Fashion' } },
//   { name: { ru: 'Искусство', en: 'Art' } },
//   { name: { ru: 'Музыка', en: 'Music' } },
//   { name: { ru: 'Общественные науки', en: 'Public Sciences' } },
//   { name: { ru: 'Инновации', en: 'Innovation' } },
//   { name: { ru: 'Медицина', en: 'Medicine' } },
//   { name: { ru: 'Кулинария', en: 'Culinary' } },
//   { name: { ru: 'География', en: 'Geography' } },
//   { name: { ru: 'Автомобили', en: 'Automobiles' } },
//   { name: { ru: 'Вакансии', en: 'Job Offers' } },
//   { name: { ru: 'Стажировки', en: 'Internships' } },
//   { name: { ru: 'Образование и карьера', en: 'Education and Career' } },
//   { name: { ru: 'Командировки', en: 'Business Trips' } },
//   { name: { ru: 'Рабочий график', en: 'Work Schedule' } },
// ]
// topicDatas.forEach(t => {
//   const newTopic = new Topic(t);
//   newTopic.save();
// }) 

// Получение списка пользователей
router.get('/', authMiddleware, async (req, res) => {
  const acceptLanguage = req.headers['accept-language'];
  try {
    const topics = await Topic.find().lean();
    const sentTopics = topics.map(({ name, ...rest }) => ({
      ...rest,
      name: name?.[acceptLanguage] || ''
    }));
    res.json(sentTopics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
  }
});

module.exports = router;
