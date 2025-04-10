
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RefreshCw, StopCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PurchaseLoopStatusProps {
  isLooping: boolean;
  currentAttempt: number;
  maxAttempts: number;
  isPurchasing: boolean;
  onStartLoop: () => void;
  onStopLoop: () => void;
  lastPurchaseSuccess?: boolean;
  lastPurchaseError?: string;
}

const PurchaseLoopStatus: React.FC<PurchaseLoopStatusProps> = ({
  isLooping,
  currentAttempt,
  maxAttempts,
  isPurchasing,
  onStartLoop,
  onStopLoop,
  lastPurchaseSuccess,
  lastPurchaseError
}) => {
  // 计算进度百分比（如果有最大尝试次数）
  const progressPercentage = maxAttempts > 0 ? Math.min((currentAttempt / maxAttempts) * 100, 100) : 0;
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <RefreshCw className={`h-5 w-5 text-blue-500 ${isLooping ? 'animate-spin' : ''}`} />
            <CardTitle className="text-lg font-medium">抢购循环状态</CardTitle>
          </div>
          
          {isLooping ? (
            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20">
              循环中
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/20">
              已停止
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {/* 尝试次数显示 */}
          <div className="flex justify-between items-center text-sm">
            <span>当前尝试：{currentAttempt}</span>
            {maxAttempts > 0 && <span>最大次数：{maxAttempts}</span>}
          </div>
          
          {/* 进度条（只有在设置了最大尝试次数时才显示） */}
          {maxAttempts > 0 && (
            <Progress value={progressPercentage} className="h-2" />
          )}
          
          {/* 上次购买结果 */}
          {lastPurchaseSuccess !== undefined && (
            <div className={`p-3 rounded-md ${lastPurchaseSuccess 
              ? 'bg-green-50 border-l-4 border-green-500 dark:bg-green-900/20' 
              : 'bg-red-50 border-l-4 border-red-500 dark:bg-red-900/20'}`}
            >
              <div className="flex items-start space-x-2">
                {lastPurchaseSuccess ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">
                    {lastPurchaseSuccess ? '购买成功' : '购买失败'}
                  </p>
                  {!lastPurchaseSuccess && lastPurchaseError && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">{lastPurchaseError}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* 控制按钮 */}
          <div className="flex space-x-2">
            {!isLooping ? (
              <Button 
                className="w-full flex items-center justify-center gap-2"
                onClick={onStartLoop}
                disabled={isPurchasing}
              >
                <RefreshCw className="h-4 w-4" />
                开始循环抢购
              </Button>
            ) : (
              <Button 
                className="w-full flex items-center justify-center gap-2"
                variant="destructive"
                onClick={onStopLoop}
              >
                <StopCircle className="h-4 w-4" />
                停止循环抢购
              </Button>
            )}
          </div>
          
          {/* 当前状态 */}
          {isPurchasing && (
            <div className="flex justify-center items-center text-sm text-blue-600 animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              正在尝试购买...
            </div>
          )}
          
        </div>
      </CardContent>
    </Card>
  );
};

export default PurchaseLoopStatus;
