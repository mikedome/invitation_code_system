const express = require('express');
const router = express.Router();
const { getPerformanceData, manualCalculatePerformance, getAvailableMonths, getAllHistoricalPerformance } = require('../controllers/performanceController');
const authenticate = require('../middleware/auth');

// 获取员工绩效数据
router.get('/performance', authenticate, getPerformanceData);

// 获取所有可用月份
router.get('/performance/months', authenticate, getAvailableMonths);

// 手动触发月度绩效计算（仅限管理员）
router.post('/performance/calculate', authenticate, (req, res, next) => {
  // 检查用户是否为管理员
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: '权限不足，只有管理员可以执行此操作' });
  }
  next();
}, manualCalculatePerformance);

// 获取所有历史绩效数据
router.get('/performance/historical', authenticate, getAllHistoricalPerformance);

module.exports = router;