const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const InvitationCode = sequelize.define('InvitationCode', {
  code: {
    type: DataTypes.STRING(16),
    allowNull: false,
    unique: true,
    comment: '邀请码'
  },
  employee_id: {
    type: DataTypes.STRING(4),
    allowNull: false,
    comment: '员工编号'
  },
  generator_id: {
    type: DataTypes.STRING(50),
    comment: '生成人ID，即登录用户名'
  },
  generator_name: {
    type: DataTypes.STRING(50),
    comment: '生成人姓名'
  },
  redeemer_id: {
    type: DataTypes.STRING(50),
    comment: '核销人ID，即登录用户名'
  },
  generated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '生成时间'
  },
  status: {
    type: DataTypes.ENUM('unused', 'used'),
    allowNull: false,
    defaultValue: 'unused',
    comment: '状态'
  },
  redeemed_at: {
    type: DataTypes.DATE,
    comment: '核销时间'
  }
}, {
  tableName: 'invitation_codes',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['code'] },
    { fields: ['employee_id'] },
    { fields: ['generated_at'] },
    { fields: ['status'] }
  ]
});

module.exports = InvitationCode;