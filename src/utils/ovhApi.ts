
// OVH API 类型定义
import { API_BASE_URL } from '@/config';

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

// 检查服务器可用性
export const checkServerAvailability = async (config: OVHConfig): Promise<ServerStatus[]> => {
  console.log("正在检查服务器可用性，配置:", config);
  
  try {
    const response = await fetch(`${API_BASE_URL}/check-availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    
    if (!response.ok) {
      // 尝试解析错误信息
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || `请求失败: ${response.status}`);
      } catch (jsonError) {
        // 如果不是有效的JSON，则直接返回状态码
        throw new Error(`请求失败: ${response.status}`);
      }
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
    const response = await fetch(`${API_BASE_URL}/purchase-server`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ config, serverStatus }),
    });
    
    try {
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || '购买请求失败'
        };
      }
      
      return data;
    } catch (jsonError) {
      return {
        success: false,
        error: `解析服务器响应时出错: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`
      };
    }
  } catch (error) {
    console.error("购买服务器出错:", error instanceof Error ? error.message : String(error));
    return {
      success: false,
      error: error instanceof Error ? error.message : '购买过程中发生未知错误'
    };
  }
};

// 健康状态检查
export const checkApiHealth = async (): Promise<{ status: string, timestamp: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error(`健康检查失败: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("API健康检查失败:", error);
    throw error;
  }
};
