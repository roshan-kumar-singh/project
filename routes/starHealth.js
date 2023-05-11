const express = require('express');
const router = express.Router();
const StarHealthController = require('../controllers/starhealth.controller')
router.get('/getPlan', StarHealthController.getPlan);
router.get('/',(req,res)=>{
    
    res.send("Hello World");
}
)

module.exports = router;