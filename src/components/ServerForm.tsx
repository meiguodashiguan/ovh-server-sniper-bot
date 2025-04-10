
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { OVHConfig } from '@/utils/ovhApi';
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from 'lucide-react';

interface ServerFormProps {
  onSubmit: (config: OVHConfig) => void;
  isRunning: boolean;
  onToggleMonitoring: () => void;
  initialConfig: OVHConfig;
}

const ServerForm: React.FC<ServerFormProps> = ({ onSubmit, isRunning, onToggleMonitoring, initialConfig }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<OVHConfig>(initialConfig);

  useEffect(() => {
    // Update formData when initialConfig changes
    setFormData(initialConfig);
  }, [initialConfig]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
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
          
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-medium">购买设置</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="autoCheckout" 
                  checked={formData.autoCheckout}
                  onCheckedChange={(checked) => handleSwitchChange("autoCheckout", checked)}
                />
                <Label htmlFor="autoCheckout">服务器可用时自动结账</Label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="enableLoop" 
                  checked={!!formData.enableLoop}
                  onCheckedChange={(checked) => handleSwitchChange("enableLoop", checked)}
                />
                <Label htmlFor="enableLoop">启用失败后循环抢购</Label>
              </div>
            </div>
            
            {formData.enableLoop && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loopInterval">循环间隔 (秒)</Label>
                  <Input 
                    id="loopInterval" 
                    name="loopInterval" 
                    type="number" 
                    placeholder="尝试间隔时间" 
                    value={formData.loopInterval || 60} 
                    onChange={handleNumberChange}
                    min={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">最大尝试次数</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      id="maxAttempts" 
                      name="maxAttempts" 
                      type="number" 
                      placeholder="0 表示无限次" 
                      value={formData.maxAttempts || 0} 
                      onChange={handleNumberChange}
                      min={0}
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">(0 = 无限次)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <Button type="submit" className="w-full flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            更新配置
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ServerForm;
