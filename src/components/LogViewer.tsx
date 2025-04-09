
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

interface LogViewerProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

const LogViewer: React.FC<LogViewerProps> = ({ logs, onClearLogs }) => {
  const getLogClass = (level: string) => {
    switch (level) {
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'success':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">监控日志</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1" 
            onClick={onClearLogs}
          >
            <Trash2 className="h-4 w-4" />
            清除
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] p-4 rounded-md border">
          {logs.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground p-4">
              暂无日志。开始监控后将显示活动记录。
            </p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-xs font-mono">
                  <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                  <span className={getLogClass(log.level)}>
                    {log.level === 'info' ? '信息' : 
                     log.level === 'warning' ? '警告' : 
                     log.level === 'error' ? '错误' : 
                     log.level === 'success' ? '成功' : log.level.toUpperCase()}
                  </span>:{' '}
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LogViewer;

