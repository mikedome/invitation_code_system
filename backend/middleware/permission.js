// 权限控制中间件
function requireRole(role) {
  return (req, res, next) => {
    try {
      // 检查用户是否已认证
      if (!req.user) {
        return res.status(401).json({ success: false, message: '未认证' });
      }

      // 检查用户角色
      if (req.user.role !== role) {
        return res.status(403).json({ success: false, message: '无权限访问该资源' });
      }

      next();
    } catch (error) {
      console.error('权限检查错误:', error);
      res.status(500).json({ success: false, message: '权限检查失败' });
    }
  };
}

// 检查是否为管理员
function isAdmin(req, res, next) {
  try {
    // 检查用户是否已认证
    if (!req.user) {
      return res.status(401).json({ success: false, message: '未认证' });
    }

    // 检查用户角色是否为管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '仅管理员可访问该资源' });
    }

    next();
  } catch (error) {
    console.error('管理员权限检查错误:', error);
    res.status(500).json({ success: false, message: '权限检查失败' });
  }
}

module.exports = {
  requireRole,
  isAdmin
};