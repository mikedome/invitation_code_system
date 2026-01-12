const InvitationCode = require('../models/InvitationCode');

// 生成随机字符串
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 生成唯一邀请码
async function generateUniqueCode(employeeId) {
  let code;
  let isUnique = false;

  // 确保employeeId是字符串类型
  const employeeIdStr = String(employeeId);
  
  // 验证员工编号格式
  if (!/^\d{4}$/.test(employeeIdStr)) {
    throw new Error('员工编号必须是4位数字');
  }

  // 尝试生成唯一邀请码，最多尝试10次
  for (let i = 0; i < 10; i++) {
    // 员工编号（4位）+ 随机字符串（12位）= 16位邀请码
    code = employeeIdStr + generateRandomString(12);

    // 检查邀请码是否已存在
    const existingCode = await InvitationCode.findOne({ where: { code } });
    if (!existingCode) {
      isUnique = true;
      break;
    }
  }

  if (!isUnique) {
    throw new Error('生成邀请码失败，请稍后重试');
  }

  // 验证邀请码长度是否为16位
  if (code.length !== 16) {
    throw new Error(`生成的邀请码长度不正确，应为16位，实际为${code.length}位: ${code}`);
  }

  return code;
}

module.exports = { generateUniqueCode };