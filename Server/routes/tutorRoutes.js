const express = require('express');
const { addTutor, getTutors, deleteTutor } = require('../controllers/tutorController');
const router = express.Router();
router.post('/add', addTutor);
router.get('/', getTutors);
router.delete('/:id', deleteTutor);
module.exports = router;