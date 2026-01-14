# 跨平台API命令行操作指南

## 适用场景
- 苹果系统（macOS）：默认安装curl
- Windows系统：Windows 10及以上默认安装curl，旧版本使用PowerShell内置命令
- 假设未安装任何额外环境，完全基于系统默认命令行工具
- 远程登录服务器，仅通过API接口操作

## 1. 系统默认命令行工具

### 1.1 苹果系统（macOS）
- 默认终端：Terminal或iTerm2
- 默认工具：`curl`（已预装）

### 1.2 Windows系统
- 默认终端：Command Prompt（cmd）或PowerShell
- 默认工具：
  - Windows 10及以上：`curl`（已预装）
  - 旧版Windows：PowerShell的`Invoke-WebRequest`（内置）

## 2. 基本登录操作

### 2.1 苹果系统（macOS）
```bash
# 使用curl登录，获取Token
curl -X POST -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}" http://invitationcode.hzgvc.com/api/login
```

### 2.2 Windows系统（Windows 10及以上）
```cmd
# 使用curl登录，获取Token
curl -X POST -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}" http://invitationcode.hzgvc.com/api/login
```

### 2.3 Windows系统（旧版，使用PowerShell）
```powershell
# 使用Invoke-WebRequest登录，获取Token
Invoke-WebRequest -Uri "http://invitationcode.hzgvc.com/api/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"username":"admin","password":"admin123"}' -UseBasicParsing
```

## 3. 保存Token（高级用法）

### 3.1 苹果系统（macOS）
```bash
# 登录并保存Token到环境变量
token=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}" http://invitationcode.hzgvc.com/api/login | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])"

# 验证Token
echo $token
```

### 3.2 Windows系统（PowerShell）
```powershell
# 登录并保存Token到变量
$response = Invoke-WebRequest -Uri "http://invitationcode.hzgvc.com/api/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"username":"admin","password":"admin123"}' -UseBasicParsing
$token = ($response.Content | ConvertFrom-Json).data.token

# 验证Token
Write-Output $token
```

## 4. 邀请码操作

### 4.1 生成邀请码

#### 苹果系统（macOS）
```bash
# 直接生成（替换YOUR_TOKEN为实际Token）
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d "{\"employee_id\":\"1234\"}" http://invitationcode.hzgvc.com/api/generate

# 使用保存的Token生成
token=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}" http://invitationcode.hzgvc.com/api/login | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")
curl -X POST -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d "{\"employee_id\":\"1234\"}" http://invitationcode.hzgvc.com/api/generate
```

#### Windows系统（PowerShell）
```powershell
# 使用保存的Token生成
$response = Invoke-WebRequest -Uri "http://invitationcode.hzgvc.com/api/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"username":"admin","password":"admin123"}' -UseBasicParsing
$token = ($response.Content | ConvertFrom-Json).data.token

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -Uri "http://invitationcode.hzgvc.com/api/generate" -Method POST -Headers $headers -Body '{"employee_id":"1234"}' -UseBasicParsing
```

### 4.2 获取邀请码历史记录

#### 苹果系统（macOS）
```bash
# 使用curl获取
token=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}" http://invitationcode.hzgvc.com/api/login | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")
curl -H "Authorization: Bearer $token" http://invitationcode.hzgvc.com/api/history
```

#### Windows系统（PowerShell）
```powershell
# 使用PowerShell获取
$response = Invoke-WebRequest -Uri "http://invitationcode.hzgvc.com/api/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"username":"admin","password":"admin123"}' -UseBasicParsing
$token = ($response.Content | ConvertFrom-Json).data.token

$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-WebRequest -Uri "http://invitationcode.hzgvc.com/api/history" -Method GET -Headers $headers -UseBasicParsing
```

### 4.3 核销邀请码

#### 苹果系统（macOS）
```bash
# 使用curl核销
token=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"username\":\"user\",\"password\":\"user123\"}" http://invitationcode.hzgvc.com/api/login | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")
curl -X POST -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d "{\"code\":\"ABCDEF1234567890\"}" http://invitationcode.hzgvc.com/api/redeem
```

