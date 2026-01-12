const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键'
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '用户名'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '密码（加密存储）'
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    allowNull: false,
    defaultValue: 'user',
    comment: '角色'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '创建时间'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW,
    comment: '更新时间'
  }
}, {
  tableName: 'users',
  timestamps: true,
  paranoid: true, // 启用软删除
  deletedAt: 'deleted_at', // 软删除时间戳字段名
  indexes: [
    { unique: true, fields: ['username'] },
    { fields: ['role'] },
    { fields: ['deleted_at'] }
  ]
});

module.exports = User;