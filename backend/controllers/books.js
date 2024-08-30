const Book = require('../models/Book') 

exports.createBook = (req, res, next) => {
    delete req.body._id;
    const book = new Book({
      ...req.body
    });
    book.save()
    .then (() => res.status(201).json({ message: 'Livre enregistré !'}))
    .catch(error => res.status(400).json({ error }));
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