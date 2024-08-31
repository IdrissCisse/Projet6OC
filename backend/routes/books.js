const express = require('express');
const auth = require('../middleware/auth');
const booksCtrl = require('../controllers/books');


const router = express.Router();
router.post('/', auth,   booksCtrl.createBook);

router.delete('/:id', auth, booksCtrl.deleteBook);

router.get('/', booksCtrl.getAllBooks);

router.get('/bestrating', booksCtrl.getBestRating);

router.get('/:id', booksCtrl.getOneBook);



module.exports = router; 