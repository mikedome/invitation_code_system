const sequelize = require('../config/db');
const InvitationCode = require('../models/InvitationCode');
const User = require('../models/User');
const EmployeePerformance = require('../models/EmployeePerformance');
const EmployeeRoster = require('../models/EmployeeRoster');

async function initDB() {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 同步表结构（只更新，不删除）
    await sequelize.sync({
      force: false, // 不强制删除表
      alter: true   // 自动修改表结构
    });
    console.log('数据库表结构同步成功');
    
    return true;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return false;
  }
}

module.exports = initDB;