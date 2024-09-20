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
    .then(() => { res.status(201).json({message: 'Livre enregistré avec succés'})})
    .catch(error => { res.status(400).json({message: 'Erreur lors de l\'enregistrement du livre', error })})
};

  exports.getAllBooks = (req, res) => {
    Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({message: 'Erreur lors de la récupération des livres', error }))
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id})
  .then(book => res.status(200).json(book))
  .catch(error => res.status(404).json ({message: 'Erreur lors de la récupération de livre', error }));
};  

exports.getBestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 }) 
    .limit(3)
    .then(books => res.status(200).json(books)) 
    .catch(error => res.status(400).json({ message: 'Erreur lors de la récupération des livres les mieux notés', error })); 
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
  .then(book => {
    if (!book) {
      return res.status(404).json({ message: 'Livre introuvable !' });
    }

    if (book.userId !== req.auth.userId) {
      return res.status(403).json({ message: 'Requête non autorisée : vous n\'êtes pas le propriétaire de ce livre' });
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
      .catch(error => res.status(400).json({message: 'Erreur lors de la suppression du livre', error }));
  })
  .catch(error => res.status(500).json({message: 'Livre introuvable !', error }));
};

exports.modifyBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre introuvable !' });
      }

      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: 'Requête non autorisée : vous n\'êtes pas le propriétaire de ce livre' });
      }

      let updatedBookData;

      try {
        if (req.file) {
          const bookData = JSON.parse(req.body.book);

          const oldImagePath = path.join(__dirname, '../images', book.imageUrl.split('/images/')[1]);
 
          fs.unlink(oldImagePath, err => {
            if (err) {
              return res.status(500).json({ message: 'Erreur lors de la suppression de l\'ancienne image' });
            }

            updatedBookData = {
              ...bookData,
              imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`, 
              _id: req.params.id
            };

            Book.updateOne({ _id: req.params.id }, updatedBookData)
              .then(() => res.status(200).json({ message: 'Livre modifié avec la nouvelle image !' }))
              .catch(error => res.status(400).json({ message: 'Erreur lors de la modification ', error }));
          });
        } else {
          updatedBookData = {
            ...req.body, 
            _id: req.params.id
          };

          Book.updateOne({ _id: req.params.id }, updatedBookData)
            .then(() => res.status(200).json({ message: 'Livre modifié sans nouvelle image !' }))
            .catch(error => res.status(400).json({message: 'Erreur lors de la modification du livre', error }));
        }
      } catch (error) {
        return res.status(400).json({ message: 'Données du livre incorrectes' });
      }
    })
    .catch(error => res.status(500).json({message: 'Livre introuvable !', error }));
};

exports.rateBook = (req, res, next) => {
  const { userId, rating } = req.body;

  if (!userId || rating === undefined) {
      return res.status(400).json({ message: 'User ID et rating sont requis.' });
  }

  if (rating < 0 || rating > 5) {
      return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5.' });
  }

  Book.findOne({ _id: req.params.id })
      .then(book => {
          if (!book) {
              return res.status(404).json({ message: 'Livre introuvable !' });
          }

          const existingRating = book.ratings.find(r => r.userId === userId);
          if (existingRating) {
              return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
          }

          const newRating = { userId, grade: rating };
          book.ratings.push(newRating);

          const totalRatings = book.ratings.reduce((sum, r) => sum + r.grade, 0);
          book.averageRating = parseFloat((totalRatings / book.ratings.length).toFixed(1));
          
          return book.save()
              .then(updatedBook => res.status(200).json(updatedBook))
              .catch(error => res.status(400).json({message: 'Erreur lors de la sauvegarde du livre:', error }));
      })
      .catch(error => res.status(400).json({message: 'Livre introuvable !', error })
    );
};