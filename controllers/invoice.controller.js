// const { Invoice, UserProfile, UserBusinessProfile } = require('../models');
// const ApiError = require('../errors/ApiError');

// class InvoiceController {
//     createInvoice = async (req, res, next) => {
//         var token = req.header('authorization');
//         if (token) {
//             var payload = decodeToken(token);
//             // console.log("token ", token);
//             var invoice = new Invoice(req.body);
//             invoice.user_id = payload.id;
//             invoice
//                 .save()
//                 .then((invoice) => {
//                     res.status(200).json({
//                         status: 'success',
//                         message: 'invoice created successfully',
//                         data: invoice,
//                     });
//                 })
//                 .catch((error) => {
//                     res.status(500).json({
//                         status: 'error',
//                         message: 'invoice not created',
//                         error: error,
//                     });
//                 });
//         } else {
//             res.status(403).json({
//                 status: 'error',
//                 message: 'token not found',
//             });
//         }
//     };

//     getInvoice = async (req, res, next) => {
//         var token = req.header('authorization');
//         if (token) {
//             var payload = decodeToken(token);
//             Invoice.findAll({
//                 where: {
//                     user_id: payload.id,
//                 },
//             })
//                 .then((invoice) => {
//                     res.status(200).json({
//                         status: 'success',
//                         message: 'invoice fetched successfully',
//                         data: invoice,
//                     });
//                 })
//                 .catch((error) => {
//                     res.status(500).json({
//                         status: 'error',
//                         message: 'invoice not fetched',
//                         error: error,
//                     });
//                 });
//         } else {
//             res.status(403).json({
//                 status: 'error',
//                 message: 'token not found',
//             });
//         }
//     };

//     updateInvoice = async (req, res, next) => {
//         var token = req.header('authorization');
//         if (token) {
//             var payload = decodeToken(token);
//             Invoice.update(req.body, {
//                 where: {
//                     id: req.body.id,
//                 },
//             })
//                 .then((invoice) => {
//                     res.status(200).json({
//                         status: 'success',
//                         message: 'invoice updated successfully',
//                         // data: invoice
//                     });
//                 })
//                 .catch((error) => {
//                     res.status(500).json({
//                         status: 'error',
//                         message: 'invoice not updated',
//                         error: error,
//                     });
//                 });
//         } else {
//             res.status(403).json({
//                 status: 'error',
//                 message: 'token not found',
//             });
//         }
//     };
// }
const { Op } = require('sequelize');
const { Party, Item, Invoice } = require('../models');
const { check, validationResult } = require('express-validator');

const LIMIT = 10;

decodeToken = (token) => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const buff = new Buffer(base64, 'base64');
    const payloadinit = buff.toString('ascii');
    const payload = JSON.parse(payloadinit);
    return payload;
};

const verifyToken = (req, res, next) => {
    var token = req.header('authorization');
    if (token) {
        var payload = decodeToken(token);

        req.user = payload;

        next();
    } else {
        res.status(403).json({
            status: 'error',
            msg: 'token not found',
        });
    }
};

const partyValidator = [
    check('name', 'Name required')
        .not()
        .isEmpty()
        .trim()
        // .customSanitizer((value) => {
        //     return value.replace(/\s\s+/g, ' ');
        // })
        // .isLength({ min: 4, max: 100 })
        // .withMessage('Name should range between 4 - 100 characters')
        .isAlpha('en-US', { ignore: ' ' })
        .withMessage('Name contain alphabets & spaces only'),
    check('phoneNumber', 'Phone number required')
        .trim()
        .isNumeric()
        .withMessage('Invalid mobile number'),
    check('gstin', 'GSTIN required')
        .trim()
        .isAlphanumeric()
        .withMessage('Invalid GSTIN'),
];

const itemValidator = [
    check('name', 'Name required')
        .not()
        .isEmpty()
        .trim()
        // .customSanitizer((value) => {
        //     return value.replace(/\s\s+/g, ' ');
        // })
        // .isLength({ min: 4, max: 100 })
        // .withMessage('Name should range between 4 - 100 characters')
        .isAlpha('en-US', { ignore: ' ' })
        .withMessage('Name contain alphabets & spaces only'),
    check('description', 'Description required')
        .trim()
        // .customSanitizer((value) => {
        //     return value.replace(/\s\s+/g, ' ');
        // })
        // .isAlpha('en-US', { ignore: ' ' })
        // .withMessage('Description contain alphabets & spaces only')
        .isLength({ max: 1000 })
        .withMessage('Description should not be greater 1000 characters'),
    check('price', 'Price required').not().isEmpty().trim().isDecimal({
        decimal_digits: 2,
    }),
    check('hsnCode', 'HSN code required')
        .not()
        .isEmpty()
        .trim()
        .isNumeric()
        .withMessage('Invalid HSN code'),
];

