const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const initDB = require('./utils/initDB');
const invitationCodeRoutes = require('./routes/invitationCodeRoutes');
const userRoutes = require('./routes/userRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const employeeRosterRoutes = require('./routes/employeeRosterRoutes');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 配置中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger配置 - 修改服务器URL为当前环境
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '邀请码生成系统API',
      version: '1.0.0',
      description: '邀请码生成、验证、核销和查询API接口',
    },
    servers: [
      {
        // 动态设置API文档的服务器地址，更灵活
        url: process.env.NODE_ENV === 'production' 
             ? `/api` // 生产环境使用相对路径，由Nginx转发
             : `http://localhost:${process.env.PORT || 3000}/api`,
        description: process.env.NODE_ENV === 'production' ? '生产服务器' : '本地开发服务器',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// 注册API路由
app.use('/api', invitationCodeRoutes);
app.use('/api', userRoutes);
app.use('/api', performanceRoutes);
app.use('/api', employeeRosterRoutes);

// ==================== 【关键修改开始】 ====================
// 移除或注释掉以下为前端服务的代码，它们在分离部署的生产环境中不需要。
// const path = require('path');
// app.use(express.static(path.join(__dirname, '../frontend/dist')));
// app.use((req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
// });
// ==================== 【关键修改结束】 ====================

// 引入绩效调度器
const { scheduleMonthlyPerformanceCalculation } = require('./utils/performanceScheduler');

// 启动服务器
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await initDB();
  } catch (error) {
    console.error('数据库初始化失败，但服务器将继续启动:', error);
  }
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API文档地址: http://localhost:${PORT}/api-docs`);
    console.log(`运行模式: ${process.env.NODE_ENV || 'development'}`);
    
    scheduleMonthlyPerformanceCalculation();
    console.log('绩效数据调度器已启动');
  });
}

startServer();