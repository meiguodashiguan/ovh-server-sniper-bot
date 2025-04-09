
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';

type StatusType = 'available' | 'unavailable' | 'unknown' | 'checking';

interface StatusCardProps {
  title: string;
  status: StatusType;
  message: string;
  lastUpdated?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, status, message, lastUpdated }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'available':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'unavailable':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'checking':
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'available':
        return <span className="status-badge status-available">可用</span>;
      case 'unavailable':
        return <span className="status-badge status-unavailable">不可用</span>;
      case 'checking':
        return <span className="status-badge status-checking">检查中...</span>;
      default:
        return <span className="status-badge status-unknown">未知</span>;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
      <CardFooter className="pt-2 text-xs text-muted-foreground flex justify-between">
        <span>最后更新: {lastUpdated || '从未'}</span>
        <div className="flex items-center gap-1">
          {getStatusIcon()}
        </div>
      </CardFooter>
    </Card>
  );
};

export default StatusCard;
