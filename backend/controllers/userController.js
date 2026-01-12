const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Sequelize } = require('sequelize');

// 注册用户
async function register(req, res) {
  try {
    const { username, password, role } = req.body;
    
    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '请提供用户名和密码' });
    }
    
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: '用户名已存在' });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建用户
    const user = await User.create({
      username,
      password: hashedPassword,
      role: role || 'user'
    });
    
    res.status(201).json({ success: true, data: { id: user.id, username: user.username, role: user.role }, message: '用户注册成功' });
  } catch (error) {
    console.error('注册用户错误:', error);
    res.status(500).json({ success: false, message: '注册失败，请稍后重试' });
  }
}

// 用户登录
async function login(req, res) {
  try {
    const { username, password } = req.body;
    
    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '请提供用户名和密码' });
    }
    
    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
    
    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.status(200).json({ 
      success: true, 
      data: { 
        id: user.id, 
        username: user.username, 
        role: user.role, 
        token 
      }, 
      message: '登录成功' 
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ success: false, message: '登录失败，请稍后重试' });
  }
}

// 获取用户列表
async function getUsers(req, res) {
  try {
    const { page = 1, pageSize = 10, role } = req.query;
    
    const where = {};
    if (role) {
      where.role = role;
    }
    
    const offset = (page - 1) * pageSize;
    
    const [users, total] = await Promise.all([
      User.findAll({
        where,
        attributes: ['id', 'username', 'role', 'created_at', 'updated_at'],
        order: [['created_at', 'DESC']],
        limit: parseInt(pageSize),
        offset: parseInt(offset)
      }),
      User.count({ where })
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        list: users,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ success: false, message: '获取用户列表失败，请稍后重试' });
  }
}

// 获取单个用户信息
async function getUser(req, res) {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'role', 'created_at', 'updated_at']
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ success: false, message: '获取用户信息失败，请稍后重试' });
  }
}

// 更新用户信息
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { username, password, role } = req.body;
    
    // 查找用户
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    // 更新用户信息
    const updateData = {};
    
    if (username) {
      // 检查新用户名是否已被其他用户使用
      const existingUser = await User.findOne({ where: { username, id: { [Sequelize.Op.ne]: id } } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: '用户名已存在' });
      }
      updateData.username = username;
    }
    
    if (password) {
      // 加密新密码
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    if (role) {
      updateData.role = role;
    }
    
    await user.update(updateData);
    
    res.status(200).json({ success: true, data: { id: user.id, username: user.username, role: user.role }, message: '用户信息更新成功' });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({ success: false, message: '更新用户信息失败，请稍后重试' });
  }
}

// 删除用户
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    
    // 查找用户
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    // 检查该用户是否有关联的重要数据
    const { InvitationCode } = require('../models/InvitationCode');
    const relatedCodes = await InvitationCode.count({
      where: { generator_id: user.username }
    });
    
    if (relatedCodes > 0) {
      // 如果有关联数据，不允许删除
      return res.status(400).json({ 
        success: false, 
        message: `该用户有${relatedCodes}条关联的邀请码记录，不能删除。请先处理相关数据或联系管理员。`
      });
    } else {
      // 如果没有关联数据，可以安全删除
      await user.destroy();
      
      res.status(200).json({ success: true, message: '用户删除成功' });
    }
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ success: false, message: '删除用户失败，请稍后重试' });
  }
}

module.exports = {
  register,
  login,
  getUsers,
  getUser,
  updateUser,
  deleteUser
};