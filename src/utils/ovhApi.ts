
// OVH API 类型定义

export type ServerAvailability = 'available' | 'unavailable' | 'unknown' | 'checking';

export interface ServerStatus {
  fqn: string;
  datacenter: string;
  availability: ServerAvailability;
}

export interface OVHConfig {
  appKey: string;
  appSecret: string;
  consumerKey: string;
  endpoint: string;
  identity: string;
  zone: string;
  planCode: string;
  os: string;
  duration: string;
  datacenter: string;
  autoCheckout: boolean;
  options: string[];
  enableLoop?: boolean; // 是否启用循环抢购
  loopInterval?: number; // 循环间隔（秒）
  maxAttempts?: number; // 最大尝试次数，0表示无限
}

// API请求基础URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api-url.com' // 替换为您的生产环境API URL
  : 'http://localhost:3001'; // 本地开发环境URL

// 检查服务器可用性
export const checkServerAvailability = async (config: OVHConfig): Promise<ServerStatus[]> => {
  console.log("正在检查服务器可用性，配置:", config);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/check-availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '请求失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error("检查服务器可用性出错:", error);
    throw error;
  }
};

// 购买服务器
export const purchaseServer = async (config: OVHConfig, serverStatus: ServerStatus): Promise<{
  success: boolean;
  orderId?: string;
  orderUrl?: string;
  error?: string;
}> => {
  console.log("尝试购买服务器:", serverStatus);
  console.log("配置:", config);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/purchase-server`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ config, serverStatus }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || '购买请求失败'
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error("购买服务器出错:", error instanceof Error ? error.message : String(error));
    return {
      success: false,
      error: error instanceof Error ? error.message : '购买过程中发生未知错误'
    };
  }
};
