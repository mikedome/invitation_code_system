const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const EmployeeRoster = sequelize.define('EmployeeRoster', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employee_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    comment: '员工编号'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '员工姓名'
  },
  department: {
    type: DataTypes.STRING(100),
    comment: '所属部门'
  },
  position: {
    type: DataTypes.STRING(100),
    comment: '职位'
  },
  hire_date: {
    type: DataTypes.DATEONLY, // 只存储日期部分
    comment: '入职日期'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'on_leave'),
    allowNull: false,
    defaultValue: 'active',
    comment: '员工状态'
  },
  phone: {
    type: DataTypes.STRING(20),
    comment: '联系电话'
  },
  email: {
    type: DataTypes.STRING(100),
    comment: '邮箱'
  },
  id_card: {
    type: DataTypes.STRING(18),
    comment: '身份证号'
  },
  emergency_contact: {
    type: DataTypes.STRING(50),
    comment: '紧急联系人'
  },
  emergency_phone: {
    type: DataTypes.STRING(20),
    comment: '紧急联系电话'
  }
}, {
  tableName: 'employee_roster',
  timestamps: true, // 使用sequelize自动管理创建和更新时间
  paranoid: true, // 启用软删除
  deletedAt: 'deleted_at', // 软删除时间戳字段名
  indexes: [
    { unique: true, fields: ['employee_id'] },
    { fields: ['department'] },
    { fields: ['status'] },
    { fields: ['hire_date'] },
    { fields: ['deleted_at'] }
  ],
  comment: '员工花名册表'
});

module.exports = EmployeeRoster;