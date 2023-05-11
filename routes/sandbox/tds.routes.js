const express= require("express")
const checkAuth = require('../../middleware/check-auth')
const tdsController = require("../../controllers/sandbox/tds.controller")
const form16Controller = require("../../controllers/sandbox/form16Controller")
const router = express.Router()




router.post("/prepare/tds/return",checkAuth,tdsController.prepareTdsReturn)
router.post("/prepare/tds/return/status",checkAuth,tdsController.tdsReturnStatus)
router.post("/calculator",checkAuth,tdsController.tdsCalculator)
router.get("/section206ABAnd206CCACheck",checkAuth,tdsController.section206ABAnd206CCACheck)
router.post("/section206ABAsyncAPI",checkAuth,tdsController.section206ABAsyncAPI)
router.get("/section206ABStatus",checkAuth,tdsController.section206ABStatus)
router.post("/authenticateTracesSession",checkAuth,tdsController.authenticateTracesSession)
router.post("/downloadForm16A",checkAuth,tdsController.downloadForm16A)
router.post("/downloadForm16",checkAuth,tdsController.downloadForm16)

//form 16 routes

router.post("/auth/form16/trace/session",checkAuth,form16Controller.genrateTraceSession)
router.post("/form16a/download",checkAuth,form16Controller.download16A)
router.post("/form16/download",checkAuth,form16Controller.downloadForm16)


router.get('/',(req,res)=>{
    
    res.send("Hello World");
}
)


module.exports =router