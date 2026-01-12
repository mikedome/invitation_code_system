const EmployeePerformance = require('../models/EmployeePerformance');
const InvitationCode = require('../models/InvitationCode');
const { Op } = require('sequelize');

// 获取员工绩效数据
async function getPerformanceData(req, res) {
  try {
    const { month, startDate, endDate, page = 1, pageSize = 10 } = req.query;
    
    const EmployeeRoster = require('../models/EmployeeRoster');
    const InvitationCode = require('../models/InvitationCode');
    
    // 获取所有在职员工
    const allActiveEmployees = await EmployeeRoster.findAll({
      where: { status: 'active' },
      attributes: ['employee_id', 'name']
    });
    
    // 构建查询条件
    const whereCondition = {
      status: 'used',
      employee_id: { [Op.in]: allActiveEmployees.map(emp => emp.employee_id) } // 只查询在职员工
    };
    
    // 如果提供了日期范围，则使用日期范围查询
    if (startDate && endDate) {
      whereCondition.redeemed_at = {
        [Op.between]: [new Date(`${startDate}T00:00:00.000Z`), new Date(`${endDate}T23:59:59.999Z`)]
      };
    } else if (month) {
      // 如果提供了月份参数，则按月份查询
      // 验证月份格式
      if (!/^(\d{4})-(\d{2})$/.test(month)) {
        console.error(`月份格式不正确: ${month}`);
        return res.status(400).json({ success: false, message: '月份格式不正确，应为 YYYY-MM' });
      }
      
      whereCondition.redeemed_at = {
        [Op.between]: [
          new Date(`${month}-01`),
          new Date(new Date(`${month}-01`).getFullYear(), new Date(`${month}-01`).getMonth() + 1, 1)
        ]
      };
    } else {
      // 如果没有提供日期范围或月份，则查询所有数据
      // 可以根据需要调整这里的逻辑
    }
    
    // 直接从邀请码表中查询指定日期范围的核销数据，进行条件聚合
    const usedCodesInRange = await InvitationCode.findAll({
      where: whereCondition,
      attributes: ['employee_id'],
      raw: true // 使用原始数据以提高性能
    });
    
    // 按员工ID统计核销数量
    const redemptionCounts = {};
    usedCodesInRange.forEach(code => {
      const employeeId = code.employee_id;
      redemptionCounts[employeeId] = (redemptionCounts[employeeId] || 0) + 1;
    });
    
    // 为所有在职员工构建绩效数据
    const allEmployeePerformance = [];
    
    allActiveEmployees.forEach(employee => {
      const redemptionCount = redemptionCounts[employee.employee_id] || 0;
      const performance_score = Math.min(100, redemptionCount * 5); // 每核销一个得5分，最高100分
      
      // 根据查询条件确定月份字段的值
      let displayMonth = 'all'; // 默认为全部
      if (month) {
        displayMonth = month;
      } else if (startDate && endDate) {
        displayMonth = `${startDate}至${endDate}`; // 日期范围格式
      }
      
      allEmployeePerformance.push({
        id: null, // 动态计算的数据没有固定ID
        employee_id: employee.employee_id,
        employee_name: employee.name,
        redemption_count: redemptionCount,
        performance_score,
        month: displayMonth,
        rank: 999, // 临时排名，稍后重新计算
        updated_at: null
      });
    });
    
    // 按照核销数量降序排序
    allEmployeePerformance.sort((a, b) => b.redemption_count - a.redemption_count);
    
    // 重新分配排名，相同核销数量的员工排名相同
    let currentRank = 1;
    allEmployeePerformance.forEach((emp, index) => {
      if (index > 0 && allEmployeePerformance[index].redemption_count !== allEmployeePerformance[index - 1].redemption_count) {
        currentRank = index + 1;
      }
      emp.rank = currentRank;
    });
    
    // 计算总数和分页数据
    const total = allEmployeePerformance.length;
    const startIndex = (parseInt(page) - 1) * parseInt(pageSize);
    const paginatedList = allEmployeePerformance.slice(startIndex, startIndex + parseInt(pageSize));
    
    res.status(200).json({
      success: true,
      data: {
        list: paginatedList,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取绩效数据失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// 计算月度绩效数据
async function calculateMonthlyPerformance(targetMonth) {
  try {
    // 验证月份格式
    if (!targetMonth || typeof targetMonth !== 'string' || !/^(\d{4})-(\d{2})$/.test(targetMonth)) {
      console.error(`月份格式不正确: ${targetMonth}`);
      return [];
    }
    
    console.log(`开始计算 ${targetMonth} 月度绩效数据...`);
    
    // 获取该月所有已使用的邀请码
    // 需要根据邀请码的使用日期来统计，但我们目前的模型没有redeemed_at字段
    // 因此需要扩展InvitationCode模型或者查询相关的使用记录
    
    // 为了实现这个功能，我们假设邀请码一旦被标记为'used'状态，
    // 就代表它在这个时刻被核销了
    
    // 获取该月的所有已使用邀请码
    const usedCodes = await InvitationCode.findAll({
      where: {
        status: 'used',
        employee_id: {
          [Op.not]: null // 确保有员工编号
        },
        redeemed_at: {
          [Op.between]: [
            new Date(`${targetMonth}-01`),
            new Date(new Date(`${targetMonth}-01`).getFullYear(), new Date(`${targetMonth}-01`).getMonth() + 1, 1)
          ]
        }
      },
      attributes: ['employee_id', 'redeemed_at']
    });
    
    // 按员工编号分组统计核销数量
    const performanceStats = {};
    
    usedCodes.forEach(code => {
      const employeeId = code.employee_id;
      
      if (!performanceStats[employeeId]) {
        performanceStats[employeeId] = {
          employee_id: employeeId,
          redemption_count: 0
        };
      }
      performanceStats[employeeId].redemption_count++;
    });
    
    // 如果没有任何核销记录，返回空数组
    if (Object.keys(performanceStats).length === 0) {
      console.log(`${targetMonth} 没有核销记录`);
      return [];
    }
    
    // 对统计结果按核销数量降序排序
    const sortedStats = Object.values(performanceStats).sort((a, b) => b.redemption_count - a.redemption_count);
    
    // 获取相关的员工信息以获取员工真实姓名
    const employeeIds = sortedStats.map(stat => stat.employee_id);
    const EmployeeRoster = require('../models/EmployeeRoster');
    const employees = await EmployeeRoster.findAll({
      where: { employee_id: employeeIds },
      attributes: ['employee_id', 'name']
    });
    
    // 创建员工编号到姓名的映射
    const employeeMap = {};
    employees.forEach(emp => {
      employeeMap[emp.employee_id] = emp.name;
    });
    
    // 准备插入或更新的数据
    const performanceRecords = sortedStats.map((stat, index) => {
      // 简单的绩效评分算法：基于核销数量进行评分
      const performance_score = Math.min(100, stat.redemption_count * 5); // 每核销一个得5分，最高100分
      const rank = index + 1; // 排名按核销数量排序
      
      return {
        employee_id: stat.employee_id,
        employee_name: employeeMap[stat.employee_id] || `员工${stat.employee_id}`, // 使用真实姓名，如果找不到则使用默认格式
        redemption_count: stat.redemption_count,
        performance_score,
        month: targetMonth,
        rank
      };
    });
    
    // 批量更新或插入绩效数据
    for (const record of performanceRecords) {
      await EmployeePerformance.upsert(record);
    }
    
    console.log(`完成计算 ${targetMonth} 月度绩效数据，共 ${performanceRecords.length} 条记录`);
    return performanceRecords;
  } catch (error) {
    console.error('计算月度绩效数据失败:', error);
    throw error;
  }
}

// 手动触发月度绩效计算
async function manualCalculatePerformance(req, res) {
  try {
    const { month } = req.body;
    
    if (!month) {
      return res.status(400).json({ success: false, message: '请提供月份参数 (YYYY-MM)' });
    }
    
    // 验证月份格式
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return res.status(400).json({ success: false, message: '月份格式不正确，应为 YYYY-MM' });
    }
    
    const results = await calculateMonthlyPerformance(month);
    
    res.status(200).json({
      success: true,
      message: `成功计算 ${month} 月度绩效数据`,
      data: {
        count: results.length,
        results
      }
    });
  } catch (error) {
    console.error('手动计算绩效数据失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// 获取所有可用月份
async function getAvailableMonths(req, res) {
  try {
    // 获取所有不同的月份
    const months = await EmployeePerformance.findAll({
      attributes: ['month'],
      group: ['month'],
      order: [['month', 'DESC']]
    });
    
    const monthList = months.map(item => item.month);
    
    res.status(200).json({
      success: true,
      data: {
        months: monthList
      }
    });
  } catch (error) {
    console.error('获取可用月份失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// 获取所有历史绩效数据
async function getAllHistoricalPerformance(req, res) {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    
    // 查询所有历史绩效数据
    const [performances, total] = await Promise.all([
      EmployeePerformance.findAll({
        order: [['month', 'DESC'], ['redemption_count', 'DESC']], // 按月份降序，然后按核销数量降序
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize)
      }),
      EmployeePerformance.count()
    ]);
    
    // 获取相关的员工信息以获取员工姓名
    const employeeIds = performances.map(p => p.employee_id);
    if (employeeIds.length > 0) {
      const EmployeeRoster = require('../models/EmployeeRoster');
      const employees = await EmployeeRoster.findAll({
        where: { employee_id: employeeIds },
        attributes: ['employee_id', 'name']
      });
      
      // 创建员工编号到姓名的映射
      const employeeMap = {};
      employees.forEach(emp => {
        employeeMap[emp.employee_id] = emp.name;
      });
      
      // 更新绩效数据中的员工姓名
      const updatedPerformances = performances.map(performance => ({
        ...performance.toJSON(),
        employee_name: employeeMap[performance.employee_id] || `员工${performance.employee_id}`
      }));
      
      res.status(200).json({
        success: true,
        data: {
          list: updatedPerformances,
          total,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      });
    } else {
      res.status(200).json({
        success: true,
        data: {
          list: performances,
          total,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      });
    }
  } catch (error) {
    console.error('获取历史绩效数据失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getPerformanceData,
  calculateMonthlyPerformance,
  manualCalculatePerformance,
  getAvailableMonths,
  getAllHistoricalPerformance
};