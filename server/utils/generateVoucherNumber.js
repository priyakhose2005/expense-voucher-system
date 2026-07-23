const { Op } = require('sequelize');

/**
 * Generates a unique voucher number in the form EV-YYYY-00001
 * Sequence resets per calendar year.
 */
async function generateVoucherNumber(VoucherModel) {
  const year = new Date().getFullYear();
  const prefix = `EV-${year}-`;

  const lastVoucher = await VoucherModel.findOne({
    where: { voucherNumber: { [Op.like]: `${prefix}%` } },
    order: [['id', 'DESC']],
  });

  let nextSeq = 1;
  if (lastVoucher) {
    const lastSeq = parseInt(lastVoucher.voucherNumber.split('-').pop(), 10);
    if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
  }

  return `${prefix}${String(nextSeq).padStart(5, '0')}`;
}

module.exports = generateVoucherNumber;
