
// 应用配置

// API基础URL
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api-url.com' // 替换为您的生产API URL
  : 'http://localhost:3001'; // 本地开发服务器URL

// 其他全局配置
export const APP_CONFIG = {
  defaultRefreshInterval: 60, // 默认刷新间隔（秒）
};
