const express = require('express');
const router = express.Router();
const { generateCode, getHistory, redeemCode } = require('../controllers/invitationCodeController');
const authenticate = require('../middleware/auth');

// 生成邀请码
router.post('/generate', authenticate, generateCode);

// 获取历史记录
router.get('/history', authenticate, getHistory);

// 核销邀请码
router.post('/redeem', authenticate, redeemCode);

module.exports = router;