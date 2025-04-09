
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface ServerFormProps {
  onSubmit: (config: any) => void;
  isRunning: boolean;
  onToggleMonitoring: () => void;
}

const ServerForm: React.FC<ServerFormProps> = ({ onSubmit, isRunning, onToggleMonitoring }) => {
  const [formData, setFormData] = useState({
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
    onSubmit(formData);
  };

  const endpointOptions = [
    { value: "ovh-eu", label: "OVH Europe (ovh-eu)" },
    { value: "ovh-us", label: "OVH US (ovh-us)" },
    { value: "ovh-ca", label: "OVH Canada (ovh-ca)" }
  ];

  const zoneOptions = [
    { value: "FR", label: "France (FR)" },
    { value: "GB", label: "United Kingdom (GB)" },
    { value: "DE", label: "Germany (DE)" },
    { value: "ES", label: "Spain (ES)" },
    { value: "IT", label: "Italy (IT)" },
    { value: "PL", label: "Poland (PL)" },
    { value: "NL", label: "Netherlands (NL)" },
    { value: "PT", label: "Portugal (PT)" },
    { value: "FI", label: "Finland (FI)" },
    { value: "IE", label: "Ireland (IE)" }
  ];

  const durationOptions = [
    { value: "P1M", label: "1 Month" },
    { value: "P3M", label: "3 Months" },
    { value: "P6M", label: "6 Months" },
    { value: "P12M", label: "12 Months" }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Server Configuration</CardTitle>
          <div className="flex items-center space-x-2">
            <Label htmlFor="monitoring-toggle" className={isRunning ? "text-success" : "text-muted-foreground"}>
              {isRunning ? "Monitoring Active" : "Monitoring Inactive"}
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
            <h3 className="text-sm font-medium">OVH API Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appKey">Application Key</Label>
                <Input 
                  id="appKey" 
                  name="appKey" 
                  placeholder="OVH Application Key" 
                  value={formData.appKey} 
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appSecret">Application Secret</Label>
                <Input 
                  id="appSecret" 
                  name="appSecret" 
                  type="password" 
                  placeholder="OVH Application Secret" 
                  value={formData.appSecret} 
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consumerKey">Consumer Key</Label>
                <Input 
                  id="consumerKey" 
                  name="consumerKey" 
                  placeholder="OVH Consumer Key" 
                  value={formData.consumerKey} 
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endpoint">API Endpoint</Label>
                <Select 
                  value={formData.endpoint} 
                  onValueChange={(value) => handleSelectChange("endpoint", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select endpoint" />
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
            <h3 className="text-sm font-medium">Telegram Notification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telegramToken">Telegram Bot Token</Label>
                <Input 
                  id="telegramToken" 
                  name="telegramToken" 
                  placeholder="Telegram Bot Token" 
                  value={formData.telegramToken} 
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegramChatId">Chat ID</Label>
                <Input 
                  id="telegramChatId" 
                  name="telegramChatId" 
                  placeholder="Telegram Chat ID" 
                  value={formData.telegramChatId} 
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Server Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="identity">Identity</Label>
                <Input 
                  id="identity" 
                  name="identity" 
                  placeholder="Your Identity Tag" 
                  value={formData.identity} 
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zone">OVH Zone</Label>
                <Select 
                  value={formData.zone} 
                  onValueChange={(value) => handleSelectChange("zone", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select OVH zone" />
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
                <Label htmlFor="planCode">Plan Code</Label>
                <Input 
                  id="planCode" 
                  name="planCode" 
                  placeholder="Server Plan Code" 
                  value={formData.planCode} 
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="os">Operating System</Label>
                <Input 
                  id="os" 
                  name="os" 
                  placeholder="OS Code" 
                  value={formData.os} 
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Subscription Duration</Label>
                <Select 
                  value={formData.duration} 
                  onValueChange={(value) => handleSelectChange("duration", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
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
                <Label htmlFor="datacenter">Preferred Datacenter</Label>
                <Input 
                  id="datacenter" 
                  name="datacenter" 
                  placeholder="Datacenter Code (e.g., rbx)" 
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
            <Label htmlFor="autoCheckout">Auto-checkout when server is available</Label>
          </div>
          
          <Button type="submit" className="w-full">Update Configuration</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ServerForm;
