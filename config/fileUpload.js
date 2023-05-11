const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const crypto = require('crypto');

// Multer setup
//let storage = multer.memoryStorage({});
/// Multer setup
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(
            null,
            crypto.randomBytes(10).toString('hex') + '_' + file.originalname
        );
    },
});



let upload = multer({ storage: storage });

// Cloudinary configuration
cloudinary.config({
    cloud_name: 'drl3vjskb',
    api_key: '873359697654574',
    api_secret: '64ENuKTsjjCp7F1Vs-KBHeWbtsw',
});

async function uploadToCloudinary(id, fileName, folderName) {
    try {
        let newFileName = `${id}_${crypto.randomBytes(5).toString('hex')}`;

        const result = await cloudinary.uploader.upload(
            './uploads/' + fileName,
            {
                public_id: `${folderName}/${newFileName}`,
            }
        );

        fs.unlinkSync('./uploads/' + fileName);

        return {
            message: 'Success',
            url: result.url,
        };
    } catch (error) {
        fs.unlinkSync('./uploads/' + fileName);
        return { message: 'Fail', error: error.error };
    }
}

function deleteFromCloudinary(url) {
    let [folderName, fileName] = url.split('/').slice(-2);

    fileName = fileName.split('.')[0];

    const public_id = `${folderName}/${fileName}`;

    return cloudinary.uploader.destroy(public_id, function (result) {
        return result;
    });
}

module.exports = { upload, uploadToCloudinary, deleteFromCloudinary};
