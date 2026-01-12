require('dotenv').config({ path: '../.env' });
const User = require('../models/User');
const bcrypt = require('bcrypt');

// 创建或更新管理员账户
async function createAdmin() {
  try {
    // 检查是否已存在管理员账户
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    
    if (existingAdmin) {
      console.log('管理员账户已存在');
      return;
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // 创建管理员账户
    const admin = await User.create({
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });
    
    console.log('管理员账户创建成功:', admin);
  } catch (error) {
    console.error('创建管理员账户失败:', error);
  }
}

// 执行函数
createAdmin();