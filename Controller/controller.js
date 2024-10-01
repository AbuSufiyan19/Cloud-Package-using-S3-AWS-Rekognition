const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const s3 = new AWS.S3();
const bucketName = process.env.S3_BUCKET_NAME;

// Render homepage with images from S3
exports.renderHomePage = async (req, res) => {
    const params = {
        Bucket: bucketName,
    };

    try {
        // List all objects in the bucket
        const data = await s3.listObjectsV2(params).promise();
        const images = data.Contents.map((item) => {
            return {
                url: `https://${bucketName}.s3.amazonaws.com/${item.Key}`,
                key: item.Key,
            };
        });
        console.log(images);
        // Render the homepage and pass images
        res.render('index', { images });
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).send('Error fetching images');
    }
};


const Image = require('../models/Images'); // Assuming you have an Image model in MongoDB

const rekognition = new AWS.Rekognition();

// Upload image to S3 and store metadata in MongoDB
exports.uploadImage = async (req, res) => {
    const file = req.file;
    const filename = req.body.filename; 

    if (!file) {
        return res.status(400).send('No file uploaded');
    }

    // Generate unique key for the file
    const key = `${uuidv4()}-${file.originalname}`;

    // S3 upload parameters
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: fs.createReadStream(file.path),
        ContentType: file.mimetype,
    };

    try {
        // Upload the image to S3
        const data = await s3.upload(params).promise();
        const imageUrl = data.Location;

        // Clean up temp file
        fs.unlinkSync(file.path);

        // Generate tags using Amazon Rekognition
        const rekognitionTags = await generateTagsFromImage(key);
        const tags = [...rekognitionTags, filename.toLowerCase()]; // Add filename as a tag


        // Save the image details and tags to MongoDB
        const imageDocument = new Image({
            url: imageUrl,
            key: key,
            tags: tags,
            uploadedAt: new Date(),
        });

        await imageDocument.save();

        res.redirect('/');
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Error uploading file');
    }
};

// Generate tags using Amazon Rekognition
async function generateTagsFromImage(key) {
    const rekognitionParams = {
        Image: {
            S3Object: {
                Bucket: bucketName,
                Name: key
            }
        },
        MaxLabels: 20, // Max number of tags
        MinConfidence: 50 // Confidence level for detecting tags
    };

    try {
        const response = await rekognition.detectLabels(rekognitionParams).promise();
        const tags = response.Labels.map(label => label.Name.toLowerCase()); // Get tag names
        return tags;
    } catch (error) {
        console.error('Error generating tags:', error);
        return [];
    }
}
