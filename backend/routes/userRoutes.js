const express = require('express');
const router = express.Router();
const { register, login, getUsers, getUser, updateUser, deleteUser } = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/permission');

// 公开路由
router.post('/register', register);
router.post('/login', login);

// 需要认证的路由
router.get('/users', authenticate, requireRole('admin'), getUsers);
router.get('/users/:id', authenticate, requireRole('admin'), getUser);
router.put('/users/:id', authenticate, requireRole('admin'), updateUser);
router.delete('/users/:id', authenticate, requireRole('admin'), deleteUser);

module.exports = router;