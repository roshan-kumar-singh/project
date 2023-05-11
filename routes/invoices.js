const express = require('express');
// const {
//     createInvoice,
//     updateInvoice,
//     deleteInvoice,
//     getInvoice,
//     getInvoicesByUser,
//     getTotalCount,
// } = require('../controllers/invoices');

// const {
//     createInvoice,
//     getInvoices,
//     getLatestInvoices,
//     getInvoiceById,
//     createParty,
//     getParties,
//     getLatestParties,
//     getPartyById,
//     searchParties,
//     createItem,
//     getItems,
//     getLatestItems,
//     searchItems,
// } = require('../controllers/invoice.controller');

const { 
    createInvoice,
    getInvoices,
    getLatestInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
    createParty,
    getParties,
    getLatestParties,
    getPartyById,
    searchParties,
    updateParty,
    deleteParty,
    createItem,
    getItems,
    getLatestItems,
    searchItems,
    updateItem,
    deleteItem,
    getSales,
} = require('../controllers/invoice.controller');

const router = express.Router();

// router.get('/count', getTotalCount); //use to generate invoice serial number
// router.get('/:id', getInvoice);
// router.get('/', getInvoicesByUser);
// router.post('/', createInvoice);
// router.patch('/:id', updateInvoice);
// router.delete('/:id', deleteInvoice);

router.get('/parties', getParties);
router.get('/parties-latest', getLatestParties);
router.get('/parties-search', searchParties);
router.get('/party/:id', getPartyById);
router.post('/party', createParty);
router.put('/party', updateParty);
router.delete('/party/:id', deleteParty);

router.get('/items', getItems);
router.get('/items-latest', getLatestItems);
router.get('/items-search', searchItems);
router.post('/item', createItem);
router.put('/item', updateItem);
router.delete('/item/:id', deleteItem);

router.get('/sales', getSales);

router.get('/', getInvoices);
router.put('/', updateInvoice);
router.post('/create', createInvoice);
router.get('/latest', getLatestInvoices);
router.get('/:id', getInvoiceById);
router.delete('/:id', deleteInvoice);

module.exports = router;