const invoiceValidator = [
    // type: req.body.type,
    // invoiceNumber: req.body.invoiceNumber,
    // partyName: req.body.partyName,
    // phoneNumber: req.body.phoneNumber,
    // partyAddress: req.body.partyAddress,
    // gstin: req.body.gstin,
    // date: req.body.date,
    // userGstin: req.body.userGstin,
    // stateOfSupply: req.body.stateOfSupply,
    // totalAmount: req.body.totalAmount,
    // paidVia: req.body.paidVia,
    // balanceDue: req.body.balanceDue,
    // userId: payload.id,
    check('partyName', 'Party name required')
        .not()
        .isEmpty()
        .trim()
        // .customSanitizer((value) => {
        //     return value.replace(/\s\s+/g, ' ');
        // })
        // .isLength({ min: 4, max: 100 })
        // .withMessage('Name should range between 4 - 100 characters')
        .isAlpha('en-US', { ignore: ' ' })
        .withMessage('Party name contain alphabets & spaces only'),
    check('phoneNumber', 'Phone number required')
        .optional()
        .trim()
        .isNumeric()
        .withMessage('Invalid phone number'),
    check('date', 'Date required')
        .trim()
        .isDate()
        .withMessage('Date format must be of YYYY/MM/DD'),
    check('gstin', 'GSTIN required')
        .optional()
        .trim()
        .isAlphanumeric()
        .withMessage('Invalid GSTIN'),
];

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

// PARTIES
exports.createParty = [
    verifyToken,
    partyValidator,
    async (req, res) => {
        const validated = expressValidatorError(req, res);
        if (validated) return;

        try {
            await Party.create({
                type: req.body.type,
                name: req.body.name,
                phoneNumber: req.body.phoneNumber,
                gstin: req.body.gstin,
                userId: req.user.id,
            });

            res.status(200).json({
                status: 'success',
                msg: 'Party created',
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    },
];

exports.getParties = async (req, res) => {
    var token = req.header('authorization');
    if (token) {
        var payload = decodeToken(token);

        if (!req.query.type) {
            return res.status(400).json({
                status: 'error',
                error: 'query type required',
            });
        }

        try {
            const data = await Party.findAndCountAll({
                where: {
                    userId: payload.id,
                    type: req.query.type,
                },
                offset: req.body.pageNo ? req.body.pageNo * LIMIT : 0,
                limit: LIMIT,
                order: [['name', 'ASC']],
            });

            res.status(200).json({
                total_parties: data.count,
                parties: data.rows,
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error: error,
            });
        }
    } else {
        res.status(403).json({
            status: 'error',
            message: 'token not found',
        });
    }
};

exports.getLatestParties = async (req, res) => {
    var token = req.header('authorization');
    if (token) {
        var payload = decodeToken(token);

        if (!req.query.type) {
            return res.status(400).json({
                status: 'error',
                error: 'query type required',
            });
        }

        try {
            const data = await Party.findAll({
                where: {
                    userId: payload.id,
                    type: req.query.type,
                },
                limit: 5,
                order: [['createdAt', 'DESC']],
            });

            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error: error,
            });
        }
    } else {
        res.status(403).json({
            status: 'error',
            message: 'token not found',
        });
    }
};

exports.getPartyById = async (req, res) => {
    var token = req.header('authorization');
    if (token) {
        var payload = decodeToken(token);
        try {
            const data = await Party.findOne({
                where: {
                    userId: payload.id,
                    id: req.params.id,
                },
            });

            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error: error,
            });
        }
    } else {
        res.status(403).json({
            status: 'error',
            message: 'token not found',
        });
    }
};

exports.searchParties = async (req, res) => {
    var token = req.header('authorization');
    if (token) {
        var payload = decodeToken(token);

        if (!req.query.search) {
            return res.status(400).json({
                status: 'error',
                error: 'Search query required',
            });
        }

        try {
            const data = await Party.findAll({
                where: {
                    userId: payload.id,
                    name: {
                        [Op.like]: '%' + req.query.search + '%',
                    },
                },
            });

            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error: error,
            });
        }
    } else {
        res.status(403).json({
            status: 'error',
            message: 'token not found',
        });
    }
};

