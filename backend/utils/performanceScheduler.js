const cron = require('node-cron');
const { calculateMonthlyPerformance } = require('../controllers/performanceController');
const moment = require('moment');

// 由于node-cron在当前版本中可能未安装，我们先检查并使用替代方案
// 或者使用setTimeout/setInterval来模拟定时任务

/**
 * 自动计算上个月的绩效数据
 * 在每月1号的凌晨2点执行
 */
function scheduleMonthlyPerformanceCalculation() {
  // 每月1日凌晨2点执行
  cron.schedule('0 2 1 * *', async () => {
    console.log('开始自动计算上个月的绩效数据...');
    
    try {
      // 获取上个月的年月
      const lastMonth = moment().subtract(1, 'month').format('YYYY-MM');
      
      console.log(`正在计算 ${lastMonth} 的绩效数据...`);
      await calculateMonthlyPerformance(lastMonth);
      
      console.log(`${lastMonth} 绩效数据计算完成`);
    } catch (error) {
      console.error('自动计算绩效数据失败:', error);
    }
  });

  console.log('已设置月度绩效计算任务');
}

/**
 * 立即计算指定月份的绩效数据
 */
async function calculatePerformanceForMonth(month) {
  try {
    console.log(`正在计算 ${month} 的绩效数据...`);
    const results = await calculateMonthlyPerformance(month);
    console.log(`${month} 绩效数据计算完成，共处理 ${results.length} 条记录`);
    return results;
  } catch (error) {
    console.error(`计算 ${month} 绩效数据失败:`, error);
    throw error;
  }
}

module.exports = {
  scheduleMonthlyPerformanceCalculation,
  calculatePerformanceForMonth
};