
import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import ServerForm from '@/components/ServerForm';
import StatusCard from '@/components/StatusCard';
import LogViewer, { LogEntry } from '@/components/LogViewer';
import NotificationHistory, { Notification } from '@/components/NotificationHistory';
import { OVHConfig, ServerStatus, checkServerAvailability, purchaseServer } from '@/utils/ovhApi';
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

const Index = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [config, setConfig] = useState<OVHConfig>({
    appKey: "",
    appSecret: "",
    consumerKey: "",
    endpoint: "ovh-eu",
    identity: "go-ovh-fr",
    zone: "FR",
    planCode: "25skmystery01",
    os: "none_64.en",
    duration: "P1M",
    datacenter: "rbx",
    autoCheckout: false,
    options: [
      "bandwidth-1000-unguaranteed-25skmystery01",
      "ram-64g-ecc-2133-25skmystery01",
      "softraid-2x480ssd-25skmystery01"
    ]
  });
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  // 当组件加载时，从本地存储中恢复配置
  useEffect(() => {
    const savedConfig = localStorage.getItem('ovhConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
        addLog('info', '已从本地存储加载配置');
      } catch (error) {
        console.error('无法解析存储的配置:', error);
      }
    }
  }, []);

  // 添加日志条目
  const addLog = (level: 'info' | 'warning' | 'error' | 'success', message: string) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString();
    setLogs(prev => [{ timestamp, level, message }, ...prev]);
  };

  // 添加通知
  const addNotification = (type: 'info' | 'success' | 'warning' | 'error', title: string, message: string) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString();
    const newNotification: Notification = {
      id: uuidv4(),
      timestamp,
      title,
      message,
      type
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    // 也显示为 toast
    toast({
      title,
      description: message,
      variant: type === 'error' ? 'destructive' : 'default',
    });
  };

  // 处理表单提交
  const handleFormSubmit = (newConfig: OVHConfig) => {
    setConfig(newConfig);
    
    // 保存配置到本地存储
    localStorage.setItem('ovhConfig', JSON.stringify(newConfig));
    
    addLog('info', `配置已更新并保存`);
    addNotification('info', '配置已更新', '服务器监控配置已更新并保存到本地。');
  };

  // 切换监控开关
  const toggleMonitoring = () => {
    if (isRunning) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  };

  // 开始监控
  const startMonitoring = () => {
    if (!config.appKey || !config.appSecret || !config.consumerKey) {
      addLog('error', '无法开始监控：缺少 OVH API 凭据');
      addNotification('error', '配置错误', '需要 OVH API 凭据才能开始监控。');
      return;
    }

    setIsRunning(true);
    addLog('info', '监控已启动');
    addNotification('info', '监控已启动', '服务器可用性监控已激活。');
    checkAvailability();

    // 每 60 秒检查一次（在实际应用中，您可能希望使其可配置）
    intervalRef.current = window.setInterval(() => {
      checkAvailability();
    }, 60000);
  };

  // 停止监控
  const stopMonitoring = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsRunning(false);
    addLog('info', '监控已停止');
    addNotification('warning', '监控已停止', '服务器可用性监控已停用。');
    
    // 停止时将服务器状态重置为未知
    if (serverStatus) {
      setServerStatus({
        ...serverStatus,
        availability: 'unknown'
      });
    }
  };

  // 清除日志
  const clearLogs = () => {
    setLogs([]);
  };

  // 清除通知
  const clearNotifications = () => {
    setNotifications([]);
  };

  // 检查服务器可用性
  const checkAvailability = async () => {
    try {
      // 更新状态为正在检查
      if (serverStatus) {
        setServerStatus({
          ...serverStatus,
          availability: 'checking'
        });
      }
      
      addLog('info', `正在检查计划可用性: ${config.planCode}`);
      const result = await checkServerAvailability(config);
      
      if (result.length > 0) {
        const status = result[0];
        setServerStatus(status);
        setLastChecked(new Date().toLocaleTimeString());
        
        if (status.availability === 'available') {
          addLog('success', `服务器 ${status.fqn} 在 ${status.datacenter} 可用!`);
          addNotification(
            'success',
            '服务器可用!',
            `服务器 ${status.fqn} 在数据中心 ${status.datacenter} 可用。`
          );
          
          // 如果启用了自动结账
          if (config.autoCheckout) {
            handlePurchase(status);
          }
        } else {
          addLog('info', `服务器 ${status.fqn} 当前在 ${status.datacenter} 不可用`);
        }
      } else {
        addLog('warning', `未找到计划的信息: ${config.planCode}`);
        setServerStatus(null);
      }
    } catch (error) {
      addLog('error', `检查可用性时出错: ${error instanceof Error ? error.message : String(error)}`);
      addNotification('error', '监控错误', '检查服务器可用性失败。');
      if (serverStatus) {
        setServerStatus({
          ...serverStatus,
          availability: 'unknown'
        });
      }
    }
  };

  // 处理服务器购买
  const handlePurchase = async (status: ServerStatus) => {
    try {
      addLog('info', `尝试购买服务器 ${status.fqn} 在 ${status.datacenter}`);
      addNotification('info', '开始购买', `尝试购买服务器 ${status.fqn} 在 ${status.datacenter}`);
      
      const result = await purchaseServer(config, status);
      
      if (result.success) {
        addLog('success', `订单成功! 订单 ID: ${result.orderId}`);
        addNotification(
          'success',
          '购买成功!',
          `服务器订购成功。订单 ID: ${result.orderId}`
        );
      } else {
        addLog('error', `购买失败: ${result.error}`);
        addNotification('error', '购买失败', result.error || '无法完成服务器购买');
      }
    } catch (error) {
      addLog('error', `购买过程中出错: ${error instanceof Error ? error.message : String(error)}`);
      addNotification('error', '购买错误', '购买过程中发生意外错误');
    }
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 格式化状态消息
  const getStatusMessage = () => {
    if (!serverStatus) {
      return '无服务器信息可用。开始监控以检查服务器状态。';
    }
    
    switch (serverStatus.availability) {
      case 'available':
        return `服务器 ${serverStatus.fqn} 在数据中心 ${serverStatus.datacenter} 可用!`;
      case 'unavailable':
        return `服务器 ${serverStatus.fqn} 在数据中心 ${serverStatus.datacenter} 不可用。`;
      case 'checking':
        return '正在检查服务器可用性...';
      default:
        return '服务器状态未知。开始监控以检查可用性。';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">OVH 服务器监控工具</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ServerForm 
              onSubmit={handleFormSubmit} 
              isRunning={isRunning} 
              onToggleMonitoring={toggleMonitoring}
              initialConfig={config} 
            />
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatusCard 
                title="服务器可用性" 
                status={serverStatus?.availability || 'unknown'} 
                message={getStatusMessage()}
                lastUpdated={lastChecked || '从未'}
              />
              
              <div className="space-y-6">
                <LogViewer logs={logs} onClearLogs={clearLogs} />
              </div>
            </div>
          </div>
          
          <div>
            <NotificationHistory 
              notifications={notifications}
              onClearNotifications={clearNotifications}
            />
          </div>
        </div>
      </main>
      <footer className="py-6 border-t">
        <div className="container flex justify-between text-sm text-muted-foreground">
          <p>OVH 服务器监控工具</p>
          <p>© {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

