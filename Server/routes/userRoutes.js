const express = require('express');
const { signup, login, getUserProfile } = require('../controllers/userController');
const router = express.Router();
router.post('/signup', signup);
router.post('/login', login);
router.get('/:userId', getUserProfile);
module.exports = router;