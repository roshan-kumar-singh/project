const faqController = require("../controllers/faqController");

const router = require("express").Router();

router.post('/create',faqController.creatFaq)
router.get('/get',faqController.getAllFaq)
router.get('/get/:q',faqController.filteredByCategory)


module.exports = router