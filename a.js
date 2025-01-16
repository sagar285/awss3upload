// Import dependencies
const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const port = 3000;

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Configure Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route to upload file to S3
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    // Set up S3 upload parameters
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME, // S3 bucket name
      Key: `${Date.now()}_${req.file.originalname}`, // File name with timestamp
      Body: req.file.buffer, // File buffer
      ContentType: req.file.mimetype, // File MIME type
    };

    // Upload file to S3
    const data = await s3.upload(params).promise();

    // Send response with S3 file URL
    res.status(200).send({
      message: 'File uploaded successfully!',
      fileUrl: data.Location,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send({ message: 'Error uploading file', error });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
