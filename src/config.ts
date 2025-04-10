
// 应用配置

// API基础URL
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' // 在生产环境中使用相对路径
  : 'http://localhost:3001/api'; // 本地开发服务器URL

// 其他全局配置
export const APP_CONFIG = {
  defaultRefreshInterval: 60, // 默认刷新间隔（秒）
};
