
import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import ServerForm from '@/components/ServerForm';
import StatusCard from '@/components/StatusCard';
import LogViewer, { LogEntry } from '@/components/LogViewer';
import NotificationHistory, { Notification } from '@/components/NotificationHistory';
import { OVHConfig, ServerStatus, checkServerAvailability, purchaseServer, sendTelegramNotification } from '@/utils/ovhApi';
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
    telegramToken: "",
    telegramChatId: "",
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

  // Add a log entry
  const addLog = (level: 'info' | 'warning' | 'error' | 'success', message: string) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString();
    setLogs(prev => [{ timestamp, level, message }, ...prev]);
  };

  // Add a notification
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
    
    // Also show as toast
    toast({
      title,
      description: message,
      variant: type === 'error' ? 'destructive' : 'default',
    });
  };

  // Handle form submission
  const handleFormSubmit = (newConfig: OVHConfig) => {
    setConfig(newConfig);
    addLog('info', `Configuration updated`);
    addNotification('info', 'Configuration Updated', 'Server monitoring configuration has been updated.');
  };

  // Toggle monitoring on/off
  const toggleMonitoring = () => {
    if (isRunning) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  };

  // Start monitoring
  const startMonitoring = () => {
    if (!config.appKey || !config.appSecret || !config.consumerKey) {
      addLog('error', 'Cannot start monitoring: Missing OVH API credentials');
      addNotification('error', 'Configuration Error', 'OVH API credentials are required to start monitoring.');
      return;
    }

    setIsRunning(true);
    addLog('info', 'Monitoring started');
    addNotification('info', 'Monitoring Started', 'Server availability monitoring has been activated.');
    checkAvailability();

    // Check every 60 seconds (in a real app, you might want to make this configurable)
    intervalRef.current = window.setInterval(() => {
      checkAvailability();
    }, 60000);
  };

  // Stop monitoring
  const stopMonitoring = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsRunning(false);
    addLog('info', 'Monitoring stopped');
    addNotification('warning', 'Monitoring Stopped', 'Server availability monitoring has been deactivated.');
    
    // Reset server status to unknown when stopping
    if (serverStatus) {
      setServerStatus({
        ...serverStatus,
        availability: 'unknown'
      });
    }
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
  };

  // Clear notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Check server availability
  const checkAvailability = async () => {
    try {
      // Update status to checking
      setServerStatus(prev => prev ? { ...prev, availability: 'checking' } : null);
      
      addLog('info', `Checking availability for plan: ${config.planCode}`);
      const result = await checkServerAvailability(config);
      
      if (result.length > 0) {
        const status = result[0];
        setServerStatus(status);
        setLastChecked(new Date().toLocaleTimeString());
        
        if (status.availability === 'available') {
          addLog('success', `Server ${status.fqn} is available in ${status.datacenter}!`);
          addNotification(
            'success',
            'Server Available!',
            `Server ${status.fqn} is available in ${status.datacenter} datacenter.`
          );
          
          // Send Telegram notification if configured
          if (config.telegramToken && config.telegramChatId) {
            const message = `${config.identity}: Found ${config.planCode} (${status.fqn}) available in ${status.datacenter}`;
            const sent = await sendTelegramNotification(config.telegramToken, config.telegramChatId, message);
            
            if (sent) {
              addLog('info', 'Telegram notification sent');
            } else {
              addLog('error', 'Failed to send Telegram notification');
            }
          }
          
          // Auto checkout if enabled
          if (config.autoCheckout) {
            handlePurchase(status);
          }
        } else {
          addLog('info', `Server ${status.fqn} is currently unavailable in ${status.datacenter}`);
        }
      } else {
        addLog('warning', `No information found for plan: ${config.planCode}`);
        setServerStatus(null);
      }
    } catch (error) {
      addLog('error', `Error checking availability: ${error instanceof Error ? error.message : String(error)}`);
      addNotification('error', 'Monitoring Error', 'Failed to check server availability.');
      setServerStatus(prev => prev ? { ...prev, availability: 'unknown' } : null);
    }
  };

  // Handle server purchase
  const handlePurchase = async (status: ServerStatus) => {
    try {
      addLog('info', `Attempting to purchase server ${status.fqn} in ${status.datacenter}`);
      addNotification('info', 'Purchase Started', `Attempting to purchase server ${status.fqn} in ${status.datacenter}`);
      
      const result = await purchaseServer(config, status);
      
      if (result.success) {
        addLog('success', `Order successful! Order ID: ${result.orderId}`);
        addNotification(
          'success',
          'Purchase Successful!',
          `Server ordered successfully. Order ID: ${result.orderId}`
        );
        
        // Send Telegram notification about successful purchase
        if (config.telegramToken && config.telegramChatId) {
          const message = `${config.identity}: Order ${result.orderId} created successfully!\nServer: ${status.fqn}\nDatacenter: ${status.datacenter}\nOrder Link: ${result.orderUrl}`;
          await sendTelegramNotification(config.telegramToken, config.telegramChatId, message);
        }
      } else {
        addLog('error', `Purchase failed: ${result.error}`);
        addNotification('error', 'Purchase Failed', result.error || 'Failed to complete server purchase');
        
        // Send Telegram notification about failed purchase
        if (config.telegramToken && config.telegramChatId) {
          const message = `${config.identity}: Purchase failed - ${result.error}`;
          await sendTelegramNotification(config.telegramToken, config.telegramChatId, message);
        }
      }
    } catch (error) {
      addLog('error', `Error during purchase: ${error instanceof Error ? error.message : String(error)}`);
      addNotification('error', 'Purchase Error', 'An unexpected error occurred during purchase');
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Format status message
  const getStatusMessage = () => {
    if (!serverStatus) {
      return 'No server information available. Start monitoring to check server status.';
    }
    
    switch (serverStatus.availability) {
      case 'available':
        return `Server ${serverStatus.fqn} is available in datacenter ${serverStatus.datacenter}!`;
      case 'unavailable':
        return `Server ${serverStatus.fqn} is not available in datacenter ${serverStatus.datacenter}.`;
      case 'checking':
        return 'Checking server availability...';
      default:
        return 'Server status unknown. Start monitoring to check availability.';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">OVH Server Sniper</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ServerForm 
              onSubmit={handleFormSubmit} 
              isRunning={isRunning} 
              onToggleMonitoring={toggleMonitoring} 
            />
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatusCard 
                title="Server Availability" 
                status={serverStatus?.availability || 'unknown'} 
                message={getStatusMessage()}
                lastUpdated={lastChecked || 'Never'}
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
          <p>OVH Server Sniper Bot</p>
          <p>© {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
