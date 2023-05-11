const { CareerApplication } = require('../models');
const {
    upload,
    uploadToCloudinary,
    deleteFromCloudinary,
} = require('./../config/fileUpload');
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

const applicationValidator = [
    check('name', 'Name required').not().isEmpty().trim(),
    check('address', 'Address required').not().isEmpty().trim(),
    check('pin', 'Pincode required')
        .not()
        .isEmpty()
        .trim()
        .isNumeric()
        .withMessage('Invalid pincode'),
    check('email', 'Email required')
        .not()
        .isEmpty()
        .trim()
        .isEmail()
        .withMessage('Invalid email'),
    check('mobile', 'Mobile required')
        .not()
        .isEmpty()
        .trim()
        .isNumeric()
        .withMessage('Invalid mobile number'),
    check('skills', 'Skills required').not().isEmpty().trim(),
    check('gender', 'Gender required').not().isEmpty().trim(),
];

exports.createApplication = [
    upload.array('cv', 1),
    applicationValidator,
    async (req, res) => {
        const validated = expressValidatorError(req, res);
        if (validated) return;

        if (!req.files[0]) {
            return res.status(400).json({
                status: 'error',
                param: 'cv',
                error: 'CV required',
            });
        }

        try {
            const result = await uploadToCloudinary(
                req.body.mobile,
                req.files[0].filename,
                'job_applications'
            );

            if (result?.message === 'Success') {
                await CareerApplication.create({
                    ...req.body,
                    cv: result.url,
                });

                res.status(200).json({
                    msg: 'Application submitted',
                });
            } else {
                return res.status(400).json(result);
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    },
];

exports.getAllApplication = [
    verifyToken,
    async (req, res) => {
        try {
            const data = await CareerApplication.findAndCountAll({
                offset: req.query.pageNo ? req.query.pageNo * 10 : 0,
                limit: 10,
                order: [['createdAt', 'DESC']],
            });

            res.status(200).json({
                total_application: data.count,
                application: data.rows,
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    },
];

exports.getApplicationById = [
    verifyToken,
    async (req, res) => {
        if (!req.params.id) {
            return res.status(400).json({
                status: 'error',
                error: 'Id parameter required',
            });
        }

        try {
            const data = await CareerApplication.findOne({
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

exports.deleteApplication = [
    verifyToken,
    async (req, res) => {
        if (!req.params.id) {
            return res.status(400).json({
                status: 'error',
                error: 'Id parameter required',
            });
        }

        try {
            const application = await CareerApplication.findOne({
                where: {
                    id: req.params.id,
                },
            });

            const deleteApplication = await deleteFromCloudinary(
                application.cv
            );

            if (deleteApplication.result === 'ok') {
                const data = await CareerApplication.destroy({
                    where: {
                        id: req.params.id,
                    },
                });

                return data
                    ? res.status(200).json({
                          status: 'success',
                          msg: 'Application deleted',
                      })
                    : res.status(400).json({
                          status: 'error',
                          msg: 'Application not deleted',
                      });
            }

            res.status(400).json({
                status: 'error',
                msg: 'Application not deleted',
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    },
];
