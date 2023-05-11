const express = require('express');
const { extractForm16,ocrPdf,awsPdf,S3upload } = require('../controllers/ocr.controller.js');
const router = express.Router();
const { upload,multipleUpload } = require('../config/fileUpload.js');

router.post('/form16', upload.single('file'), extractForm16);
router.post('/ocrspace', upload.single('filename'), ocrPdf);
router.post('/ocraws', upload.single('filename'),awsPdf);
router.post('/s3upload', upload.array('file',10),S3upload);


module.exports = router;