#### Windows系统（PowerShell）
```powershell
# 使用PowerShell核销
$response = Invoke-WebRequest -Uri "http://invitationcode.hzgvc.com/api/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"username":"user","password":"user123"}' -UseBasicParsing
$token = ($response.Content | ConvertFrom-Json).data.token

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -Uri "http://invitationcode.hzgvc.com/api/redeem" -Method POST -Headers $headers -Body '{"code":"ABCDEF1234567890"}' -UseBasicParsing
```

## 5. 用户管理操作（管理员权限）

### 5.1 获取用户列表

#### 苹果系统（macOS）
```bash
# 使用curl获取
token=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}" http://invitationcode.hzgvc.com/api/login | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")
curl -H "Authorization: Bearer $token" http://invitationcode.hzgvc.com/api/users
```

#### Windows系统（PowerShell）
```powershell
# 使用PowerShell获取
$response = Invoke-WebRequest -Uri "http://invitationcode.hzgvc.com/api/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"username":"admin","password":"admin123"}' -UseBasicParsing
$token = ($response.Content | ConvertFrom-Json).data.token

$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-WebRequest -Uri "http://invitationcode.hzgvc.com/api/users" -Method GET -Headers $headers -UseBasicParsing
```

### 5.2 注册新用户

#### 苹果系统（macOS）
```bash
# 使用curl注册
token=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}" http://invitationcode.hzgvc.com/api/login | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")
curl -X POST -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d "{\"username\":\"newuser\",\"password\":\"newpass123\",\"role\":\"user\"}" http://invitationcode.hzgvc.com/api/register
```

#### Windows系统（PowerShell）
```powershell
# 使用PowerShell注册
$response = Invoke-WebRequest -Uri "http://invitationcode.hzgvc.com/api/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"username":"admin","password":"admin123"}' -UseBasicParsing
$token = ($response.Content | ConvertFrom-Json).data.token

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -Uri "http://invitationcode.hzgvc.com/api/register" -Method POST -Headers $headers -Body '{"username":"newuser","password":"newpass123","role":"user"}' -UseBasicParsing
```

## 6. 绩效数据操作

### 6.1 获取员工绩效

#### 苹果系统（macOS）
```bash
# 使用curl获取
token=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}" http://invitationcode.hzgvc.com/api/login | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")
curl -H "Authorization: Bearer $token" "http://invitationcode.hzgvc.com/api/performance?year=2026&month=1"
```

#### Windows系统（PowerShell）
```powershell
# 使用PowerShell获取
$response = Invoke-WebRequest -Uri "http://invitationcode.hzgvc.com/api/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"username":"admin","password":"admin123"}' -UseBasicParsing
$token = ($response.Content | ConvertFrom-Json).data.token

$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-WebRequest -Uri "http://invitationcode.hzgvc.com/api/performance?year=2026&month=1" -Method GET -Headers $headers -UseBasicParsing
```

## 7. 员工花名册操作

### 7.1 获取员工列表

#### 苹果系统（macOS）
```bash
# 使用curl获取
token=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}" http://invitationcode.hzgvc.com/api/login | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")
curl -H "Authorization: Bearer $token" http://invitationcode.hzgvc.com/api/employees
```

#### Windows系统（PowerShell）
```powershell
# 使用PowerShell获取
$response = Invoke-WebRequest -Uri "http://invitationcode.hzgvc.com/api/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"username":"admin","password":"admin123"}' -UseBasicParsing
$token = ($response.Content | ConvertFrom-Json).data.token

$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-WebRequest -Uri "http://invitationcode.hzgvc.com/api/employees" -Method GET -Headers $headers -UseBasicParsing
```

## 8. 简化操作：创建命令行脚本

### 8.1 苹果系统（macOS）

