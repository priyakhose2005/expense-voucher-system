const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

// All voucher routes require authentication
router.use(auth);

// List + detail (scoped by role inside controller)
router.get('/', voucherController.getVouchers);
router.get('/:id', voucherController.getVoucherById);

// Employee actions
router.post('/', roleCheck(['employee']), voucherController.createVoucher);
router.put('/:id', roleCheck(['employee']), voucherController.updateVoucher);
router.delete('/:id', roleCheck(['employee']), voucherController.deleteVoucher);
router.post('/:id/signature', roleCheck(['employee']), upload.single('signature'), voucherController.uploadEmployeeSignature);
router.post('/:id/submit', roleCheck(['employee']), voucherController.submitVoucher);

// Director actions
router.post('/:id/approve', roleCheck(['director']), upload.single('signature'), voucherController.approveVoucher);
router.post('/:id/reject', roleCheck(['director']), voucherController.rejectVoucher);

module.exports = router;
