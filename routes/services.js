const express = require('express');
const router = express.Router();

const {
    createService,
    getAllServices,
    getServiceById,
    updateService,
    deleteService,
} = require('../controllers/services');

// router.delete('/services/:id', deleteParty);
router.post('/', createService);
router.put('/:id', updateService);
router.get('/all', getAllServices);
router.get('/:id', getServiceById);
router.delete('/:id', deleteService);

module.exports = router;
