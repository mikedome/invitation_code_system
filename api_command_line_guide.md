# 项目API命令行操作指南

## 基础说明

### API基础URL
```
http://localhost:3000/api
```

### 身份验证
1. 首先通过登录API获取token
2. 后续请求在Header中添加 `Authorization: Bearer YOUR_TOKEN`

### 命令行工具
本指南使用 `curl` 命令，确保您的系统已安装 `curl`。

## 1. 用户相关操作

### 1.1 登录（获取Token）
```bash
curl -X POST -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}' http://localhost:3000/api/login
```

**示例输出**：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "token": "YOUR_JWT_TOKEN"
  },
  "message": "登录成功"
}
```

### 1.2 注册新用户
```bash
curl -X POST -H "Content-Type: application/json" -d '{"username":"testuser","password":"test123","role":"user"}' http://localhost:3000/api/register
```

### 1.3 获取用户列表（需要管理员权限）
```bash
curl -X GET -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/users
```

### 1.4 获取单个用户信息（需要管理员权限）
```bash
curl -X GET -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/users/1
```

### 1.5 更新用户信息（需要管理员权限）
```bash
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"username":"updateduser","password":"newpassword","role":"user"}' http://localhost:3000/api/users/1
```

### 1.6 删除用户（需要管理员权限）
```bash
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/users/1
```

## 2. 邀请码相关操作

### 2.1 生成邀请码
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"employee_id":"1234"}' http://localhost:3000/api/generate
```

**参数说明**：
- `employee_id`: 员工编号，必须是4位数字（必填）

**说明**：
- 每个请求只能生成一个邀请码
- 邀请码是基于员工编号生成的16位唯一字符
- 邀请码有效期为15天
- 系统会自动检查员工编号是否存在

### 2.2 获取邀请码历史记录
```bash
curl -X GET -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/history
```

### 2.3 核销邀请码
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"code":"ABCDEF1234567890"}' http://localhost:3000/api/redeem
```

**参数说明**：
- `code`: 邀请码，必须是16位字母数字组合（必填）

**说明**：
- 系统会验证邀请码格式、有效性、是否已使用和是否过期
- 核销后邀请码状态会更新为已使用，并记录核销人和核销时间
- 系统会自动更新对应员工的绩效数据

## 3. 绩效相关操作

### 3.1 获取员工绩效数据
```bash
curl -X GET -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:3000/api/performance?year=2026&month=1"
```

**参数说明**：
- `year`: 年份（可选，默认当前年份）
- `month`: 月份（可选，默认当前月份）

### 3.2 获取所有可用月份
```bash
curl -X GET -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/performance/months
```

### 3.3 手动触发月度绩效计算（需要管理员权限）
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"year":2026,"month":1}' http://localhost:3000/api/performance/calculate
```

### 3.4 获取所有历史绩效数据
```bash
curl -X GET -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/performance/historical
```

## 4. 员工花名册相关操作

### 4.1 获取员工花名册列表
```bash
curl -X GET -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:3000/api/employees?page=1&pageSize=10"
```

**参数说明**：
- `page`: 页码（可选，默认1）
- `pageSize`: 每页条数（可选，默认10）

### 4.2 获取单个员工信息
```bash
curl -X GET -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/employees/1
```

### 4.3 获取部门列表
```bash
curl -X GET -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/departments
```

### 4.4 添加员工（需要管理员权限）
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"name":"张三","department":"技术部","position":"开发工程师","hire_date":"2023-01-01"}' http://localhost:3000/api/employees
```

### 4.5 更新员工信息（需要管理员权限）
```bash
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"name":"李四","department":"市场部","position":"市场经理"}' http://localhost:3000/api/employees/1
```

### 4.6 删除员工（需要管理员权限）
```bash
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/employees/1
```

## 5. 高级用法

### 5.1 保存Token到环境变量
```bash
# 登录并保存token
token=$(curl -s -X POST -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}' http://localhost:3000/api/login | jq -r '.data.token')

# 验证token是否保存成功
echo $token
```

### 5.2 使用保存的Token进行后续操作
```bash
# 使用保存的token获取用户列表
curl -X GET -H "Authorization: Bearer $token" http://localhost:3000/api/users
```

### 5.3 批量生成邀请码
```bash
# 生成100个邀请码
curl -X POST -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d '{"quantity":100,"prefix":"BATCH","expiresIn":7}' http://localhost:3000/api/generate
```

### 5.4 导出数据到文件
```bash
# 导出员工列表到文件
curl -X GET -H "Authorization: Bearer $token" http://localhost:3000/api/employees > employees.json

# 导出绩效数据到文件
curl -X GET -H "Authorization: Bearer $token" http://localhost:3000/api/performance?year=2026 > performance_2026.json
```

## 6. 错误处理

### 6.1 常见错误码
| 状态码 | 说明 |
|-------|------|
| 400 | 请求参数错误 |
| 401 | 未授权（Token无效或过期） |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 6.2 调试方法
```bash
# 显示详细的请求和响应信息
curl -v -X POST -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}' http://localhost:3000/api/login

# 只显示响应头
curl -I -X GET -H "Authorization: Bearer $token" http://localhost:3000/api/users
```

## 7. 服务器部署环境下的使用

如果您的项目已经部署到服务器，只需将 `http://localhost:3000` 替换为您的服务器域名或IP地址即可。

### 示例（服务器环境）
```bash
# 登录
curl -X POST -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}' http://invitationcode.hzgvc.com/api/login

# 生成邀请码
token=$(curl -s -X POST -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}' http://invitationcode.hzgvc.com/api/login | jq -r '.data.token')
curl -X POST -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d '{"quantity":10}' http://invitationcode.hzgvc.com/api/generate
```

## 8. 完整操作流程示例

### 8.1 管理员登录并生成邀请码
```bash
# 1. 登录获取token
token=$(curl -s -X POST -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}' http://localhost:3000/api/login | jq -r '.data.token')

# 2. 为员工1234生成邀请码
curl -X POST -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d '{"employee_id":"1234"}' http://localhost:3000/api/generate

# 3. 查看邀请码历史记录
curl -s -X GET -H "Authorization: Bearer $token" http://localhost:3000/api/history | jq '.data.list[] | {code: .code, employee_id: .employee_id, status: .status}'
```

### 8.2 普通用户登录并核销邀请码
```bash
# 1. 登录获取token
token=$(curl -s -X POST -H "Content-Type: application/json" -d '{"username":"user","password":"user123"}' http://localhost:3000/api/login | jq -r '.data.token')

# 2. 核销邀请码（替换为实际生成的16位邀请码）
curl -X POST -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d '{"code":"ABCDEF1234567890"}' http://localhost:3000/api/redeem
```

## 9. 注意事项

1. 请确保您的账号具有相应的操作权限
2. 敏感操作（如删除用户、生成大量邀请码）请谨慎执行
3. 定期更换密码，保护您的账号安全
4. 生产环境下建议使用HTTPS协议
5. 批量操作时请注意服务器性能，避免过度请求

## 10. 相关文档

- [API文档地址](http://localhost:3000/api-docs) - Swagger API文档
- [项目源代码](https://github.com/your-repo/invitation-code-system) - 项目GitHub地址

---

**提示**：本指南中的命令行语句可以根据您的实际环境和需求进行调整。如果您使用的是Windows系统，可能需要调整命令格式或使用PowerShell代替。