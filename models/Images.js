const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    url: { type: String, required: true },
    key: { type: String, required: true },
    tags: [{ type: String, required: true }], // Array of tags generated from Rekognition
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Image', imageSchema);
