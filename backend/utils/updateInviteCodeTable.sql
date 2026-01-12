-- 为邀请码表添加生成人关联字段
ALTER TABLE invitation_codes 
ADD COLUMN generator_id VARCHAR(10) COMMENT '生成人ID，关联员工花名册',
ADD COLUMN generator_name VARCHAR(50) COMMENT '生成人姓名';

-- 添加外键约束（可选，取决于业务需求）
-- ALTER TABLE invitation_codes 
-- ADD CONSTRAINT fk_generator_id FOREIGN KEY (generator_id) REFERENCES employee_roster(employee_id) ON DELETE SET NULL ON UPDATE CASCADE;

-- 更新现有数据，将 employee_id 映射到 generator_id 和 generator_name
UPDATE invitation_codes ic
JOIN employee_roster er ON ic.employee_id = er.employee_id
SET ic.generator_id = er.employee_id,
    ic.generator_name = er.name;

-- 创建索引以提高查询性能
CREATE INDEX idx_generator_id ON invitation_codes(generator_id);
CREATE INDEX idx_generator_name ON invitation_codes(generator_name);