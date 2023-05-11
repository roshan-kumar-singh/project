const express = require('express');
const router = express.Router();

const checkAuth = require('../../middleware/check-auth')
const bodyValidator = require('../../middleware/body-validator');
const searchTanController = require('../../controllers/sandbox/searchTan.controller');






router.get("/search/tan",checkAuth,searchTanController.searchTan)




module.exports = router