exports.updateParty = [
    verifyToken,
    partyValidator,
    async (req, res) => {
        const validated = expressValidatorError(req, res);
        if (validated) return;

        try {
            await Party.update(req.body, {
                where: {
                    id: req.body.id,
                    userId: req.user.id,
                },
            });

            res.status(200).json({
                status: 'success',
                msg: 'Party updated',
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error: error,
            });
        }
    },
];

exports.deleteParty = [
    verifyToken,
    async (req, res) => {
        try {
            const data = await Party.destroy({
                where: {
                    id: req.params.id,
                    userId: req.user.id,
                },
            });

            data
                ? res.status(200).json({
                      status: 'success',
                      msg: 'Party deleted',
                  })
                : res.status(400).json({
                      status: 'error',
                      msg: 'Party not deleted',
                  });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error: error,
            });
        }
    },
];

// ITEMS
exports.createItem = [
    verifyToken,
    itemValidator,
    async (req, res) => {
        const validated = expressValidatorError(req, res);
        if (validated) return;

        try {
            await Item.create({
                type: req.body.type,
                name: req.body.name,
                description: req.body.description,
                unit: req.body.unit,
                price: req.body.price,
                purchasePrice: req.body.purchasePrice,
                taxExempted: req.body.taxExempted,
                openingStock: req.body.openingStock,
                lowStock: req.body.lowStock,
                hsnCode: req.body.hsnCode,
                gstPercentage: req.body.gstPercentage,
                userId: req.user.id,
            });

            res.status(200).json({
                status: 'success',
                msg: 'Item created',
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error: error,
            });
        }
    },
];

exports.getItems = async (req, res) => {
    var token = req.header('authorization');
    if (token) {
        var payload = decodeToken(token);
        try {
            const data = await Item.findAndCountAll({
                where: {
                    userId: payload.id,
                },
                offset: req.query.pageNo ? req.query.pageNo * LIMIT : 0,
                limit: LIMIT,
                order: [['name', 'ASC']],
                // offset: req.body.offset ? req.body.offset : 0,
            });

            res.status(200).json({
                total_items: data.count,
                items: data.rows,
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error: error,
            });
        }
    } else {
        res.status(403).json({
            status: 'error',
            message: 'token not found',
        });
    }
};

exports.getLatestItems = async (req, res) => {
    var token = req.header('authorization');
    if (token) {
        var payload = decodeToken(token);

        try {
            const data = await Item.findAll({
                where: {
                    userId: payload.id,
                },
                limit: 5,
                order: [['createdAt', 'DESC']],
            });

            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error: error,
            });
        }
    } else {
        res.status(403).json({
            status: 'error',
            message: 'token not found',
        });
    }
};

exports.getItemById = async (req, res) => {
    var token = req.header('authorization');
    if (token) {
        var payload = decodeToken(token);
        try {
            const data = await Item.findOne({
                where: {
                    userId: payload.id,
                    id: req.params.id,
                },
            });

            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error: error,
            });
        }
    } else {
        res.status(403).json({
            status: 'error',
            message: 'token not found',
        });
    }
};

exports.searchItems = async (req, res) => {
    var token = req.header('authorization');
    if (token) {
        var payload = decodeToken(token);

        if (!req.query.search) {
            return res.status(400).json({
                status: 'error',
                error: 'Search query required',
            });
        }

        try {
            const data = await Item.findAll({
                where: {
                    userId: payload.id,
                    name: {
                        [Op.like]: '%' + req.query.search + '%',
                    },
                },
            });

            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error: error,
            });
        }
    } else {
        res.status(403).json({
            status: 'error',
            message: 'token not found',
        });
    }
};

exports.updateItem = [
    verifyToken,
    itemValidator,
    async (req, res) => {
        const validated = expressValidatorError(req, res);
        if (validated) return;

        try {
            await Item.update(req.body, {
                where: {
                    id: req.body.id,
                    userId: req.user.id,
                },
            });

            res.status(200).json({
                status: 'success',
                msg: 'Item updated',
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error: error,
            });
        }
    },
];

exports.deleteItem = [
    verifyToken,
    async (req, res) => {
        try {
            const data = await Item.destroy({
                where: {
                    id: req.params.id,
                    userId: req.user.id,
                },
            });

            data
                ? res.status(200).json({
                      status: 'success',
                      msg: 'Item deleted',
                  })
                : res.status(400).json({
                      status: 'error',
                      msg: 'Item not deleted',
                  });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error: error,
            });
        }
    },
];

