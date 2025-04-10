
// 应用配置

// API基础URL - 直接使用OVH API网址
export const API_BASE_URL = import.meta.env.DEV 
  ? '/api' // 开发环境使用代理
  : 'https://api.ovh.com/1.0'; // 生产环境使用实际API

// 其他全局配置
export const APP_CONFIG = {
  defaultRefreshInterval: 60, // 默认刷新间隔（秒）
};
