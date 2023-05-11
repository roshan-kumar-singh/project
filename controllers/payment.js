const crypto = require('crypto');
const Razorpay = require('razorpay');
const { Order, PaymentTransaction } = require('../models');
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

const razorpayConfig = {
    // rzp_test_cjiBoQ2omzGo9K,rsrq5Nwe8Z7jHI7ltvObdT30
    key_id: 'rzp_test_cjiBoQ2omzGo9K',
    key_secret: 'rsrq5Nwe8Z7jHI7ltvObdT30',
};

let instance = new Razorpay(razorpayConfig);

const initiatePaymentValidator = [check('orderId', 'Order id required')];

exports.initiatePayment = [
    verifyToken,
    initiatePaymentValidator,
    async (req, res) => {
        const validated = expressValidatorError(req, res);
        if (validated) return;

        try {
            const data = await Order.findOne({
                where: {
                    id: req.body.orderId,
                    // userId: req.user.id,
                },
            });

            const orderTotal = data.orderTotal.split('.');

            var options = {
                amount: Number(orderTotal[0] + orderTotal[1]),
                currency: 'INR',
                receipt: data.id,
            };

            instance.orders.create(options, async function (err, order) {
                if (err) {
                    return res.status(400).json({
                        status: 'error',
                        error: err,
                    });
                }

                await PaymentTransaction.create({
                    razorpay_order_id: order.id,
                    userId: req.user.id,
                });

                return res.status(200).json({
                    key: razorpayConfig.key_id,
                    ...order,
                    orderNo: data.orderNo,
                    user: {
                        name: `${req.user.first_name} ${req.user.last_name} `,
                        email: req.user.email,
                        contact: req.user.phone,
                    },
                });
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    },
];

exports.handlePaymentResponse = [
    verifyToken,
    async (req, res) => {
        try {
            const response = req.body.response;

            if (req.body.status === 'success') {
                let body =
                    response.razorpay_order_id +
                    '|' +
                    response.razorpay_payment_id;

                var expectedSignature = crypto
                    .createHmac('sha256', razorpayConfig.key_secret)
                    .update(body.toString())
                    .digest('hex');

                if (expectedSignature === response.razorpay_signature) {
                    await PaymentTransaction.update(
                        {
                            razorpay_payment_id: response.razorpay_payment_id,
                            status: 'success',
                        },
                        {
                            where: {
                                razorpay_order_id: response.razorpay_order_id,
                            },
                        }
                    );

                    const data = await Order.update(
                        {
                            payment_id: response.razorpay_payment_id,
                            payment_status: true,
                        },
                        {
                            where: {
                                id: response.razorpay_order_id,
                            },
                        }
                    );

                    return data[0]
                        ? res.status(200).json({
                              status: 'success',
                              msg: 'Payment Successful',
                          })
                        : res.status(400).json({
                              status: 'error',
                              msg: 'Payment Successful but saved to database',
                          });
                }

                return res.status(400).json({
                    status: 'error',
                    msg: 'Payment not verified',
                });
            } else {
                const data = await PaymentTransaction.update(
                    {
                        razorpay_payment_id: response.razorpay_payment_id,
                        status: 'failed',
                    },
                    {
                        where: {
                            razorpay_order_id: response.razorpay_order_id,
                        },
                    }
                );

                return data[0]
                    ? res.status(200).json({
                          status: 'success',
                          msg: 'Failed transaction saved',
                      })
                    : res.status(400).json({
                          status: 'error',
                          msg: 'Transaction not saved to database',
                      });
            }
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    },
];

exports.getAllTransactions = [
    verifyToken,
    async (req, res) => {
        try {
            const data = await PaymentTransaction.findAndCountAll({
                offset: req.query.pageNo ? req.query.pageNo * 10 : 0,
                limit: 10,
                order: [['createdAt', 'DESC']],
            });

            res.status(200).json({
                total_pages: Math.ceil(data.count / 10),
                total_transactions: data.count,
                transactions: data.rows,
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    },
];

exports.getAllTransactionsByUser = [
    verifyToken,
    async (req, res) => {
        try {
            const data = await PaymentTransaction.findAndCountAll({
                where: {
                    userId: req.user.id,
                },
                offset: req.query.pageNo ? req.query.pageNo * 10 : 0,
                limit: 10,
                order: [['createdAt', 'DESC']],
            });

            res.status(200).json({
                total_pages: Math.ceil(data.count / 10),
                total_transactions: data.count,
                transactions: data.rows,
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    },
];

exports.getTransactionById = [
    verifyToken,
    async (req, res) => {
        if (!req.params.orderId) {
            return res.status(400).json({
                status: 'error',
                error: 'Order Id parameter required',
            });
        }

        try {
            const data = await PaymentTransaction.findOne({
                where: {
                    razorpay_order_id: req.params.orderId,
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

exports.getRazorpayTransactionByPaymentId = [
    verifyToken,
    async (req, res) => {
        if (!req.params.paymentId) {
            return res.status(400).json({
                status: 'error',
                error: 'Payment Id parameter required',
            });
        }

        try {
            const data = await instance.payments.fetch(req.params.paymentId);

            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error,
            });
        }
    },
];

exports.getAllRazorpayTransactions = [
    verifyToken,
    async (req, res) => {
        try {
            const data = await instance.payments.all({
                from:
                    req.query.from ||
                    new Date(
                        Date.now() - 10 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString('sv-SE'),
                to: req.query.to || new Date().toLocaleDateString('sv-SE'),
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

// -------------------------------------------------------------
// EASEBUZZ

// const { Service } = require('../models');
// const axios = require('axios');
// const sha512 = require('js-sha512');
// const verifyToken = require('../middleware/verifyToken');
// const { check, validationResult } = require('express-validator');

// const expressValidatorError = (req, res) => {
//     const errors = validationResult(req).formatWith(({ msg, param }) => {
//         return {
//             status: 'error',
//             param,
//             msg,
//         };
//     });

//     if (!errors.isEmpty()) {
//         return res.status(400).json(
//             errors.array({
//                 onlyFirstError: true,
//             })
//         );
//     }
// };

// var config = {
//     key: process.env.EASEBUZZ_KEY || '2PBP7IABZ2',
//     salt: process.env.EASEBUZZ_SALT || 'DAH88E3UWQ',
//     env: process.env.EASEBUZZ_ENV || 'test',
//     enable_iframe: process.env.EASEBUZZ_IFRAME || 0,
// };

// exports.initiatePayment = [
//     verifyToken,
//     async (req, res) => {
//         try {
//             req.body.key = config.key;
//             generateHash(req.body);

//             function getFormData(object) {
//                 const formData = new FormData();
//                 Object.keys(object).forEach((key) =>
//                     formData.append(key, object[key])
//                 );
//                 return formData;
//             }

//             const formData = getFormData(req.body);
//             console.log(formData);

//             const gatewayData = await axios.post(
//                 `${geturl(config.env)}payment/initiateLink`,
//                 { ...req.body },
//                 {
//                     headers: {
//                         'Content-Type': 'application/x-www-form-urlencoded',
//                     },
//                 }
//             );

//             console.log(gatewayData.data);
//             const data = JSON.parse(gatewayData);
//             console.log(data);

//             // var url = url_main + 'pay/' + access_key;

//             // var initiate_payment = require('./Easebuzz/initiate_payment.js');
//             // initiate_payment.initiate_payment(data, config, res);
//         } catch (error) {
//             console.log(error);
//             res.status(500).json({
//                 status: 'error',
//                 error,
//             });
//         }
//     },
// ];

// exports.transaction = [
//     verifyToken,
//     function (req, res) {
//         data = req.body;
//         var transaction = require('./Easebuzz/transaction.js');
//         transaction.transaction(data, config, res);
//     },
// ];

// exports.transactionDate = [
//     verifyToken,
//     function (req, res) {
//         data = req.body;
//         var transaction_date = require('./Easebuzz/tranaction_date.js');
//         transaction_date.tranaction_date(data, config, res);
//     },
// ];

// exports.payout = [
//     verifyToken,
//     function (req, res) {
//         data = req.body;
//         var payout = require('./Easebuzz/payout.js');
//         payout.payout(data, config, res);
//     },
// ];

// exports.refund = [
//     verifyToken,
//     function (req, res) {
//         data = req.body;
//         var refund = require('./Easebuzz/refund.js');
//         refund.refund(data, config, res);
//     },
// ];

// function geturl(env) {
//     if (env == 'test') {
//         url_link = 'https://testpay.easebuzz.in/';
//     } else if (env == 'prod') {
//         url_link = 'https://pay.easebuzz.in/';
//     } else {
//         url_link = 'https://testpay.easebuzz.in/';
//     }
//     return url_link;
// }

// function generateHash(data) {
//     var hashstring =
//         config.key +
//         '|' +
//         data.txnid +
//         '|' +
//         data.amount +
//         '|' +
//         data.productinfo +
//         '|' +
//         data.name +
//         '|' +
//         data.email +
//         '|' +
//         data.udf1 +
//         '|' +
//         data.udf2 +
//         '|' +
//         data.udf3 +
//         '|' +
//         data.udf4 +
//         '|' +
//         data.udf5 +
//         '|' +
//         data.udf6 +
//         '|' +
//         data.udf7 +
//         '|' +
//         data.udf8 +
//         '|' +
//         data.udf9 +
//         '|' +
//         data.udf10;
//     hashstring += '|' + config.salt;
//     data.hash = sha512.sha512(hashstring);
//     return data.hash;
// }
