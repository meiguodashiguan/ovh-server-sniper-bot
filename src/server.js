
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const crypto = require('crypto');
const fetch = require('node-fetch');

dotenv.config();

const app = express();

// 配置更完整的 CORS 选项
app.use(cors({
  origin: ['http://localhost:8080', 'https://f8e063de-2d8e-45dc-9801-7c7507e3e60b.lovableproject.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// 启用详细日志记录
const DEBUG = true;

// 请求日志记录中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (DEBUG && req.body) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// OVH API签名生成器 - 根据OVH API文档实现
function createOvhSignature(method, url, body, timestamp, appSecret, consumerKey) {
  // 确保使用完整URL格式
  const fullUrl = `https://api.ovh.com/1.0${url}`;
  
  // 创建签名字符串
  const toSign = [
    appSecret,
    consumerKey,
    method,
    fullUrl,
    body ? JSON.stringify(body) : '',
    timestamp
  ].join('+');
  
  // 生成SHA1哈希并格式化为OVH要求的格式
  return '$1$' + crypto.createHash('sha1').update(toSign).digest('hex');
}

// 代理转发到OVH API
async function proxyToOvhApi(req, res, path, method, body) {
  try {
    const config = req.body;
    
    if (!config.appKey || !config.appSecret || !config.consumerKey) {
      return res.status(400).json({ 
        error: '缺少 OVH API 凭据 (appKey, appSecret, consumerKey)' 
      });
    }
    
    const timestamp = Math.round(Date.now() / 1000);
    const signature = createOvhSignature(method, path, body, timestamp, config.appSecret, config.consumerKey);
    
    const ovhUrl = `https://api.ovh.com/1.0${path}`;
    console.log(`向OVH发送请求: ${method} ${ovhUrl}`);
    
    // 设置请求超时
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    
    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Ovh-Application': config.appKey,
        'X-Ovh-Consumer': config.consumerKey,
        'X-Ovh-Timestamp': timestamp.toString(),
        'X-Ovh-Signature': signature
      },
      signal: controller.signal
    };
    
    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }
    
    const response = await fetch(ovhUrl, fetchOptions);
    clearTimeout(timeout);
    
    // 获取响应数据
    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    // 转发OVH响应状态码和数据到客户端
    if (!response.ok) {
      console.error('OVH API错误:', responseData);
      return res.status(response.status).json({
        error: `OVH API错误: ${response.status}`,
        details: responseData
      });
    }
    
    return res.status(response.status).json(responseData);
  } catch (error) {
    console.error('请求OVH API时出错:', error);
    return res.status(500).json({
      error: `请求OVH API时出错: ${error.message || '未知错误'}`
    });
  }
}

// 检查服务器可用性
app.post('/check-availability', async (req, res) => {
  try {
    const config = req.body;
    
    if (DEBUG) {
      console.log(`正在检查服务器可用性，配置:`, config);
    }
    
    if (!config.appKey || !config.appSecret || !config.consumerKey) {
      return res.status(400).json({ 
        error: '缺少 OVH API 凭据 (appKey, appSecret, consumerKey)' 
      });
    }
    
    // 构建查询参数
    const queryParams = new URLSearchParams({
      planCode: config.planCode,
      zone: config.zone
    }).toString();
    
    const path = `/dedicated/server/supplierPlan/availability?${queryParams}`;
    
    // 使用代理函数发送请求到OVH
    await proxyToOvhApi(req, res, path, 'GET', null);
    
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: error.message || '服务器内部错误' });
  }
});

// 购买服务器
app.post('/purchase-server', async (req, res) => {
  try {
    const { config, serverStatus } = req.body;
    
    if (DEBUG) {
      console.log(`尝试购买服务器:`, serverStatus);
      console.log(`配置:`, config);
    }
    
    if (!config.appKey || !config.appSecret || !config.consumerKey) {
      return res.status(400).json({ 
        error: '缺少 OVH API 凭据 (appKey, appSecret, consumerKey)' 
      });
    }
    
    // 创建订单参数
    const orderParams = {
      planCode: config.planCode,
      duration: config.duration || 'P1M',
      pricingMode: 'default',
      quantity: 1,
      configuration: [
        { label: 'os', value: config.os || 'none_64.en' }
      ]
    };
    
    // 添加选项
    if (config.options && Array.isArray(config.options)) {
      config.options.forEach(option => {
        orderParams.configuration.push({
          label: 'option',
          value: option
        });
      });
    }
    
    // 添加数据中心选择
    if (config.datacenter) {
      orderParams.configuration.push({
        label: 'datacenter',
        value: config.datacenter
      });
    }
    
    const path = `/order/dedicated/server/${config.zone}`;
    
    // 使用代理函数发送购买请求到OVH
    await proxyToOvhApi(req, res, path, 'POST', orderParams);
    
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: error.message || '服务器内部错误' });
  }
});

// 添加健康状态检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`服务器正在监听端口: ${PORT}`);
  console.log(`调试模式: ${DEBUG ? '启用' : '禁用'}`);
  console.log(`CORS 已启用，允许来源: http://localhost:8080, https://f8e063de-2d8e-45dc-9801-7c7507e3e60b.lovableproject.com`);
});
