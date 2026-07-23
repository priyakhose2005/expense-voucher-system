const { Op } = require('sequelize');
const Voucher = require('../models/Voucher');
const User = require('../models/User');
const generateVoucherNumber = require('../utils/generateVoucherNumber');

const EDITABLE_STATUSES = ['draft'];

// ---------- Create (always starts as Draft) ----------
exports.createVoucher = async (req, res) => {
  try {
    const { expenseDate, department, expenseTitle, expenseCategory, expenseDescription, amount } = req.body;

    if (!department || !expenseTitle || !expenseDate || amount === undefined) {
      return res.status(400).json({ message: 'Department, Expense Title, Expense Date, and Amount are mandatory.' });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero.' });
    }

    const voucherNumber = await generateVoucherNumber(Voucher);

    const voucher = await Voucher.create({
      voucherNumber,
      voucherDate: new Date(),
      expenseDate,
      department,
      expenseTitle,
      expenseCategory,
      expenseDescription,
      amount,
      status: 'draft',
      employeeId: req.user.id,
    });

    res.status(201).json(voucher);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create voucher.', error: err.message });
  }
};

// ---------- Update (Draft only, owner only) ----------
exports.updateVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id);
    if (!voucher) return res.status(404).json({ message: 'Voucher not found.' });

    if (voucher.employeeId !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own vouchers.' });
    }
    if (!EDITABLE_STATUSES.includes(voucher.status)) {
      return res.status(400).json({ message: 'Only vouchers in Draft status can be edited.' });
    }

    const { expenseDate, department, expenseTitle, expenseCategory, expenseDescription, amount } = req.body;
    if (amount !== undefined && Number(amount) <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero.' });
    }

    await voucher.update({
      expenseDate: expenseDate ?? voucher.expenseDate,
      department: department ?? voucher.department,
      expenseTitle: expenseTitle ?? voucher.expenseTitle,
      expenseCategory: expenseCategory ?? voucher.expenseCategory,
      expenseDescription: expenseDescription ?? voucher.expenseDescription,
      amount: amount ?? voucher.amount,
    });

    res.json(voucher);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update voucher.', error: err.message });
  }
};

// ---------- Delete (Draft only, owner only) ----------
exports.deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id);
    if (!voucher) return res.status(404).json({ message: 'Voucher not found.' });

    if (voucher.employeeId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own vouchers.' });
    }
    if (!EDITABLE_STATUSES.includes(voucher.status)) {
      return res.status(400).json({ message: 'Only vouchers in Draft status can be deleted.' });
    }

    await voucher.destroy();
    res.json({ message: 'Voucher deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete voucher.', error: err.message });
  }
};

// ---------- Submit (Draft -> Submitted -> Pending Approval) ----------
exports.submitVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id);
    if (!voucher) return res.status(404).json({ message: 'Voucher not found.' });

    if (voucher.employeeId !== req.user.id) {
      return res.status(403).json({ message: 'You can only submit your own vouchers.' });
    }
    if (voucher.status !== 'draft') {
      return res.status(400).json({ message: 'Only Draft vouchers can be submitted.' });
    }
    if (!voucher.employeeSignatureUrl) {
      return res.status(400).json({ message: 'Employee signature is mandatory before submission.' });
    }

    voucher.status = 'pending_approval';
    await voucher.save();

    res.json(voucher);
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit voucher.', error: err.message });
  }
};

// ---------- Attach employee signature (upload) ----------
exports.uploadEmployeeSignature = async (req, res) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id);
    if (!voucher) return res.status(404).json({ message: 'Voucher not found.' });
    if (voucher.employeeId !== req.user.id) {
      return res.status(403).json({ message: 'You can only sign your own vouchers.' });
    }
    if (!EDITABLE_STATUSES.includes(voucher.status)) {
      return res.status(400).json({ message: 'Signature can only be added while the voucher is in Draft status.' });
    }
    if (!req.file) return res.status(400).json({ message: 'No signature file uploaded.' });

    voucher.employeeSignatureUrl = `/uploads/signatures/${req.file.filename}`;
    await voucher.save();
    res.json(voucher);
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload signature.', error: err.message });
  }
};

