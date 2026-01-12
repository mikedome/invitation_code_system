-- 员工花名册表
CREATE TABLE IF NOT EXISTS employee_roster (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  employee_id VARCHAR(10) NOT NULL UNIQUE COMMENT '员工编号',
  name VARCHAR(50) NOT NULL COMMENT '员工姓名',
  department VARCHAR(100) COMMENT '所属部门',
  position VARCHAR(100) COMMENT '职位',
  hire_date DATE COMMENT '入职日期',
  status ENUM('active', 'inactive', 'on_leave') NOT NULL DEFAULT 'active' COMMENT '员工状态',
  phone VARCHAR(20) COMMENT '联系电话',
  email VARCHAR(100) COMMENT '邮箱',
  id_card VARCHAR(18) COMMENT '身份证号',
  emergency_contact VARCHAR(50) COMMENT '紧急联系人',
  emergency_phone VARCHAR(20) COMMENT '紧急联系电话',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_employee_id (employee_id),
  INDEX idx_department (department),
  INDEX idx_status (status),
  INDEX idx_hire_date (hire_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='员工花名册表';

-- 插入示例数据
INSERT INTO employee_roster (employee_id, name, department, position, hire_date, phone, email) VALUES
('0001', '张三', '技术部', '高级工程师', '2023-01-15', '13800138001', 'zhangsan@example.com'),
('0002', '李四', '销售部', '销售经理', '2023-02-20', '13800138002', 'lisi@example.com'),
('0003', '王五', '人事部', '人事专员', '2023-03-10', '13800138003', 'wangwu@example.com'),
('0004', '赵六', '财务部', '会计', '2023-04-05', '13800138004', 'zhaoliu@example.com'),
('0005', '钱七', '市场部', '市场专员', '2023-05-12', '13800138005', 'qianqi@example.com');

-- 为邀请码表的employee_id字段添加外键约束（可选）
-- ALTER TABLE invitation_codes 
-- ADD CONSTRAINT fk_employee_id FOREIGN KEY (employee_id) REFERENCES employee_roster(employee_id) ON DELETE SET NULL ON UPDATE CASCADE;

-- 创建视图：员工绩效与花名册关联
CREATE OR REPLACE VIEW v_employee_performance_with_details AS
SELECT 
  ep.id,
  ep.employee_id,
  IFNULL(er.name, CONCAT('员工', ep.employee_id)) AS employee_name,
  IFNULL(er.department, '未知部门') AS department,
  ep.redemption_count,
  ep.performance_score,
  ep.month,
  ep.rank,
  ep.updated_at
FROM employee_performance ep
LEFT JOIN employee_roster er ON ep.employee_id = er.employee_id;