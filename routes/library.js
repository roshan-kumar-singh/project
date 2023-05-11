const express = require('express');
const router = express.Router();

const {
    createLibrary,
    getAllLibrary,
    getLibraryById,
    updateLibrary,
    deleteLibrary,
} = require('../controllers/library');

router.post('/', createLibrary);
router.get('/all', getAllLibrary);
router.get('/:id', getLibraryById);
router.put('/:id', updateLibrary);
router.delete('/:id', deleteLibrary);

module.exports = router;
