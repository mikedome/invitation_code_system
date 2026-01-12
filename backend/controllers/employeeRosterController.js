const EmployeeRoster = require('../models/EmployeeRoster');
const InvitationCode = require('../models/InvitationCode');
const { Op } = require('sequelize');

// 获取员工花名册列表
async function getEmployeeRoster(req, res) {
  try {
    const {
      page = 1,
      pageSize = 10,
      department,
      status,
      keyword, // 搜索关键词，可用于搜索姓名或员工编号
      includeDeleted = 'false' // 是否包含已删除的记录
    } = req.query;

    // 构建查询条件
    const where = {};
    
    if (department) {
      where.department = department;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { employee_id: { [Op.like]: `%${keyword}%` } }
      ];
    }
    
    // 根据includeDeleted参数决定是否包含已软删除的记录
    const includeDeletedFlag = includeDeleted === 'true';

    // 计算偏移量
    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    // 查询员工花名册
    const [employees, total] = await Promise.all([
      EmployeeRoster.findAll({
        where,
        order: [['employee_id', 'ASC']], // 按员工编号排序
        limit: parseInt(pageSize),
        offset: parseInt(offset),
        paranoid: !includeDeletedFlag // 如果includeDeleted为true，则包含已软删除的记录
      }),
      EmployeeRoster.count({ where, paranoid: !includeDeletedFlag })
    ]);

    res.status(200).json({
      success: true,
      data: {
        list: employees,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取员工花名册失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// 获取单个员工信息
async function getEmployeeById(req, res) {
  try {
    const { id } = req.params;
    
    const employee = await EmployeeRoster.findByPk(id);
    
    if (!employee) {
      return res.status(404).json({ success: false, message: '员工信息不存在' });
    }
    
    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('获取员工信息失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// 添加员工
async function addEmployee(req, res) {
  try {
    const {
      employee_id,
      name,
      department,
      position,
      hire_date,
      phone,
      email,
      id_card,
      emergency_contact,
      emergency_phone
    } = req.body;

    // 验证必要字段
    if (!employee_id || !name) {
      return res.status(400).json({ success: false, message: '员工编号和姓名不能为空' });
    }

    // 检查员工编号是否已存在
    const existingEmployee = await EmployeeRoster.findOne({
      where: { employee_id }
    });
    
    if (existingEmployee) {
      return res.status(400).json({ success: false, message: '员工编号已存在' });
    }

    // 验证并处理入职日期
    let processedHireDate = null;
    if (hire_date) {
      // 验证日期格式
      const dateObj = new Date(hire_date);
      if (!isNaN(dateObj.getTime())) { // 检查是否为有效日期
        processedHireDate = dateObj.toISOString().split('T')[0]; // 转换为 YYYY-MM-DD 格式
      }
    }
    
    // 创建新员工
    const newEmployee = await EmployeeRoster.create({
      employee_id,
      name,
      department,
      position,
      hire_date: processedHireDate, // 使用处理后的日期
      phone,
      email,
      id_card,
      emergency_contact,
      emergency_phone
    });

    res.status(201).json({
      success: true,
      message: '员工添加成功',
      data: newEmployee
    });
  } catch (error) {
    console.error('添加员工失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// 更新员工信息
async function updateEmployee(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      department,
      position,
      hire_date,
      status,
      phone,
      email,
      id_card,
      emergency_contact,
      emergency_phone
    } = req.body;

    // 查找员工
    const employee = await EmployeeRoster.findByPk(id);
    
    if (!employee) {
      return res.status(404).json({ success: false, message: '员工信息不存在' });
    }

    // 验证并处理入职日期
    let processedHireDate = null;
    if (hire_date) {
      // 验证日期格式
      const dateObj = new Date(hire_date);
      if (!isNaN(dateObj.getTime())) { // 检查是否为有效日期
        processedHireDate = dateObj.toISOString().split('T')[0]; // 转换为 YYYY-MM-DD 格式
      }
    }
    
    // 更新员工信息
    await employee.update({
      name,
      department,
      position,
      hire_date: processedHireDate, // 使用处理后的日期
      status,
      phone,
      email,
      id_card,
      emergency_contact,
      emergency_phone
    });

    res.status(200).json({
      success: true,
      message: '员工信息更新成功',
      data: employee
    });
  } catch (error) {
    console.error('更新员工信息失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// 删除员工
async function deleteEmployee(req, res) {
  try {
    const { id } = req.params;

    // 查找员工
    const employee = await EmployeeRoster.findByPk(id);
    
    if (!employee) {
      return res.status(404).json({ success: false, message: '员工信息不存在' });
    }

    // 检查该员工是否有关联的邀请码记录
    const relatedCodes = await InvitationCode.count({
      where: {
        employee_id: employee.employee_id
      }
    });
    
    if (relatedCodes > 0) {
      // 如果有关联数据，更新员工状态为离职而非删除
      await employee.update({ status: 'inactive' });
      
      res.status(200).json({
        success: true,
        message: `员工已标记为离职状态（有${relatedCodes}条相关记录被保留）`
      });
    } else {
      // 如果没有关联数据，可以安全软删除
      await employee.destroy();
      
      res.status(200).json({
        success: true,
        message: '员工删除成功'
      });
    }
  } catch (error) {
    console.error('删除员工失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// 获取所有部门列表
async function getDepartments(req, res) {
  try {
    const departments = await EmployeeRoster.findAll({
      attributes: ['department'],
      group: ['department'],
      where: {
        department: {
          [Op.not]: null,
          [Op.ne]: ''
        }
      },
      order: [['department', 'ASC']]
    });

    const departmentList = departments
      .map(item => item.department)
      .filter(dept => dept !== null && dept.trim() !== ''); // 过滤null和空字符串

    res.status(200).json({
      success: true,
      data: {
        departments: departmentList
      }
    });
  } catch (error) {
    console.error('获取部门列表失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getEmployeeRoster,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getDepartments
};