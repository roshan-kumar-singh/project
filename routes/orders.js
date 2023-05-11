const express = require('express');
const router = express.Router();

const {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrder,
    uploadDocument,
    getAllDocuments,
    getAllOrdersByUser,
    deleteOrder,
} = require('../controllers/orders');

// router.delete('/services/:id', deleteParty);
router.post('/', createOrder);
router.post('/upload-documents', uploadDocument);
router.put('/:id', updateOrder);
router.get('/all', getAllOrders);
router.get('/user/all', getAllOrdersByUser);
router.get('/:id', getOrderById);
router.get('/documents/:orderId', getAllDocuments);
router.delete('/:id', deleteOrder);

module.exports = router;