创建一个名为 `api-tools.sh` 的脚本：
```bash
#!/bin/bash

# API基础URL
API_URL="http://invitationcode.hzgvc.com/api"

# 登录并获取Token
login() {
    echo "正在登录..."
    token=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"username\":\"$1\",\"password\":\"$2\"}" "$API_URL/login" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")
    echo "登录成功，Token: $token"
    export API_TOKEN="$token"
}

# 生成邀请码
generate_code() {
    if [ -z "$API_TOKEN" ]; then
        echo "请先登录！"
        return 1
    fi
    echo "正在生成邀请码..."
    curl -X POST -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" -d "{\"employee_id\":\"$1\"}" "$API_URL/generate"
}

# 查看历史记录
history() {
    if [ -z "$API_TOKEN" ]; then
        echo "请先登录！"
        return 1
    fi
    echo "获取历史记录..."
    curl -H "Authorization: Bearer $API_TOKEN" "$API_URL/history"
}

# 核销邀请码
redeem_code() {
    if [ -z "$API_TOKEN" ]; then
        echo "请先登录！"
        return 1
    fi
    echo "正在核销邀请码..."
    curl -X POST -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" -d "{\"code\":\"$1\"}" "$API_URL/redeem"
}

# 执行命令
$@
```

**使用方法**：
```bash
# 赋予执行权限
chmod +x api-tools.sh

# 登录
./api-tools.sh login admin admin123

# 生成邀请码
./api-tools.sh generate_code 1234

# 查看历史记录
./api-tools.sh history

# 核销邀请码
./api-tools.sh redeem_code ABCDEF1234567890
```

### 8.2 Windows系统（PowerShell）

创建一个名为 `ApiTools.ps1` 的脚本：
```powershell
# API基础URL
$API_URL = "http://invitationcode.hzgvc.com/api"

# 登录并获取Token
function Login {
    param(
        [string]$Username,
        [string]$Password
    )
    Write-Output "正在登录..."
    $body = @{
        username = $Username
        password = $Password
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$API_URL/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body -UseBasicParsing
    $token = ($response.Content | ConvertFrom-Json).data.token
    Write-Output "登录成功，Token: $token"
    Set-Variable -Name API_TOKEN -Value $token -Scope Global
}

# 生成邀请码
function GenerateCode {
    param(
        [string]$EmployeeId
    )
    if (-not (Get-Variable -Name API_TOKEN -Scope Global -ErrorAction SilentlyContinue)) {
        Write-Output "请先登录！"
        return
    }
    Write-Output "正在生成邀请码..."
    $body = @{
        employee_id = $EmployeeId
    } | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "Bearer $Global:API_TOKEN"
        "Content-Type" = "application/json"
    }
    
    Invoke-WebRequest -Uri "$API_URL/generate" -Method POST -Headers $headers -Body $body -UseBasicParsing
}

# 查看历史记录
function GetHistory {
    if (-not (Get-Variable -Name API_TOKEN -Scope Global -ErrorAction SilentlyContinue)) {
        Write-Output "请先登录！"
        return
    }
    Write-Output "获取历史记录..."
    $headers = @{
        "Authorization" = "Bearer $Global:API_TOKEN"
    }
    
    Invoke-WebRequest -Uri "$API_URL/history" -Method GET -Headers $headers -UseBasicParsing
}

# 核销邀请码
function RedeemCode {
    param(
        [string]$Code
    )
    if (-not (Get-Variable -Name API_TOKEN -Scope Global -ErrorAction SilentlyContinue)) {
        Write-Output "请先登录！"
        return
    }
    Write-Output "正在核销邀请码..."
    $body = @{
        code = $Code
    } | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "Bearer $Global:API_TOKEN"
        "Content-Type" = "application/json"
    }
    
    Invoke-WebRequest -Uri "$API_URL/redeem" -Method POST -Headers $headers -Body $body -UseBasicParsing
}
```

**使用方法**：
```powershell
# 执行脚本
. .\ApiTools.ps1

# 登录
Login -Username admin -Password admin123

# 生成邀请码
GenerateCode -EmployeeId 1234

# 查看历史记录
GetHistory

# 核销邀请码
RedeemCode -Code ABCDEF1234567890
```

## 9. 注意事项

### 9.1 安全性
- 避免在命令行中直接输入密码，建议使用脚本或环境变量
- 不要将Token存储在明文文件中
- 定期更换密码和Token

