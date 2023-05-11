const express = require('express');
const router = express.Router();

const {
    createApplication,
    getAllApplication,
    getApplicationById,
    deleteApplication,
} = require('../controllers/careerApplications');

router.post('/application/apply', createApplication);
router.get('/application/all', getAllApplication);
router.get('/application/:id', getApplicationById);
router.delete('/application/:id', deleteApplication);

module.exports = router;
