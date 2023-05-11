const { Library } = require('../models');
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

// const libraryValidator = [check('services', 'Services required')];

exports.createLibrary = [
    verifyToken,
    // libraryValidator,
    async (req, res) => {
        const validated = expressValidatorError(req, res);
        if (validated) return;

        try {
            await Library.create(req.body);

            res.status(200).json({
                msg: 'Library created',
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    },
];

exports.getAllLibrary = [
    verifyToken,
    async (req, res) => {
        try {
            const data = await Library.findAndCountAll({
                offset: req.query.pageNo ? req.query.pageNo * 10 : 0,
                limit: 10,
                order: [['createdAt', 'DESC']],
            });

            res.status(200).json({
                total_pages: Math.ceil(data.count / 10),
                total_libraries: data.count,
                libraries: data.rows,
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    },
];

exports.getLibraryById = [
    verifyToken,
    async (req, res) => {
        if (!req.params.id) {
            return res.status(400).json({
                status: 'error',
                error: 'Id parameter required',
            });
        }

        try {
            const data = await Library.findOne({
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

exports.updateLibrary = [
    verifyToken,
    async (req, res) => {
        if (!req.params.id) {
            return res.status(400).json({
                status: 'error',
                error: 'Id parameter required',
            });
        }

        try {
            const data = await Library.update(req.body, {
                where: {
                    id: req.params.id,
                },
            });

            data[0]
                ? res.status(200).json({
                      status: 'success',
                      msg: data[0] + ' library updated',
                  })
                : res.status(400).json({
                      status: 'error',
                      msg: 'Library not updated, may be data is same or not available',
                  });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    },
];

exports.deleteLibrary = [
    verifyToken,
    async (req, res) => {
        if (!req.params.id) {
            return res.status(400).json({
                status: 'error',
                error: 'Id parameter required',
            });
        }

        try {
            const data = await Library.destroy({
                where: {
                    id: req.params.id,
                },
            });

            data
                ? res.status(200).json({
                      status: 'success',
                      msg: 'Library deleted',
                  })
                : res.status(400).json({
                      status: 'error',
                      msg: 'Library not deleted',
                  });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    },
];
