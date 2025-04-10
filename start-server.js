
const { spawn } = require('child_process');
const path = require('path');

// 获取服务器脚本的绝对路径
const serverPath = path.join(__dirname, 'src', 'server.js');
console.log(`启动服务器脚本: ${serverPath}`);

// 启动服务器
console.log('正在启动服务器...');
const serverProcess = spawn('node', [serverPath], {
  stdio: 'inherit' // 将子进程的输出传递到当前进程
});

serverProcess.on('error', (error) => {
  console.error('启动服务器时出错:', error);
  process.exit(1);
});

serverProcess.on('exit', (code, signal) => {
  if (code !== 0) {
    console.log(`服务器进程退出，代码: ${code}, 信号: ${signal}`);
    process.exit(code);
  }
});

console.log('服务器进程已启动。按Ctrl+C停止服务器。');
console.log('API 将在 http://localhost:3001 上可用');
console.log('前端可以通过 /api 代理访问 API');

