const express = require('express');
const router = express.Router();
const { 
  getEmployeeRoster, 
  getEmployeeById, 
  addEmployee, 
  updateEmployee, 
  deleteEmployee,
  getDepartments
} = require('../controllers/employeeRosterController');
const authenticate = require('../middleware/auth');
const permission = require('../middleware/permission');

// 获取员工花名册列表
router.get('/employees', authenticate, getEmployeeRoster);

// 获取单个员工信息
router.get('/employees/:id', authenticate, getEmployeeById);

// 获取部门列表
router.get('/departments', authenticate, getDepartments);

// 添加员工（仅限管理员）
router.post('/employees', authenticate, permission.isAdmin, addEmployee);

// 更新员工信息（仅限管理员）
router.put('/employees/:id', authenticate, permission.isAdmin, updateEmployee);

// 删除员工（仅限管理员）
router.delete('/employees/:id', authenticate, permission.isAdmin, deleteEmployee);

module.exports = router;