const { upload, uploadToCloudinary } = require('./../config/fileUpload');
const { Order, Service, OrderResource } = require('../models');
const verifyToken = require('../middleware/verifyToken');
const { check, validationResult } = require('express-validator');
const{S3upload }=require('./ocr.controller');
const fs = require('fs');
const AWS = require('aws-sdk');

const expressValidatorError = (req, res) => {
    const errors = validationResult(req).formatWith(({ msg, param }) => {
        return {
            status: 'error',
            param,
            msg,
        };
    });

    if (!errors.isEmpty()) {
        return res.status(400).json(
            errors.array({
                onlyFirstError: true,
            })
        );
    }
};

const orderValidator = [check('services', 'Services required')];

exports.createOrder = [
    verifyToken,
    orderValidator,
    async (req, res) => {
        const validated = expressValidatorError(req, res);
        if (validated) return;

        try {
            let servicesTitles = [];
            let docsRequired = new Set();
            let totalPrice = 0.0;
            let totalGST = 0.0;

            const allServices = await Service.findAll();

            allServices.filter((item) => {
                if (JSON.stringify(req.body.services).includes(item.id)) {
                    servicesTitles.push(item.serviceName);
                    totalPrice += parseFloat(item.price);
                    totalGST += parseFloat(item.gst);
                    const parseDocuments = (v) => {
                        if (typeof v === 'string') {
                            return parseDocuments(JSON.parse(v));
                        }
                        return v;
                    };
                    return parseDocuments(item.documents).map((_item) => {
                        return docsRequired.add(_item.title);
                    });
                }
            });

            const newOrder = await Order.create({
                ...req.body,
                price: totalPrice,
                gst: totalGST,
                orderTotal: totalPrice + totalGST,
                services: JSON.stringify(req.body.services),
                userId: req.user.id,
            });

            res.status(200).json({
                orderId: newOrder.id,
                services: servicesTitles,
                documents: Array.from(docsRequired),
                price: totalPrice,
                gst: totalGST,
                orderTotal: totalPrice + totalGST,
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    },
];

exports.uploadDocument = [
    verifyToken,
    upload.any('document', 20),
    async (req, res) => {
        console.log(req.body);
        try {
            const orderId = req.body?.orderId;

            if (!orderId) {
                return res.status(400).json({
                    status: 'error',
                    error: 'Order Id required',
                });
            }

            const data = await Order.findOne({
                where: {
                    id: orderId,
                    userId: req.user.id,
                },
            });

            if (!data) {
                return res.status(400).json({
                    status: 'error',
                    error: 'User Id not found',
                });
            }

            await Order.update(
                {
                    stateOfSupply: req.body.stateOfSupply,
                },
                {
                    where: {
                        id: orderId,
                        userId: req.user.id,
                    },
                }
            );

        const file = req.files;

            console.log('Files to upload: ', file);

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
        Key: item.filename,
        Body: fs.createReadStream(filePath)
  }; 
  //file upload
s3.upload(params, function (err, data) {
        if (err) {
         res.json({ "error": true, "Message": err});
        }else{
            ResponseData.push(data);
            fs.unlinkSync(filePath);
              OrderResource.create({
                            orderId: orderId,
                            fileName: item.filename,
                            fileType:item.filename.split('.')[1],
                            url: data.Location,
                        });
    
                        if(ResponseData.length == file.length){
                            
                            res.status(200).json(ResponseData);
                        }
                    }
                });
                });
            });
        } catch(e) {
            console.error(e);
            return res.status(500).send({ status: 'failure', message: 'something went wrong' });
        }

        // try {
            // let imageUrlList = [];

            // for (var i = 0; i < req.files.length; i++) {
            //     let fileName = req.files[i].filename;

            //     let result = await uploadToCloudinary(
            //         orderId,
            //         fileName,
            //         'documents'
            //     );

            //     if (result?.message === 'Success') {
            //         await OrderResource.create({
            //             orderId: orderId,
            //             fileName: req.files[i].originalname.split('.')[0],
            //             url: result.url,
            //         });

            //         imageUrlList.push({ file: fileName, url: result.url });
            //     } else {
            //         return res.status(400).json(result);
            //     }
            // }

            // res.status(200).json(imageUrlList);



        // } catch (error) {
        //     res.status(500).json({
        //         status: 'error',
        //         error,
        //     });
        // }
    },
];