// ---------- Approve (Director only) ----------
exports.approveVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id);
    if (!voucher) return res.status(404).json({ message: 'Voucher not found.' });
    if (voucher.status !== 'pending_approval' && voucher.status !== 'submitted') {
      return res.status(400).json({ message: 'Only pending vouchers can be approved.' });
    }

    // Director signature: either uploaded now via req.file, or already provided by req.body.directorSignatureUrl
    let signatureUrl = voucher.directorSignatureUrl;
    if (req.file) {
      signatureUrl = `/uploads/signatures/${req.file.filename}`;
    }
    if (!signatureUrl) {
      return res.status(400).json({ message: 'Director signature is mandatory before approval.' });
    }

    voucher.status = 'approved';
    voucher.directorSignatureUrl = signatureUrl;
    voucher.approvalDate = new Date();
    voucher.approvedById = req.user.id;
    voucher.rejectionReason = null;
    await voucher.save();

    res.json(voucher);
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve voucher.', error: err.message });
  }
};

// ---------- Reject (Director only) ----------
exports.rejectVoucher = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({ message: 'Rejection reason is mandatory when rejecting a voucher.' });
    }

    const voucher = await Voucher.findByPk(req.params.id);
    if (!voucher) return res.status(404).json({ message: 'Voucher not found.' });
    if (voucher.status !== 'pending_approval' && voucher.status !== 'submitted') {
      return res.status(400).json({ message: 'Only pending vouchers can be rejected.' });
    }

    voucher.status = 'rejected';
    voucher.rejectionReason = rejectionReason;
    voucher.approvedById = req.user.id;
    voucher.approvalDate = new Date();
    await voucher.save();

    res.json(voucher);
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject voucher.', error: err.message });
  }
};

// ---------- List (role-scoped) with search/filter/sort ----------
exports.getVouchers = async (req, res) => {
  try {
    const {
      voucherNumber, employeeName, department, category, status,
      dateFrom, dateTo, amountMin, amountMax,
      sortBy = 'createdAt', sortOrder = 'DESC',
    } = req.query;

    const where = {};
    const employeeWhere = {};

    // Role-based scoping
    if (req.user.role === 'employee') {
      where.employeeId = req.user.id;
    }

    if (voucherNumber) where.voucherNumber = { [Op.like]: `%${voucherNumber}%` };
    if (department) where.department = { [Op.like]: `%${department}%` };
    if (category) where.expenseCategory = { [Op.like]: `%${category}%` };
    if (status) where.status = status;
    if (employeeName) employeeWhere.name = { [Op.like]: `%${employeeName}%` };

    if (dateFrom || dateTo) {
      where.expenseDate = {};
      if (dateFrom) where.expenseDate[Op.gte] = dateFrom;
      if (dateTo) where.expenseDate[Op.lte] = dateTo;
    }
    if (amountMin || amountMax) {
      where.amount = {};
      if (amountMin) where.amount[Op.gte] = Number(amountMin);
      if (amountMax) where.amount[Op.lte] = Number(amountMax);
    }

    const allowedSortFields = ['createdAt', 'amount', 'expenseDate', 'status', 'voucherNumber'];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const vouchers = await Voucher.findAll({
      where,
      include: [
        { model: User, as: 'employee', attributes: ['id', 'name', 'department', 'employeeCode'], where: Object.keys(employeeWhere).length ? employeeWhere : undefined },
        { model: User, as: 'approvedBy', attributes: ['id', 'name'] },
      ],
      order: [[orderField, orderDir]],
    });

    res.json(vouchers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch vouchers.', error: err.message });
  }
};

// ---------- Get single voucher ----------
exports.getVoucherById = async (req, res) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id, {
      include: [
        { model: User, as: 'employee', attributes: ['id', 'name', 'department', 'employeeCode'] },
        { model: User, as: 'approvedBy', attributes: ['id', 'name'] },
      ],
    });
    if (!voucher) return res.status(404).json({ message: 'Voucher not found.' });

    if (req.user.role === 'employee' && voucher.employeeId !== req.user.id) {
      return res.status(403).json({ message: 'You can only view your own vouchers.' });
    }

    res.json(voucher);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch voucher.', error: err.message });
  }
};
