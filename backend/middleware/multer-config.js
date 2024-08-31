const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'jpg'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')

        console.log('Destination: ', 'images'); 
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_').split('.').slice(0, -1).join('.');
        const extension = MIME_TYPES[file.mimetype];

        console.log(`Filename: ${name}${Date.now()}.${extension}`);
        callback(null, name + Date.now() + '.' + extension);
    }
});

module.exports = multer({ storage }).single('image'); 