exports.getAllOrders = [
    verifyToken,
    async (req, res) => {
        try {
            const data = await Order.findAndCountAll({
                offset: req.query.pageNo ? req.query.pageNo * 10 : 0,
                limit: 10,
                order: [['createdAt', 'DESC']],
            });

            res.status(200).json({
                total_pages: Math.ceil(data.count / 10),
                total_orders: data.count,
                orders: data.rows,
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    },
];

exports.getAllOrdersByUser = [
    verifyToken,
    async (req, res) => {
        try {
            const data = await Order.findAndCountAll({
                where: {
                    userId: req.user.id,
                },
                offset: req.query.pageNo ? req.query.pageNo * 10 : 0,
                limit: 10,
                order: [['createdAt', 'DESC']],
            });

            res.status(200).json({
                total_pages: Math.ceil(data.count / 10),
                total_orders: data.count,
                orders: data.rows,
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    },
];

exports.getAllDocuments = [
    verifyToken,
    async (req, res) => {
        if (!req.params.orderId) {
            return res.status(400).json({
                status: 'error',
                error: 'Order Id parameter required',
            });
        }

        try {
            const order = await Order.findOne({
                where: {
                    id: req.params.orderId,
                },
            });

            let docsRequired = new Set();

            const allServices = await Service.findAll();

            allServices.filter((item) => {
                if (JSON.stringify(order.services).includes(item.id)) {
                    const parseDocuments = (v) => {
                        if (typeof v === 'string') {
                            return parseDocuments(JSON.parse(v));
                        }
                        return v;
                    };
                    return parseDocuments(item.documents).map((_item) => {
                        return docsRequired.add(_item.title);
                    });
                }
            });

            const data = await OrderResource.findAll({
                where: {
                    orderId: req.params.orderId,
                },
            });

            res.status(200).json({
                document_uploaded: data,
                document_required: Array.from(docsRequired),
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    },
];

exports.getOrderById = [
    verifyToken,
    async (req, res) => {
        if (!req.params.id) {
            return res.status(400).json({
                status: 'error',
                error: 'Id parameter required',
            });
        }

        try {
            const data = await Order.findOne({
                where: {
                    id: req.params.id,
                },
            });

            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    },
];

exports.updateOrder = [
    verifyToken,
    async (req, res) => {
        if (!req.params.id) {
            return res.status(400).json({
                status: 'error',
                error: 'Id parameter required',
            });
        }

        try {
            if ('services' in req.body) {
                req.body.services = JSON.stringify(req.body.services);
            }

            const data = await Order.update(req.body, {
                where: {
                    id: req.params.id,
                },
            });

            data[0]
                ? res.status(200).json({
                      status: 'success',
                      msg: data[0] + ' order updated',
                  })
                : res.status(400).json({
                      status: 'error',
                      msg: 'Order not updated, may be data is same or not available',
                  });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    },
];

exports.deleteOrder = [
    verifyToken,
    async (req, res) => {
        if (!req.params.id) {
            return res.status(400).json({
                status: 'error',
                error: 'Id parameter required',
            });
        }

        try {
            const data = await Order.destroy({
                where: {
                    id: req.params.id,
                },
            });

            data
                ? res.status(200).json({
                      status: 'success',
                      msg: 'Order deleted',
                  })
                : res.status(400).json({
                      status: 'error',
                      msg: 'Order not deleted',
                  });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    },
];
