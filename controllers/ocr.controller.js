const { AnalyzeDocumentCommand } =require('@aws-sdk/client-textract');
const  { TextractClient } =require("@aws-sdk/client-textract");
const {fromIni} =require('@aws-sdk/credential-providers');
const bCrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const { Op } = require("sequelize");
const ApiError = require('../errors/ApiError');
const { ocrSpace } = require('ocr-space-api-wrapper');
const { parse } = require('querystring');
const fs = require('fs');
const AWS = require('aws-sdk');
const textract = require('textract');

const Tesseract = require('tesseract.js');

const sharp = require('sharp');

const { fromPath } = require('pdf2pic');

const path = require('path');
const { cwd } = require('process');
const { readFileSync } = require('fs');

const langPath = path.join(cwd(), 'data');

const b64ToBuffer = b64 => Buffer.from(b64, 'base64');

const b64ToString = b64 => Buffer.from(b64, 'base64').toString('utf-8');
var objectKey='';


const loadModel = () => {
    const b64 = readFileSync(path.join(langPath, '/ocr-model.txt')).toString('utf8');
    const string = b64ToString(b64);
    const model = JSON.parse(string);

    return model;
};

const pageSlices = loadModel();

const sliceImage = async (image, top, left, right, bottom) => {
    const imageBuffer = await sharp(image).extract({
        top,
        left,
        width: right - left,
        height: bottom - top,
    }).toBuffer();

    return imageBuffer;
};

const flatterData = a => a.reduce((o, v) => Object.assign(o, v), {});

const extractForm16 = async (req, res) => {
    try {

        const convertToImage = fromPath(req.file.path, {
            width: 892,
            format: 'png',
            height: 1263,
            quality: 100,
            density: 180,
        });

        let b64Strings = await convertToImage.bulk(-1, true);

        const images = await Promise.all(b64Strings.map(({ base64 }) => b64ToBuffer(base64)));

        b64Strings = null;
        
        // const pageData = await Promise.all(images.map(async (image, i) => {
        //     const worker = await Tesseract.createWorker({
        //         logger: m => console.log(m),
        //         cacheMethod: 'none',
        //         langPath,
        //     });
    
        //     await worker.loadLanguage('eng');
        //     await worker.initialize('eng');

        //     const slices = pageSlices[i];

        //     if(!slices) {
        //         return;
        //     }

        //     const data = {};

        //     for(let i = 0; i < slices.length; i++) {
        //         const { top, left, right, bottom, label } = slices[i];

        //         const slicedImage = await sliceImage(image, top, left, right, bottom);

        //         const { data: { text } } = await worker.recognize(slicedImage);

        //         data[label] = text.trim();
        //     }

        //     await worker.terminate();

        //     return data;
        // }));

        const pageData = [];

        for(let i = 0; i < images.length; i++) {
            const image = images[i];

            const worker = await Tesseract.createWorker({
                logger: m => console.log(m),
                cacheMethod: 'none',
                langPath,
            });
    
            await worker.loadLanguage('eng');
            await worker.initialize('eng');

            const slices = pageSlices[i];

            if(!slices) {
                return;
            }

            const data = {};

            for(let i = 0; i < slices.length; i++) {
                const { top, left, right, bottom, label } = slices[i];

                const slicedImage = await sliceImage(image, top, left, right, bottom);

                const { data: { text } } = await worker.recognize(slicedImage);

                data[label] = text.trim();
            }

            await worker.terminate();

            pageData.push(data);
        }
        
        return res.status(200).send({
            data: flatterData(pageData)
        });
    } catch(e) {
        console.error(e);
        res.status(504).send({ message: 'something went wrong' });
    }
};


    
    // Set the AWS Region.
const REGION = "ap-south-1"; //e.g. "us-east-1"
const profileName = "default";

// Create SNS service object.
const textractClient = new TextractClient({region: REGION, 
  credentials:  {
    accessKeyId: 'AKIATKRYDO5PNBUXX47A',
    secretAccessKey: '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'
  }, 
});

const bucket = 'itaxdocument'


