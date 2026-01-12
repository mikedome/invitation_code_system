# 邀请码生成系统

## 系统概述
邀请码生成系统是一个基于Vue3和Node.js开发的Web应用，用于生成和管理16位邀请码。系统支持员工编号+随机字符串的邀请码生成规则，并提供历史记录查询功能。

## 技术栈
- **前端**：Vue3 + Vite + Element Plus + Vue Router + Axios
- **后端**：Node.js + Express + Sequelize + MySQL

## 环境要求
- Node.js >= 16.0.0
- MySQL >= 5.7.0
- npm >= 8.0.0

## 部署步骤

### 1. 数据库配置

#### 1.1 创建数据库
```sql
CREATE DATABASE invitation_code_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 1.2 创建数据库用户
```sql
CREATE USER 'invitation_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON invitation_code_db.* TO 'invitation_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. 后端部署

#### 2.1 进入后端目录
```bash
cd backend
```

#### 2.2 安装依赖
```bash
npm install
```

#### 2.3 配置环境变量
修改 `.env` 文件，配置数据库连接信息：
```env
DB_HOST=localhost
DB_USER=invitation_user
DB_PASSWORD=your_password
DB_NAME=invitation_code_db
DB_PORT=3306
PORT=3000
```

#### 2.4 启动后端服务
```bash
npm start
```

### 3. 前端部署

#### 3.1 进入前端目录
```bash
cd frontend
```

#### 3.2 安装依赖
```bash
npm install
```

#### 3.3 配置API地址
修改 `src/main.js` 中的API地址（如果后端服务不在本地运行）：
```javascript
axios.defaults.baseURL = 'http://your-server-ip:3000/api'
```

#### 3.4 构建前端项目
```bash
npm run build
```

#### 3.5 部署构建产物
将 `dist` 目录下的文件部署到Web服务器（如Nginx、Apache等）。

## 系统功能说明

### 1. 生成邀请码
- 输入4位员工编号（如0001）
- 点击"生成邀请码"按钮
- 系统生成16位邀请码（员工编号+12位随机字符串）
- 支持复制邀请码到剪贴板

### 2. 历史记录查询
- 支持按员工编号筛选
- 支持按状态（未使用/已使用）筛选
- 支持分页查询
- 表格展示邀请码详情

## API接口说明

### 1. 生成邀请码
- **URL**：`/api/generate`
- **方法**：`POST`
- **请求体**：
  ```json
  {
    "employee_id": "0001"
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "data": {
      "code": "0001aBcDeFgHiJkL",
      "employee_id": "0001"
    }
  }
  ```

### 2. 查询历史记录
- **URL**：`/api/history`
- **方法**：`GET`
- **查询参数**：
  - `page`：页码（默认1）
  - `pageSize`：每页条数（默认10）
  - `employee_id`：员工编号（可选）
  - `status`：状态（unused/used，可选）
- **响应**：
  ```json
  {
    "success": true,
    "data": {
      "list": [
        {
          "id": 1,
          "code": "0001aBcDeFgHiJkL",
          "employee_id": "0001",
          "generated_at": "2026-01-04T07:48:30.000Z",
          "status": "unused"
        }
      ],
      "total": 1,
      "page": 1,
      "pageSize": 10
    }
  }
  ```

### 3. 验证邀请码
- **URL**：`/api/validate`
- **方法**：`POST`
- **请求体**：
  ```json
  {
    "code": "0001aBcDeFgHiJkL"
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "邀请码有效",
    "data": {
      "id": 1,
      "code": "0001aBcDeFgHiJkL",
      "employee_id": "0001",
      "generated_at": "2026-01-04T07:48:30.000Z",
      "status": "unused"
    }
  }
  ```

## 项目结构

### 后端结构
```
backend/
├── config/         # 配置文件
│   └── db.js       # 数据库连接配置
├── controllers/    # 控制器
│   └── invitationCodeController.js  # 邀请码控制器
├── models/         # 数据库模型
│   └── InvitationCode.js  # 邀请码模型
├── routes/         # 路由
│   └── invitationCodeRoutes.js  # 邀请码路由
├── utils/          # 工具函数
│   ├── generateCode.js  # 邀请码生成工具
│   └── initDB.js   # 数据库初始化工具
├── .env            # 环境变量配置
├── app.js          # 应用入口
├── package.json    # 项目依赖
└── package-lock.json
```

### 前端结构
```
frontend/
├── public/         # 静态资源
├── src/            # 源码
│   ├── assets/     # 资源文件
│   ├── components/ # 组件
│   ├── router/     # 路由配置
│   ├── views/      # 页面组件
│   │   ├── GenerateCode.vue  # 邀请码生成页面
│   │   └── History.vue       # 历史记录页面
│   ├── App.vue     # 根组件
│   ├── main.js     # 入口文件
│   └── style.css   # 全局样式
├── index.html      # HTML模板
├── package.json    # 项目依赖
├── vite.config.js  # Vite配置
└── package-lock.json
```

## 常见问题及解决方案

### 1. 数据库连接失败
**问题**：启动后端服务时出现 `AccessDeniedError`
**解决方案**：
- 检查 `.env` 文件中的数据库连接信息是否正确
- 确保数据库用户具有足够的权限
- 确保MySQL服务正在运行

### 2. 前端无法访问后端API
**问题**：前端请求API时出现跨域错误或连接超时
**解决方案**：
- 检查后端服务是否正在运行
- 检查前端配置的API地址是否正确
- 检查服务器防火墙是否允许3000端口访问

### 3. 邀请码生成失败
**问题**：点击生成按钮后提示生成失败
**解决方案**：
- 检查员工编号是否为4位数字
- 检查后端服务日志，查看具体错误信息

## 开发说明

### 前端开发
```bash
cd frontend
npm run dev
```

### 后端开发
```bash
cd backend
npm start
```

## 许可证
MIT
