const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Controller = require('../Controller/controller');

// Define your routes
router.get('/', Controller.renderHomePage);

router.get('/upload', (req, res) => {
    res.render('upload'); 
});
const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/; // Allowed image formats
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Error: File upload only supports the following filetypes - ' + filetypes));
        }
    },
});router.post('/upload', upload.single('image'), Controller.uploadImage);

const Image = require('../models/Images'); // Assuming you have an Image model in MongoDB

// Search for images by tag
router.get('/search', async (req, res) => {
    const searchTerm = req.query.q.toLowerCase(); // Get the search term from query parameters

    try {
        // Use a regular expression to match tags that contain the search term
        const images = await Image.find({ tags: { $regex: searchTerm, $options: 'i' } }); // Match tags partially

        // Render the dashboard with the filtered images
        res.render('index', { images: images }); // Render with images found
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).send('Internal Server Error');
    }
});



// Export the router
module.exports = router;
