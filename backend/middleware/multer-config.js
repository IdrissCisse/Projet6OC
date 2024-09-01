const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, 
}).single('image');

const optimizeImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const name = req.file.originalname.split(' ').join('_').split('.').slice(0, -1).join('_');
    const filename = `${name}_${Date.now()}.webp`; 
    const outputPath = path.join(__dirname, '../images', filename);

    try {
        await sharp(req.file.buffer)
        .resize(206, 260, {
            fit: 'cover', 
            position: 'center'
        }) 
            .toFormat('webp') 
            .webp({ quality: 80 }) 
            .toFile(outputPath); 

        req.file.filename = filename; 
        next();
    } catch (error) {
        console.error('Erreur lors de l\'optimisation de l\'image:', error);
        return res.status(500).json({ message: 'Erreur lors du traitement de l\'image' });
    }
};

module.exports = { upload, optimizeImage };