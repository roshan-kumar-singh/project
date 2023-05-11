const { Service } = require('../models');
const verifyToken = require('../middleware/verifyToken');
const { check, validationResult } = require('express-validator');

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

const serviceValidator = [
    check('serviceName', 'Service name required').not().isEmpty().trim(),
    check('serviceType', 'Service Type').trim(),
    check('description', 'Description').trim(),
    check('price', 'Price required').isNumeric().withMessage('Invalid price'),
    check('gst', 'GST required').isDecimal().withMessage('Invalid gst'),
    check('documents', 'Documents required'),
];

exports.createService = [
    verifyToken,
    serviceValidator,
    async (req, res) => {
        const validated = expressValidatorError(req, res);
        if (validated) return;

        try {
            req.body.documents = JSON.stringify(req.body.documents);
            await Service.create(req.body);

            res.status(200).json({
                msg: 'Service created',
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    },
];

exports.getAllServices = async (req, res) => {
    try {
        const data = await Service.findAndCountAll({
            offset: req.query.pageNo ? req.query.pageNo * 10 : 0,
            limit: req.query.pageNo && 10,
            // order: [['serviceName', 'ASC']],
        });

        res.status(200).json({
            total_pages: Math.ceil(data.count / 10),
            total_services: data.count,
            services: data.rows,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error,
        });
    }
};

exports.getServiceById = async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({
            status: 'error',
            error: 'Id parameter required',
        });
    }

    try {
        const data = await Service.findOne({
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
};

exports.updateService = [
    verifyToken,
    async (req, res) => {
        if (!req.params.id) {
            return res.status(400).json({
                status: 'error',
                error: 'Id parameter required',
            });
        }

        try {
            if (req.body.documents) {
                const isJsonObject = (strData) => {
                    try {
                        JSON.parse(strData);
                    } catch (e) {
                        return false;
                    }
                    return true;
                };

                if (!isJsonObject(req.body.documents)) {
                    req.body.documents = JSON.stringify(req.body.documents);
                }
            }

            const data = await Service.update(req.body, {
                where: {
                    id: req.params.id,
                },
            });

            data[0]
                ? res.status(200).json({
                      status: 'success',
                      msg: data[0] + ' service updated',
                  })
                : res.status(400).json({
                      status: 'error',
                      msg: 'Service not updated, may be data is same or not available',
                  });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    },
];

exports.deleteService = [
    verifyToken,
    async (req, res) => {
        if (!req.params.id) {
            return res.status(400).json({
                status: 'error',
                error: 'Id parameter required',
            });
        }

        try {
            const data = await Service.destroy({
                where: {
                    id: req.params.id,
                },
            });

            data
                ? res.status(200).json({
                      status: 'success',
                      msg: 'Service deleted',
                  })
                : res.status(400).json({
                      status: 'error',
                      msg: 'Service not deleted',
                  });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    },
];