const displayBlockInfo = async (response) => {
    try {
        response.Blocks.forEach(block => {
            console.log(`ID: ${block.Id}`)
            console.log(`Block Type: ${block.BlockType}`)
            if ("Text" in block && block.Text !== undefined){
                console.log(`Text: ${block.Text}`)
            }
            else{}
            if ("Confidence" in block && block.Confidence !== undefined){
                console.log(`Confidence: ${block.Confidence}`)
            }
            else{}
            if (block.BlockType == 'CELL'){
                console.log("Cell info:")
                console.log(`   Column Index - ${block.ColumnIndex}`)
                console.log(`   Row - ${block.RowIndex}`)
                console.log(`   Column Span - ${block.ColumnSpan}`)
                console.log(`   Row Span - ${block.RowSpan}`)
            }
            if ("Relationships" in block && block.Relationships !== undefined){
                console.log(block.Relationships)
                console.log("Geometry:")
                console.log(`   Bounding Box - ${JSON.stringify(block.Geometry.BoundingBox)}`)
                console.log(`   Polygon - ${JSON.stringify(block.Geometry.Polygon)}`)
            }
            console.log("-----")
        });
      } catch (err) {
        console.log("Error", err);
      }
}

const aws_document_text = async (req,res) => {
    try {
        const params = {
            Document: {
              S3Object: {
                Bucket: bucket,
                Name: objectKey
              },
            },
            FeatureTypes: ['TABLES', 'FORMS', 'SIGNATURES'],
          }
        const analyzeDoc = new AnalyzeDocumentCommand(params);
        const response = await textractClient.send(analyzeDoc);
        console.log(response)
        displayBlockInfo(response);
        response
        ? res.status(200).json({
              status: 'success',
              msg:response,
          })
        : res.status(400).json({
              status: 'error',
              msg: 'error',
          });
} catch (error) {
    res.status(500).json({
        status: 'error',
        error,
    });
  }
     
}


const awsPdf = async (req, res) => {
    console.log(req.file);
// Configure AWS SDK with your credentials
console.log(AWS.config);
AWS.config.update({
  accessKeyId: 'AKIATKRYDO5PNBUXX47A',
  secretAccessKey: '7rFx1NxnwtcgSj8aKf4QS7SQfzcocRsZylbiRXhR',
  region: 'ap-south-1'
});

const s3 = new AWS.S3();

const bucketName = 'itaxdocument'; // Replace with your bucket name
objectKey = req.file.filename; // Replace with your object key
const filePath = req.file.path; // Replace with your local file path

// Upload the file to S3
const uploadParams = {
  Bucket: bucketName,
  Key: objectKey,
  Body: fs.createReadStream(filePath)
};

s3.upload(uploadParams, (err, data) => {
  if (err) {
    console.log('Error uploading file:', err);
  } else {
    console.log('File uploaded successfully:', data.Location);
    console.log(data);
    fs.unlinkSync(filePath);
    // Extract text from the uploaded file using Textract
    aws_document_text(req,res);
  }
  });

}

const S3upload = async (req, res) => {
  const file = req.files;


  AWS.config.update({
    accessKeyId: 'AKIATKRYDO5PNBUXX47A',
    secretAccessKey: '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',
    region: 'ap-south-1'
  });
  
  const s3 = new AWS.S3();
s3.createBucket(function () {
      let Bucket_Path = 'itaxdocument';
      //Where you want to store your file
      var ResponseData = [];

   
file.map((item) => {
  let filePath = item.path;
      var params = {
        Bucket: Bucket_Path,
        Key: item.originalname,
        Body: fs.createReadStream(filePath)
  };
s3.upload(params, function (err, data) {
        if (err) {
         res.json({ "error": true, "Message": err});
        }else{
            ResponseData.push(data);
            if(ResponseData.length == file.length){
              fs.unlinkSync(filePath);
              res.json({ "error": false, "Message": "File Uploaded Successfully", Data: ResponseData});
            }
          }
       });
     });
   });

}



const ocrPdf= [
  async (req, res) => {
   console.log(req.file);
  try {
    const data = await ocrSpace(req.file.path, { apiKey: 'K89137648988957',isOverlayRequired:'true' });

    data
        ? res.status(200).json({
              status: 'success',
              msg:data,
          })
        : res.status(400).json({
              status: 'error',
              msg: 'error',
          });
} catch (error) {
    res.status(500).json({
        status: 'error',
        error,
    });
  }
  }
];
module.exports = { extractForm16,ocrPdf,aws_document_text,awsPdf,S3upload };