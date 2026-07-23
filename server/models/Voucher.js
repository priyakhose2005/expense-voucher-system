const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Voucher = sequelize.define('Voucher', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  voucherNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  voucherDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  expenseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expenseTitle: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expenseCategory: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expenseDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: { min: 0.01 },
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'pending_approval', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'draft',
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  employeeSignatureUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  directorSignatureUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  approvalDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  approvedById: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: User, key: 'id' },
  },
}, {
  tableName: 'vouchers',
  timestamps: true, // createdAt / updatedAt cover Audit Information
});

Voucher.belongsTo(User, { as: 'employee', foreignKey: 'employeeId' });
Voucher.belongsTo(User, { as: 'approvedBy', foreignKey: 'approvedById' });
User.hasMany(Voucher, { as: 'vouchers', foreignKey: 'employeeId' });

module.exports = Voucher;
