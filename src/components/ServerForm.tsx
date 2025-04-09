
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { OVHConfig } from '@/utils/ovhApi';
import { useToast } from "@/hooks/use-toast";

interface ServerFormProps {
  onSubmit: (config: OVHConfig) => void;
  isRunning: boolean;
  onToggleMonitoring: () => void;
}

const ServerForm: React.FC<ServerFormProps> = ({ onSubmit, isRunning, onToggleMonitoring }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<OVHConfig>({
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

  // 从本地存储加载配置
  useEffect(() => {
    const savedConfig = localStorage.getItem('ovhConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setFormData(parsedConfig);
        toast({
          title: "配置已加载",
          description: "已从本地存储加载您之前保存的配置。"
        });
      } catch (error) {
        console.error("无法解析保存的配置:", error);
        toast({
          title: "加载配置失败",
          description: "无法加载本地存储的配置。",
          variant: "destructive"
        });
      }
    }
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, autoCheckout: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 保存到本地存储
    localStorage.setItem('ovhConfig', JSON.stringify(formData));
    onSubmit(formData);
    toast({
      title: "配置已保存",
      description: "您的配置已成功保存并应用。"
    });
  };

  const endpointOptions = [
    { value: "ovh-eu", label: "OVH 欧洲 (ovh-eu)" },
    { value: "ovh-us", label: "OVH 美国 (ovh-us)" },
    { value: "ovh-ca", label: "OVH 加拿大 (ovh-ca)" }
  ];

  const zoneOptions = [
    { value: "FR", label: "法国 (FR)" },
    { value: "GB", label: "英国 (GB)" },
    { value: "DE", label: "德国 (DE)" },
    { value: "ES", label: "西班牙 (ES)" },
    { value: "IT", label: "意大利 (IT)" },
    { value: "PL", label: "波兰 (PL)" },
    { value: "NL", label: "荷兰 (NL)" },
    { value: "PT", label: "葡萄牙 (PT)" },
    { value: "FI", label: "芬兰 (FI)" },
    { value: "IE", label: "爱尔兰 (IE)" }
  ];

  const durationOptions = [
    { value: "P1M", label: "1 个月" },
    { value: "P3M", label: "3 个月" },
    { value: "P6M", label: "6 个月" },
    { value: "P12M", label: "12 个月" }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>服务器配置</CardTitle>
          <div className="flex items-center space-x-2">
            <Label htmlFor="monitoring-toggle" className={isRunning ? "text-success" : "text-muted-foreground"}>
              {isRunning ? "监控中" : "监控已停止"}
            </Label>
            <Switch 
              id="monitoring-toggle" 
              checked={isRunning}
              onCheckedChange={onToggleMonitoring}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">OVH API 凭据</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appKey">应用密钥</Label>
                <Input 
                  id="appKey" 
                  name="appKey" 
                  placeholder="OVH 应用密钥" 
                  value={formData.appKey} 
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appSecret">应用密钥</Label>
                <Input 
                  id="appSecret" 
                  name="appSecret" 
                  type="password" 
                  placeholder="OVH 应用密钥" 
                  value={formData.appSecret} 
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consumerKey">消费者密钥</Label>
                <Input 
                  id="consumerKey" 
                  name="consumerKey" 
                  placeholder="OVH 消费者密钥" 
                  value={formData.consumerKey} 
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endpoint">API 端点</Label>
                <Select 
                  value={formData.endpoint} 
                  onValueChange={(value) => handleSelectChange("endpoint", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择端点" />
                  </SelectTrigger>
                  <SelectContent>
                    {endpointOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Telegram 通知设置</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telegramToken">Telegram 机器人令牌</Label>
                <Input 
                  id="telegramToken" 
                  name="telegramToken" 
                  placeholder="Telegram 机器人令牌" 
                  value={formData.telegramToken} 
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegramChatId">聊天 ID</Label>
                <Input 
                  id="telegramChatId" 
                  name="telegramChatId" 
                  placeholder="Telegram 聊天 ID" 
                  value={formData.telegramChatId} 
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">服务器详情</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="identity">身份标识</Label>
                <Input 
                  id="identity" 
                  name="identity" 
                  placeholder="您的身份标签" 
                  value={formData.identity} 
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zone">OVH 区域</Label>
                <Select 
                  value={formData.zone} 
                  onValueChange={(value) => handleSelectChange("zone", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择 OVH 区域" />
                  </SelectTrigger>
                  <SelectContent>
                    {zoneOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="planCode">计划代码</Label>
                <Input 
                  id="planCode" 
                  name="planCode" 
                  placeholder="服务器计划代码" 
                  value={formData.planCode} 
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="os">操作系统</Label>
                <Input 
                  id="os" 
                  name="os" 
                  placeholder="操作系统代码" 
                  value={formData.os} 
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">订阅时长</Label>
                <Select 
                  value={formData.duration} 
                  onValueChange={(value) => handleSelectChange("duration", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择时长" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="datacenter">首选数据中心</Label>
                <Input 
                  id="datacenter" 
                  name="datacenter" 
                  placeholder="数据中心代码 (如 rbx)" 
                  value={formData.datacenter} 
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch 
              id="autoCheckout" 
              checked={formData.autoCheckout}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="autoCheckout">服务器可用时自动结账</Label>
          </div>
          
          <Button type="submit" className="w-full">更新配置</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ServerForm;
