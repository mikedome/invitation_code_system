const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 认证中间件
async function authenticate(req, res, next) {
  try {
    // 获取Authorization头
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ success: false, message: '未提供认证令牌' });
    }

    // 提取令牌
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未提供认证令牌' });
    }

    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 查找用户
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: '用户不存在' });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    console.error('认证错误:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: '无效的认证令牌' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: '认证令牌已过期' });
    }
    res.status(500).json({ success: false, message: '认证失败' });
  }
}

module.exports = authenticate;