### 9.2 字符转义
- JSON中的双引号需要转义：`{\"key\":\"value\"}`
- 不同系统的转义字符可能不同

### 9.3 错误处理
- 检查命令返回的状态码
- 查看响应内容中的错误信息
- 使用 `-v` 参数查看详细的请求和响应

### 9.4 网络问题
- 确保网络连接正常
- 检查防火墙设置，确保API端口可访问
- 验证域名解析是否正确

## 10. 常见问题

### 10.1 Windows系统curl命令不工作
- 确认Windows版本：Windows 10及以上才默认安装curl
- 旧版Windows使用PowerShell的Invoke-WebRequest命令
- 或从微软官网下载并安装curl

### 10.2 JSON解析错误
- 确保JSON格式正确，双引号已转义
- 苹果系统：使用python3内置的json模块解析
- Windows系统：使用PowerShell的ConvertFrom-Json命令解析

### 10.3 Token过期
- Token有效期通常为24小时
- 过期后需要重新登录获取新Token
- 可以在脚本中添加自动刷新Token的逻辑

## 11. 完整远程操作流程示例

### 11.1 苹果系统（macOS）
```bash
# 1. 登录服务器获取Token
token=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}" http://invitationcode.hzgvc.com/api/login | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")

# 2. 生成邀请码
curl -X POST -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d "{\"employee_id\":\"1234\"}" http://invitationcode.hzgvc.com/api/generate

# 3. 查看历史记录
curl -s -H "Authorization: Bearer $token" http://invitationcode.hzgvc.com/api/history | python3 -c "import sys, json; data = json.load(sys.stdin); print('邀请码数量:', len(data['data']['list'])); print('最近5个邀请码:'); [print(item['code'], item['status'], item['generated_at']) for item in data['data']['list'][:5]]"

# 4. 核销邀请码
curl -X POST -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d "{\"code\":\"ABCDEF1234567890\"}" http://invitationcode.hzgvc.com/api/redeem
```

### 11.2 Windows系统（PowerShell）
```powershell
# 1. 登录服务器获取Token
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "http://invitationcode.hzgvc.com/api/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody -UseBasicParsing
$token = ($loginResponse.Content | ConvertFrom-Json).data.token
Write-Output "登录成功，Token: $token"

# 2. 生成邀请码
$generateBody = @{
    employee_id = "1234"
} | ConvertTo-Json

$generateHeaders = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$generateResponse = Invoke-WebRequest -Uri "http://invitationcode.hzgvc.com/api/generate" -Method POST -Headers $generateHeaders -Body $generateBody -UseBasicParsing
Write-Output "生成邀请码结果:"
$generateResponse.Content | ConvertFrom-Json

# 3. 查看历史记录
$historyHeaders = @{
    "Authorization" = "Bearer $token"
}

$historyResponse = Invoke-WebRequest -Uri "http://invitationcode.hzgvc.com/api/history" -Method GET -Headers $historyHeaders -UseBasicParsing
$historyData = $historyResponse.Content | ConvertFrom-Json
Write-Output "邀请码总数: $($historyData.data.list.Count)"
Write-Output "最近5个邀请码:"
$historyData.data.list | Select-Object -First 5 | Select-Object code, status, generated_at

# 4. 核销邀请码
$redeemBody = @{
    code = "ABCDEF1234567890"
} | ConvertTo-Json

$redeemHeaders = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$redeemResponse = Invoke-WebRequest -Uri "http://invitationcode.hzgvc.com/api/redeem" -Method POST -Headers $redeemHeaders -Body $redeemBody -UseBasicParsing
Write-Output "核销邀请码结果:"
$redeemResponse.Content | ConvertFrom-Json
```

## 总结

本指南提供了跨平台的API命令行操作方法，适用于：
- 苹果系统（macOS）：使用默认curl
- Windows系统：使用默认curl或PowerShell内置命令
- 未安装任何额外环境
- 远程登录服务器，仅通过API接口操作

您可以根据需要选择适合自己系统的命令，或创建简化的脚本提高工作效率。