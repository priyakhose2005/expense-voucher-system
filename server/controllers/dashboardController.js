const { Op, fn, col, literal } = require('sequelize');
const Voucher = require('../models/Voucher');

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

exports.getDashboard = async (req, res) => {
  try {
    const { role, id } = req.user;

    if (role === 'employee') {
      const where = { employeeId: id };
      const all = await Voucher.findAll({ where });
      const totalAmount = all.reduce((sum, v) => sum + Number(v.amount), 0);

      return res.json({
        totalVouchers: all.length,
        draft: all.filter(v => v.status === 'draft').length,
        pendingApproval: all.filter(v => v.status === 'pending_approval' || v.status === 'submitted').length,
        approved: all.filter(v => v.status === 'approved').length,
        rejected: all.filter(v => v.status === 'rejected').length,
        totalAmountClaimed: totalAmount,
      });
    }

    if (role === 'director') {
      const today = startOfToday();
      const all = await Voucher.findAll();
      const pending = all.filter(v => v.status === 'pending_approval' || v.status === 'submitted');
      const approvedToday = all.filter(v => v.status === 'approved' && v.approvalDate && new Date(v.approvalDate) >= today);
      const rejectedToday = all.filter(v => v.status === 'rejected' && v.approvalDate && new Date(v.approvalDate) >= today);
      const totalPendingAmount = pending.reduce((sum, v) => sum + Number(v.amount), 0);
      const recent = [...all].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 10);

      return res.json({
        pendingApprovalCount: pending.length,
        approvedToday: approvedToday.length,
        rejectedToday: rejectedToday.length,
        totalPendingAmount,
        recentActivity: recent,
      });
    }

    if (role === 'accounts') {
      const all = await Voucher.findAll();
      const approved = all.filter(v => v.status === 'approved');
      const totalApprovedAmount = approved.reduce((sum, v) => sum + Number(v.amount), 0);
      const recentApproved = [...approved].sort((a, b) => new Date(b.approvalDate) - new Date(a.approvalDate)).slice(0, 10);

      return res.json({
        totalVouchers: all.length,
        pendingApproval: all.filter(v => v.status === 'pending_approval' || v.status === 'submitted').length,
        approved: approved.length,
        rejected: all.filter(v => v.status === 'rejected').length,
        totalApprovedExpenseAmount: totalApprovedAmount,
        recentApprovedVouchers: recentApproved,
      });
    }

    res.status(400).json({ message: 'Unknown role.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load dashboard.', error: err.message });
  }
};
