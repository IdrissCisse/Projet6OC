const express = require('express');
const auth = require('../middleware/auth');
const booksCtrl = require('../controllers/books');
const multer = require('../middleware/multer-config');

const router = express.Router();

router.post('/', auth,  multer, booksCtrl.createBook);

router.delete('/:id', auth, booksCtrl.deleteBook);

router.get('/', booksCtrl.getAllBooks);

router.get('/bestrating', booksCtrl.getBestRating);

router.get('/:id', booksCtrl.getOneBook);



module.exports = router; 