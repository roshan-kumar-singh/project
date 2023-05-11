const express = require('express');
const router = express.Router();

const {
    initiatePayment,
    handlePaymentResponse,
    getAllTransactions,
    getAllTransactionsByUser,
    getAllRazorpayTransactions,
    getRazorpayTransactionByPaymentId,
    getTransactionById,
} = require('../controllers/payment');

router.post('/initiate_payment', initiatePayment);
router.post('/response', handlePaymentResponse);
router.get('/all', getAllTransactions);
router.get('/user/all', getAllTransactionsByUser);
router.get('/razorpay/all', getAllRazorpayTransactions);
router.get('/razorpay/:paymentId', getRazorpayTransactionByPaymentId);
router.get('/:orderId', getTransactionById);

module.exports = router;
