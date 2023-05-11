const express = require('express');
const router = express.Router();
const usersRouter = require('./users.route');
const mcaRouter = require('./sandbox/mca.route');
const bankRouter = require('./sandbox/bank.route');
const gspRouter = require('./sandbox/gstin.route');
const panRouter = require('./sandbox/pan.route');
const sandboxcalcRouter = require('./sandbox/calculator.route');
const sandboxTaxRouter = require('../routes/sandbox/tax.route'); // pk
const Blog = require('../routes/blog.route'); //
const calcRouter = require('./calculator.route');
const ApiError = require('../errors/ApiError');
const banks = require('./bank');
const pincoderoute = require('./pincode');
const postofficeroute = require('./postoffice');
const pdfroute = require('./pdf');
const hsnRouter = require('./hsn');
const clientRouter = require('./clients');
const invoice = require('./invoices');
const profileRouter = require('./profile');
const starhealth = require("./starHealth");
const cmsRouter = require('./cms');
const emailRouter = require('./email');
const challan = require('../routes/sandbox/taxPayment.routes');
const footer = require('../routes/fotter.route');
const tanRoutes = require('./sandbox/tan.routes');
const tdsRoutes = require('./sandbox/tds.routes');
const FAQ = require('./faqRoutes');
const payment = require('./payment');
const services = require('./services');
const orders = require('./orders');
const library = require('./library');
const careerApplications = require('./careerApplications');

const ocr = require('./ocr.routes');
// const chatbot = require('./chatbot.route');

router.get('/', function (req, res, next) {
    res.render('index', { title: 'APi node Server is running! 🏃‍' });
});

router.use('/blog', Blog);
router.use('/taxes', sandboxTaxRouter);
router.use('/users', usersRouter);
router.use('/mca', mcaRouter);
router.use('/bank', bankRouter);
router.use('/gsp', gspRouter);
router.use('/pan', panRouter);
router.use('/calculator', calcRouter);
router.use('/banks', banks);
router.use('/postoffice', postofficeroute);
router.use('/pincode', pincoderoute);
router.use('/pdf', pdfroute);
router.use('/hsn', hsnRouter);
router.use('/client', clientRouter);
router.use('/invoice', invoice);
router.use('/profile', profileRouter);
router.use('/cms', cmsRouter);
router.use('/email', emailRouter);
router.use('/challan', challan);
router.use('/footer', footer);
router.use('/tan', tanRoutes);
router.use('/tds', tdsRoutes);
router.use('/faq', FAQ);
router.use('/payment', payment);
router.use('/service', services);
router.use('/order', orders);
router.use('/library', library);
router.use('/career', careerApplications);
router.use('/starhealth', starhealth);
router.use('/ocr', ocr);
// router.use('/chatbot', chatbot);

router.get('*', (req, res, next) => {
    return next(ApiError.notFound('endpoint not found'));
});

router.post('*', (req, res, next) => {
    return next(ApiError.notFound('endpoint not found'));
});

module.exports = router;
