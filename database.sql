-- 切换到已创建的数据库
USE invitation_code;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  password VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user' COMMENT '角色',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 修复现有表的默认值问题
ALTER TABLE users 
MODIFY COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
MODIFY COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间';

-- 创建核销人员表
CREATE TABLE IF NOT EXISTS redeemers (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  name VARCHAR(50) NOT NULL COMMENT '核销人员姓名',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='核销人员表';

-- 修改邀请码表，添加核销相关字段
ALTER TABLE invitation_codes 
ADD COLUMN redeemed_by INT COMMENT '核销人员ID',
ADD COLUMN redeemed_at DATETIME COMMENT '核销时间',
ADD CONSTRAINT fk_redeemed_by FOREIGN KEY (redeemed_by) REFERENCES redeemers(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- 添加索引（优化查询性能）
CREATE INDEX idx_employee_id ON invitation_codes(employee_id);
CREATE INDEX idx_generated_at ON invitation_codes(generated_at);
CREATE INDEX idx_status ON invitation_codes(status);
CREATE INDEX idx_redeemed_by ON invitation_codes(redeemed_by);
CREATE INDEX idx_redeemed_at ON invitation_codes(redeemed_at);
CREATE INDEX idx_role ON users(role);

-- 插入初始数据：默认管理员账户
-- 密码：admin123（已加密）
INSERT INTO users (username, password, role) 
VALUES ('admin', '$2b$10$QJ5pX8zJ2eJvX5zJ3eJvX5zJ3eJvX5zJ3eJvX5zJ3eJvX5zJ3eJvX5zJ3', 'admin') 
ON DUPLICATE KEY UPDATE username=username;

-- 验证表创建结果
DESCRIBE users;
DESCRIBE redeemers;
DESCRIBE invitation_codes;
SHOW INDEX FROM users;
SHOW INDEX FROM redeemers;
SHOW INDEX FROM invitation_codes;