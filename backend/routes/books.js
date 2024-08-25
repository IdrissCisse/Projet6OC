const express = require('express');
const booksCtrl = require('../controllers/books');

const router = express.Router();


router.get('/',  booksCtrl.getAllBooks);
router.post('/',  booksCtrl.createBook);

module.exports = router; 