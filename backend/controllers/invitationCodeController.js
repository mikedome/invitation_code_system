const InvitationCode = require('../models/InvitationCode');
const EmployeeRoster = require('../models/EmployeeRoster');
const { generateUniqueCode } = require('../utils/generateCode');

// 生成邀请码
async function generateCode(req, res) {
  try {
    let { employee_id } = req.body;
    
    if (!employee_id) {
      return res.status(400).json({ success: false, message: '请提供员工编号' });
    }
    
    // 确保employee_id是字符串类型，防止丢失前导零
    employee_id = String(employee_id);
    
    // 验证员工编号是否为4位数字
    if (!/^\d{4}$/.test(employee_id)) {
      return res.status(400).json({ success: false, message: '员工编号必须是4位数字' });
    }
    
    // 查找员工信息
    const employee = await EmployeeRoster.findOne({ where: { employee_id } });
    
    // 生成唯一邀请码
    const code = await generateUniqueCode(employee_id);
    
    // 保存到数据库
    const newCode = await InvitationCode.create({
      code,
      employee_id,
      generator_id: req.user.username, // 使用当前登录用户的用户名作为生成人
      generator_name: req.user.username, // 使用当前登录用户的用户名作为生成人姓名
      redeemer_id: null // 核销人初始为空
    });
    
    res.status(200).json({ success: true, data: { code, employee_id, generator_name: newCode.generator_name } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// 获取历史记录
async function getHistory(req, res) {
  try {
    const { page = 1, pageSize = 10, employee_id, status } = req.query;
    
    const where = {};
    if (employee_id) {
      where.employee_id = employee_id;
    }
    if (status) {
      where.status = status;
    }
    
    const offset = (page - 1) * pageSize;
    
    const [codes, total] = await Promise.all([
      InvitationCode.findAll({
        where,
        order: [['generated_at', 'DESC']],
        limit: parseInt(pageSize),
        offset: parseInt(offset)
      }),
      InvitationCode.count({ where })
    ]);
    
    // 为每个邀请码添加生成人姓名（这里使用用户名作为姓名）
    const codesWithGeneratorInfo = codes.map(code => ({
      ...code.toJSON(),
      generator_name: code.generator_id  // 将生成人ID（用户名）作为生成人姓名返回
    }));
    
    res.status(200).json({
      success: true,
      data: {
        list: codesWithGeneratorInfo,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// 检查邀请码是否过期（15天有效期）
function isCodeExpired(generatedAt) {
  const now = new Date();
  const generatedDate = new Date(generatedAt);
  const diffTime = Math.abs(now - generatedDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 15;
}

// 核销邀请码
async function redeemCode(req, res) {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ success: false, message: '请提供邀请码' });
    }
    
    // 验证邀请码格式
    if (!/^[A-Za-z0-9]{16}$/.test(code)) {
      return res.status(400).json({ success: false, message: '邀请码格式不正确' });
    }
    
    // 查找邀请码
    const invitationCode = await InvitationCode.findOne({ where: { code } });
    
    if (!invitationCode) {
      return res.status(404).json({ success: false, message: '邀请码不存在' });
    }
    
    // 检查是否已使用
    if (invitationCode.status === 'used') {
      return res.status(400).json({ success: false, message: '邀请码已被使用' });
    }
    
    // 检查是否过期
    if (isCodeExpired(invitationCode.generated_at)) {
      return res.status(400).json({ success: false, message: '邀请码已过期' });
    }
    
    // 更新状态为已使用，并记录核销人和核销时间
    await invitationCode.update({ 
      status: 'used',
      redeemer_id: req.user.username, // 记录当前登录用户为核销人
      redeemed_at: new Date() // 记录核销时间
    });
    
    // 更新绩效数据
    try {
      const EmployeePerformance = require('../models/EmployeePerformance');
      const EmployeeRoster = require('../models/EmployeeRoster');
      
      // 获取当前月份
      const currentMonth = new Date().toISOString().slice(0, 7); // 例如 '2026-01'
      
      // 获取员工姓名
      const employee = await EmployeeRoster.findOne({
        where: { employee_id: invitationCode.employee_id },
        attributes: ['name']
      });
      
      // 尝试查找或创建绩效记录
      let performanceRecord = await EmployeePerformance.findOne({
        where: {
          employee_id: invitationCode.employee_id,
          month: currentMonth
        }
      });
      
      if (performanceRecord) {
        // 如果存在现有记录，更新核销数量
        const newRedemptionCount = performanceRecord.redemption_count + 1;
        const newPerformanceScore = Math.min(100, newRedemptionCount * 5); // 每核销一个得5分，最高100分
        
        await performanceRecord.update({
          redemption_count: newRedemptionCount,
          performance_score: newPerformanceScore,
          updated_at: new Date()
        });
      } else {
        // 如果不存在记录，创建新记录
        const employeeName = employee ? employee.name : `员工${invitationCode.employee_id}`;
        await EmployeePerformance.create({
          employee_id: invitationCode.employee_id,
          employee_name: employeeName,
          redemption_count: 1,
          performance_score: 5, // 初始5分
          month: currentMonth,
          rank: 999, // 初始排名，后续会重新计算
          updated_at: new Date()
        });
      }
      
      // 重新计算当月所有员工的排名
      await recalculateRankings(currentMonth);
    } catch (perfError) {
      // 如果更新绩效数据失败，不影响核销操作的成功
      console.error('更新绩效数据失败:', perfError);
    }
    
    res.status(200).json({ 
      success: true, 
      message: '邀请码核销成功',
      data: {
        code: invitationCode.code,
        employee_id: invitationCode.employee_id,
        redeemer_id: req.user.username
      }
    });
  } catch (error) {
    console.error('核销邀请码失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// 重新计算指定月份的排名
async function recalculateRankings(month) {
  try {
    const EmployeePerformance = require('../models/EmployeePerformance');
    
    // 获取指定月份的所有绩效记录
    const records = await EmployeePerformance.findAll({
      where: { month: month },
      order: [['redemption_count', 'DESC']] // 按核销数量降序排列
    });
    
    // 更新排名
    let currentRank = 1;
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      // 如果当前记录的核销数量不同于前一个记录，则更新排名
      if (i > 0 && records[i].redemption_count !== records[i - 1].redemption_count) {
        currentRank = i + 1;
      }
      
      await record.update({ rank: currentRank });
    }
  } catch (error) {
    console.error('重新计算排名失败:', error);
  }
}

module.exports = { generateCode, getHistory, redeemCode };