const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const crypto = require('crypto');

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

// OVH API签名生成器
function createOvhSignature(method, url, body, timestamp, appSecret, consumerKey) {
  const fullUrl = `https://api.ovh.com/1.0${url}`;
  const toSign = [
    appSecret,
    consumerKey,
    method,
    fullUrl,
    body ? JSON.stringify(body) : '',
    timestamp
  ].join('+');
  
  return '$1$' + crypto.createHash('sha1').update(toSign).digest('hex');
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
    
    const timestamp = Math.round(Date.now() / 1000);
    const url = `/dedicated/server/supplierPlan/availability`;
    const queryParams = new URLSearchParams({
      planCode: config.planCode,
      zone: config.zone
    }).toString();
    
    const fullUrl = `https://api.ovh.com/1.0${url}?${queryParams}`;
    const signature = createOvhSignature('GET', `${url}?${queryParams}`, null, timestamp, config.appSecret, config.consumerKey);
    
    if (DEBUG) {
      console.log(`请求 URL: ${fullUrl}`);
      console.log(`生成的签名: ${signature}`);
    }
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'X-Ovh-Application': config.appKey,
          'X-Ovh-Consumer': config.consumerKey,
          'X-Ovh-Timestamp': timestamp.toString(),
          'X-Ovh-Signature': signature
        }
      });
      
      if (DEBUG) {
        console.log(`OVH API 状态码: ${response.status}`);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OVH API 错误:', errorText);
        return res.status(response.status).json({ 
          error: `OVH API 错误: ${response.status} ${errorText}` 
        });
      }
      
      const result = await response.json();
      
      // 解析API返回的数据
      let availability = 'unknown';
      if (result && Array.isArray(result)) {
        const datacenterInfo = result.find(item => 
          (!config.datacenter || item.datacenter === config.datacenter)
        );
        
        if (datacenterInfo && datacenterInfo.availability === 'available') {
          availability = 'available';
        } else {
          availability = 'unavailable';
        }
      }
      
      const responseData = [{
        fqn: `KS-${config.planCode}`,
        datacenter: config.datacenter || 'default',
        availability: availability
      }];
      
      res.json(responseData);
    } catch (apiError) {
      console.error('请求 OVH API 时出错:', apiError);
      return res.status(500).json({ error: `请求 OVH API 时出错: ${apiError.message}` });
    }
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: error.message });
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
    
    try {
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
      
      const timestamp = Math.round(Date.now() / 1000);
      const url = `/order/dedicated/server/${config.zone}`;
      const signature = createOvhSignature('POST', url, orderParams, timestamp, config.appSecret, config.consumerKey);
      
      if (DEBUG) {
        console.log(`请求 URL: https://api.ovh.com/1.0${url}`);
        console.log(`订单参数:`, JSON.stringify(orderParams));
      }
      
      const response = await fetch(`https://api.ovh.com/1.0${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Ovh-Application': config.appKey,
          'X-Ovh-Consumer': config.consumerKey,
          'X-Ovh-Timestamp': timestamp.toString(),
          'X-Ovh-Signature': signature
        },
        body: JSON.stringify(orderParams)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OVH API 购买错误:', errorText);
        return res.status(response.status).json({
          success: false,
          error: `OVH API 错误: ${response.status} ${errorText}`
        });
      }
      
      const order = await response.json();
      
      // 返回订单信息
      res.json({
        success: true,
        orderId: order.orderId,
        orderUrl: `https://www.ovh.com/manager/order/follow.html?orderId=${order.orderId}`
      });
    } catch (apiError) {
      console.error('OVH API购买错误:', apiError);
      res.status(400).json({
        success: false,
        error: apiError.message || '购买失败'
      });
    }
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: error.message });
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
