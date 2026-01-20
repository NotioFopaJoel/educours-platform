
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const paymentController = require('../controllers/payment.controller');
const { routeValidations } = require('../middleware/validation');

// Routes protégées
router.post('/create-checkout', auth, routeValidations.createPayment, paymentController.createCheckoutSession);
router.post('/webhook', paymentController.handleWebhook);
router.get('/success/:sessionId', auth, paymentController.paymentSuccess);
router.get('/cancel/:sessionId', auth, paymentController.paymentCancel);
router.get('/history', auth, paymentController.getPaymentHistory);
router.get('/:id', auth, paymentController.getPaymentById);
router.post('/manual', auth, paymentController.processManualPayment);

module.exports = router;
