const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const EmployeePerformance = sequelize.define('EmployeePerformance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employee_id: {
    type: DataTypes.STRING(4),
    allowNull: false,
    comment: '员工编号'
  },
  employee_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '员工姓名'
  },
  redemption_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '核销数量'
  },
  performance_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    },
    comment: '绩效评分 (0-100)'
  },
  month: {
    type: DataTypes.STRING(7), // YYYY-MM
    allowNull: false,
    comment: '统计月份'
  },
  rank: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '月度排名'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '更新时间'
  }
}, {
  tableName: 'employee_performance',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['employee_id', 'month'] }, // 每个员工每个月只能有一条记录
    { fields: ['month'] },
    { fields: ['rank'] },
    { fields: ['redemption_count'] },
    { fields: ['performance_score'] }
  ]
});

module.exports = EmployeePerformance;