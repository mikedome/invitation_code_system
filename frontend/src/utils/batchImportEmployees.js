// 批量导入员工数据的工具函数
import axios from 'axios';

// 创建API请求实例
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// 添加请求拦截器，自动添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 解析员工数据
function parseEmployeeData(rawData) {
  const lines = rawData.trim().split('\n');
  const employees = [];
  
  lines.forEach(line => {
    line = line.trim();
    if (!line) return;
    
    // 使用正则表达式提取4位数字和姓名
    const match = line.match(/([A-Z])(\d{4})\s+(.+)/);
    if (match) {
      const [, prefix, employeeId, name] = match;
      employees.push({
        employee_id: employeeId,
        name: name.trim(),
        department: '签证业务部',
        status: 'active' // 默认在职
      });
    }
  });
  
  return employees;
}

// 批量添加员工
async function batchAddEmployees(employeeData) {
  const employees = parseEmployeeData(employeeData);
  const results = {
    success: [],
    failed: []
  };
  
  for (const employee of employees) {
    try {
      const response = await api.post('/employees', employee);
      if (response.data.success) {
        results.success.push({
          ...employee,
          message: response.data.message
        });
        console.log(`成功添加员工: ${employee.name} (${employee.employee_id})`);
      } else {
        results.failed.push({
          ...employee,
          message: response.data.message
        });
        console.error(`添加员工失败: ${employee.name} (${employee.employee_id}) - ${response.data.message}`);
      }
    } catch (error) {
      results.failed.push({
        ...employee,
        message: error.response?.data?.message || error.message
      });
      console.error(`添加员工出错: ${employee.name} (${employee.employee_id}) - ${error.message}`);
    }
  }
  
  return results;
}

// 示例数据
const sampleData = `0001 黄未
V0002 裘加文
E0003 程开阳
E0004 邹生地
N0005 邓德妙
V0006 郑滢滢
L0007 吴信瑶
G0008 杨淑涵
V0009 马春秀
V0010 李皓
N0011 杨伊婷
V0012 吴京京
V0013 徐梦怡
V0014 江琛
V0015 姚林艺
V0016 胡思铱
V0017 陈均艳
G0018 羊以
B0019 陈一儒
B0020 蔡耀萱
B0021 孙菡励
F0022 施舒虹`;

export {
  parseEmployeeData,
  batchAddEmployees,
  sampleData
};