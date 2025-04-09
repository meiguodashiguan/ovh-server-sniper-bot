
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

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

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Notifications</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1" 
            onClick={onClearNotifications}
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground p-4">
              No notifications yet.
            </p>
          ) : (
            <div className="space-y-2 p-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 rounded-md ${getNotificationClass(notification.type)}`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                  </div>
                  <p className="text-xs mt-1">{notification.message}</p>
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
