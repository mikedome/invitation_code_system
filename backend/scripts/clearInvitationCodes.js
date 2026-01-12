const sequelize = require('../config/db');
const InvitationCode = require('../models/InvitationCode');

/**
 * 清空邀请码脚本
 * 用于测试环境中清空所有邀请码数据
 */
async function clearInvitationCodes() {
  try {
    console.log('开始清空邀请码...');
    
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 清空邀请码表
    const result = await InvitationCode.destroy({
      where: {},
      truncate: true // 使用truncate快速清空表，同时重置自增ID
    });
    
    console.log(`成功清空 ${result} 条邀请码记录`);
    console.log('邀请码清空完成');
    
    // 关闭数据库连接
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('清空邀请码失败:', error.message);
    
    // 关闭数据库连接
    await sequelize.close();
    process.exit(1);
  }
}

// 执行脚本
clearInvitationCodes();