
// 应用配置

// API基础URL
export const API_BASE_URL = import.meta.env.DEV 
  ? '/api' // 在开发环境使用代理
  : '/api'; // 生产环境也使用相对路径

// 其他全局配置
export const APP_CONFIG = {
  defaultRefreshInterval: 60, // 默认刷新间隔（秒）
};

