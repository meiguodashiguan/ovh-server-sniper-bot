
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2, Bell } from 'lucide-react';

export interface Notification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationHistoryProps {
  notifications: Notification[];
  onClearNotifications: () => void;
}

const NotificationHistory: React.FC<NotificationHistoryProps> = ({ notifications, onClearNotifications }) => {
  const getNotificationClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'info':
      default:
        return 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>;
      case 'error':
        return <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>;
      case 'warning':
        return <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>;
      case 'info':
      default:
        return <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>;
    }
  };

  return (
    <Card className="h-full shadow-md">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg font-medium">通知中心</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30" 
            onClick={onClearNotifications}
          >
            <Trash2 className="h-4 w-4" />
            清除
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-center">
              <Bell className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-center text-sm text-muted-foreground p-4">
                暂无通知信息
              </p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 rounded-md shadow-sm hover:shadow transition-all duration-200 ${getNotificationClass(notification.type)}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      {getNotificationIcon(notification.type)}
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                    </div>
                    <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                  </div>
                  <p className="text-xs mt-1 ml-4 text-gray-600 dark:text-gray-300">{notification.message}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default NotificationHistory;