// INVOICE
exports.createInvoice = [
    verifyToken,
    invoiceValidator,
    async (req, res) => {
        const validated = expressValidatorError(req, res);
        if (validated) return;

        try {
            await Invoice.create({
                type: req.body.type,
                invoiceNumber: req.body.invoiceNumber,
                partyName: req.body.partyName,
                phoneNumber: req.body.phoneNumber,
                partyAddress: req.body.partyAddress,
                gstin: req.body.gstin,
                date: req.body.date,
                userGstin: req.body.userGstin,
                stateOfSupply: req.body.stateOfSupply,
                totalAmount: req.body.totalAmount,
                paidVia: req.body.paidVia,
                balanceDue: req.body.balanceDue,
                userId: req.user.id,
            });

            res.status(200).json({
                status: 'success',
                msg: 'Invoice created',
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    },
];

exports.getInvoices = async (req, res) => {
    var token = req.header('authorization');
    if (token) {
        var payload = decodeToken(token);
        try {
            const data = await Invoice.findAndCountAll({
                where: {
                    userId: payload.id,
                },
                offset: req.query.pageNo ? req.query.pageNo * LIMIT : 0,
                limit: LIMIT,
            });

            res.status(200).json({
                total_invoices: data.count,
                items: data.rows,
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    } else {
        res.status(403).json({
            status: 'error',
            message: 'token not found',
        });
    }
};

exports.getLatestInvoices = async (req, res) => {
    var token = req.header('authorization');
    if (token) {
        var payload = decodeToken(token);

        try {
            const data = await Invoice.findAll({
                where: {
                    userId: payload.id,
                },
                limit: 5,
                order: [['createdAt', 'DESC']],
            });

            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    } else {
        res.status(403).json({
            status: 'error',
            message: 'token not found',
        });
    }
};

exports.getInvoiceById = async (req, res) => {
    var token = req.header('authorization');
    if (token) {
        var payload = decodeToken(token);
        try {
            const data = await Invoice.findOne({
                where: {
                    userId: payload.id,
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
    } else {
        res.status(403).json({
            status: 'error',
            message: 'token not found',
        });
    }
};

exports.updateInvoice = [
    verifyToken,
    invoiceValidator,
    async (req, res) => {
        const validated = expressValidatorError(req, res);
        if (validated) return;

        try {
            await Invoice.update(req.body, {
                where: {
                    id: req.body.id,
                    userId: req.user.id,
                },
            });

            res.status(200).json({
                status: 'success',
                msg: 'Invoice updated',
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error: error,
            });
        }
    },
];

exports.deleteInvoice = [
    verifyToken,
    async (req, res) => {
        try {
            const data = await Invoice.destroy({
                where: {
                    id: req.params.id,
                    userId: req.user.id,
                },
            });

            data
                ? res.status(200).json({
                      status: 'success',
                      msg: 'Invoice deleted',
                  })
                : res.status(400).json({
                      status: 'error',
                      msg: 'Invoice not deleted',
                  });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error: error,
            });
        }
    },
];

// SALES
exports.getSales = [
    verifyToken,
    async (req, res) => {
        const now = new Date();

        try {
            let startDate;

            req.query.type === 'year'
                ? (startDate = new Date(now.getFullYear(), 0, 1))
                : req.query.type === 'month'
                ? (startDate = new Date(now.getFullYear(), now.getMonth(), 1))
                : req.query.type === 'week'
                ? (startDate = new Date(
                      now.getFullYear(),
                      now.getMonth(),
                      now.getDate() -
                          now.getDay() +
                          (now.getDay() == 0 ? -6 : 1)
                  ))
                : null;

            let data = await Invoice.findAll({
                where: {
                    userId: req.user.id,
                    date: {
                        [Op.between]: [startDate, now],
                    },
                },
                attributes: ['date', 'totalAmount'],
                order: [['date', 'ASC']],
                raw: true,
            });

            const newData = data
                .map((element) => {
                    element.totalAmount = Number(element.totalAmount);
                    return element;
                })
                .filter((element, index, array) => {
                    if (array.length > index + 1) {
                        if (element.date === array[index + 1].date) {
                            array[index + 1].totalAmount += element.totalAmount;
                            return false;
                        }
                    }
                    return element;
                });

            res.status(200).json(newData);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error: error,
            });
        }
    },
];
