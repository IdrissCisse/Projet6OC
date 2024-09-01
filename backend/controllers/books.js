const fs = require('fs');
const path = require('path');

const Book = require('../models/Book') 

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      averageRating: bookObject.averageRating || 0,
      ratings: bookObject.ratings || [] 
    });
 
    book.save()
    .then(() => { res.status(201).json({message: 'Livre enregistré'})})
    .catch(error => { res.status(400).json( { error })})
};

  exports.getAllBooks = (req, res) => {
    Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }))
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id})
  .then(book => res.status(200).json(book))
  .catch(error => res.status(404).json ({ error }));
};  

exports.getBestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 }) 
    .limit(3)
    .then(books => res.status(200).json(books)) 
    .catch(error => res.status(400).json({ error })); 
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
  .then(book => {
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé !' });
    }
    Book.deleteOne({ _id: req.params.id })
      .then(() => {
        const imagePath = path.join(__dirname, '../images', path.basename(book.imageUrl));
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error('Erreur lors de la suppression de l\'image:', err);
          } else {
            console.log('Image supprimée avec succès.');
          }
        });
        res.status(200).json({ message: 'Livre et image supprimés !' });
      })
      .catch(error => res.status(400).json({ error }));
  })
  .catch(error => res.status(500).json({ error }));
};
